import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

const BANK_STATUSES = {
  initiated: "pending",
  awaiting_confirmation: "pending",
  approved: "successful",
  rejected: "failed",
  cancelled: "cancelled",
  refunded: "refunded",
};
const TERMINAL_BANK_STATES = ["approved", "cancelled", "refunded"];
const STORAGE_KEY = "studentBankTransfers";
// International format, no "+" or leading zero, for wa.me deep links.
const WHATSAPP_NUMBER = "2348029606405";

const STATE_TEXT = {
  initiated: "After transferring, tell us you have paid below.",
  awaiting_confirmation: "We are confirming your payment. Course access starts after approval.",
  approved: "Payment approved. This course is paid.",
  rejected: "Your payment claim was rejected. Review the reason and submit your claim again.",
  cancelled:
    "This transfer is closed. The enrollment may already be paid by another method. Do not transfer again.",
  refunded: "This payment was refunded. Please contact support.",
};

const isSettledTransfer = (transfer) =>
  transfer?.checked &&
  ((transfer.state === "approved" && transfer.status === "successful") ||
    (transfer.state === "cancelled" && transfer.review?.action === "superseded"));

const readStore = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const sanitized = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v && typeof v === "object") {
        sanitized[k] = { ...v, error: "", needsRecovery: false };
      }
    }
    return sanitized;
  } catch {
    return {};
  }
};

const writeStore = (next) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
};

async function fetchBankTransferStatus(transfer, signal) {
  const response = await axios.get(
    `${API_BASE_URL}/api/payments/bank-transfer/${encodeURIComponent(transfer.reference)}`,
    {
      headers: { Accept: "application/json", "X-Payment-Token": transfer.accessToken },
      timeout: 15000,
      signal,
    }
  );
  const data = response.data;
  if (response.status !== 200 || !data?.reference) {
    throw new Error("The server returned an invalid payment status. Please retry.");
  }
  const state = data.state || "initiated";
  return {
    ...transfer,
    amount: Number(data.amount || transfer.amount || 0),
    currency: data.currency || transfer.currency || "NGN",
    state: state,
    status: BANK_STATUSES[state] || data.status || "pending",
    review: data.review || null,
    checked: true,
    needsRecovery: false,
    error: "",
  };
}

/**
 * Bank-transfer lane for the student dashboard (Add Training).
 *
 * The backend issues one reference per enrollment (the reference is the transfer
 * narration the admin matches against), so a student still transfers once per
 * course. This component unifies the experience into a single view: one account
 * block, one total, one reference list, one shared claim form and one
 * "I have paid" action covering every open reference.
 *
 * Props:
 *  - enrollments: [{ enrollmentId, courseName, amount }] — pending course enrollments
 *  - studentId: the paying student id
 *  - onAllSettled: called once every enrollment is confirmed paid (approved)
 *  - onPendingSubmitted: called when a claim is submitted/pending approval
 */
