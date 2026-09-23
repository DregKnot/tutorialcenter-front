import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TC_logo from "../../../assets/images/tutorial_logo.webp";
import signup_img from "../../../assets/images/Student_sign_up.webp";
import { ChevronLeftIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Paystack from "../../../components/Paystack";
import { getStudentData, updateStudentData } from "./studentStorageHelper";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

const BANK_STATUSES = {
  initiated: "pending", awaiting_confirmation: "pending", approved: "successful",
  rejected: "failed", cancelled: "cancelled", refunded: "refunded",
};
const TERMINAL_BANK_STATES = ["approved", "cancelled", "refunded"];
const isSettledTransfer = (transfer) => transfer?.checked && (
  (transfer.state === "approved" && transfer.status === "successful") ||
  (transfer.state === "cancelled" && transfer.review?.action === "superseded")
);

async function fetchBankTransferStatus(transfer, signal) {
  const response = await axios.get(`${API_BASE_URL}/api/payments/bank-transfer/${encodeURIComponent(transfer.reference)}`, {
    headers: { Accept: "application/json", "X-Payment-Token": transfer.accessToken },
    timeout: 15000, signal,
  });
  const data = response.data;
  if (response.status !== 200 || data?.reference !== transfer.reference ||
      !Object.prototype.hasOwnProperty.call(BANK_STATUSES, data.state) || BANK_STATUSES[data.state] !== data.status ||
      data.currency !== "NGN" || !Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0) {
    throw new Error("The server returned an invalid payment status. Please retry.");
  }
  return { ...transfer, amount: Number(data.amount), currency: data.currency,
    state: data.state, status: data.status, review: data.review || null,
    checked: true, needsRecovery: false, error: "" };
}

export const StudentTrainingPayment = () => {
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [selectedDurations, setSelectedDurations] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("paystack");
  const [bankTransfers, setBankTransfers] = useState({});
  const [bankLoading, setBankLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingPayment, setPendingPayment] = useState(null);
  const verificationLock = useRef(false);
  const bankLock = useRef(false);
  const transfersRef = useRef({});
  const claimLock = useRef(false);
  const completionHandled = useRef(false);
  const [claimingId, setClaimingId] = useState(null);
  const [claimForms, setClaimForms] = useState({});

  const saveTransfer = useCallback((enrollmentId, transfer) => {
    const next = { ...transfersRef.current, [enrollmentId]: transfer };
    transfersRef.current = next;
    setBankTransfers(next);
    if (!updateStudentData({ bankTransfers: next })) {
      setError("Unable to save payment recovery details. Keep this page open and allow site storage.");
    }
  }, []);

  /* ================= INIT ================= */
  useEffect(() => {
    const stored = getStudentData();

    if (!stored?.data || !stored?.selectedDurations || Object.keys(stored.selectedDurations).length === 0) {
      navigate("/register/student/training/selection");
      return;
    }

    const selectedIds = [...new Set((stored.selectedTraining || []).map(String))];
    const ready = selectedIds.length > 0 && selectedIds.every(id => {
      const enrollment = stored.selectedEnrollments?.[id];
      return enrollment?.course_enrollment_id > 0 &&
        Number(enrollment.student_id) === Number(stored.id) &&
        String(enrollment.course_id) === id && enrollment.status === "pending" &&
        enrollment.billing_cycle === stored.selectedDurations[id]?.duration &&
        Number.isFinite(Number(enrollment.cost)) && Number(enrollment.cost) > 0;
    });
    if (!ready) {
      navigate("/register/student/training/duration", { replace: true });
      return;
    }

    setStudentData(stored);
    setSelectedDurations(Object.fromEntries(selectedIds.map(id => [id, {
      ...stored.selectedDurations[id], price: Number(stored.selectedEnrollments[id].cost),
    }])));
    const currentEnrollmentIds = new Set(selectedIds.map(id => String(stored.selectedEnrollments[id].course_enrollment_id)));
    const cached = Object.fromEntries(Object.entries(stored.raw?.bankTransfers || {})
      .filter(([id, transfer]) => currentEnrollmentIds.has(id) && transfer?.reference && transfer?.accessToken)
      .map(([id, transfer]) => [id, { ...transfer, checked: false, needsRecovery: false }]));
    transfersRef.current = cached;
    setBankTransfers(cached);
    if (Object.keys(cached).length) setSelectedMethod("bank_transfer");
    setPendingPayment(stored.raw?.pendingPaystackPayment || null);
  }, [navigate]);

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.entries(selectedDurations)
      .filter(([id]) => !isSettledTransfer(bankTransfers[studentData?.selectedEnrollments[id]?.course_enrollment_id]))
      .reduce((sum, [, item]) => sum + Number(item.price || 0), 0);
  }, [selectedDurations, bankTransfers, studentData]);

  /* ================= EMAIL ================= */
  const payerEmail = useMemo(() => {
    const email = studentData?.email || studentData?.data?.email;
    const tel = studentData?.tel || studentData?.data?.tel;

    if (email && email.includes("@")) return email.trim();
    if (tel) return `${String(tel).replace(/\D/g, "")}@student.tutorialcenter.ng`;

    return "student@tutorialcenter.ng";
  }, [studentData]);

  /* ================= PAYSTACK METADATA ================= */
  const paystackMetadata = useMemo(() => {
    const studentId = studentData?.id || studentData?.data?.id;
    const selectedSubjects = studentData?.selectedSubjects || {};
    const referralCode = studentData?.referral_code;

    const courses = Object.entries(selectedDurations)
      .filter(([id, duration]) => Boolean(duration) && !isSettledTransfer(bankTransfers[studentData?.selectedEnrollments[id]?.course_enrollment_id]))
      .map(([courseId, duration]) => ({
        course_id: Number(courseId),
        billing_cycle: duration.duration,
        price: Number(duration.price || 0),
        subjects: selectedSubjects[courseId] || [],
      }));

    return {
      type: "student_enrollment",
      student_id: studentId,
      courses,
      referral_code: referralCode,
    };
  }, [studentData, selectedDurations, bankTransfers]);

  const courseName = (id) => studentData?.availableTrainings?.find(course => String(course.id) === String(id))?.title || `Course #${id}`;

  const startBankTransfer = async () => {
    if (bankLock.current || claimLock.current || verificationLock.current || !studentData) return;
    bankLock.current = true;
    setBankLoading(true);
    setError("");
    let currentCourse = "";
    try {
      for (const id of Object.keys(selectedDurations)) {
        currentCourse = courseName(id);
        const enrollmentId = studentData.selectedEnrollments[id].course_enrollment_id;
        const cached = transfersRef.current[enrollmentId];
        if (cached?.reference && cached?.accessToken) {
          try {
            saveTransfer(enrollmentId, await fetchBankTransferStatus(cached));
            continue;
          } catch (err) {
            if (![403, 404].includes(err.response?.status)) throw err;
            // Starting again recovers the server-issued reference/token pair.
          }
        }
        const response = await axios.post(`${API_BASE_URL}/api/payments/bank-transfer`, {
          student_id: Number(studentData.id), course_enrollment_id: enrollmentId,
        }, {
          headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 30000,
        });
        const transfer = response.data;
        if (![200, 201].includes(response.status) || !transfer?.reference || !transfer.access_token ||
            !Number.isFinite(Number(transfer.amount)) || Number(transfer.amount) <= 0 ||
            transfer.currency !== "NGN" || !["initiated", "awaiting_confirmation", "rejected"].includes(transfer.state)) {
          throw new Error("The server did not return valid bank transfer details. Please retry.");
        }
        saveTransfer(enrollmentId, {
          reference: transfer.reference, accessToken: transfer.access_token,
          amount: Number(transfer.amount), currency: transfer.currency, state: transfer.state,
          status: BANK_STATUSES[transfer.state], checked: false, needsRecovery: false,
        });
      }
    } catch (err) {
      const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
      setError(`${currentCourse}: ${validation || err.response?.data?.message || err.message || "Unable to prepare bank transfer."}`);
    } finally {
      bankLock.current = false;
      setBankLoading(false);
    }
  };

  const enrollmentIds = useMemo(() => Object.keys(selectedDurations)
    .map(id => String(studentData?.selectedEnrollments[id]?.course_enrollment_id))
    .filter(id => id !== "undefined"), [selectedDurations, studentData]);
  const pollTargetsKey = enrollmentIds.map(id => {
    const transfer = bankTransfers[id];
    return transfer ? `${id}:${transfer.reference}:${transfer.accessToken}:${!!transfer.needsRecovery}` : id;
  }).join("|");
  const checkingExistingPayments = enrollmentIds.some(id => bankTransfers[id] && !bankTransfers[id].checked);
  const allPaid = enrollmentIds.length > 0 && enrollmentIds.every(id => isSettledTransfer(bankTransfers[id]));

  useEffect(() => {
    if (!allPaid || completionHandled.current || processing || showModal) return;
    completionHandled.current = true;
    localStorage.removeItem("studentEmail");
    localStorage.removeItem("studentTel");
    navigate("/register/student/training/payment/success");
  }, [allPaid, navigate, processing, showModal]);

  useEffect(() => {
    if (bankLoading || processing || showModal || !enrollmentIds.length) return;
    let active = true;
    let timer;
    const controller = new AbortController();
    const interval = Math.max(30000, enrollmentIds.length * 1500);
    const poll = async () => {
      let delay = interval;
      for (const id of enrollmentIds) {
        if (!active) return;
        const transfer = transfersRef.current[id];
        if (!transfer?.reference || !transfer.accessToken || transfer.needsRecovery ||
            (transfer.checked && TERMINAL_BANK_STATES.includes(transfer.state))) continue;
        if (document.visibilityState === "hidden" || claimLock.current) break;
        try {
          const updated = await fetchBankTransferStatus(transfer, controller.signal);
          // Do not overwrite a newer claim or a recovered token with an older poll.
          if (active && transfersRef.current[id] === transfer) saveTransfer(id, updated);
        } catch (err) {
          if (!active || transfersRef.current[id] !== transfer) continue;
          const needsRecovery = [403, 404].includes(err.response?.status);
          saveTransfer(id, { ...transfer, needsRecovery,
            error: needsRecovery ? "Payment details could not be accessed. Recover the reference below."
              : "Unable to check payment status. We will retry automatically; do not pay again." });
          if (err.response?.status === 429) {
            const retryAfter = Number(err.response?.headers?.["retry-after"]);
            delay = Math.max(interval, Number.isFinite(retryAfter) ? retryAfter * 1000 : 60000);
            break;
          }
        }
      }
      const hasOpenTransfer = enrollmentIds.some(id => {
        const transfer = transfersRef.current[id];
        return transfer?.reference && !transfer.needsRecovery &&
          !(transfer.checked && TERMINAL_BANK_STATES.includes(transfer.state));
      });
      if (active && hasOpenTransfer) timer = setTimeout(poll, delay);
    };
    poll();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [pollTargetsKey, enrollmentIds, bankLoading, processing, showModal, saveTransfer]);

  const claimBankTransfer = async (event, enrollmentId) => {
    event.preventDefault();
    const transfer = transfersRef.current[enrollmentId];
    if (claimLock.current || bankLock.current || !transfer?.checked || transfer.needsRecovery ||
        !["initiated", "rejected"].includes(transfer.state)) return;
    const form = claimForms[enrollmentId] || {};
    const amountPaid = form.amount_paid?.trim();
    if (amountPaid && (!Number.isFinite(Number(amountPaid)) || Number(amountPaid) <= 0)) {
      saveTransfer(enrollmentId, { ...transfer, error: "Enter a valid amount paid, or leave it empty." });
      return;
    }
    claimLock.current = true;
    setClaimingId(enrollmentId);
    // Invalidate any status request that started before this claim.
    saveTransfer(enrollmentId, { ...transfer, error: "" });
    try {
      const response = await axios.post(`${API_BASE_URL}/api/payments/bank-transfer/${encodeURIComponent(transfer.reference)}/claim`, {
        access_token: transfer.accessToken,
        ...(form.paid_from_account_name?.trim() ? { paid_from_account_name: form.paid_from_account_name.trim() } : {}),
        ...(amountPaid ? { amount_paid: Number(amountPaid) } : {}),
        ...(form.note?.trim() ? { note: form.note.trim() } : {}),
      }, { headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 30000 });
      if (response.status !== 200 || response.data?.reference !== transfer.reference || response.data.state !== "awaiting_confirmation") {
        throw new Error("Payment claim was not acknowledged. Check the payment status before retrying.");
      }
      saveTransfer(enrollmentId, { ...transfer, state: "awaiting_confirmation", status: "pending", checked: true, review: null, error: "" });
    } catch (err) {
      const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
      const message = validation || err.response?.data?.message || err.message || "Unable to submit your payment claim.";
      const needsRecovery = [403, 404].includes(err.response?.status);
      saveTransfer(enrollmentId, { ...transfer, needsRecovery, error: message });
      if (!needsRecovery) {
        // The request may have reached the server, or the payment may already be settled.
        try {
          const updated = await fetchBankTransferStatus(transfersRef.current[enrollmentId]);
          saveTransfer(enrollmentId, { ...updated,
            error: ["initiated", "rejected"].includes(updated.state) ? message : "" });
        }
        catch { /* The scheduled status check will retry. */ }
      }
    } finally {
      claimLock.current = false;
      setClaimingId(null);
    }
  };

  const updateClaimField = (enrollmentId, field, value) => setClaimForms(forms => ({
    ...forms, [enrollmentId]: { ...forms[enrollmentId], [field]: value },
  }));

  const selectMethod = (method) => {
    if (processing || bankLoading || claimLock.current) return;
    setSelectedMethod(method);
    setError("");
    if (method === "bank_transfer") startBankTransfer();
  };

  /* ================= PAYSTACK VERIFICATION ================= */
  const handlePaystackSuccess = async (response, metadata = paystackMetadata) => {
    if (verificationLock.current) return;
    const reference = response?.reference;
    if (!reference) {
      setError("No payment reference was returned. Contact support before making another payment.");
      setShowModal(false);
      return;
    }
    const payment = { reference, metadata };
    setPendingPayment(payment);
    updateStudentData({ pendingPaystackPayment: payment });
    verificationLock.current = true;
    setProcessing(true);
    setShowModal(false);
    setError("");
    try {
      const result = await axios.post(`${API_BASE_URL}/api/payments/verify-paystack`, {
        reference, fallback_metadata: payment.metadata,
      }, {
        headers: { "Content-Type": "application/json", Accept: "application/json" }, timeout: 30000,
      });
      if (result.status !== 200 || result.data?.success !== true) {
        throw new Error(result.data?.message || "Payment has not been confirmed.");
      }
      updateStudentData({ pendingPaystackPayment: null });
      setPendingPayment(null);
      localStorage.removeItem("studentEmail");
      localStorage.removeItem("studentTel");
      navigate("/register/student/training/payment/success");
    } catch (err) {
      setError(`${err.response?.data?.message || err.message || "Unable to verify payment."} If you were charged, do not pay again. Retry verification using the saved reference.`);
    } finally {
      verificationLock.current = false;
      setProcessing(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col lg:flex-row bg-[#F4F4F4] font-sans selection:bg-[#09314F] selection:text-white">
      {/* VISUAL IMAGE PANEL */}
      <div className="w-full lg:w-1/2 h-[200px] sm:h-[260px] lg:h-auto lg:min-h-screen relative order-1 lg:order-2 overflow-hidden shrink-0">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url(${signup_img})` }}
        >
          <div className="w-full h-full bg-gradient-to-t from-[#09314F]/80 via-transparent to-black/20 lg:bg-[#09314F]/25 backdrop-blur-[1px]" />
        </div>
      </div>

      {/* INTERACTIVE FORM AREA */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-4 sm:px-8 md:px-12 lg:px-16 py-8 md:py-12 order-2 lg:order-1 overflow-y-auto">
        <div className="w-full max-w-[min(100%,560px)] mx-auto my-auto flex flex-col">
          {/* LOGO */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <img
              src={TC_logo}
              alt="Tutorial Center"
              className="h-16 sm:h-20 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
              onClick={() => {
                if (window.confirm("Returning to the home page will clear your registration progress. Are you sure?")) {
                  navigate("/");
                }
              }}
            />
          </div>

          {/* HEADER BAR */}
          <div className="relative w-full flex items-center justify-center mb-6">
            <button
              type="button"
              onClick={() => navigate("/register/student/training/duration")}
              aria-label="Go back to Duration Selection"
              className="absolute left-0 p-2.5 sm:p-3 bg-white hover:bg-gray-50 text-[#09314F] rounded-2xl shadow-sm border border-gray-200/80 transition-all active:scale-90"
            >
              <ChevronLeftIcon className="h-5 w-5 stroke-[2.5]" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-[#09314F] tracking-tight text-center px-12">
              Payment Method
            </h1>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mb-6 text-center max-w-[420px] mx-auto leading-relaxed">
            Review your registration summary and choose how to pay.
          </p>

          {/* CARD CONTAINER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(9,49,79,0.06)] border border-gray-100 mb-8 flex flex-col">
            {/* GATEWAY OPTION */}
            <div className="mb-6">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                Payment Gateway
              </span>

              <div className="space-y-3" role="group" aria-label="Payment method">
                {[
                  { id: "paystack", label: "Paystack", description: "Pay online. Activation follows payment verification." },
                  { id: "bank_transfer", label: "Bank Transfer", description: "Transfer to our bank account. An admin confirms payment." },
                ].map(method => (
                  <button key={method.id} type="button" aria-pressed={selectedMethod === method.id}
                    disabled={!studentData || processing || bankLoading || claimingId !== null} onClick={() => selectMethod(method.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left disabled:opacity-50 ${selectedMethod === method.id ? "border-[#09314F] bg-blue-50/40" : "border-gray-200 bg-white"}`}>
                    <span className="flex items-center justify-between font-black text-[#09314F]">
                      {method.label}<ShieldCheckIcon className="h-5 w-5" />
                    </span>
                    <span className="text-xs text-gray-600">{method.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 mb-8 border border-gray-100">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                Enrollment Breakdown
              </span>

              <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {Object.entries(selectedDurations).map(([cId, dur]) => (
                  <div key={cId} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-bold text-gray-700 capitalize">
                      {courseName(cId)} ({dur.duration})
                    </span>
                    <span className="font-mono font-black text-[#09314F]">
                      {isSettledTransfer(bankTransfers[studentData?.selectedEnrollments[cId]?.course_enrollment_id]) ? "Paid" : `₦${Number(dur.price || 0).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/80 flex justify-between items-baseline">
                <span className="text-xs sm:text-sm font-black text-[#09314F] uppercase tracking-wider">
                  Remaining Payable
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#09314F] font-mono">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            {checkingExistingPayments && <p role="status" className="mb-4 text-sm text-gray-600">Checking your existing payments before another checkout...</p>}
            {pendingPayment && (
              <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-gray-800">
                <p>Paystack payment awaiting verification: {pendingPayment.reference}. If you were charged, verify this payment before paying again.</p>
                <button type="button" disabled={processing || bankLoading || claimingId !== null}
                  onClick={() => handlePaystackSuccess(pendingPayment, pendingPayment.metadata)}
                  className="mt-3 rounded-lg bg-[#09314F] px-4 py-2 text-white disabled:opacity-50">
                  Retry payment verification
                </button>
              </div>
            )}

            {selectedMethod === "paystack" ? (
              <button type="button" onClick={() => setShowModal(true)}
                disabled={!studentData || !Number.isFinite(totalAmount) || totalAmount <= 0 || processing || !!pendingPayment || checkingExistingPayments || allPaid}
                className="w-full py-4 px-6 rounded-2xl font-black text-white bg-[#09314F] disabled:opacity-50">
                Pay ₦{totalAmount.toLocaleString()} via Paystack
              </button>
            ) : (
              <div aria-live="polite" className="space-y-4">
                {bankLoading && <p className="text-sm text-gray-600">Preparing bank transfer details...</p>}
                {!bankLoading && Object.keys(bankTransfers).length > 0 && (
                  <>
                    {Object.values(bankTransfers).some(transfer => transfer.checked && !transfer.needsRecovery && !TERMINAL_BANK_STATES.includes(transfer.state)) && <div className="rounded-xl bg-blue-50 p-4 text-sm text-[#09314F]">
                      <p className="font-bold">Zenith Bank</p>
                      <p>Tutorial Center LTD</p>
                      <p className="font-mono text-xl font-bold">1312411265</p>
                    </div>}
                    <p className="text-sm text-gray-600">Each course has its own transfer reference and amount. Use the matching reference as the transfer narration.</p>
                    {Object.keys(selectedDurations).map(id => {
                      const enrollmentId = studentData?.selectedEnrollments[id]?.course_enrollment_id;
                      const transfer = bankTransfers[enrollmentId];
                      if (!transfer) return null;
                      return (
                        <div key={id} className="rounded-xl border border-gray-200 p-4 text-sm">
                          <p className="font-bold text-[#09314F]">{courseName(id)}</p>
                          <p>Amount: ₦{transfer.amount.toLocaleString()}</p>
                          <p>Reference: <strong className="font-mono">{transfer.reference}</strong></p>
                          <p className="mt-2 text-gray-600">{!transfer.checked ? "Checking payment status..." : {
                            initiated: "After transferring, tell us you have paid below.",
                            awaiting_confirmation: "We are confirming your payment. Course access starts after approval.",
                            approved: "Payment approved. This course is paid.",
                            rejected: "Your payment claim was rejected. Review the reason and submit your claim again.",
                            cancelled: "This transfer is closed. The enrollment may already be paid by another method. Do not transfer again.",
                            refunded: "This payment was refunded. Please contact support.",
                          }[transfer.state]}</p>
                          {transfer.checked && transfer.state === "rejected" && transfer.review?.reason &&
                            <p className="mt-2 text-red-700">Reason: {transfer.review.reason}</p>}
                          {transfer.error && <p role="alert" className="mt-2 text-red-700">{transfer.error}</p>}
                          {transfer.needsRecovery && <button type="button" disabled={bankLoading || claimingId !== null}
                            onClick={startBankTransfer} className="mt-3 rounded-lg bg-[#09314F] px-4 py-2 text-white">Recover payment details</button>}
                          {transfer.checked && !transfer.needsRecovery && ["initiated", "rejected"].includes(transfer.state) && (
                            <form onSubmit={event => claimBankTransfer(event, enrollmentId)} className="mt-4 space-y-3">
                              <label className="block">Sender's account name (optional)
                                <input type="text" maxLength={255} value={claimForms[enrollmentId]?.paid_from_account_name || ""}
                                  onChange={event => updateClaimField(enrollmentId, "paid_from_account_name", event.target.value)}
                                  className="mt-1 w-full rounded-lg border p-2" />
                              </label>
                              <label className="block">Amount paid (optional)
                                <input type="number" min="0.01" step="0.01" value={claimForms[enrollmentId]?.amount_paid || ""}
                                  onChange={event => updateClaimField(enrollmentId, "amount_paid", event.target.value)}
                                  className="mt-1 w-full rounded-lg border p-2" />
                              </label>
                              <label className="block">Note (optional)
                                <textarea maxLength={1000} value={claimForms[enrollmentId]?.note || ""}
                                  onChange={event => updateClaimField(enrollmentId, "note", event.target.value)}
                                  className="mt-1 w-full rounded-lg border p-2" />
                              </label>
                              <button type="submit" disabled={claimingId !== null || bankLoading}
                                className="rounded-lg bg-[#09314F] px-4 py-3 font-bold text-white disabled:opacity-50">
                                {claimingId === enrollmentId ? "Submitting claim..." : transfer.state === "rejected" ? "Submit payment claim again" : "I have paid"}
                              </button>
                            </form>
                          )}
                          {transfer.checked && ["awaiting_confirmation", "approved", "rejected"].includes(transfer.state) && (
                            <a href={`https://wa.me/?text=${encodeURIComponent(`I have paid NGN ${transfer.amount.toLocaleString()} for my registration.\nCourse: ${courseName(id)}\nReference: ${transfer.reference}`)}`}
                              target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-bold text-green-700 underline">
                              Share payment reference on WhatsApp
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
                {!bankLoading && (error || enrollmentIds.some(id => !bankTransfers[id])) &&
                  <button type="button" onClick={startBankTransfer} disabled={claimingId !== null}
                    className="rounded-xl bg-[#09314F] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">
                    {error ? "Retry bank transfer setup" : "Get bank details for remaining courses"}
                  </button>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PAYSTACK POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 relative shadow-2xl text-center">
            <h2 className="text-xl font-black text-[#09314F] mb-2">Complete Payment</h2>
            <p className="text-gray-500 text-xs sm:text-sm mb-6">
              You will be redirected to Paystack to authorize your transaction.
            </p>

            <div className="text-3xl font-black text-[#09314F] font-mono mb-8 py-4 bg-gray-50 rounded-2xl border border-gray-100">
              ₦{totalAmount.toLocaleString()}
            </div>

            <Paystack
              amount={totalAmount}
              email={payerEmail}
              reference={`TC-${Date.now()}-${studentData?.id || "std"}`}
              metadata={paystackMetadata}
              onSuccess={handlePaystackSuccess}
              onClose={() => setShowModal(false)}
            />

            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={processing}
              className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel Payment
            </button>
          </div>
        </div>
      )}

      {/* VERIFYING OVERLAY */}
      {processing && (
        <div className="fixed inset-0 bg-[#09314F]/85 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-[400px] text-center">
            <div className="w-16 h-16 border-4 border-gray-100 border-t-[#E83831] rounded-full animate-spin mb-6" />
            <h2 className="text-xl font-black text-[#09314F] mb-2">Authenticating Payment</h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              We are finalizing your course subscriptions with the learning portal. Please do not refresh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTrainingPayment;
