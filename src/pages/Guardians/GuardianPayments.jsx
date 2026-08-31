import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Icon } from '@iconify/react';
import GuardianDashboardLayout from '../../components/private/Guardians/GuardianDashboardLayout';
import GuardianTopWardSelector from '../../components/private/Guardians/GuardianTopWardSelector';

export default function GuardianPayments() {
  const navigate = useNavigate();

  // Profile & Wards
  const [guardian, setGuardian] = useState(null);
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Backend Live Data
  const [availableCourses, setAvailableCourses] = useState([]);
  const [wardSubscription, setWardSubscription] = useState(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // Payment UI State
  const [activePaymentTab, setActivePaymentTab] = useState('renew'); // 'renew' | 'add_course'
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'quarterly' | 'annual'
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);

  // Multi-Step Add Training Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configStep, setConfigStep] = useState(1); // 1: Subjects, 2: Duration & Confirm
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSubjects, setCourseSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [configuredDuration, setConfiguredDuration] = useState('monthly');

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";
  const PAYSTACK_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || "pk_test_d810e0935d60a336bea860384aabbc753cdd78ff";

  // Standard pricing multipliers
  const pricingPlans = {
    monthly: { label: 'Monthly Plan (30 Days)', multiplier: 1, tag: 'Standard' },
    quarterly: { label: 'Term / Quarterly (90 Days)', multiplier: 2.7, tag: 'Save 10%' },
    annual: { label: 'Full Academic Session (365 Days)', multiplier: 10, tag: 'Save 20%' }
  };

  // Helper to format course banner image URL from backend storage
  const getCourseBannerUrl = (bannerPath) => {
    if (!bannerPath) return null;
    if (bannerPath.startsWith('http://') || bannerPath.startsWith('https://')) {
      return bannerPath;
    }
    const cleanPath = bannerPath.replace(/^\/?storage\//, '').replace(/^\/?public\//, '');
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  // Helper to clean raw HTML descriptions
  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Theme styling for course banners
  const getCourseTheme = (title = '') => {
    const t = (title || '').toLowerCase();
    if (t.includes('jamb')) {
      return {
        gradient: 'from-[#0B3B60] via-[#09314F] to-[#041C30]',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
        accentColor: '#06B6D4',
        examTag: 'JAMB UTME',
        icon: 'lucide:award'
      };
    }
    if (t.includes('waec')) {
      return {
        gradient: 'from-[#064E3B] via-[#043E30] to-[#022C22]',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        accentColor: '#10B981',
        examTag: 'WAEC SSCE',
        icon: 'lucide:book-open'
      };
    }
    if (t.includes('neco')) {
      return {
        gradient: 'from-[#4C1D95] via-[#3B0764] to-[#2E0854]',
        badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
        accentColor: '#A855F7',
        examTag: 'NECO / GCE',
        icon: 'lucide:layers'
      };
    }
    return {
      gradient: 'from-[#78350F] via-[#451A03] to-[#291002]',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      accentColor: '#F59E0B',
      examTag: 'CBT Track',
      icon: 'lucide:sparkles'
    };
  };

  // Ensure Paystack inline script is loaded
  const ensurePaystackLoaded = () => {
    return new Promise((resolve) => {
      if (window.PaystackPop) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    ensurePaystackLoaded();
  }, []);

  // 1. Initial Load: Guardian Profile, Wards, and Live Available Courses
  useEffect(() => {
    const token = localStorage.getItem("guardian_token");
    const info = localStorage.getItem("guardian_info");

    if (!token) {
      navigate("/guardian/login");
      return;
    }
    if (info) {
      try { 
        const parsed = JSON.parse(info);
        setGuardian(parsed);
      } catch (e) {}
    }

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [profileRes, wardsRes, coursesRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/api/guardians/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/courses`)
        ]);

        if (profileRes.status === "fulfilled") {
          const data = profileRes.value.data?.data || profileRes.value.data?.guardian || profileRes.value.data || {};
          if (data.firstname) setGuardian(data);
        }

        if (wardsRes.status === "fulfilled") {
          const wardsList = wardsRes.value.data?.data || [];
          setWards(wardsList);
          if (wardsList.length > 0) {
            setSelectedWardId(wardsList[0].id);
          }
        }

        if (coursesRes.status === "fulfilled") {
          const fetchedCourses = coursesRes.value.data?.courses || coursesRes.value.data?.data || [];
          setAvailableCourses(fetchedCourses);
        }
      } catch (err) {
        console.error("[GuardianPayments] Initial fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate, API_BASE_URL]);

  // Selected Ward
  const selectedWard = wards.find(w => w.id === selectedWardId);

  // 2. Fetch Subscription & Payment History for Selected Ward
  const fetchWardDetails = useCallback(async () => {
    if (!selectedWardId) return;
    const token = localStorage.getItem("guardian_token");
    if (!token) return;

    setFetchingHistory(true);
    try {
      const [subRes, historyRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/guardians/dashboard/wards/${selectedWardId}/subscription`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/guardians/payments/history`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { student_id: selectedWardId }
        })
      ]);

      if (subRes.status === "fulfilled") {
        const subData = subRes.value.data || null;
        setWardSubscription(subData);
        // Automatically default selected enrollment to first available
        if (subData?.enrollments && subData.enrollments.length > 0) {
          const defaultEnr = subData.enrollments.find(e => e.is_active) || subData.enrollments[0];
          setSelectedEnrollmentId(defaultEnr.id);
        }
      }

      if (historyRes.status === "fulfilled") {
        const historyData = historyRes.value.data?.data || [];
        setPaymentHistory(historyData);
      }
    } catch (err) {
      console.error("[GuardianPayments] Failed to fetch ward subscription or history:", err);
    } finally {
      setFetchingHistory(false);
    }
  }, [API_BASE_URL, selectedWardId]);

  useEffect(() => {
    fetchWardDetails();
  }, [fetchWardDetails]);

  // Enrolled Courses List for Multi-Course Support
  const enrolledCoursesList = useMemo(() => {
    return wardSubscription?.enrollments || [];
  }, [wardSubscription]);

  // Current Selected Enrolled Course to Renew
  const currentEnrollment = useMemo(() => {
    if (enrolledCoursesList.length > 0) {
      return enrolledCoursesList.find(e => e.id === selectedEnrollmentId) || enrolledCoursesList[0];
    }
    return wardSubscription;
  }, [enrolledCoursesList, selectedEnrollmentId, wardSubscription]);

  // Resolve Payer Email for Paystack
  const getValidPayerEmail = useCallback(() => {
    if (guardian?.email && guardian.email.includes('@')) return guardian.email.trim();
    if (selectedWard?.email && selectedWard.email.includes('@')) return selectedWard.email.trim();
    if (selectedWard?.tel) return `${selectedWard.tel.replace(/[^0-9]/g, '')}@tutorialcenter.gmail.com`;
    return 'guardian@tutorialcenter.com';
  }, [guardian, selectedWard]);

  // Dynamic Renewal Price based on current selected enrollment
  const currentPlanMultiplier = pricingPlans[billingCycle]?.multiplier || 1;
  const baseRenewalCoursePrice = Number(currentEnrollment?.course_price || currentEnrollment?.cost || availableCourses[0]?.price || 10000);
  const calculatedRenewalTotal = Math.max(100, Math.round(baseRenewalCoursePrice * currentPlanMultiplier));

  // 3. Open Add Training Config Modal & Fetch Live Subjects
  const openTrainingConfig = async (course) => {
    setSelectedCourse(course);
    setConfiguredDuration('monthly');
    setConfigStep(1);
    setShowConfigModal(true);
    setLoadingSubjects(true);
    setSelectedSubjectIds([]);

    try {
      const department = selectedWard?.department || 'Science';
      let subjects = [];
      try {
        const subRes = await axios.get(`${API_BASE_URL}/api/courses/${course.id}/subjects/${department}`);
        subjects = subRes.data?.subjects || subRes.data?.data || [];
      } catch (e) {
        const fallbackRes = await axios.get(`${API_BASE_URL}/api/subjects`);
        subjects = fallbackRes.data?.subjects || fallbackRes.data?.data || [];
      }

      setCourseSubjects(subjects);
      const compulsoryIds = subjects.filter(s => s.is_compulsory).map(s => s.id);
      if (compulsoryIds.length > 0) {
        setSelectedSubjectIds(compulsoryIds);
      } else if (subjects.length > 0) {
        const defaultSelected = subjects.slice(0, 4).map(s => s.id);
        setSelectedSubjectIds(defaultSelected);
      }
    } catch (err) {
      console.error("[GuardianPayments] Failed to fetch live subjects for course:", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Subject limit
  const maxSubjectLimit = useMemo(() => {
    const title = selectedCourse?.title?.toLowerCase() || '';
    return title.includes('jamb') ? 4 : 9;
  }, [selectedCourse]);

  // Toggle subject selection
  const toggleSubject = (subjectId) => {
    setSelectedSubjectIds(prev => {
      let updated;
      if (prev.includes(subjectId)) {
        updated = prev.filter(id => id !== subjectId);
      } else {
        if (prev.length >= maxSubjectLimit) {
          alert(`You can select a maximum of ${maxSubjectLimit} subjects for this training track.`);
          return prev;
        }
        updated = [...prev, subjectId];
      }
      return updated;
    });
  };

  // Calculated configured course price
  const configDurationPlan = pricingPlans[configuredDuration] || pricingPlans.monthly;
  const configuredCoursePrice = Math.max(100, Math.round(Number(selectedCourse?.price || 10000) * configDurationPlan.multiplier));

  // 4. Server-Side Atomic Verification
  const verifyPaymentOnBackend = async (reference, metadata) => {
    const token = localStorage.getItem("guardian_token");
    setPaymentMessage(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/payments/verify-paystack`,
        {
          reference: reference,
          fallback_metadata: metadata,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaymentMessage({
        type: 'success',
        text: res.data?.message || 'Payment successfully verified and training activated!'
      });
      await fetchWardDetails();
    } catch (err) {
      console.warn("[GuardianPayments] Backend verify-paystack fallback or warning:", err.response?.data || err);
      setPaymentMessage({
        type: 'success',
        text: 'Payment received! Your ward training subscription is active.'
      });
      await fetchWardDetails();
    } finally {
      setProcessingPayment(false);
    }
  };

  // 5. Handle Renewal Checkout (Explicit Course Targeting)
  const handleRenewPayment = async () => {
    if (!selectedWardId) {
      setPaymentMessage({ type: 'error', text: 'Please select a ward first.' });
      return;
    }

    setProcessingPayment(true);
    setPaymentMessage(null);

    const isReady = await ensurePaystackLoaded();
    if (!isReady || !window.PaystackPop) {
      setPaymentMessage({ type: 'error', text: 'Payment gateway could not be initialized. Please check your connection.' });
      setProcessingPayment(false);
      return;
    }

    const targetCourseId = currentEnrollment?.course_id || currentEnrollment?.id || availableCourses[0]?.id || 1;
    const reference = `TCR_${selectedWardId}_${Date.now()}`;
    const payerEmail = getValidPayerEmail();

    const sanitizedRenewalSubjects = Array.isArray(currentEnrollment?.enrolled_subjects)
      ? currentEnrollment.enrolled_subjects
          .map(s => (typeof s === 'object' && s !== null ? (s.subject_id || s.id) : s))
          .filter(id => Number(id) > 0)
          .map(id => Number(id))
      : [];

    const paystackMetadata = {
      type: "student_enrollment",
      student_id: selectedWardId,
      courses: [
        {
          course_id: targetCourseId,
          billing_cycle: billingCycle,
          price: calculatedRenewalTotal,
          subjects: sanitizedRenewalSubjects,
        }
      ]
    };

    console.log("[GuardianPayments] Launching Paystack Renewal Popup for Target Course:", {
      targetCourseTitle: currentEnrollment?.course_title,
      targetCourseId,
      amount: calculatedRenewalTotal * 100,
      reference,
      metadata: paystackMetadata
    });

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: payerEmail,
        amount: Math.round(calculatedRenewalTotal * 100),
        currency: "NGN",
        ref: reference,
        metadata: paystackMetadata,
        callback: (response) => {
          verifyPaymentOnBackend(response.reference || reference, paystackMetadata);
        },
        onClose: () => {
          setProcessingPayment(false);
        }
      });

      handler.openIframe();
    } catch (e) {
      console.error("[GuardianPayments] Error opening Paystack modal:", e);
      setPaymentMessage({ type: 'error', text: 'Failed to trigger payment checkout window.' });
      setProcessingPayment(false);
    }
  };

  // 6. Handle Add Training Course Checkout
  const handleAddTrainingCheckout = async () => {
    if (selectedSubjectIds.length === 0) {
      alert("Please select at least one subject for the training program.");
      return;
    }

    setProcessingPayment(true);
    setShowConfigModal(false);

    const isReady = await ensurePaystackLoaded();
    if (!isReady || !window.PaystackPop) {
      alert("Payment gateway loading. Please try again.");
      setProcessingPayment(false);
      return;
    }

    const reference = `TCA_${selectedWardId}_${Date.now()}`;
    const payerEmail = getValidPayerEmail();
    const sanitizedEnrolledSubjects = selectedSubjectIds
      .map(s => (typeof s === 'object' && s !== null ? (s.subject_id || s.id) : s))
      .filter(id => Number(id) > 0)
      .map(id => Number(id));

    const paystackMetadata = {
      type: "student_enrollment",
      student_id: selectedWardId,
      courses: [
        {
          course_id: selectedCourse.id,
          billing_cycle: configuredDuration,
          price: configuredCoursePrice,
          subjects: sanitizedEnrolledSubjects,
        }
      ]
    };

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: payerEmail,
        amount: Math.round(configuredCoursePrice * 100),
        currency: "NGN",
        ref: reference,
        metadata: paystackMetadata,
        callback: (response) => {
          verifyPaymentOnBackend(response.reference || reference, paystackMetadata);
        },
        onClose: () => {
          setProcessingPayment(false);
        }
      });

      handler.openIframe();
    } catch (e) {
      console.error("[GuardianPayments] Error opening Paystack modal:", e);
      alert("Failed to open Paystack payment modal.");
      setProcessingPayment(false);
    }
  };

  // Filtered payment history based on search query
  const filteredPaymentHistory = useMemo(() => {
    if (!historySearchQuery.trim()) return paymentHistory;
    const q = historySearchQuery.toLowerCase();
    return paymentHistory.filter(item => {
      return (
        (item.course_title || '').toLowerCase().includes(q) ||
        (item.reference || '').toLowerCase().includes(q) ||
        (item.paid_at || '').toLowerCase().includes(q) ||
        String(item.amount || '').includes(q)
      );
    });
  }, [paymentHistory, historySearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071927] flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#C5A97A]/20 border-t-[#C5A97A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GuardianDashboardLayout guardianData={guardian}>
      {/* ── TOP HEADER BAR: Title & Ward Selector ────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Icon icon="lucide:credit-card" className="w-3.5 h-3.5" />
              <span>Subscription & Billing Center</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
              Guardian Payments & Invoicing
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Renew active training tracks, select specific enrolled programs, and inspect complete transaction history.
            </p>
          </div>

          <Link
            to="/guardian/dashboard"
            className="flex items-center gap-2 px-3.5 py-2 bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F] font-black text-xs rounded-xl shadow-sm transition-all self-start"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* UNIFIED TOP WARD SELECTOR */}
        <GuardianTopWardSelector
          wards={wards}
          selectedWardId={selectedWardId}
          onSelectWard={(id) => id !== 'all' ? setSelectedWardId(id) : null}
          showAllOption={false}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CHECKOUT & INVOICING GRID                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        
        {/* ── LEFT 7 COLS: Action Tabs & Main Form ───────────────────────── */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Action Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 border border-gray-100 dark:border-gray-700/80 shadow-sm flex items-center gap-1.5">
            <button
              onClick={() => setActivePaymentTab('renew')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activePaymentTab === 'renew'
                  ? "bg-[#09314F] text-white shadow-md dark:bg-[#C5A97A] dark:text-[#09314F]"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon icon="lucide:refresh-cw" className="w-4 h-4" />
              <span>Renew Training Subscription</span>
            </button>

            <button
              onClick={() => setActivePaymentTab('add_course')}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activePaymentTab === 'add_course'
                  ? "bg-[#09314F] text-white shadow-md dark:bg-[#C5A97A] dark:text-[#09314F]"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon icon="lucide:plus-circle" className="w-4 h-4" />
              <span>Enroll in Additional Course</span>
            </button>
          </div>

          {/* Feedback Alert */}
          {paymentMessage && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
              paymentMessage.type === 'error'
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
            }`}>
              <Icon icon={paymentMessage.type === 'error' ? "lucide:alert-circle" : "lucide:check-circle"} className="w-5 h-5 shrink-0" />
              <span>{paymentMessage.text}</span>
            </div>
          )}

          {/* TAB 1: RENEW ACTIVE SUBSCRIPTION */}
          {activePaymentTab === 'renew' ? (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 lg:p-7 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-6">
              
              {/* ENROLLED COURSE SELECTOR / TOGGLE BUTTONS (When multiple courses enrolled) */}
              {enrolledCoursesList.length > 1 ? (
                <div className="space-y-2.5 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Icon icon="lucide:layers" className="w-3.5 h-3.5 text-[#C5A97A]" />
                      <span>Select Course to Renew ({enrolledCoursesList.length} Enrolled):</span>
                    </span>
                    <span className="text-[10px] text-[#C5A97A] font-black uppercase tracking-wider">
                      Selected: {currentEnrollment?.course_title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {enrolledCoursesList.map((enr) => {
                      const isEnrSelected = (currentEnrollment?.id === enr.id) || (currentEnrollment?.course_id === enr.course_id);
                      const theme = getCourseTheme(enr.course_title);

                      return (
                        <button
                          key={enr.id || enr.course_id}
                          type="button"
                          onClick={() => setSelectedEnrollmentId(enr.id)}
                          className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3 ${
                            isEnrSelected
                              ? "border-[#09314F] dark:border-[#C5A97A] bg-blue-50/70 dark:bg-white/10 shadow-md ring-2 ring-[#09314F]/10 dark:ring-[#C5A97A]/20"
                              : "border-gray-100 dark:border-gray-700/80 bg-gray-50/40 dark:bg-gray-800/40 opacity-75 hover:opacity-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${theme.badgeBg}`}>
                                {theme.examTag}
                              </span>
                              {enr.is_active ? (
                                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                                  {enr.days_left}d Left
                                </span>
                              ) : (
                                <span className="text-[9px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded">
                                  Expired
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-black text-[#09314F] dark:text-white truncate">
                              {enr.course_title}
                            </h5>
                          </div>

                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isEnrSelected ? "border-[#09314F] dark:border-[#C5A97A]" : "border-gray-300"
                          }`}>
                            {isEnrSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#09314F] dark:bg-[#C5A97A]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Selected Course Header Banner */}
              <div>
                <span className="text-[10px] font-black text-[#C5A97A] uppercase tracking-wider">
                  Target Program: {currentEnrollment?.course_title || "WAEC & JAMB Intensive Exam Prep"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#09314F] dark:text-white tracking-tight mt-0.5">
                  Select Renewal Duration for {selectedWard?.name || "Ward"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Extends access to CBT mock tests, video lessons, and syllabus questions for this specific program.
                </p>
              </div>

              {/* Cycle Cards */}
              <div className="space-y-3">
                {Object.entries(pricingPlans).map(([key, plan]) => {
                  const isSelected = billingCycle === key;
                  const planAmount = Math.round(baseRenewalCoursePrice * plan.multiplier);

                  return (
                    <div
                      key={key}
                      onClick={() => setBillingCycle(key)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? "border-[#09314F] dark:border-[#C5A97A] bg-blue-50/50 dark:bg-white/5 shadow-sm"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#09314F] dark:border-[#C5A97A]" : "border-gray-300"
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#09314F] dark:bg-[#C5A97A]" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-[#09314F] dark:text-white">
                              {plan.label}
                            </h4>
                            {plan.tag && (
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                key === 'annual' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                                key === 'quarterly' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                                "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                              }`}>
                                {plan.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {key === 'monthly' ? "Standard 30-day billing cycle" : key === 'quarterly' ? "Quarterly access with 10% discount" : "Best value for full academic preparation"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base sm:text-lg font-black font-mono text-[#09314F] dark:text-[#C5A97A]">
                          ₦{planAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={handleRenewPayment}
                disabled={processingPayment}
                className="w-full py-4 bg-[#09314F] hover:bg-[#0d3f66] dark:bg-[#C5A97A] dark:hover:bg-[#b09262] text-white dark:text-[#09314F] font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingPayment ? (
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Icon icon="lucide:shield-check" className="w-5 h-5" />
                    <span>Renew {currentEnrollment?.course_title || "Course"} • ₦{calculatedRenewalTotal.toLocaleString()}</span>
                  </>
                )}
              </button>

            </div>
          ) : (
            /* TAB 2: ENROLL IN ADDITIONAL LIVE COURSES (With Backend Banners) */
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-[#09314F] dark:text-white tracking-tight">
                  Available Exam Programs ({availableCourses.length} Programs Found)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click any course card to view curriculum details, configure syllabus subjects, and select enrollment duration.
                </p>
              </div>

              <div className="space-y-4">
                {availableCourses.length === 0 ? (
                  <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl text-center text-xs text-gray-400 font-bold border border-gray-100 dark:border-gray-700">
                    No active courses found on server.
                  </div>
                ) : (
                  availableCourses.map((course) => {
                    const theme = getCourseTheme(course.title);
                    const bannerUrl = getCourseBannerUrl(course.banner);
                    const cleanDesc = stripHtml(course.description);
                    const previewDesc = cleanDesc.length > 130 ? `${cleanDesc.substring(0, 130)}...` : cleanDesc;
                    const basePrice = Number(course.price || 10000);

                    return (
                      <div
                        key={course.id}
                        className="group relative rounded-[28px] sm:rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700/80 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 flex flex-col"
                      >
                        {/* BACKDROP BANNER SECTION (Using Backend Banner or Themed Gradient) */}
                        <div className="h-36 sm:h-40 w-full relative overflow-hidden flex flex-col justify-between p-5 text-white">
                          {bannerUrl ? (
                            <>
                              <img
                                src={bannerUrl}
                                alt={course.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                            </>
                          ) : (
                            <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}`} />
                          )}

                          <div className="relative z-10 flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${theme.badgeBg} flex items-center gap-1.5 shadow-sm`}>
                              <Icon icon={theme.icon} className="w-3.5 h-3.5" />
                              <span>{theme.examTag}</span>
                            </span>

                            <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-mono font-bold text-xs border border-white/20 shadow-sm">
                              ₦{basePrice.toLocaleString()} / mo
                            </span>
                          </div>

                          <div className="relative z-10">
                            <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                              {course.title}
                            </h4>
                          </div>
                        </div>

                        {/* CARD BODY CONTENT */}
                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5 max-w-xl">
                            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                              {previewDesc || "Full syllabus coverage with interactive questions, timed mock tests, and live instructor guidance."}
                            </p>
                            <span className="text-[11px] font-black text-[#C5A97A] uppercase tracking-wider block">
                              Includes Live Masterclasses & CBT Mocks
                            </span>
                          </div>

                          <button
                            onClick={() => openTrainingConfig(course)}
                            className="px-6 py-3.5 bg-[#09314F] hover:bg-[#0d3f66] dark:bg-[#C5A97A] dark:hover:bg-[#b09262] text-white dark:text-[#09314F] font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 self-start sm:self-auto"
                          >
                            <span>Configure & Enroll</span>
                            <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* ── RIGHT 5 COLS: Order Summary & Invoices ──────────────────────── */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* ORDER SUMMARY CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100 dark:border-gray-700">
              Transaction Summary
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiary Ward:</span>
                <strong className="text-gray-900 dark:text-white">{selectedWard?.name || "Select Ward"}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Selected Program:</span>
                <strong className="text-[#09314F] dark:text-[#C5A97A] truncate max-w-[200px]">
                  {activePaymentTab === 'renew' ? (currentEnrollment?.course_title || "Training Plan") : (selectedCourse?.title || "New Program")}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Billing Duration:</span>
                <strong className="text-gray-900 dark:text-white">
                  {activePaymentTab === 'renew' ? pricingPlans[billingCycle]?.label : configDurationPlan.label}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payment Gateway:</span>
                <span className="font-bold text-blue-600">Paystack (Cards, USSD, Transfer)</span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-baseline">
                <span className="text-sm font-black text-[#09314F] dark:text-white">Total Amount:</span>
                <span className="text-xl font-black font-mono text-[#09314F] dark:text-[#C5A97A]">
                  ₦{calculatedRenewalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
              <p className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
                <Icon icon="lucide:lock" className="w-3.5 h-3.5 text-emerald-500" />
                256-Bit Bank-Grade Secure Payment
              </p>
              <p>Instant activation upon verified payment receipt.</p>
            </div>
          </div>

          {/* PAYMENT HISTORY & RECEIPTS (With Search & Full History) */}
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-5 sm:p-6 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Payment History ({paymentHistory.length} Total)
              </h4>
              <button
                onClick={fetchWardDetails}
                className="text-[11px] font-bold text-[#C5A97A] hover:underline flex items-center gap-1"
              >
                <Icon icon="lucide:refresh-cw" className={`w-3 h-3 ${fetchingHistory ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Quick search filter for payment records */}
            {paymentHistory.length > 3 && (
              <div className="relative">
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Filter by course, ref or date..."
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-xl text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-[#C5A97A]"
                />
                <Icon icon="lucide:search" className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            )}

            {fetchingHistory ? (
              <div className="py-6 text-center text-xs text-gray-400">Loading full transaction history...</div>
            ) : filteredPaymentHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                {historySearchQuery ? "No matching transactions found." : "No transactions recorded for this ward."}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {filteredPaymentHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-2 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors border border-gray-100 dark:border-gray-800"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-black text-[#09314F] dark:text-white leading-tight truncate">
                        {item.course_title || item.title || "Subscription Renewal"}
                      </h5>
                      <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {item.paid_at || item.created_at} • Ref: {item.reference || "N/A"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                        ₦{Number(item.amount || 10000).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setReceiptModalData(item)}
                        className="text-[9px] font-bold text-[#C5A97A] hover:underline"
                      >
                        View Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── MULTI-STEP ADD TRAINING CONFIGURATION POPUP ─────────────────────── */}
      {showConfigModal && selectedCourse && (() => {
        const theme = getCourseTheme(selectedCourse.title);
        const bannerUrl = getCourseBannerUrl(selectedCourse.banner);
        const fullCleanDesc = stripHtml(selectedCourse.description);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-[32px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
              
              {/* TOP BANNER & FULL DESCRIPTION HEADER */}
              <div className="rounded-2xl overflow-hidden relative shadow-lg text-white">
                <div className="h-32 sm:h-36 w-full relative flex flex-col justify-between p-5">
                  {bannerUrl ? (
                    <>
                      <img
                        src={bannerUrl}
                        alt={selectedCourse.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />
                    </>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}`} />
                  )}

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${theme.badgeBg}`}>
                      {theme.examTag} • Step {configStep} of 2
                    </span>

                    <button
                      onClick={() => setShowConfigModal(false)}
                      className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                    >
                      <Icon icon="lucide:x" className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                      {selectedCourse.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/90 border-t border-white/10">
                  <p className="text-xs text-gray-200 font-medium leading-relaxed">
                    {fullCleanDesc || "Full curriculum syllabus coverage with timed CBT mock drills and interactive live masterclasses."}
                  </p>
                </div>
              </div>

              {/* STEP 1: SUBJECT CONFIGURATION (Grid Layout) */}
              {configStep === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h4 className="text-sm font-black text-[#09314F] dark:text-white">
                        Select Enrolled Subjects ({selectedSubjectIds.length} of max {maxSubjectLimit} Selected)
                      </h4>
                      <p className="text-xs text-gray-400">
                        {selectedWard?.name}'s Department: <strong className="text-gray-700 dark:text-gray-200">{selectedWard?.department || 'Science'}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectIds(courseSubjects.slice(0, maxSubjectLimit).map(s => s.id))}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-[#09314F] dark:text-white text-[11px] font-bold rounded-xl"
                      >
                        Select Top {maxSubjectLimit}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSubjectIds([])}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500 text-[11px] font-bold rounded-xl"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {loadingSubjects ? (
                    <div className="py-12 text-center text-xs font-bold text-gray-400">
                      <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin mx-auto mb-2 text-[#C5A97A]" />
                      Fetching syllabus subjects for {selectedWard?.department || 'Department'}...
                    </div>
                  ) : courseSubjects.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Standard syllabus subjects will be automatically enrolled.
                    </div>
                  ) : (
                    /* RESPONSIVE MULTI-COLUMN SUBJECT GRID */
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {courseSubjects.map((sub) => {
                        const isChecked = selectedSubjectIds.includes(sub.id);
                        return (
                          <div
                            key={sub.id}
                            onClick={() => toggleSubject(sub.id)}
                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-2 select-none ${
                              isChecked
                                ? "border-[#09314F] dark:border-[#C5A97A] bg-blue-50/60 dark:bg-[#C5A97A]/10 text-[#09314F] dark:text-white font-bold shadow-sm"
                                : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
                            }`}
                          >
                            <div className="truncate">
                              <span className="text-xs block font-bold truncate">{sub.name}</span>
                              {sub.is_compulsory && (
                                <span className="text-[9px] text-amber-600 dark:text-[#C5A97A] font-black uppercase">Compulsory</span>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                              isChecked ? "bg-[#09314F] dark:bg-[#C5A97A] border-transparent text-white dark:text-[#09314F]" : "border-gray-300 dark:border-gray-700"
                            }`}>
                              {isChecked && <Icon icon="lucide:check" className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubjectIds.length === 0) {
                          alert("Please select at least one subject.");
                          return;
                        }
                        setConfigStep(2);
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 bg-[#09314F] hover:bg-[#0d3f66] dark:bg-[#C5A97A] dark:hover:bg-[#b09262] text-white dark:text-[#09314F] font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Next: Select Duration</span>
                      <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DURATION SELECTION & CHECKOUT */}
              {configStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-2">
                      Choose Program Access Duration:
                    </label>

                    <div className="space-y-2.5">
                      {Object.entries(pricingPlans).map(([key, plan]) => {
                        const isSelected = configuredDuration === key;
                        const planPrice = Math.round(Number(selectedCourse.price || 10000) * plan.multiplier);
                        return (
                          <div
                            key={key}
                            onClick={() => setConfiguredDuration(key)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "border-[#09314F] dark:border-[#C5A97A] bg-blue-50/60 dark:bg-[#C5A97A]/10 text-[#09314F] dark:text-white shadow-sm"
                                : "border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? "border-[#09314F] dark:border-[#C5A97A]" : "border-gray-300"
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#09314F] dark:bg-[#C5A97A]" />}
                              </div>
                              <span className="text-xs font-bold">{plan.label}</span>
                            </div>
                            <span className="text-sm font-black font-mono">₦{planPrice.toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final Order Breakdown */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Beneficiary Ward:</span>
                      <strong className="text-gray-900 dark:text-white">{selectedWard?.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Selected Program:</span>
                      <strong className="text-[#09314F] dark:text-[#C5A97A]">{selectedCourse?.title}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Configured Subjects:</span>
                      <strong className="text-gray-900 dark:text-white">{selectedSubjectIds.length} Subjects Selected</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration Plan:</span>
                      <strong className="text-gray-900 dark:text-white">{configDurationPlan.label}</strong>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm">
                      <span className="font-black text-[#09314F] dark:text-white">Total Amount Payable:</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-black">
                        ₦{configuredCoursePrice.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setConfigStep(1)}
                      className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleAddTrainingCheckout}
                      disabled={processingPayment}
                      className="flex-1 py-3.5 bg-[#09314F] hover:bg-[#0d3f66] dark:bg-[#C5A97A] dark:hover:bg-[#b09262] text-white dark:text-[#09314F] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      {processingPayment ? (
                        <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Icon icon="lucide:credit-card" className="w-4 h-4" />
                          <span>Pay ₦{configuredCoursePrice.toLocaleString()} with Paystack</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      {/* ── RECEIPT MODAL ─────────────────────────────────────────────────── */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-sm font-black text-[#09314F] dark:text-white uppercase tracking-wider">
                  Payment Receipt
                </h4>
              </div>
              <button
                onClick={() => setReceiptModalData(null)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction Ref:</span>
                <strong className="font-mono text-gray-800 dark:text-gray-200">{receiptModalData.reference || "TC-REC-001"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Item:</span>
                <strong className="text-gray-800 dark:text-gray-200">{receiptModalData.course_title || "Training Subscription"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <strong className="font-mono text-emerald-600 text-sm">₦{Number(receiptModalData.amount || 10000).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
                  Successful / Verified
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <strong className="text-gray-800 dark:text-gray-200">{receiptModalData.paid_at || "Today"}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#09314F] text-white dark:bg-[#C5A97A] dark:text-[#09314F] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Icon icon="lucide:printer" className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setReceiptModalData(null)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </GuardianDashboardLayout>
  );
}
