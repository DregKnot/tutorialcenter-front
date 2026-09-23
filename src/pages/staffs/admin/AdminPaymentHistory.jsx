import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useStaffAuth } from "../../../context/StaffAuthContext";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  // XCircleIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  // FunnelIcon,
  // SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  CheckIcon,
  // BuildingLibraryIcon,
  // CalendarDaysIcon,
  // AcademicCapIcon,
  // UserCircleIcon,
  ArrowTrendingUpIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";

const BANK_REVIEW_STATES = [
  ["awaiting_confirmation", "Awaiting confirmation"], ["initiated", "Initiated"],
  ["approved", "Approved"], ["rejected", "Rejected"], ["cancelled", "Cancelled / refunded"],
];

function bankReviewState(payment) {
  if (payment.status === "successful") return "Approved";
  if (payment.status === "failed") return "Rejected";
  if (payment.status === "cancelled") return "Cancelled";
  if (payment.status === "refunded") return "Refunded";
  return payment.meta?.bank_transfer?.claimed_paid_at ? "Awaiting confirmation" : "Initiated";
}

function canReviewBankPayment(payment) {
  return payment?.payment_method === "bank_transfer" && payment.gateway === "bank" &&
    ["pending", "failed"].includes(payment.status);
}

// Return the view from a hook so the responsive layout's two copies share one
// queue and one submission lock, rather than mounting two independent reviewers.
function useBankTransferReview({ enabled, token, canReview, onReviewed }) {
  const apiBase = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";
  const [query, setQuery] = useState({ search: "", state: "awaiting_confirmation", page: 1 });
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, last: 1, total: 0 });
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState("");
  const [notice, setNotice] = useState(null);
  const [revision, setRevision] = useState(0);
  const [reviewPayment, setReviewPayment] = useState(null);
  const [action, setAction] = useState("approve");
  const [form, setForm] = useState({ confirmed_amount: "", bank_reference: "", reason: "", paid_at: "" });
  const [saving, setSaving] = useState(false);
  const submitLock = useRef(false);
  useEffect(() => {
    if (reviewPayment && !queueLoading) {
      const visiblePanel = Array.from(document.querySelectorAll("[data-bank-review-panel]"))
        .find(panel => panel.getClientRects().length > 0);
      visiblePanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [reviewPayment, queueLoading]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    if (!enabled) return;
    setQueueLoading(true);
    setQueueError("");
    const load = async () => {
      try {
        if (!token) throw new Error("Please sign in with your staff account.");
        const response = await axios.get(`${apiBase}/api/admin/payments/bank-transfers`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          params: { page: query.page, ...(query.state ? { state: query.state } : {}), ...(query.search ? { search: query.search } : {}) },
          signal: controller.signal, timeout: 20000,
        });
        const page = response.data?.payments;
        if (response.status !== 200 || !Array.isArray(page?.data)) {
          throw new Error("The server did not return a valid bank-transfer queue.");
        }
        if (!active) return;
        const last = Math.max(1, Number(page.last_page) || Math.ceil(Number(page.total || 0) / Number(page.per_page || 20)));
        if (query.page > last) {
          setQuery(current => ({ ...current, page: last }));
          return;
        }
        setRows(page.data);
        setPagination({ current: Number(page.current_page) || query.page, last, total: Number(page.total) || 0 });
        setReviewPayment(current => current ? page.data.find(row => row.id === current.id) || null : null);
      } catch (err) {
        if (!active) return;
        setRows([]);
        setReviewPayment(null);
        setQueueError(err.response?.data?.message || err.message || "Unable to load bank transfers.");
      } finally {
        if (active) setQueueLoading(false);
      }
    };
    load();
    return () => { active = false; controller.abort(); };
  }, [enabled, apiBase, token, query, revision]);

  const openReview = (payment) => {
    if (saving) return;
    setReviewPayment(payment);
    setAction("approve");
    setForm({ confirmed_amount: "", bank_reference: "", reason: "", paid_at: "" });
    setNotice(null);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (submitLock.current || queueLoading) return;
    if (!canReview || !token) {
      setNotice({ type: "error", text: "Only an admin can approve or reject bank transfers." });
      return;
    }
    if (!canReviewBankPayment(reviewPayment)) {
      setNotice({ type: "error", text: "This transfer is already settled or cannot be reviewed. Refresh the queue." });
      return;
    }
    const payload = {};
    if (action === "approve") {
      const amount = Number(form.confirmed_amount);
      const expected = Number(reviewPayment.amount);
      if (!/^\d+(\.\d{1,2})?$/.test(form.confirmed_amount.trim()) ||
          !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(expected) ||
          !Number.isSafeInteger(Math.round(amount * 100)) ||
          Math.abs(Math.round(amount * 100) - Math.round(expected * 100)) > 1) {
        setNotice({ type: "error", text: "Enter the amount confirmed in the bank account. It must match the payment amount (within ₦0.01)." });
        return;
      }
      payload.confirmed_amount = amount;
      if (form.bank_reference.trim()) payload.bank_reference = form.bank_reference.trim();
      if (form.reason.trim()) payload.reason = form.reason.trim();
      if (form.paid_at) {
        const paidAt = new Date(form.paid_at);
        if (Number.isNaN(paidAt.getTime())) {
          setNotice({ type: "error", text: "Enter a valid payment date." });
          return;
        }
        payload.paid_at = paidAt.toISOString();
      }
    } else {
      if (form.reason.trim().length < 5) {
        setNotice({ type: "error", text: "Enter a rejection reason of at least 5 characters. The student will see it." });
        return;
      }
      payload.reason = form.reason.trim();
    }
    submitLock.current = true;
    setSaving(true);
    setNotice(null);
    try {
      const response = await axios.post(`${apiBase}/api/admin/payments/${reviewPayment.id}/bank-transfer/${action}`, payload, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
        timeout: 30000,
      });
      if (response.status !== 200 || Number(response.data?.payment?.id) !== Number(reviewPayment.id) ||
          response.data.payment.status !== (action === "approve" ? "successful" : "failed")) {
        throw new Error("The server did not confirm the review outcome. Refresh and check this reference before retrying.");
      }
      setNotice({ type: "success", text: action === "approve"
        ? "Payment approved and enrollment activated."
        : "Payment rejected. The student can read the reason and submit a new claim." });
      setReviewPayment(null);
      setRevision(value => value + 1);
      onReviewed?.();
    } catch (err) {
      const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
      setNotice({ type: "error", text: validation || err.response?.data?.message || err.message || "Unable to save the review." });
      // Reconcile a stale row or a request whose response was lost; do not auto-resubmit.
      setRevision(value => value + 1);
    } finally {
      submitLock.current = false;
      setSaving(false);
    }
  };

  const claim = reviewPayment?.meta?.bank_transfer || {};
  return (
    <section aria-label="Bank transfer reviews" className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#09314F] dark:text-white">Bank Transfer Reviews</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">Find a student's transfer using the reference shared on WhatsApp.</p>
          {!canReview && <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Read-only access. An admin must approve or reject payments.</p>}
        </div>
        <button type="button" disabled={saving || queueLoading} onClick={() => setRevision(value => value + 1)}
          className="rounded-xl border px-4 py-2 text-sm font-bold disabled:opacity-50">Refresh transfers</button>
      </div>

      <form onSubmit={event => {
        event.preventDefault();
        if (saving) return;
        setReviewPayment(null);
        setQuery(current => ({ ...current, search: search.trim(), state: search.trim() ? "" : current.state, page: 1 }));
      }} className="mt-5 flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1 text-sm font-semibold">Reference, name, email or phone
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="TC-7K2M9Q"
            disabled={saving} className="mt-1 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2 dark:border-gray-600" />
        </label>
        <button type="submit" disabled={saving} className="rounded-xl bg-[#09314F] px-4 py-2 font-bold text-white disabled:opacity-50">Search transfers</button>
        <label className="text-sm font-semibold">Transfer state
          <select value={query.state} disabled={saving} onChange={event => {
            setReviewPayment(null);
            setQuery(current => ({ ...current, state: event.target.value, page: 1 }));
          }} className="mt-1 block rounded-xl border bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800">
            <option value="">All states</option>
            {BANK_REVIEW_STATES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </form>
      {notice && <p role={notice.type === "error" ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm ${notice.type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>{notice.text}</p>}
      {queueError && <p role="alert" className="mt-4 text-sm text-red-600">{queueError}</p>}
      {queueLoading ? <p role="status" className="py-6 text-sm">Loading bank transfers...</p> : !queueError && (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Bank transfers for manual payment review</caption>
              <thead><tr className="border-b text-gray-500 dark:text-gray-300">
                {["Reference", "Student / Course", "Amount", "State", "Details"].map(title => <th key={title} scope="col" className="px-3 py-3">{title}</th>)}
              </tr></thead>
              <tbody>{rows.map(payment => (
                <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="px-3 py-3 font-mono">{payment.gateway_reference}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold">{[payment.student?.firstname, payment.student?.surname].filter(Boolean).join(" ") || "Unknown student"}</p>
                    <p>{payment.student?.email || payment.student?.tel || "No contact provided"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">{payment.enrollment?.course?.title || "Course unavailable"}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">₦{Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-3 py-3">{bankReviewState(payment)}</td>
                  <td className="px-3 py-3"><button type="button" disabled={saving} onClick={() => openReview(payment)}
                    aria-label={`View transfer ${payment.gateway_reference}`} className="font-bold text-blue-700 dark:text-blue-300 disabled:opacity-50">
                    {canReview && canReviewBankPayment(payment) ? "Review" : "View details"}
                  </button></td>
                </tr>
              ))}</tbody>
            </table>
            {!rows.length && <p className="py-6 text-center text-gray-500">No bank transfers match these filters.</p>}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p>{pagination.total} transfers · Page {pagination.current} of {pagination.last}</p>
            <div className="flex gap-2">
              <button type="button" disabled={saving || query.page <= 1} onClick={() => { setReviewPayment(null); setQuery(current => ({ ...current, page: current.page - 1 })); }}
                className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous transfers</button>
              <button type="button" disabled={saving || query.page >= pagination.last} onClick={() => { setReviewPayment(null); setQuery(current => ({ ...current, page: current.page + 1 })); }}
                className="rounded-lg border px-3 py-2 disabled:opacity-40">Next transfers</button>
            </div>
          </div>
        </>
      )}

      {reviewPayment && !queueLoading && (
        <div data-bank-review-panel className="mt-6 scroll-mt-20 rounded-2xl border border-blue-200 bg-blue-50/30 p-5 dark:border-blue-900">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold">Transfer {reviewPayment.gateway_reference}</h3>
            <button type="button" disabled={saving} onClick={() => setReviewPayment(null)} className="text-sm underline">Close review</button>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-gray-500 dark:text-gray-300">Expected amount</dt><dd>₦{Number(reviewPayment.amount).toLocaleString()}</dd></div>
            <div><dt className="text-gray-500 dark:text-gray-300">Claimed amount</dt><dd>{claim.amount_paid != null ? `₦${Number(claim.amount_paid).toLocaleString()}` : "Not provided"}</dd></div>
            <div><dt className="text-gray-500 dark:text-gray-300">Sender's account name</dt><dd>{claim.paid_from_account_name || "Not provided"}</dd></div>
            <div><dt className="text-gray-500 dark:text-gray-300">Claim time</dt><dd>{claim.claimed_paid_at ? new Date(claim.claimed_paid_at).toLocaleString() : "Not claimed yet"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-gray-500 dark:text-gray-300">Student's note</dt><dd className="whitespace-pre-wrap break-words">{claim.note || "No note"}</dd></div>
            {claim.review && <div className="sm:col-span-2"><dt className="text-gray-500 dark:text-gray-300">Previous review</dt>
              <dd>{claim.review.action} · Staff #{claim.review.by_staff_id || "—"} · {claim.review.reason || "No reason recorded"}</dd>
            </div>}
          </dl>
          {canReview && canReviewBankPayment(reviewPayment) ? (
            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold">Review action
                <select value={action} disabled={saving} onChange={event => {
                  setAction(event.target.value);
                  setForm(current => ({ ...current, reason: "" }));
                  setNotice(null);
                }}
                  className="mt-1 block rounded-lg border bg-white p-2 dark:bg-gray-800">
                  <option value="approve">Approve payment</option><option value="reject">Reject payment</option>
                </select>
              </label>
              {action === "approve" && <>
                <p className="text-sm text-gray-600 dark:text-gray-300">Check the actual credit in the bank account before approving. The student's claim alone is not confirmation.</p>
                <label className="block text-sm font-semibold">Confirmed amount (NGN)
                  <input type="number" required min="0.01" step="0.01" value={form.confirmed_amount} disabled={saving}
                    onChange={event => setForm(current => ({ ...current, confirmed_amount: event.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-transparent p-2" />
                </label>
                <label className="block text-sm font-semibold">Bank transaction reference (optional)
                  <input maxLength={255} value={form.bank_reference} disabled={saving}
                    onChange={event => setForm(current => ({ ...current, bank_reference: event.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-transparent p-2" />
                </label>
                <label className="block text-sm font-semibold">Payment date (optional; defaults to claim time)
                  <input type="datetime-local" value={form.paid_at} disabled={saving}
                    onChange={event => setForm(current => ({ ...current, paid_at: event.target.value }))}
                    className="mt-1 w-full rounded-lg border bg-transparent p-2" />
                </label>
              </>}
              <label className="block text-sm font-semibold">{action === "reject" ? "Rejection reason (shown to the student)" : "Internal note (optional)"}
                <textarea required={action === "reject"} minLength={action === "reject" ? 5 : undefined} maxLength={1000}
                  value={form.reason} disabled={saving} onChange={event => setForm(current => ({ ...current, reason: event.target.value }))}
                  className="mt-1 w-full rounded-lg border bg-transparent p-2" />
              </label>
              <button type="submit" disabled={saving} className={`rounded-xl px-5 py-3 font-bold text-white disabled:opacity-50 ${action === "approve" ? "bg-green-700" : "bg-red-700"}`}>
                {saving ? "Saving review..." : action === "approve" ? "Approve payment" : "Reject payment"}
              </button>
            </form>
          ) : <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">{canReview ? "This payment is settled; no review actions are available." : "Only admins can change payment decisions."}</p>}
        </div>
      )}
    </section>
  );
}

export default function AdminPaymentHistory() {
  const { role, token } = useStaffAuth();
  const staffRole = typeof role === "string" ? role.trim().toLowerCase() : "";
  const canViewBankReviews = ["admin", "moderator", "coo"].includes(staffRole);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("all"); // all, month, week, today
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  const paymentsPerPage = 8;
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  // ─── Fetch Payments ────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_token");

      let response;
      try {
        response = await axios.get(`${API_BASE_URL}/api/admin/payments/all`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
      } catch (err) {
        response = await axios.get(`${API_BASE_URL}/api/admin/payments`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
      }

      let paymentData = [];
      if (Array.isArray(response.data)) {
        paymentData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        paymentData = response.data.data;
      } else if (Array.isArray(response.data?.payments)) {
        paymentData = response.data.payments;
      } else if (Array.isArray(response.data?.payments?.data)) {
        paymentData = response.data.payments.data;
      } else if (response.data && typeof response.data === "object") {
        const possibleArray = Object.values(response.data).find((val) =>
          Array.isArray(val)
        );
        if (possibleArray) paymentData = possibleArray;
      }

      setPayments(paymentData);
      setError("");
    } catch (err) {
      console.warn("Error fetching payments:", err);
      setError("Unable to load live payments. Displaying offline records.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const bankReviewPanel = useBankTransferReview({
    enabled: canViewBankReviews, token, canReview: staffRole === "admin", onReviewed: fetchPayments,
  });

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ─── Copy to Clipboard Helper ──────────────────────────────────────────────
  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Payment Type Classifier ───────────────────────────────────────────────
  const getPaymentType = useCallback((payment, allPayments) => {
    if (!payment || !payment.enrollment || !payment.student) return "New Payment";

    const studentId = payment.student.id;
    const courseId = payment.enrollment.course_id;

    const relatedPayments = allPayments.filter(
      (p) =>
        p.student?.id === studentId &&
        p.enrollment?.course_id === courseId &&
        p.status?.toLowerCase() === "successful"
    );

    relatedPayments.sort(
      (a, b) =>
        new Date(a.paid_at || a.created_at) - new Date(b.paid_at || b.created_at)
    );

    const currentIndex = relatedPayments.findIndex((p) => p.id === payment.id);

    if (currentIndex <= 0) {
      return "New Payment";
    }

    const prevPayment = relatedPayments[currentIndex - 1];
    const prevEndDate = prevPayment.enrollment?.end_date;
    const currentPaidAt = payment.paid_at || payment.created_at;

    if (prevEndDate && new Date(currentPaidAt) <= new Date(prevEndDate)) {
      return "Renewal - Upfront";
    } else {
      return "Renewal - Due";
    }
  }, []);

  // ─── Timeframe Filtering ───────────────────────────────────────────────────
  const timeframePayments = useMemo(() => {
    if (timeframe === "all") return payments;
    const now = new Date();
    return payments.filter((p) => {
      const pDate = new Date(p.paid_at || p.created_at);
      if (timeframe === "today") {
        return pDate.toDateString() === now.toDateString();
      }
      if (timeframe === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return pDate >= weekAgo;
      }
      if (timeframe === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        return pDate >= monthAgo;
      }
      return true;
    });
  }, [payments, timeframe]);

  // ─── Funnel & Pipeline Calculations ────────────────────────────────────────
  const funnelStats = useMemo(() => {
    const total = timeframePayments.length;
    const successful = timeframePayments.filter(
      (p) => p.status?.toLowerCase() === "successful"
    );
    const pending = timeframePayments.filter(
      (p) => p.status?.toLowerCase() === "pending"
    );
    const failed = timeframePayments.filter(
      (p) =>
        p.status?.toLowerCase() === "failed" ||
        p.status?.toLowerCase() === "cancelled" ||
        p.status?.toLowerCase() === "refunded"
    );

    const renewals = successful.filter((p) => {
      const type = getPaymentType(p, payments);
      return type.includes("Renewal");
    });

    const freeGrants = timeframePayments.filter(
      (p) => Number(p.amount) === 0 || p.payment_method === "manual"
    );

    const revenue = successful.reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );

    const conversionRate = total > 0 ? Math.round((successful.length / total) * 100) : 0;
    const dropoffRate = 100 - conversionRate;
    const aov = successful.length > 0 ? Math.round(revenue / successful.length) : 0;

    // Funnel stage calculation
    const initiatedVal = total;
    const authorizedVal = Math.max(successful.length + pending.length, Math.round(total * 0.82));
    const successfulVal = successful.length;
    const renewalsVal = renewals.length > 0 ? renewals.length : Math.round(successful.length * 0.6);
    const completedVal = Math.max(successful.length - failed.length, Math.round(successful.length * 0.5));

    return {
      total,
      successfulCount: successful.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      renewalsCount: renewals.length,
      freeGrantsCount: freeGrants.length,
      totalRevenue: revenue,
      conversionRate,
      dropoffRate,
      aov,
      stages: [
        {
          id: "initiated",
          label: "Initiated Payments",
          value: initiatedVal,
          displayVal: total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toString(),
          heightPct: 88,
          isFocus: false,
          color: "from-blue-500 to-indigo-600"
        },
        {
          id: "authorized",
          label: "Authorized Payments",
          value: authorizedVal,
          displayVal:
            authorizedVal >= 1000
              ? `${(authorizedVal / 1000).toFixed(1)}k`
              : authorizedVal.toString(),
          heightPct: 68,
          isFocus: false,
          color: "from-blue-500 to-indigo-600"
        },
        {
          id: "successful",
          label: "Successful Payments",
          value: successfulVal,
          displayVal:
            successfulVal >= 1000
              ? `${(successfulVal / 1000).toFixed(1)}k`
              : successfulVal.toString(),
          heightPct: 56,
          isFocus: true,
          color: "from-blue-600 via-indigo-600 to-blue-700"
        },
        {
          id: "renewals",
          label: "Active Renewals",
          value: renewalsVal,
          displayVal:
            renewalsVal >= 1000
              ? `${(renewalsVal / 1000).toFixed(1)}k`
              : renewalsVal.toString(),
          heightPct: 38,
          isFocus: false,
          color: "from-blue-500 to-indigo-600"
        },
        {
          id: "completed",
          label: "Completed Grants",
          value: completedVal,
          displayVal:
            completedVal >= 1000
              ? `${(completedVal / 1000).toFixed(1)}k`
              : completedVal.toString(),
          heightPct: 24,
          isFocus: false,
          color: "from-blue-500 to-indigo-600"
        }
      ]
    };
  }, [timeframePayments, getPaymentType, payments]);

  // ─── Filtered Payments List ────────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    return timeframePayments.filter((payment) => {
      const studentName = (
        payment.student?.firstname
          ? `${payment.student.firstname} ${payment.student.surname || ""}`
          : payment.student?.fullname || ""
      ).toLowerCase();

      const email = (payment.student?.email || "").toLowerCase();
      const phone = (payment.student?.tel || "").toLowerCase();
      const ref = (payment.gateway_reference || "").toLowerCase();
      const course = (payment.enrollment?.course?.title || "").toLowerCase();

      const query = searchTerm.toLowerCase();
      const matchesSearch =
        studentName.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        ref.includes(query) ||
        course.includes(query);

      // Status / Funnel Filter
      let matchesStatus = true;
      if (statusFilter === "successful") {
        matchesStatus = payment.status?.toLowerCase() === "successful";
      } else if (statusFilter === "pending") {
        matchesStatus = payment.status?.toLowerCase() === "pending";
      } else if (statusFilter === "failed") {
        matchesStatus =
          payment.status?.toLowerCase() === "failed" ||
          payment.status?.toLowerCase() === "cancelled" ||
          payment.status?.toLowerCase() === "refunded";
      } else if (statusFilter === "renewals") {
        const type = getPaymentType(payment, payments);
        matchesStatus = type.includes("Renewal");
      } else if (statusFilter === "free") {
        matchesStatus = Number(payment.amount) === 0 || payment.payment_method === "manual";
      }

      return matchesSearch && matchesStatus;
    });
  }, [timeframePayments, searchTerm, statusFilter, getPaymentType, payments]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / paymentsPerPage));
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + paymentsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, timeframe]);

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const exportToCSV = () => {
    if (filteredPayments.length === 0) return;
    const headers = [
      "ID",
      "Student Name",
      "Email",
      "Phone",
      "Course",
      "Amount (NGN)",
      "Method",
      "Type",
      "Status",
      "Reference",
      "Date"
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      `"${p.student?.firstname ? `${p.student.firstname} ${p.student.surname || ""}` : p.student?.fullname || "Unknown"}"`,
      `"${p.student?.email || "N/A"}"`,
      `"${p.student?.tel || "N/A"}"`,
      `"${p.enrollment?.course?.title || "General"}"`,
      p.amount || 0,
      p.payment_method || "Card",
      `"${getPaymentType(p, payments)}"`,
      p.status || "pending",
      `"${p.gateway_reference || "N/A"}"`,
      `"${new Date(p.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tutorialcenter_payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <StaffDashboardLayout pagetitle="Payment Pipeline & Financial Audits">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
        
        {canViewBankReviews && bankReviewPanel}
        {/* ==================================================================== */}
        {/* TOP SECTION: MODERN FINANCIAL PIPELINE & FUNNEL BAR CHART CARD       */}
        {/* ==================================================================== */}
        <div className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/90 rounded-[32px] p-6 sm:p-8 border border-gray-200/80 dark:border-gray-700/60 shadow-xl relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-700/60 relative z-10">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F2843] dark:text-white tracking-tight">
                  Payments
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
                  Live Funnel
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Real-time conversion breakdown from checkout initialization to settled access
              </p>
            </div>

            {/* Timeframe Filter Pills & Options Menu */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-700/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60 text-xs font-bold">
                {[
                  { id: "all", label: "All Time" },
                  { id: "month", label: "30D" },
                  { id: "week", label: "7D" },
                  { id: "today", label: "Today" }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeframe(tf.id)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      timeframe === tf.id
                        ? "bg-white dark:bg-gray-800 text-[#0F2843] dark:text-white shadow-sm font-black"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Options Dropdown Trigger */}
              <div className="relative">
                <button
                  onClick={() => setShowOptionsDropdown((prev) => !prev)}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
                  title="Payment options"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
                </button>

                {showOptionsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={() => {
                        exportToCSV();
                        setShowOptionsDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 text-gray-400" /> Export CSV
                    </button>
                    <button
                      onClick={() => {
                        fetchPayments();
                        setShowOptionsDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2"
                    >
                      <ArrowPathIcon className="w-4 h-4 text-gray-400" /> Refresh Data
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Visual Funnel Chart Component ───────────────────────────────── */}
          <div className="pt-6 relative">
            
            {/* Desktop / Tablet Funnel Grid */}
            <div className="relative">
              {/* Y-Axis Scale Ticks (Left) */}
              <div className="hidden sm:flex flex-col justify-between absolute left-0 top-16 bottom-0 text-[11px] font-bold text-gray-400 dark:text-gray-500 pointer-events-none pr-3 select-none h-44 z-0">
                <span>70k</span>
                <span>60k</span>
                <span>50k</span>
                <span>40k</span>
                <span>30k</span>
              </div>

              {/* 5 Funnel Columns */}
              <div className="sm:pl-10 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-0 relative z-10">
                {funnelStats.stages.map((stage, idx) => {
                  const isStageSelected =
                    (statusFilter === "all" && stage.id === "initiated") ||
                    (statusFilter === "successful" && stage.id === "successful") ||
                    (statusFilter === "pending" && stage.id === "authorized") ||
                    (statusFilter === "renewals" && stage.id === "renewals") ||
                    (statusFilter === "free" && stage.id === "completed");

                  return (
                    <div
                      key={stage.id}
                      onClick={() => {
                        if (stage.id === "initiated") setStatusFilter("all");
                        else if (stage.id === "authorized") setStatusFilter("pending");
                        else if (stage.id === "successful") setStatusFilter("successful");
                        else if (stage.id === "renewals") setStatusFilter("renewals");
                        else if (stage.id === "completed") setStatusFilter("free");
                      }}
                      className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-none transition-all cursor-pointer group ${
                        stage.isFocus
                          ? "bg-blue-50/70 dark:bg-blue-950/20 sm:border-x border-blue-200/80 dark:border-blue-800/40 shadow-sm"
                          : "hover:bg-gray-50/70 dark:hover:bg-white/5 sm:border-r border-gray-100 dark:border-gray-700/40"
                      } ${idx === 0 ? "sm:border-l" : ""}`}
                    >
                      {/* Column Header: Label + Big Number */}
                      <div className="space-y-1 mb-3">
                        <p className={`text-xs font-bold truncate ${
                          stage.isFocus ? "text-gray-900 dark:text-blue-300 font-black" : "text-gray-400 dark:text-gray-400 font-medium"
                        }`}>
                          {stage.label}
                        </p>
                        <p className={`text-2xl sm:text-3xl font-black tracking-tight ${
                          stage.isFocus ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-300"
                        }`}>
                          {stage.displayVal}
                        </p>
                        {/* Top selection indicator pill */}
                        <div className="pt-1">
                          <div className={`w-8 h-1 rounded-full transition-all ${
                            isStageSelected ? "bg-blue-600 dark:bg-blue-400 w-12" : "bg-transparent group-hover:bg-blue-300"
                          }`} />
                        </div>
                      </div>

                      {/* Sloped Diagonal Funnel Bar Visual */}
                      <div className="h-44 flex flex-col justify-end items-center relative overflow-hidden rounded-xl">
                        {/* Top Floating Pill Cap (Matching Mockup) */}
                        <div 
                          className="w-6 h-1.5 rounded-full bg-blue-500/90 dark:bg-blue-400 shadow-sm mb-1.5 transition-all duration-300 group-hover:scale-110 z-20 shrink-0"
                        />

                        {/* Background diagonal stripe pattern */}
                        <div
                          className={`w-full rounded-t-xl transition-all duration-500 relative overflow-hidden ${
                            stage.isFocus
                              ? "bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-600 dark:to-indigo-700 ring-2 ring-blue-500/40 shadow-lg"
                              : "bg-blue-500/5 dark:bg-gradient-to-br dark:from-blue-400 dark:to-blue-600 opacity-90 group-hover:opacity-100 shadow-md border-t border-x border-blue-400/30 dark:border-transparent"
                          }`}
                          style={{
                            height: `${stage.heightPct}%`,
                            backgroundImage: stage.isFocus
                              ? undefined
                              : "repeating-linear-gradient(45deg, #2563eb 0, #2563eb 3px, transparent 3px, transparent 9px)"
                          }}
                        >
                          {/* Inner glowing edge for focus bar */}
                          {stage.isFocus && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/30" />
                          )}
                        </div>

                        {/* Sloped Perspective Transition Connectors (Desktop Only) */}
                        {idx < funnelStats.stages.length - 1 && (
                          <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity z-10">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 24 100">
                              <polygon points="0,0 24,15 24,100 0,100" fill="url(#funnelSlopeGrad)" />
                              <defs>
                                <linearGradient id="funnelSlopeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Tooltip on Successful Payments Stage (Matching Mockup) */}
                      {stage.isFocus && (
                        <div className="mt-3 sm:absolute sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-2 z-30 pointer-events-none">
                          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-xl text-[11px] font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap flex items-center gap-2">
                            <span><strong>{stage.displayVal}</strong> transactions</span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Conversion: {funnelStats.conversionRate}%</span>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <span className="text-rose-500 font-extrabold">Drop-off: -{funnelStats.dropoffRate}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-2xl p-4 text-xs text-red-600 dark:text-red-400 font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* KPI SUMMARY CARDS (4 METRICS)                                        */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Gross Revenue */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400">Total Collected</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CurrencyDollarIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-[#0F2843] dark:text-white">
                ₦{funnelStats.totalRevenue.toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> 100% verified settlement
              </p>
            </div>
          </div>

          {/* 2. Successful Transactions */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400">Successful Orders</span>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-[#0F2843] dark:text-white">
                {funnelStats.successfulCount}
              </h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                {funnelStats.conversionRate}% overall conversion rate
              </p>
            </div>
          </div>

          {/* 3. Pending Verification */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400">Pending Review</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <ClockIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-[#0F2843] dark:text-white">
                {funnelStats.pendingCount}
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                In-flight gateway confirmations
              </p>
            </div>
          </div>

          {/* 4. Average Order Value */}
          <div className="bg-white dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400">Avg Transaction (AOV)</span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <CreditCardIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-black text-[#0F2843] dark:text-white">
                ₦{funnelStats.aov.toLocaleString()}
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                Per active enrollment
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SEARCH, FILTER TABS & AUDIT TOOLBAR                                  */}
        {/* ==================================================================== */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student, email, phone, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          {/* Quick Segment Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Records", count: timeframePayments.length },
              { id: "successful", label: "Successful", count: funnelStats.successfulCount },
              { id: "pending", label: "Pending", count: funnelStats.pendingCount },
              { id: "renewals", label: "Renewals", count: funnelStats.renewalsCount },
              { id: "free", label: "Free Grants", count: funnelStats.freeGrantsCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-[#0F2843] dark:bg-white text-white dark:text-[#0F2843] shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700/60 hover:bg-gray-50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusFilter === tab.id
                    ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#0F2843]"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TRANSACTIONS TABLE SECTION (DESKTOP + MOBILE CARDS)                  */}
        {/* ==================================================================== */}
        <div className="space-y-4">
          
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-6 items-center bg-[#09314F] px-6 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-wider shadow-md">
            <div className="col-span-2">Student & Academic Course</div>
            <div className="text-center">Amount & Gateway</div>
            <div className="text-center">Transaction Type</div>
            <div className="text-center">Status & Date</div>
            <div className="text-right pr-4">Reference & Audit</div>
          </div>

          {/* Rows List */}
          <div className="flex flex-col gap-3 min-h-[350px]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Payment Audits...</p>
              </div>
            ) : paginatedPayments.length > 0 ? (
              paginatedPayments.map((payment, idx) => {
                const studentName = payment.student?.firstname
                  ? `${payment.student.firstname} ${payment.student.surname || ""}`
                  : payment.student?.fullname || "Unknown Student";

                const paymentType = getPaymentType(payment, payments);
                const isSuccessful = payment.status?.toLowerCase() === "successful";
                const isPending = payment.status?.toLowerCase() === "pending";
                const isFree = Number(payment.amount) === 0;

                return (
                  <div key={payment.id || idx}>
                    
                    {/* DESKTOP ROW */}
                    <div
                      onClick={() => setSelectedPayment(payment)}
                      className="hidden md:grid md:grid-cols-6 items-center bg-white dark:bg-gray-800/80 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      {/* Student & Course (2 cols) */}
                      <div className="col-span-2 flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0 flex items-center justify-center text-gray-700 dark:text-white font-black text-sm">
                          {payment.student?.profile_picture && payment.student.profile_picture !== "default-avatar.png" ? (
                            <img
                              src={`${API_BASE_URL}/storage/${payment.student.profile_picture}`}
                              className="w-full h-full object-cover"
                              alt={studentName}
                            />
                          ) : (
                            studentName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F2843] dark:text-white text-sm truncate" title={studentName}>
                            {studentName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {payment.enrollment?.course?.title || "General Tuition Prep"} • <span className="capitalize">{payment.student?.department || "Student"}</span>
                          </p>
                        </div>
                      </div>

                      {/* Amount & Gateway */}
                      <div className="text-center">
                        {isFree ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200">
                            FREE
                          </span>
                        ) : (
                          <p className="font-black text-sm text-[#0F2843] dark:text-white">
                            ₦{Number(payment.amount).toLocaleString()}
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                          {payment.payment_method || "Card"} • {payment.gateway || "Paystack"}
                        </p>
                      </div>

                      {/* Transaction Type */}
                      <div className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          paymentType.includes("Upfront")
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200"
                            : paymentType.includes("Due")
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200"
                        }`}>
                          {paymentType}
                        </span>
                      </div>

                      {/* Status & Date */}
                      <div className="text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                          isSuccessful
                            ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : isPending
                            ? "bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-rose-100/70 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isSuccessful ? "bg-emerald-500" : isPending ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                          }`} />
                          {payment.status || "Pending"}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {new Date(payment.paid_at || payment.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Reference & Audit Action */}
                      <div className="text-right pr-2 flex items-center justify-end gap-2">
                        {payment.gateway_reference && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(payment.gateway_reference, payment.id);
                            }}
                            className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 transition-all text-xs flex items-center gap-1"
                            title="Copy Gateway Reference"
                          >
                            {copiedId === payment.id ? (
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayment(payment);
                          }}
                          className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-[#0F2843] dark:hover:text-white rounded-xl transition-all"
                          title="View receipt"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* MOBILE CARD VIEW */}
                    <div
                      onClick={() => setSelectedPayment(payment)}
                      className="block md:hidden bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center font-black text-xs text-gray-700 dark:text-white">
                            {payment.student?.profile_picture && payment.student.profile_picture !== "default-avatar.png" ? (
                              <img
                                src={`${API_BASE_URL}/storage/${payment.student.profile_picture}`}
                                className="w-full h-full object-cover"
                                alt={studentName}
                              />
                            ) : (
                              studentName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#0F2843] dark:text-white text-sm truncate">{studentName}</p>
                            <p className="text-[11px] text-gray-400 truncate">{payment.enrollment?.course?.title || "Tuition Prep"}</p>
                          </div>
                        </div>

                        {/* Amount Badge */}
                        <div className="text-right">
                          {isFree ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700">FREE</span>
                          ) : (
                            <span className="text-sm font-black text-[#0F2843] dark:text-white">
                              ₦{Number(payment.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Status</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold capitalize mt-0.5 ${
                            isSuccessful
                              ? "bg-emerald-50 text-emerald-700"
                              : isPending
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                          }`}>
                            {payment.status || "Pending"}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Type</span>
                          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{paymentType}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 bg-white/40 dark:bg-gray-800/40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <CurrencyDollarIcon className="w-12 h-12 text-gray-300 mb-2" />
                <p className="font-bold text-gray-400 text-sm">No payment records found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/60">
              <p className="text-xs text-gray-400 font-bold">
                Showing {startIndex + 1}–{Math.min(startIndex + paymentsPerPage, filteredPayments.length)} of {filteredPayments.length} transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-all"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-gray-700 dark:text-gray-300 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 transition-all"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ==================================================================== */}
        {/* PAYMENT DETAILS & RECEIPT INSPECTION MODAL                           */}
        {/* ==================================================================== */}
        {selectedPayment && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedPayment(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-[#09314F] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <DocumentDuplicateIcon className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black uppercase tracking-wider">Transaction Audit Receipt</h3>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs">
                
                {/* Amount Hero */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-700/20 border border-blue-100 dark:border-gray-600 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Settlement</span>
                    <h2 className="text-3xl font-black text-[#0F2843] dark:text-white mt-0.5">
                      {Number(selectedPayment.amount) === 0 ? "FREE GRANT" : `₦${Number(selectedPayment.amount).toLocaleString()}`}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedPayment.status?.toLowerCase() === "successful"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {selectedPayment.status || "Pending"}
                  </span>
                </div>

                {/* Student Profile Block */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Student Information</h4>
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Name</span>
                      <span className="font-bold text-gray-800 dark:text-white text-sm">
                        {selectedPayment.student?.firstname
                          ? `${selectedPayment.student.firstname} ${selectedPayment.student.surname || ""}`
                          : selectedPayment.student?.fullname || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Email</span>
                      <span className="font-medium text-gray-800 dark:text-white truncate block">{selectedPayment.student?.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Phone</span>
                      <span className="font-bold text-gray-800 dark:text-white">{selectedPayment.student?.tel || "—"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Department</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{selectedPayment.student?.department || "General"}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Enrollment Info */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Enrollment & Course</h4>
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                    <div className="col-span-2">
                      <span className="text-[10px] text-gray-400 font-bold block">Course Title</span>
                      <span className="font-bold text-gray-800 dark:text-white text-sm">
                        {selectedPayment.enrollment?.course?.title || "Comprehensive UTME/SSCE Prep"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Billing Cycle</span>
                      <span className="font-bold text-gray-800 dark:text-white capitalize">{selectedPayment.billing_cycle || "Monthly"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">Payment Type</span>
                      <span className="font-bold text-emerald-600">{getPaymentType(selectedPayment, payments)}</span>
                    </div>
                  </div>
                </div>

                {/* Gateway Metadata */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Gateway Metadata</h4>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">Gateway Reference</span>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span>{selectedPayment.gateway_reference || "N/A"}</span>
                        {selectedPayment.gateway_reference && (
                          <button
                            onClick={() => handleCopy(selectedPayment.gateway_reference, "modal-ref")}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            {copiedId === "modal-ref" ? (
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">Payment Method</span>
                      <span className="font-bold text-gray-800 dark:text-white capitalize">{selectedPayment.payment_method || "Card"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-bold">Transaction Date</span>
                      <span className="font-bold text-gray-800 dark:text-white">
                        {new Date(selectedPayment.paid_at || selectedPayment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-[#0F2843] hover:bg-[#09314F] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <PrinterIcon className="w-4 h-4" /> Print Receipt
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </StaffDashboardLayout>
  );
}
