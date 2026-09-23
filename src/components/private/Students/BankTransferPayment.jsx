import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

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

const isSettledTransfer = (transfer) =>
  transfer?.checked &&
  ((transfer.state === "approved" && transfer.status === "successful") ||
    (transfer.state === "cancelled" && transfer.review?.action === "superseded"));

const readStore = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
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
  if (
    response.status !== 200 ||
    data?.reference !== transfer.reference ||
    !Object.prototype.hasOwnProperty.call(BANK_STATUSES, data.state) ||
    BANK_STATUSES[data.state] !== data.status ||
    data.currency !== "NGN" ||
    !Number.isFinite(Number(data.amount)) ||
    Number(data.amount) <= 0
  ) {
    throw new Error("The server returned an invalid payment status. Please retry.");
  }
  return {
    ...transfer,
    amount: Number(data.amount),
    currency: data.currency,
    state: data.state,
    status: data.status,
    review: data.review || null,
    checked: true,
    needsRecovery: false,
    error: "",
  };
}

/**
 * Bank-transfer lane for the student dashboard (Add Training / renewals).
 *
 * Props:
 *  - enrollments: [{ enrollmentId, courseName, amount }] — pending course enrollments
 *  - studentId: the paying student id
 *  - onAllSettled: called once every enrollment is confirmed paid (approved)
 */
