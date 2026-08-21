import React, { useState, useEffect } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

export default function StudentPaymentsRecovery({ studentEmail, studentId, API_BASE_URL, token, apiPrefix, isPreview }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recoveringId, setRecoveringId] = useState(null);
  const [gatewayRef, setGatewayRef] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!studentEmail) return;
    
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // We use the recovery search endpoint which allows admin to find by email
        const res = await axios.get(`${API_BASE_URL}/api/${apiPrefix}/payments/registration-recovery/search?search=${encodeURIComponent(studentEmail)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.payments) {
          setPayments(res.data.payments);
        } else if (res.data?.data) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch payments for recovery", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [studentEmail, API_BASE_URL, token, apiPrefix]);

  const handleRecover = async (paymentId) => {
    if (!gatewayRef || !reason) {
       setError("Gateway Reference and Reason are required.");
       return;
    }
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/${apiPrefix}/payments/${paymentId}/registration-recovery`,
        { gateway_reference: gatewayRef, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data?.message || "Recovery successful");
      setRecoveringId(null);
      // Update local state to reflect success
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'successful' } : p));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to recover payment");
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading payments...</div>;
  if (payments.length === 0) return <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-xl">No payments found for this student.</div>;

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-600 text-xs rounded-xl font-bold">{success}</div>}
      
      {payments.map(payment => (
        <div key={payment.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-black text-[#0F2843] dark:text-white">
                Payment #{payment.id} - ₦{parseFloat(payment.amount).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 font-semibold mt-1">
                Ref: {payment.gateway_reference || "N/A"} • Date: {new Date(payment.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${
              payment.status === 'successful' ? 'bg-green-100 text-green-600' :
              payment.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'
            }`}>
              {payment.status}
            </div>
          </div>
          
          {/* Recovery UI for Pending/Failed Payments */}
          {!isPreview && payment.status !== 'successful' && apiPrefix === 'admin' && (
            <div className="mt-2 pt-3 border-t border-gray-200 dark:border-gray-700">
              {recoveringId === payment.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Enter Gateway Reference (e.g. from Paystack)"
                    value={gatewayRef}
                    onChange={e => setGatewayRef(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Reason for manual recovery (e.g. Confirmed on Paystack dashboard)"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full text-xs p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRecover(payment.id)}
                      className="px-3 py-1.5 bg-[#0F2843] text-white text-xs font-bold rounded"
                    >
                      Confirm Recovery
                    </button>
                    <button 
                      onClick={() => { setRecoveringId(null); setError(null); }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-bold rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => { setRecoveringId(payment.id); setGatewayRef(payment.gateway_reference || ""); setReason(""); setError(null); }}
                  className="text-[11px] font-black uppercase text-[#BB9E7F] hover:text-[#0F2843] transition-colors flex items-center gap-1"
                >
                  <Icon icon="heroicons:arrow-path" className="w-3.5 h-3.5" />
                  Recover Payment
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
