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
 */
export default function BankTransferPayment({ enrollments = [], studentId, onAllSettled }) {
  const [transfers, setTransfers] = useState(readStore);
  const [loading, setLoading] = useState(true);
  const [sharedForm, setSharedForm] = useState({
    paid_from_account_name: "",
    amount_paid: "",
    note: "",
  });
  const [sharedError, setSharedError] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [copied, setCopied] = useState("");
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
    event.preventDefault();
    if (claimLock.current) return;
    const targets = claimableIds;
    if (!targets.length) return;

    const name = sharedForm.paid_from_account_name?.trim();
    const note = sharedForm.note?.trim();
    const amountPaid = sharedForm.amount_paid?.trim();
    if (amountPaid && (!Number.isFinite(Number(amountPaid)) || Number(amountPaid) <= 0)) {
      setSharedError("Enter a valid amount paid, or leave it empty.");
      return;
    }

    claimLock.current = true;
    setClaiming(true);
    setClaimed(true);
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

    if (failures) {
      setSharedError(
        "Some courses could not be claimed. Review the messages below and submit your claim again."
      );
    }
    claimLock.current = false;
    setClaiming(false);
  };

  const retrySetup = () => {
    enrollmentIds.forEach((id) => {
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
  const pendingCount = enrollmentIds.filter((id) => !isSettledTransfer(transfers[id])).length;

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
      {loading && <p className="text-sm text-gray-600">Preparing bank transfer details...</p>}

      {!loading && pendingCount > 0 && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm text-[#09314F]">
          <p className="font-bold">Zenith Bank</p>
          <p>Tutorial Center LTD</p>
          <p className="font-mono text-xl font-bold">1312411265</p>
        </div>
      )}

      {!loading && (
        <div className="rounded-xl border border-gray-200 p-4 text-sm">
          <div className="flex justify-between font-bold text-[#09314F]">
            <span>Total to transfer</span>
            <span>₦{totalAmount.toLocaleString()}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {referenceRows.length} course{referenceRows.length === 1 ? "" : "s"} — transfer each amount
            using its own reference as the narration.
          </p>
        </div>
      )}

      {!loading && referenceRows.length > 0 && (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4 text-sm">
          <p className="font-bold text-[#09314F]">Transfer references</p>
          {referenceRows.map(({ id, transfer }) => (
            <div
              key={id}
              className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-semibold text-[#09314F]">{courseNameFor(id)}</p>
                <p className="text-gray-500">₦{Number(transfer.amount || 0).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{transfer.reference}</span>
                <button
                  type="button"
                  onClick={() => copyReference(transfer.reference)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-semibold text-[#09314F] hover:bg-gray-50"
                >
                  {copied === transfer.reference ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {claimableIds.length > 0 && (
        <form onSubmit={claimAll} className="space-y-3 rounded-xl border border-gray-200 p-4 text-sm">
          <p className="font-bold text-[#09314F]">I have paid</p>
          <label className="block">
            Sender's account name (optional)
            <input
              type="text"
              maxLength={255}
              value={sharedForm.paid_from_account_name}
              onChange={(event) => updateSharedField("paid_from_account_name", event.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
          <label className="block">
            Amount paid (optional)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={sharedForm.amount_paid}
              onChange={(event) => updateSharedField("amount_paid", event.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
            />
            {claimableIds.length > 1 && (
              <span className="mt-1 block text-xs text-gray-500">
                Leave blank if you paid each course separately — we match each reference to its own
                amount.
              </span>
            )}
          </label>
          <label className="block">
            Note (optional)
            <textarea
              maxLength={1000}
              value={sharedForm.note}
              onChange={(event) => updateSharedField("note", event.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
          {sharedError && (
            <p role="alert" className="text-red-700">
              {sharedError}
            </p>
          )}
          <button
            type="submit"
            disabled={claiming}
            className="w-full rounded-lg bg-[#09314F] px-4 py-3 font-bold text-white disabled:opacity-50"
          >
            {claiming
              ? "Submitting claim..."
              : `I have paid${claimableIds.length > 1 ? ` (${claimableIds.length} courses)` : ""}`}
          </button>
        </form>
      )}

      {claimed && referenceRows.length > 0 && (
        <div className="space-y-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-green-700"
          >
            Send your payment receipt on WhatsApp
          </a>
          <p className="text-xs text-gray-500">
            After WhatsApp opens, tap the attachment (📎) icon and add your payment screenshot to the
            chat, then send it.
          </p>
        </div>
      )}

      {!loading && referenceRows.length > 0 && (
        <div className="space-y-2">
          {referenceRows.map(({ id, transfer }) => (
            <div key={id} className="rounded-xl border border-gray-200 p-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-[#09314F]">{courseNameFor(id)}</span>
                <span className="font-mono text-gray-500">{transfer.reference}</span>
              </div>
              <p className="mt-1 text-gray-600">
                {!transfer.checked
                  ? "Checking payment status..."
                  : STATE_TEXT[transfer.state] || "Checking payment status..."}
              </p>
              {transfer.checked && transfer.state === "rejected" && transfer.review?.reason && (
                <p className="mt-1 text-red-700">Reason: {transfer.review.reason}</p>
              )}
              {transfer.error && (
                <p role="alert" className="mt-1 text-red-700">
                  {transfer.error}
                </p>
              )}
              {transfer.needsRecovery && (
                <button
                  type="button"
                  disabled={claiming}
                  onClick={retrySetup}
                  className="mt-2 rounded-lg bg-[#09314F] px-3 py-2 text-white disabled:opacity-50"
                >
                  Recover payment details
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && enrollmentIds.some((id) => !transfers[id]?.reference) && (
        <button
          type="button"
          onClick={retrySetup}
          disabled={claiming}
          className="rounded-xl bg-[#09314F] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Retry bank transfer setup
        </button>
      )}
    </div>
  );
}
