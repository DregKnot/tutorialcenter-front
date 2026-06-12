// pages/Students/StudentPaymentDisplay.jsx

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../../components/private/Students/DashboardLayout.jsx";
import RemoveTraining from "../../components/private/Students/RemoveTraining.jsx";
import AddTraining from "../../components/private/Students/AddTraining.jsx";
import PaymentMethodModal from "../../components/private/Students/PaymentMethodModal.jsx";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext.jsx";

export default function StudentPaymentDisplay() {
  const { student, token } = useAuth();
  const [payments, setPayments] = useState([]); // Payment history
  const [activeCourses, setActiveCourses] = useState([]); // For "On-going Training"
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeView, setActiveView] = useState("main"); // "main" | "renew" | "remove" | "add"
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [allCourses, setAllCourses] = useState([]); // Base prices
  const [selectedMethod, setSelectedMethod] = useState("");
  const [renewLoading, setRenewLoading] = useState(false);

  const DURATION_OPTIONS = [
    { key: "monthly", label: "Monthly", months: 1 },
    { key: "quarterly", label: "Quarterly", months: 3 },
    { key: "semi_annual", label: "Semi-Annual", months: 6 },
    { key: "annual", label: "Annual", months: 12 },
  ];

  // Calculate expiry date from start date + billing cycle
  const calculateExpiryDate = (startDate, billingCycle) => {
    if (!startDate || !billingCycle) return null;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;
    
    const monthsMap = {
      monthly: 1,
      quarterly: 3,
      semi_annual: 6,
      annual: 12,
    };
    const months = monthsMap[billingCycle] || 1;
    const expiry = new Date(start);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry;
  };

  const calculatePrice = (basePrice, months) => {
    const total = basePrice * months;
    return months === 1 ? total : total - total * 0.05;
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";



  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch all payment-related data
  const fetchData = useCallback(async () => {
    if (!token) return; // Prevent 401 on initial render if token is still loading from context

    setLoading(true);
    try {
      // 1. Fetch Payment History
      const paymentsRes = await axios.get(`${API_BASE_URL}/api/students/payments`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      // The user wants response.data.payments
      setPayments(paymentsRes.data.payments || paymentsRes.data.courses || []);
      console.log("History API Response:", paymentsRes.data);

      // 2. Fetch Active Enrolled Courses (these have the titles and dates we need for "On-going Training")
      const coursesRes = await axios.get(`${API_BASE_URL}/api/students/courses`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      const activeData = coursesRes.data.courses || coursesRes.data.data || [];
      setActiveCourses(activeData);
      console.log("Courses API Response:", coursesRes.data);

      // 3. Fetch All Courses (for base prices)
      const allCoursesRes = await axios.get(`${API_BASE_URL}/api/courses`);
      setAllCourses(allCoursesRes.data.courses || []);

    } catch (error) {
      console.error("Failed to fetch payment data:", error);
      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load payment info"
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const handleRenewClick = (payment) => {
    setSelectedPayment(payment);
    setSelectedDuration("");
    setCalculatedPrice(0);
    setShowDurationModal(true);
  };

  const handleDurationContinue = () => {
    if (!selectedDuration) {
      setToast({ type: "error", message: "Please select a duration." });
      return;
    }
    setShowDurationModal(false);
    setShowPaymentModal(true);
  };

  const handleRenewContinue = async (response) => {
    if (!selectedMethod) {
      setToast({ type: "error", message: "Please select a payment method." });
      return;
    }

    setRenewLoading(true);
    try {
      const payload = {
        student_id: student?.id,
        course_enrollment_id: selectedPayment.enrollment_id,
        amount: calculatedPrice,
        billing_cycle: selectedDuration,
        payment_method: "card",
        gateway: selectedMethod,
        status: "successful",
        gateway_reference: response?.reference || `TC-REN-${Date.now()}-${student?.id}`,
        paid_at: new Date().toISOString(),
        email: student?.email
      };

      console.log("Sending renewal payment:", payload);

      await axios.post(`${API_BASE_URL}/api/payments`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      setToast({ type: "success", message: "Payment renewed successfully!" });
      setShowPaymentModal(false);
      fetchData();
    } catch (error) {
      console.error("Renewal failed:", error);
      setToast({ 
        type: "error", 
        message: error.response?.data?.message || "Renewal failed. Please try again." 
      });
    } finally {
      setRenewLoading(false);
    }
  };

  // ===================== MAIN VIEW =====================
  const MainView = () => {
    // Calculate summary stats
    const totalPaid = payments.filter(p => p.status === 'successful' || p.status === 'paid').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalTransactions = payments.length;
    const activeCount = payments.filter(p => p.status === 'successful' || p.status === 'paid').length;

    return (
      <>
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => setActiveView("add")}
            className="px-6 py-5 bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] rounded-3xl text-left hover:shadow-md hover:border-[#C5A97A]/40 transition-all active:scale-[0.99] group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 rounded-2xl flex items-center justify-center border border-green-100 dark:border-green-900/30 shrink-0">
                <span className="text-xl text-green-500">+</span>
              </div>
              <div>
                <h4 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-tight">Add Training</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Enroll in a new course</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setActiveView("renew")}
            className="px-6 py-6 md:py-5 bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] rounded-3xl text-left hover:shadow-md hover:border-[#C5A97A]/40 transition-all active:scale-[0.99] group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-12 md:h-12 bg-blue-50 dark:bg-blue-950/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shrink-0">
                <span className="text-2xl md:text-xl text-[#C5A97A]">↻</span>
              </div>
              <div>
                <h4 className="text-base md:text-sm font-black text-[#09314F] dark:text-white uppercase tracking-tight">Renew Payment</h4>
                <p className="text-xs md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Extend your subscription</p>
              </div>
            </div>
          </button>
        </div>

        {/* Summary Stats Row */}
        {!loading && payments.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-3 md:p-5 border border-gray-100 dark:border-[#09314F] shadow-sm flex flex-col items-center md:items-start text-center md:text-left justify-center">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-sm sm:text-lg md:text-xl font-black text-[#09314F] dark:text-white">₦{totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-3 md:p-5 border border-gray-100 dark:border-[#09314F] shadow-sm flex flex-col items-center md:items-start text-center md:text-left justify-center">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Transactions</p>
              <p className="text-base sm:text-lg md:text-xl font-black text-[#09314F] dark:text-white">{totalTransactions}</p>
            </div>
            <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-3xl p-3 md:p-5 border border-gray-100 dark:border-[#09314F] shadow-sm flex flex-col items-center md:items-start text-center md:text-left justify-center">
              <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Active</p>
              <p className="text-base sm:text-lg md:text-xl font-black text-green-500">{activeCount}</p>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md rounded-[32px] border border-gray-100 dark:border-[#09314F] shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 md:px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-widest">Payment History</h2>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{payments.length} Records</span>
          </div>

          {/* Table Column Headers (Desktop) */}
          {!loading && payments.length > 0 && (
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 md:px-8 py-3 bg-gray-50/80 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-800 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <div className="col-span-4">Course</div>
              <div className="col-span-2 text-center">Amount</div>
              <div className="col-span-2 text-center">Billing</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-right">Expires</div>
            </div>
          )}

          {/* Table Content */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#09314F] border-t-transparent dark:border-white dark:border-t-transparent mx-auto" />
                <p className="mt-4 text-gray-400 font-black text-xs uppercase tracking-widest">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20 px-8">
                <div className="w-16 h-16 bg-gray-50 dark:bg-[#06243A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-300">₦</span>
                </div>
                <h3 className="text-base font-black text-[#09314F] dark:text-white mb-1">No Payment History</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">You haven't made any payments yet. Add a training to get started.</p>
              </div>
            ) : (
              payments.map((payment, index) => {
                const relatedCourse = activeCourses.find(c => 
                  Number(c.enrollment_id) === Number(payment.course_enrollment_id) ||
                  Number(c.course_id) === Number(payment.course_id)
                );
                
                const displayTitle = payment.course?.title || payment.course_title || payment.course_name || relatedCourse?.course?.title || payment.name || `Payment #${payment.id}`;
                const isCancelled = payment.status === 'cancelled' || payment.status === 'removed';
                const isSuccessful = payment.status === 'successful' || payment.status === 'paid';
                const isPending = !isSuccessful && !isCancelled;

                const startDate = payment.start_date || payment.paid_at || payment.created_at;
                const computedExpiry = calculateExpiryDate(startDate, payment.billing_cycle);
                const expiryDisplay = computedExpiry ? formatDate(computedExpiry) : formatDate(payment.end_date || payment.expires_at || payment.expiry_date);

                const billingLabel = payment.billing_cycle ? payment.billing_cycle.replace('_', '-') : '—';

                return (
                  <div
                    key={payment.id || `history-${index}`}
                    className="px-6 md:px-8 py-5 hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-all"
                  >
                    {/* Desktop Row */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* Course Info */}
                      <div className="col-span-4 flex items-center gap-3.5 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                          isCancelled 
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-500' 
                            : isPending
                            ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30 text-[#C5A97A]'
                            : 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-500'
                        }`}>
                          <span className="font-black text-sm">₦</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-tight truncate">{displayTitle}</h4>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{formatDate(startDate)}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 text-center">
                        <span className="text-sm font-black text-[#09314F] dark:text-white">₦{Number(payment.amount || 0).toLocaleString()}</span>
                      </div>

                      {/* Billing Cycle */}
                      <div className="col-span-2 text-center">
                        <span className="px-3 py-1.5 bg-gray-100 dark:bg-[#06243A] text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-lg capitalize">{billingLabel}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 text-center">
                        {isSuccessful && (
                          <span className="px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-500/20">
                            Paid
                          </span>
                        )}
                        {isCancelled && (
                          <span className="px-3 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-500/20">
                            Cancelled
                          </span>
                        )}
                        {isPending && (
                          <span className="px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full text-[9px] font-black uppercase tracking-wider border border-yellow-500/20">
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Expiry */}
                      <div className="col-span-2 text-right">
                        <span className={`text-[11px] font-bold ${isCancelled ? 'text-red-400 line-through' : 'text-gray-500 dark:text-gray-400'}`}>
                          {isCancelled ? 'Expired' : expiryDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Row */}
                    <div className="md:hidden flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                          isCancelled 
                            ? 'bg-red-50 border-red-100 text-red-500' 
                            : 'bg-green-50 border-green-100 text-green-500'
                        }`}>
                          <span className="font-black text-sm">₦</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-[#09314F] dark:text-white uppercase tracking-tight truncate">{displayTitle}</h4>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">₦{Number(payment.amount || 0).toLocaleString()} • {billingLabel}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isSuccessful && (
                          <span className="px-2.5 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-green-500/20 block mb-1">Paid</span>
                        )}
                        {isCancelled && (
                          <span className="px-2.5 py-1 bg-red-500/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-500/20 block mb-1">Cancelled</span>
                        )}
                        {isPending && (
                          <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-yellow-500/20 block mb-1">Pending</span>
                        )}
                        <span className="text-[10px] text-gray-400 font-bold">{isCancelled ? 'Expired' : expiryDisplay}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </>
    );
  };

  // ===================== RENEW VIEW (ON-GOING TRAINING) =====================
  const RenewView = () => (
    <>
      <button
        onClick={() => setActiveView("main")}
        className="flex items-center gap-2 mb-8 group mt-4"
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-[#09314F] dark:group-hover:text-white transition-colors" />
        <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-[#09314F] dark:group-hover:text-white transition-colors">
          Back / <span className="font-bold text-[#09314F] dark:text-white">Renew Payment</span>
        </span>
      </button>

      <div>
        <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-5">On-going Training</h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#09314F] dark:border-white mx-auto" />
          </div>
        ) : activeCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-bold">No active trainings found.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {activeCourses.map((item, index) => {
              const iStatus = item.status?.toLowerCase();
              const isCancelled = iStatus === 'cancelled' || iStatus === 'removed' || iStatus === 'inactive';
              
              return (
                <div
                  key={item.enrollment_id || item.id || `active-${index}`}
                  className={`bg-white dark:bg-[#09314F]/50 dark:backdrop-blur-md border rounded-xl p-5 hover:shadow-sm transition-all ${isCancelled ? 'border-red-100 bg-red-50/10 dark:bg-red-900/10 dark:border-red-900/30' : 'border-gray-200 dark:border-[#09314F]'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[15px] font-bold text-[#09314F] dark:text-white">
                        {item.course?.title || item.course_name || `Enrollment #${item.enrollment_id}`}
                      </h4>
                      <div>
                        {isCancelled ? (
                          <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-red-100 shadow-sm">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-tighter border border-green-100 shadow-sm">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sub: <span className="font-bold text-gray-700 dark:text-gray-200 ml-2 capitalize">{item.billing_cycle || "—"}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRenewClick(item)}
                    className={`mt-4 w-full py-3.5 md:py-2 text-white text-sm md:text-xs font-black rounded-xl transition-all shadow-md active:scale-[0.99] ${isCancelled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#09314F] hover:bg-[#0a3d63]'}`}
                  >
                    {isCancelled ? "Re-enroll Training" : "Renew Training"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  // ===================== MODAL =====================
  const DurationModal = () => {
    const courseInfo = allCourses.find(c => Number(c.id) === Number(selectedPayment?.course_id));
    
    const handleSelect = (key) => {
      setSelectedDuration(key);
      const option = DURATION_OPTIONS.find(d => d.key === key);
      const price = calculatePrice(courseInfo?.price || 0, option.months);
      setCalculatedPrice(price);
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDurationModal(false)} />
        <div className="relative bg-white rounded-3xl p-8 md:p-10 w-[90%] max-w-md shadow-2xl z-10">
          <button onClick={() => setShowDurationModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400">✕</button>
          <h2 className="text-2xl font-black text-[#09314F] mb-6 text-center">Select Duration</h2>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Training</p>
            <p className="font-black text-[#09314F]">{selectedPayment?.course?.title || selectedPayment?.course_name}</p>
          </div>
          <div className="space-y-3 mb-8">
            {DURATION_OPTIONS.map((opt) => (
              <button key={opt.key} onClick={() => handleSelect(opt.key)} className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all ${selectedDuration === opt.key ? "border-[#09314F] bg-blue-50" : "border-gray-200 hover:border-[#09314F] bg-white"}`}>
                <span className={`font-bold text-sm ${selectedDuration === opt.key ? "text-[#09314F]" : "text-gray-600"}`}>{opt.label}</span>
                {selectedDuration === opt.key && <span className="text-[#09314F] font-bold">₦{calculatedPrice.toLocaleString()}</span>}
              </button>
            ))}
          </div>
          <button onClick={handleDurationContinue} className="w-full py-4 px-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-[#09314F] to-[#E83831] hover:opacity-90 active:scale-[0.98]">
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  };


  return (
    <DashboardLayout pagetitle="Payment">
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-6 py-4 rounded-2xl shadow-2xl text-white ${toast.type === "success" ? "bg-[#76D287]" : "bg-[#E83831] transition-all"}`}>
          <p className="font-bold text-sm">{toast.message}</p>
        </div>
      )}
      
      <div className="max-w-5xl mx-auto w-full min-h-screen">
        {activeView === "main" ? (
          <MainView />
        ) : activeView === "renew" ? (
          <RenewView />
        ) : activeView === "add" ? (
          <AddTraining 
            onBack={() => setActiveView("main")} 
            onSuccess={(msg) => {
              setToast({ type: "success", message: msg });
              fetchData();
              setActiveView("main");
            }}
          />
        ) : (
          <RemoveTraining 
            activeCourses={activeCourses}
            loading={loading}
            fetchData={fetchData}
            setToast={setToast}
            setActiveView={setActiveView}
            API_BASE_URL={API_BASE_URL}
            token={token}
            formatDate={formatDate}
          />
        )}
      </div>

      {showDurationModal && <DurationModal />}
      {showPaymentModal && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedDuration={selectedDuration}
          amount={calculatedPrice}
          email={student?.email}
          selectedMethod={selectedMethod}
          setSelectedMethod={setSelectedMethod}
          onContinue={handleRenewContinue}
          loading={renewLoading}
        />
      )}
    </DashboardLayout>
  );
}
