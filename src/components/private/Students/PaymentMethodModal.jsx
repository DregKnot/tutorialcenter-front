import React, { useState, useEffect } from "react";
import Paystack from "../../Paystack";
import BankTransferPayment from "./BankTransferPayment";
import { Icon } from "@iconify/react";
import { clearDashboardCache } from "../../../utils/dashboardCache.js";

const WHATSAPP_NUMBER = "2348029606405";

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  selectedDuration, 
  amount = 0, 
  email,
  metadata = {},
  bankEnrollments = [],
  studentId,
  onBankSettled,
  onPendingSubmitted,
  selectedMethod, 
  setSelectedMethod, 
  onContinue, 
  loading 
}) {
  const [pendingDetails, setPendingDetails] = useState(null);
  const [copiedRef, setCopiedRef] = useState("");

  useEffect(() => {
    if (isOpen && !selectedMethod) {
      setSelectedMethod("Paystack");
    }
  }, [isOpen, selectedMethod, setSelectedMethod]);

  // Check if current bank enrollments are already submitted / awaiting confirmation
  useEffect(() => {
    if (isOpen && bankEnrollments.length > 0) {
      try {
        const store = JSON.parse(localStorage.getItem("studentBankTransfers") || "{}");
        const allAwaiting = bankEnrollments.every((e) => {
          const t = store[e.enrollmentId];
          return t && (t.state === "awaiting_confirmation" || t.status === "pending");
        });
        if (allAwaiting) {
          const refRows = bankEnrollments.map((e) => ({
            id: e.enrollmentId,
            courseName: e.courseName,
            transfer: store[e.enrollmentId],
          }));
          const totalAmt = bankEnrollments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          const waMsg = [
            `Hello Tutorial Center, I have paid NGN ${totalAmt.toLocaleString()} for ${refRows.length} course${
              refRows.length === 1 ? "" : "s"
            }.`,
            ...refRows.map(
              ({ courseName, transfer }) =>
                `- ${courseName}: NGN ${Number(transfer?.amount || 0).toLocaleString()} (Ref: ${
                  transfer?.reference || "Pending"
                })`
            ),
            "Attaching my payment screenshot below for confirmation.",
          ].join("\n");

          setPendingDetails({
            references: refRows,
            courses: bankEnrollments,
            totalAmount: totalAmt,
            whatsappMessage: waMsg,
          });
        }
      } catch {}
    } else if (!isOpen) {
      setPendingDetails(null);
      setCopiedRef("");
    }
  }, [isOpen, bankEnrollments]);

  if (!isOpen) return null;

  const reference = `TC-PAY-${Date.now()}`;

  const handleCopyReference = (refText) => {
    if (!refText) return;
    try {
      navigator.clipboard?.writeText(refText);
      setCopiedRef(refText);
      setTimeout(() => setCopiedRef((curr) => (curr === refText ? "" : curr)), 1800);
    } catch {}
  };

  const handlePendingDone = () => {
    if (studentId) {
      clearDashboardCache(studentId);
    }
    if (onPendingSubmitted) {
      onPendingSubmitted(pendingDetails);
    }
    setPendingDetails(null);
    onClose();
  };

  const handleBankPendingCapture = (data) => {
    setPendingDetails(data);
    if (onPendingSubmitted) {
      onPendingSubmitted(data);
    }
    if (studentId) {
      clearDashboardCache(studentId);
    }
  };

  // ── CHANGED POPUP VIEW: PENDING AND WAITING FOR ADMIN APPROVAL ──
  if (pendingDetails) {
    const waText = pendingDetails.whatsappMessage || `Hello Tutorial Center, I have made a bank transfer payment for my courses. Attaching my receipt screenshot below.`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handlePendingDone} />
        <div className="relative bg-white dark:bg-[#09314F] rounded-[36px] p-6 sm:p-8 md:p-10 w-full max-w-lg max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-white/10 text-center">
          <button 
            onClick={handlePendingDone} 
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors font-bold text-gray-400"
            title="Close"
          >
            ✕
          </button>

          {/* Animated Status Icon */}
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon icon="lucide:clock" className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Pending Admin Approval
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0F2843] dark:text-white uppercase tracking-tight">
            Transfer Submitted
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
            Your transfer claim has been received by the system. An administrator is currently reviewing your payment. Your courses will activate automatically upon confirmation.
          </p>

          {/* Transfer Summary Card */}
          <div className="mt-6 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-left space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-white/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Amount</span>
              <span className="text-base font-black text-[#0F2843] dark:text-white">
                ₦{Number(pendingDetails.totalAmount || amount || 0).toLocaleString()}
              </span>
            </div>

            {/* References */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1.5">
                Payment References
              </span>
              <div className="space-y-1.5">
                {(pendingDetails.references || []).map((row, idx) => {
                  const refCode = row.transfer?.reference || row.reference || "TC-PENDING";
                  const isCopied = copiedRef === refCode;
                  return (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between bg-white dark:bg-white/5 px-3 py-2 rounded-xl border border-gray-200/70 dark:border-white/10 text-xs"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[180px]">
                        {row.courseName || `Course #${row.id}`}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-[#0F2843] dark:text-amber-400">
                          {refCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyReference(refCode)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                            isCopied
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                          }`}
                        >
                          {isCopied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bank details recap */}
            <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200/60 dark:border-white/10 flex justify-between items-center">
              <span>Zenith Bank • 1312411265</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">⏳ Awaiting Approval</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/25"
            >
              <Icon icon="ic:baseline-whatsapp" className="w-5 h-5" />
              <span>Share Receipt on WhatsApp</span>
            </a>
            <p className="text-[11px] text-gray-400 leading-normal">
              Send your payment screenshot to our admin on WhatsApp for faster verification.
            </p>

            <button
              type="button"
              onClick={handlePendingDone}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#09314F] hover:bg-[#0c4066] dark:bg-white/10 dark:hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Done • Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STANDARD PAYMENT METHOD SELECTION ──
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[40px] p-8 md:p-10 w-[90%] max-w-md max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400">✕</button>
        <h2 className="text-2xl font-black text-[#0F2843] mb-2 text-center uppercase tracking-tighter italic">Payment Method</h2>
        <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest mb-8">Choose your preferred gateway</p>
        
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8 flex justify-between items-center">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Plan</span>
             <span className="text-sm font-black text-[#0F2843] uppercase italic">{selectedDuration || "Termwise"}</span>
          </div>
          <div className="text-right">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Amount</span>
             <span className="text-xl font-black text-[#0F2843]">₦{amount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mb-10">
          {["Paystack", "Bank Transfer"].map((item) => {
            const isSelected = selectedMethod === item;
            return (
              <button
                key={item}
                onClick={() => setSelectedMethod(item)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#76D287] bg-green-50"
                    : "border-gray-200 hover:border-[#09314F] bg-white"
                }`}
              >
                <span className={`font-bold text-sm md:text-base ${
                  isSelected ? "text-[#09314F]" : "text-gray-600"
                }`}>
                  {item}
                </span>
                <span className={`font-bold text-lg ${
                  isSelected ? "text-[#76D287]" : "text-[#09314F]"
                }`}>
                  {isSelected ? "✓" : "›"}
                </span>
              </button>
            );
          })}
        </div>

        {selectedMethod === "Paystack" ? (
          <Paystack
            amount={amount}
            email={email}
            reference={reference}
            metadata={metadata}
            onSuccess={onContinue}
            onClose={() => {}}
          />
        ) : selectedMethod === "Bank Transfer" ? (
          <BankTransferPayment
            enrollments={bankEnrollments}
            studentId={studentId}
            onAllSettled={onBankSettled}
            onPendingSubmitted={handleBankPendingCapture}
          />
        ) : (
          <button 
            onClick={onContinue} 
            disabled={loading || !selectedMethod} 
            className={`w-full py-5 rounded-[12px] font-bold text-lg text-white shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] ${
              selectedMethod
                ? "bg-gradient-to-r from-[#09314F] to-[#E83831] hover:shadow-[#E8383144]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : `Continue = ₦${amount.toLocaleString()}`}
          </button>
        )}
      </div>
    </div>
  );
}