export default function BankTransferPayment({
  enrollments = [],
  studentId,
  onAllSettled,
  onPendingSubmitted,
}) {
  const [transfers, setTransfers] = useState(readStore);
  const [loading, setLoading] = useState(true);
  const [sharedForm, setSharedForm] = useState({
    paid_from_account_name: "",
    amount_paid: "",
    note: "",
  });
  const [sharedError, setSharedError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState("");
  const [revision, setRevision] = useState(0);
  const transfersRef = useRef(transfers);
  const claimLock = useRef(false);
  const settledNotified = useRef(false);
  const inFlightRef = useRef({});

  const enrollmentKey = useMemo(
    () => enrollments.map((item) => String(item.enrollmentId)).join(","),
    [enrollments]
  );
  const enrollmentIds = useMemo(
    () => enrollments.map((item) => String(item.enrollmentId)),
    [enrollments]
  );
  const courseNameFor = useCallback(
    (enrollmentId) =>
      enrollments.find((item) => String(item.enrollmentId) === String(enrollmentId))?.courseName ||
      `Course #${enrollmentId}`,
    [enrollments]
  );

  const saveTransfer = useCallback((enrollmentId, transfer) => {
    const next = { ...transfersRef.current, [enrollmentId]: transfer };
    transfersRef.current = next;
    setTransfers(next);
    writeStore(next);
  }, []);

  /* ================= INIT: start or resume a transfer per enrollment ================= */
  useEffect(() => {
    if (!enrollments.length) {
      setLoading(false);
      return;
    }
    let active = true;

    const run = async () => {
      setLoading(true);
      for (const item of enrollments) {
        if (!active) return;
        const key = String(item.enrollmentId);
        const cached = transfersRef.current[key];

        if (cached?.reference && cached?.accessToken) {
          // If this is a renewal, do NOT reuse a settled/approved transfer from a previous cycle
          if (item.isRenewal && (cached.state === "approved" || cached.status === "successful")) {
            // Discard settled cache from previous billing cycle so a fresh renewal reference is generated below
          } else {
            try {
              const updated = await fetchBankTransferStatus(cached);
              if (item.isRenewal && (updated.state === "approved" || updated.status === "successful")) {
                // Discard settled cache so fresh renewal reference is generated below
              } else {
                if (active) saveTransfer(key, updated);
                continue;
              }
            } catch (err) {
              console.warn("Cached bank transfer check failed, resuming from server:", err);
              // Fall through to initiateBankTransfer to get authoritative details from DB
            }
          }
        }

        if (inFlightRef.current[key]) {
          continue;
        }
        inFlightRef.current[key] = true;

        try {
          const authToken =
            localStorage.getItem("guardian_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("access_token");

          const response = await axios.post(
            `${API_BASE_URL}/api/payments/bank-transfer`,
            { 
              student_id: Number(studentId), 
              course_enrollment_id: Number(item.enrollmentId),
              billing_cycle: item.billingCycle || undefined,
              is_renewal: Boolean(item.isRenewal),
              guardian_id: item.guardianId || undefined,
            },
            {
              headers: { 
                "Content-Type": "application/json", 
                Accept: "application/json",
                ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
              },
              timeout: 30000,
            }
          );
          const transfer = response.data;
          const ref = transfer?.reference;
          const token = transfer?.access_token;
          const amt = Number(transfer?.amount || item.amount || 0);
          const curr = transfer?.currency || "NGN";
          const rawState = transfer?.state || "initiated";
          const validState = ["initiated", "awaiting_confirmation", "rejected", "approved"].includes(rawState)
            ? rawState
            : "initiated";

          if (![200, 201].includes(response.status) || !ref) {
            throw new Error(transfer?.message || "The server did not return a valid bank transfer reference. Please retry.");
          }
          if (active) {
            saveTransfer(key, {
              reference: ref,
              accessToken: token || "",
              amount: amt,
              currency: curr,
              state: validState,
              status: BANK_STATUSES[validState] || "pending",
              checked: false,
              needsRecovery: false,
              error: "",
            });
          }
        } catch (err) {
          const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
          if (active) {
            saveTransfer(key, {
              ...(transfersRef.current[key] || {}),
              error:
                validation ||
                err.response?.data?.message ||
                err.message ||
                "Unable to prepare bank transfer.",
            });
          }
        } finally {
          delete inFlightRef.current[key];
        }
      }
      if (active) setLoading(false);
    };

    run();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentKey, studentId, revision]);

  /* ================= POLLING ================= */
  const pollKey = enrollmentIds
    .map((id) => {
      const transfer = transfers[id];
      return transfer
        ? `${id}:${transfer.reference}:${transfer.accessToken}:${!!transfer.needsRecovery}`
        : id;
    })
    .join("|");

  useEffect(() => {
    if (loading || !enrollmentIds.length) return;
    let active = true;
    let timer;
    const controller = new AbortController();
    const interval = Math.max(30000, enrollmentIds.length * 1500);

    const poll = async () => {
      let delay = interval;
      for (const id of enrollmentIds) {
        if (!active) return;
        const transfer = transfersRef.current[id];
        if (
          !transfer?.reference ||
          !transfer.accessToken ||
          transfer.needsRecovery ||
          (transfer.checked && TERMINAL_BANK_STATES.includes(transfer.state))
        ) {
          continue;
        }
        if (document.visibilityState === "hidden" || claimLock.current) break;
        try {
          const updated = await fetchBankTransferStatus(transfer, controller.signal);
          if (active && transfersRef.current[id] === transfer) saveTransfer(id, updated);
        } catch (err) {
          if (!active || transfersRef.current[id] !== transfer) continue;
          const needsRecovery = [403, 404].includes(err.response?.status);
          saveTransfer(id, {
            ...transfer,
            needsRecovery,
            error: needsRecovery
              ? "Payment details could not be accessed. Recover the reference below."
              : "Unable to check payment status. We will retry automatically; do not pay again.",
          });
          if (err.response?.status === 429) {
            const retryAfter = Number(err.response?.headers?.["retry-after"]);
            delay = Math.max(interval, Number.isFinite(retryAfter) ? retryAfter * 1000 : 60000);
            break;
          }
        }
      }
      const hasOpenTransfer = enrollmentIds.some((id) => {
        const transfer = transfersRef.current[id];
        return (
          transfer?.reference &&
          !transfer.needsRecovery &&
          !(transfer.checked && TERMINAL_BANK_STATES.includes(transfer.state))
        );
      });
      if (active && hasOpenTransfer) timer = setTimeout(poll, delay);
    };

    poll();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollKey, loading]);

  /* ================= ALL SETTLED ================= */
  const allSettled =
    enrollmentIds.length > 0 && enrollmentIds.every((id) => isSettledTransfer(transfers[id]));

  useEffect(() => {
    if (!allSettled || settledNotified.current) return;
    settledNotified.current = true;
    onAllSettled?.();
  }, [allSettled, onAllSettled]);

  /* ================= CLAIM (every open reference in one go) ================= */
  const claimableIds = enrollmentIds.filter((id) => {
    const transfer = transfers[id];
    return (
      transfer?.checked &&
      !transfer.needsRecovery &&
      ["initiated", "rejected"].includes(transfer.state)
    );
  });

  const updateSharedField = (field, value) =>
    setSharedForm((form) => ({ ...form, [field]: value }));

  const copyReference = (reference) => {
    try {
      navigator.clipboard?.writeText(reference);
      setCopied(reference);
      setTimeout(() => setCopied((current) => (current === reference ? "" : current)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const claimAll = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (claimLock.current) return false;
    const targets = claimableIds;
    if (!targets.length) {
      if (onPendingSubmitted) {
        onPendingSubmitted({
          references: referenceRows,
          courses: enrollments,
          totalAmount,
          whatsappMessage,
        });
      }
      return true;
    }

    const name = sharedForm.paid_from_account_name?.trim();
    const note = sharedForm.note?.trim();
    const amountPaid = sharedForm.amount_paid?.trim();
    if (amountPaid && (!Number.isFinite(Number(amountPaid)) || Number(amountPaid) <= 0)) {
      setSharedError("Enter a valid amount paid, or leave it empty.");
      return false;
    }

    claimLock.current = true;
    setClaiming(true);
    setSharedError("");
    let failures = 0;

    for (const id of targets) {
      const transfer = transfersRef.current[id];
      if (!transfer?.reference || !transfer.accessToken) continue;
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/payments/bank-transfer/${encodeURIComponent(transfer.reference)}/claim`,
          {
            access_token: transfer.accessToken,
            ...(name ? { paid_from_account_name: name } : {}),
            // A single figure only maps to a single reference, so it is only sent when
            // one course is open; with several, the admin matches each reference itself.
            ...(amountPaid && targets.length === 1 ? { amount_paid: Number(amountPaid) } : {}),
            ...(note ? { note } : {}),
          },
          {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            timeout: 30000,
          }
        );
        if (
          response.status !== 200 ||
          response.data?.reference !== transfer.reference ||
          response.data.state !== "awaiting_confirmation"
        ) {
          throw new Error("Payment claim was not acknowledged. Check the payment status before retrying.");
        }
        saveTransfer(id, {
          ...transfer,
          state: "awaiting_confirmation",
          status: "pending",
          checked: true,
          review: null,
          error: "",
        });
      } catch (err) {
        failures += 1;
        const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
        const message =
          validation ||
          err.response?.data?.message ||
          err.message ||
          "Unable to submit your payment claim.";
        const needsRecovery = [403, 404].includes(err.response?.status);
        saveTransfer(id, { ...transfer, needsRecovery, error: message });
        if (!needsRecovery) {
          try {
            const updated = await fetchBankTransferStatus(transfersRef.current[id]);
            saveTransfer(id, {
              ...updated,
              error: ["initiated", "rejected"].includes(updated.state) ? message : "",
            });
          } catch {
            /* The scheduled status check will retry. */
          }
        }
      }
    }

    claimLock.current = false;
    setClaiming(false);

    if (failures) {
      setSharedError(
        "Some courses could not be claimed. Review the messages below and submit your claim again."
      );
      return false;
    }

    if (onPendingSubmitted) {
      onPendingSubmitted({
        references: referenceRows,
        courses: enrollments,
        totalAmount,
        whatsappMessage,
      });
    }
    return true;
  };

  const handleShareAndContinue = async () => {
    if (claiming) return;
    let success = true;
    if (claimableIds.length > 0) {
      success = await claimAll();
    }
    if (!success) return;

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(waUrl, "_blank");
  };

  const retrySetup = () => {
    enrollmentIds.forEach((id) => {
      delete inFlightRef.current[id];
      const current = transfersRef.current[id];
      if (current) {
        saveTransfer(id, { ...current, error: "", needsRecovery: false });
      }
    });
    setSharedError("");
    setLoading(true);
    setRevision((value) => value + 1);
  };

  /* ================= DERIVED ================= */
  const totalAmount = enrollments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const referenceRows = enrollmentIds
    .map((id) => ({ id, transfer: transfers[id] }))
    .filter(({ transfer }) => transfer?.reference);

  const whatsappMessage = [
    `I have paid NGN ${totalAmount.toLocaleString()} for ${referenceRows.length} course${
      referenceRows.length === 1 ? "" : "s"
    }. I am attaching my payment screenshot below.`,
    ...referenceRows.map(
      ({ id, transfer }) =>
        `- ${courseNameFor(id)}: NGN ${Number(transfer.amount || 0).toLocaleString()} (Ref: ${transfer.reference})`
    ),
  ].join("\n");

  return (
    <div className="space-y-4 text-left">
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-[#09314F] font-bold">
          <div className="w-5 h-5 border-2 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
          <span>Preparing bank transfer details...</span>
        </div>
      )}

      {!loading && !enrollments.length && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-xs font-semibold text-amber-800">
          No training enrollment selected. Please select a duration plan and try again.
        </div>
      )}

      {/* 1. Official Bank Account - ALWAYS visible immediately */}
      {enrollments.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 to-blue-100/40 border border-blue-200/80 p-5 text-[#09314F] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900/60 block mb-0.5">
                Official Account
              </span>
              <p className="font-extrabold text-base text-[#09314F]">Zenith Bank</p>
              <p className="text-xs font-semibold text-gray-600 mt-0.5">Tutorial Center LTD</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900/60 block mb-0.5">
                Account Number
              </span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-mono text-xl sm:text-2xl font-black text-[#09314F] tracking-tight">
                  1312411265
                </span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard?.writeText("1312411265");
                      setCopied("1312411265");
                      setTimeout(() => setCopied(""), 1800);
                    } catch {}
                  }}
                  className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#09314F] border border-blue-200 text-xs transition-colors shadow-xs"
                  title="Copy account number"
                >
                  <Icon icon={copied === "1312411265" ? "lucide:check" : "lucide:copy"} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Total to transfer - ALWAYS visible immediately */}
      {enrollments.length > 0 && (
        <div className="rounded-2xl bg-[#F8F9FA] border border-gray-200/70 p-4 text-sm shadow-xs">
          <div className="flex justify-between items-center font-black text-[#09314F]">
            <span className="text-xs uppercase tracking-wider text-gray-500 font-bold">Total to transfer</span>
            <span className="text-lg font-black text-[#09314F]">₦{totalAmount.toLocaleString()}</span>
          </div>
          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
            {enrollments.length} course{enrollments.length === 1 ? "" : "s"} — transfer each amount
            using its own reference as the narration.
          </p>
        </div>
      )}

      {/* 3. Transfer references */}
      {referenceRows.length > 0 ? (
        <div className="space-y-3 rounded-2xl bg-[#F8F9FA] border border-gray-200/70 p-4 text-sm shadow-xs">
          <p className="font-black text-xs uppercase tracking-wider text-[#09314F]">Transfer references</p>
          <div className="space-y-2">
            {referenceRows.map(({ id, transfer }) => (
              <div
                key={id}
                className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200/70 shadow-xs"
              >
                <div>
                  <p className="font-bold text-[#09314F] text-xs sm:text-sm">{courseNameFor(id)}</p>
                  <p className="text-xs font-semibold text-gray-500">₦{Number(transfer.amount || 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#09314F] bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {transfer.reference}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyReference(transfer.reference)}
                    className="rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 text-xs font-bold text-[#09314F] transition-colors"
                  >
                    {copied === transfer.reference ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="space-y-3 rounded-2xl bg-[#F8F9FA] border border-gray-200/70 p-4 text-sm shadow-xs">
          <p className="font-black text-xs uppercase tracking-wider text-[#09314F]">Transfer references</p>
          <div className="space-y-2">
            {enrollments.map((item) => (
              <div
                key={item.enrollmentId}
                className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200/70 shadow-xs"
              >
                <div>
                  <p className="font-bold text-[#09314F] text-xs sm:text-sm">{item.courseName || `Course #${item.enrollmentId}`}</p>
                  <p className="text-xs font-semibold text-gray-500">₦{Number(item.amount || totalAmount).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#09314F]/20 border-t-[#09314F] rounded-full animate-spin" />
                  <span className="font-mono text-xs text-gray-400">Generating reference...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {claimableIds.length > 0 && (
        <form onSubmit={claimAll} className="space-y-4 rounded-2xl bg-[#F8F9FA] border border-gray-200/70 p-5 text-sm shadow-xs">
          <div className="flex items-center gap-2 border-b border-gray-200/60 pb-3">
            <div className="w-2 h-2 rounded-full bg-[#09314F]" />
            <p className="font-black text-xs uppercase tracking-wider text-[#09314F]">Payment Details (Optional)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#09314F] mb-1.5 uppercase tracking-wide">
              Sender's account name <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              maxLength={255}
              placeholder="e.g. John Doe"
              value={sharedForm.paid_from_account_name}
              onChange={(event) => updateSharedField("paid_from_account_name", event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-[#09314F] placeholder-gray-400 focus:outline-none focus:border-[#09314F] focus:ring-2 focus:ring-[#09314F]/15 transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#09314F] mb-1.5 uppercase tracking-wide">
              Amount paid <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder={`e.g. ${totalAmount}`}
              value={sharedForm.amount_paid}
              onChange={(event) => updateSharedField("amount_paid", event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-[#09314F] placeholder-gray-400 focus:outline-none focus:border-[#09314F] focus:ring-2 focus:ring-[#09314F]/15 transition-all shadow-xs"
            />
            {claimableIds.length > 1 && (
              <span className="mt-1 block text-[11px] text-gray-500">
                Leave blank if you paid each course separately — we match each reference to its own
                amount.
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#09314F] mb-1.5 uppercase tracking-wide">
              Note <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea
              maxLength={1000}
              rows={2}
              placeholder="Any additional information..."
              value={sharedForm.note}
              onChange={(event) => updateSharedField("note", event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-[#09314F] placeholder-gray-400 focus:outline-none focus:border-[#09314F] focus:ring-2 focus:ring-[#09314F]/15 transition-all shadow-xs resize-none"
            />
          </div>

          {sharedError && (
            <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {sharedError}
            </div>
          )}

          <button
            type="submit"
            disabled={claiming}
            className="w-full py-3.5 px-6 rounded-xl bg-[#09314F] hover:bg-[#0c4066] active:scale-[0.98] font-black text-xs uppercase tracking-wider text-white shadow-md shadow-[#09314F]/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {claiming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Claim...</span>
              </>
            ) : (
              <span>I have paid{claimableIds.length > 1 ? ` (${claimableIds.length} courses)` : ""}</span>
            )}
          </button>
        </form>
      )}

      {/* Primary Action: Share on WhatsApp & Continue */}
      {!loading && referenceRows.length > 0 && (
        <div className="pt-2 space-y-2">
          <button
            type="button"
            onClick={handleShareAndContinue}
            disabled={claiming}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50"
          >
            <Icon icon="ic:baseline-whatsapp" className="w-5 h-5 text-white" />
            <span>{claiming ? "Submitting Claim..." : "Share on WhatsApp & Continue"}</span>
          </button>
          <p className="text-xs text-gray-500 text-center leading-normal">
            Submits your transfer as pending admin review and opens WhatsApp to attach your payment screenshot.
          </p>
        </div>
      )}

      {!loading && referenceRows.length > 0 && (
        <div className="space-y-2">
          {referenceRows.map(({ id, transfer }) => (
            <div key={id} className="rounded-2xl bg-[#F8F9FA] border border-gray-200/70 p-3.5 text-sm shadow-xs">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-[#09314F] text-xs">{courseNameFor(id)}</span>
                <span className="font-mono text-xs font-semibold text-gray-500">{transfer.reference}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {!transfer.checked
                  ? "Checking payment status..."
                  : STATE_TEXT[transfer.state] || "Checking payment status..."}
              </p>
              {transfer.checked && transfer.state === "rejected" && transfer.review?.reason && (
                <p className="mt-1 text-xs text-red-700 font-medium">Reason: {transfer.review.reason}</p>
              )}
              {transfer.error && (
                <p role="alert" className="mt-1 text-xs text-red-700 font-medium">
                  {transfer.error}
                </p>
              )}
              {transfer.needsRecovery && (
                <button
                  type="button"
                  disabled={claiming}
                  onClick={retrySetup}
                  className="mt-2 rounded-xl bg-[#09314F] px-3 py-2 text-xs font-bold text-white hover:bg-[#0c4066] disabled:opacity-50 transition-colors shadow-sm"
                >
                  Recover payment details
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && enrollmentIds.some((id) => !transfers[id]?.reference) && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="font-bold">Unable to prepare bank transfer</p>
            <p className="mt-0.5 text-red-600">
              {enrollmentIds.map((id) => transfers[id]?.error).filter(Boolean)[0] || "Could not retrieve your payment reference. Please tap retry."}
            </p>
          </div>
          <button
            type="button"
            onClick={retrySetup}
            disabled={claiming}
            className="rounded-xl bg-[#09314F] hover:bg-[#0c4066] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#09314F]/20 shrink-0 transition-all disabled:opacity-50"
          >
            Retry Setup
          </button>
        </div>
      )}
    </div>
  );
}