export default function BankTransferPayment({ enrollments = [], studentId, onAllSettled }) {
  const [transfers, setTransfers] = useState(readStore);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [claimForms, setClaimForms] = useState({});
  const [claimingId, setClaimingId] = useState(null);
  const [revision, setRevision] = useState(0);
  const transfersRef = useRef(transfers);
  const claimLock = useRef(false);
  const settledNotified = useRef(false);

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
    if (!enrollments.length) return;
    let active = true;

    const run = async () => {
      setLoading(true);
      setError("");
      for (const item of enrollments) {
        if (!active) return;
        const key = String(item.enrollmentId);
        const cached = transfersRef.current[key];

        if (cached?.reference && cached?.accessToken) {
          try {
            const updated = await fetchBankTransferStatus(cached);
            if (active) saveTransfer(key, updated);
            continue;
          } catch (err) {
            if (![403, 404].includes(err.response?.status)) {
              if (active) {
                saveTransfer(key, {
                  ...cached,
                  checked: true,
                  needsRecovery: false,
                  error: "Unable to check payment status. We will retry automatically; do not pay again.",
                });
              }
              continue;
            }
            // 403/404 -> fall through and re-initiate to recover a fresh reference/token pair.
          }
        }

        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/payments/bank-transfer`,
            { student_id: Number(studentId), course_enrollment_id: Number(item.enrollmentId) },
            {
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              timeout: 30000,
            }
          );
          const transfer = response.data;
          if (
            ![200, 201].includes(response.status) ||
            !transfer?.reference ||
            !transfer.access_token ||
            !Number.isFinite(Number(transfer.amount)) ||
            Number(transfer.amount) <= 0 ||
            transfer.currency !== "NGN" ||
            !["initiated", "awaiting_confirmation", "rejected"].includes(transfer.state)
          ) {
            throw new Error("The server did not return valid bank transfer details. Please retry.");
          }
          if (active) {
            saveTransfer(key, {
              reference: transfer.reference,
              accessToken: transfer.access_token,
              amount: Number(transfer.amount),
              currency: transfer.currency,
              state: transfer.state,
              status: BANK_STATUSES[transfer.state],
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
  }, [allSettled, onAllSettled, saveTransfer]);

  /* ================= CLAIM ================= */
  const updateClaimField = (enrollmentId, field, value) =>
    setClaimForms((forms) => ({
      ...forms,
      [enrollmentId]: { ...forms[enrollmentId], [field]: value },
    }));

  const claimBankTransfer = async (event, enrollmentId) => {
    event.preventDefault();
    const transfer = transfersRef.current[enrollmentId];
    if (
      claimLock.current ||
      !transfer?.checked ||
      transfer.needsRecovery ||
      !["initiated", "rejected"].includes(transfer.state)
    ) {
      return;
    }
    const form = claimForms[enrollmentId] || {};
    const amountPaid = form.amount_paid?.trim();
    if (amountPaid && (!Number.isFinite(Number(amountPaid)) || Number(amountPaid) <= 0)) {
      saveTransfer(enrollmentId, { ...transfer, error: "Enter a valid amount paid, or leave it empty." });
      return;
    }

    claimLock.current = true;
    setClaimingId(enrollmentId);
    saveTransfer(enrollmentId, { ...transfer, error: "" });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/bank-transfer/${encodeURIComponent(transfer.reference)}/claim`,
        {
          access_token: transfer.accessToken,
          ...(form.paid_from_account_name?.trim()
            ? { paid_from_account_name: form.paid_from_account_name.trim() }
            : {}),
          ...(amountPaid ? { amount_paid: Number(amountPaid) } : {}),
          ...(form.note?.trim() ? { note: form.note.trim() } : {}),
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
      saveTransfer(enrollmentId, {
        ...transfer,
        state: "awaiting_confirmation",
        status: "pending",
        checked: true,
        review: null,
        error: "",
      });
    } catch (err) {
      const validation = Object.values(err.response?.data?.errors || {}).flat().join(" ");
      const message =
        validation ||
        err.response?.data?.message ||
        err.message ||
        "Unable to submit your payment claim.";
      const needsRecovery = [403, 404].includes(err.response?.status);
      saveTransfer(enrollmentId, { ...transfer, needsRecovery, error: message });
      if (!needsRecovery) {
        try {
          const updated = await fetchBankTransferStatus(transfersRef.current[enrollmentId]);
          saveTransfer(enrollmentId, {
            ...updated,
            error: ["initiated", "rejected"].includes(updated.state) ? message : "",
          });
        } catch {
          /* The scheduled status check will retry. */
        }
      }
    } finally {
      claimLock.current = false;
      setClaimingId(null);
    }
  };

  const retrySetup = () => {
    enrollmentIds.forEach((id) => {
      const current = transfersRef.current[id];
      if (current) {
        saveTransfer(id, { ...current, error: "", needsRecovery: false });
      }
    });
    setError("");
    setLoading(true);
    setRevision((value) => value + 1);
  };

  const hasOpenTransfer = enrollmentIds.some((id) => {
    const transfer = transfers[id];
    return (
      transfer?.reference &&
      !transfer.needsRecovery &&
      !(transfer.checked && TERMINAL_BANK_STATES.includes(transfer.state))
    );
  });

  return (
    <div className="space-y-4 text-left">
      {loading && <p className="text-sm text-gray-600">Preparing bank transfer details...</p>}

      {hasOpenTransfer && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-[#09314F]">
          <p className="font-bold">Zenith Bank</p>
          <p>Tutorial Center LTD</p>
          <p className="font-mono text-xl font-bold">1312411265</p>
        </div>
      )}

      {!loading && hasOpenTransfer && (
        <p className="text-sm text-gray-600">
          Each course has its own transfer reference and amount. Use the matching reference as the
          transfer narration.
        </p>
      )}

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {enrollmentIds.map((id) => {
        const transfer = transfers[id];
        if (!transfer) return null;
        return (
          <div key={id} className="rounded-xl border border-gray-200 p-4 text-sm">
            <p className="font-bold text-[#09314F]">{courseNameFor(id)}</p>
            {transfer.amount != null && <p>Amount: ₦{Number(transfer.amount).toLocaleString()}</p>}
            {transfer.reference && (
              <p>
                Reference: <strong className="font-mono">{transfer.reference}</strong>
              </p>
            )}
            <p className="mt-2 text-gray-600">
              {!transfer.checked
                ? "Checking payment status..."
                : {
                    initiated: "After transferring, tell us you have paid below.",
                    awaiting_confirmation:
                      "We are confirming your payment. Course access starts after approval.",
                    approved: "Payment approved. This course is paid.",
                    rejected:
                      "Your payment claim was rejected. Review the reason and submit your claim again.",
                    cancelled:
                      "This transfer is closed. The enrollment may already be paid by another method. Do not transfer again.",
                    refunded: "This payment was refunded. Please contact support.",
                  }[transfer.state] || "Checking payment status..."}
            </p>

            {transfer.checked && transfer.state === "rejected" && transfer.review?.reason && (
              <p className="mt-2 text-red-700">Reason: {transfer.review.reason}</p>
            )}
            {transfer.error && (
              <p role="alert" className="mt-2 text-red-700">
                {transfer.error}
              </p>
            )}

            {transfer.needsRecovery && (
              <button
                type="button"
                disabled={claimingId !== null}
                onClick={retrySetup}
                className="mt-3 rounded-lg bg-[#09314F] px-4 py-2 text-white disabled:opacity-50"
              >
                Recover payment details
              </button>
            )}

            {transfer.checked &&
              !transfer.needsRecovery &&
              ["initiated", "rejected"].includes(transfer.state) && (
                <form onSubmit={(event) => claimBankTransfer(event, id)} className="mt-4 space-y-3">
                  <label className="block">
                    Sender's account name (optional)
                    <input
                      type="text"
                      maxLength={255}
                      value={claimForms[id]?.paid_from_account_name || ""}
                      onChange={(event) => updateClaimField(id, "paid_from_account_name", event.target.value)}
                      className="mt-1 w-full rounded-lg border p-2"
                    />
                  </label>
                  <label className="block">
                    Amount paid (optional)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={claimForms[id]?.amount_paid || ""}
                      onChange={(event) => updateClaimField(id, "amount_paid", event.target.value)}
                      className="mt-1 w-full rounded-lg border p-2"
                    />
                  </label>
                  <label className="block">
                    Note (optional)
                    <textarea
                      maxLength={1000}
                      value={claimForms[id]?.note || ""}
                      onChange={(event) => updateClaimField(id, "note", event.target.value)}
                      className="mt-1 w-full rounded-lg border p-2"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={claimingId !== null}
                    className="rounded-lg bg-[#09314F] px-4 py-3 font-bold text-white disabled:opacity-50"
                  >
                    {claimingId === id
                      ? "Submitting claim..."
                      : transfer.state === "rejected"
                      ? "Submit payment claim again"
                      : "I have paid"}
                  </button>
                </form>
              )}

            {transfer.checked &&
              ["awaiting_confirmation", "approved", "rejected"].includes(transfer.state) && (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `I have paid NGN ${Number(transfer.amount || 0).toLocaleString()} for my training.\nCourse: ${courseNameFor(
                      id
                    )}\nReference: ${transfer.reference}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-bold text-green-700 underline"
                >
                  Share payment reference on WhatsApp
                </a>
              )}
          </div>
        );
      })}

      {!loading && enrollmentIds.some((id) => !transfers[id]?.reference) && (
        <button
          type="button"
          onClick={retrySetup}
          disabled={claimingId !== null}
          className="rounded-xl bg-[#09314F] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Retry bank transfer setup
        </button>
      )}
    </div>
  );
}
