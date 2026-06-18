import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";
import StaffDashboardLayout from "../../../components/private/staffs/DashboardLayout.jsx";

import DataTable from "../../../components/common/tables/DataTable";
import FilterBar from "../../../components/common/filters/FilterBar";
import PaymentStatusBadge from "../../../components/common/tables/PaymentStatusBadge";
import MobilePaymentCard from "../../../components/common/tables/MobilePaymentCard";
import TablePagination from "../../../components/common/tables/TablePagination";



export default function AdminPaymentHistory() {

  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [stats, setStats] = useState({
    totalPayments: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;
  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://tutorialcenter-back.test";

  const calculateStats = (data) => {
    if (!Array.isArray(data)) return;
    const successful = data.filter(
      (p) => p.status?.toLowerCase() === "successful"
    );

    const pending = data.filter(
      (p) => p.status?.toLowerCase() === "pending"
    );

    const revenue = successful.reduce(
      (total, p) => total + Number(p.amount || 0),
      0
    );

    setStats({
      totalPayments: data.length,
      successfulPayments: successful.length,
      pendingPayments: pending.length,
      totalRevenue: revenue,
    });
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("staff_token");

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/payments/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("PAYMENTS API RAW RESPONSE:", response.data);

      let paymentData = [];
      if (Array.isArray(response.data)) {
        paymentData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        paymentData = response.data.data;
      } else if (Array.isArray(response.data?.payments)) {
        paymentData = response.data.payments;
      } else if (Array.isArray(response.data?.payments?.data)) {
        paymentData = response.data.payments.data;
      } else if (response.data && typeof response.data === 'object') {
        const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArray) paymentData = possibleArray;
      }

      setPayments(paymentData);

      calculateStats(paymentData);

      setError("");
    } catch (error) {
      console.log("PAYMENT ERROR:", error);

      setError("Failed to load payments.");

      setPayments([]);

      setStats({
        totalPayments: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const filteredPayments = payments.filter((payment) => {
    const studentName =
      payment.student?.fullname?.toLowerCase() || "";

    const matchesSearch =
      studentName.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : payment.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(
    filteredPayments.length / paymentsPerPage
  );

  const startIndex =
    (currentPage - 1) * paymentsPerPage;

  const paginatedPayments =
    filteredPayments.slice(
      startIndex,
      startIndex + paymentsPerPage
    );

  useEffect(() => {
  fetchPayments();
}, [fetchPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getPaymentType = (payment, allPayments) => {
    if (!payment || !payment.enrollment || !payment.student) return "New Payment";

    const studentId = payment.student.id;
    const courseId = payment.enrollment.course_id;

    // Find all successful payments for this student and course
    const relatedPayments = allPayments.filter(
      (p) =>
        p.student?.id === studentId &&
        p.enrollment?.course_id === courseId &&
        p.status?.toLowerCase() === "successful"
    );

    // Sort chronologically
    relatedPayments.sort(
      (a, b) => new Date(a.paid_at || a.created_at) - new Date(b.paid_at || b.created_at)
    );

    const currentIndex = relatedPayments.findIndex((p) => p.id === payment.id);

    // If it's the first successful payment or not successful and no previous successful payment exists
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
  };

  const columns = [
    { key: "student", label: "Student Details" },
    { key: "academics", label: "Academics" },
    { key: "payment_info", label: "Payment Info" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Date" },
  ];

  return (
    <StaffDashboardLayout pagetitle="Payment History">
      <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#C5A97A]/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total Payments</p>
              <div className="p-2 bg-[#09314F]/5 dark:bg-white/5 rounded-xl text-[#C5A97A]">
                <Icon icon="lucide:receipt" className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#09314F] dark:text-white">
              {stats.totalPayments}
            </h2>
          </div>

          <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Successful</p>
              <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-500">
                <Icon icon="lucide:check-circle-2" className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#09314F] dark:text-white">
              {stats.successfulPayments}
            </h2>
          </div>

          <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pending</p>
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-500">
                <Icon icon="lucide:clock" className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#09314F] dark:text-white">
              {stats.pendingPayments}
            </h2>
          </div>

          <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-100 dark:border-[#09314F] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Revenue</p>
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500">
                <Icon icon="lucide:wallet" className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#09314F] dark:text-white">
              ₦{stats.totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          totalResults={filteredPayments.length}
        />
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={paginatedPayments}
          loading={loading}
          renderRow={(payment) => {
            const studentName = payment.student?.firstname 
              ? `${payment.student.firstname} ${payment.student.surname || ''}` 
              : payment.student?.fullname || "Unknown";
              
            const paymentType = getPaymentType(payment, payments);

            return (
              <tr
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{studentName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{payment.student?.email || 'N/A'}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {payment.student?.tel || 'No phone'}
                      {payment.student?.tel_verified_at && (
                        <Icon icon="lucide:badge-check" className="w-3 h-3 text-green-500" title="Phone verified" />
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{payment.student?.department || 'N/A'}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{payment.student?.gender || 'N/A'}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#09314F] dark:text-white">
                      ₦{Number(payment.amount).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-md capitalize">
                        {payment.payment_method || 'Card'}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        paymentType.includes('Upfront') 
                          ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                          : paymentType.includes('Due') 
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-green-50 text-green-600 border border-green-200'
                      }`}>
                        {paymentType}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <PaymentStatusBadge status={payment.status} />
                </td>

                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
              </tr>
            );
          }}
        />

      </div>
      <div className="grid grid-cols-1 gap-4 md:hidden">

        {loading ? (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className="bg-white rounded-2xl p-6 h-32 animate-pulse border border-gray-200"
      />
    ))}
  </div>
) : filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500 border border-gray-200">
            No payments found.
          </div>
        ) : (
          paginatedPayments.map((payment) => (
            <div key={payment.id} onClick={() => setSelectedPayment(payment)} className="cursor-pointer">
              <MobilePaymentCard
                payment={payment}
              />
            </div>
          ))
        )}

      </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() =>
            setCurrentPage((prev) =>
              Math.max(prev - 1, 1)
            )
          }
          onNext={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, totalPages)
            )
          }
        />
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-8 animate-in fade-in duration-300" onClick={() => setSelectedPayment(null)}>
          <div className="bg-white dark:bg-[#0a2540] w-full max-w-[650px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative text-[#09314F] dark:text-white font-sans" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedPayment(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400 dark:text-gray-300 z-10">
              <Icon icon="lucide:x" className="w-5 h-5" />
            </button>
            <div className="flex-1 overflow-y-auto p-8 md:p-10">
              <h1 className="text-xl md:text-2xl font-black mb-8 uppercase tracking-tight text-[#09314F] dark:text-white">
                PAYMENT DETAILS [{selectedPayment.student?.firstname || 'Unknown'}]
              </h1>

              {/* Top Section: Avatar + Primary Fields */}
              <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 relative">
                  <div className="w-full h-full rounded-[20px] overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 flex items-center justify-center relative">
                    {selectedPayment.student?.profile_picture && selectedPayment.student.profile_picture !== "default-avatar.png" ? (
                      <img 
                        src={`${API_BASE_URL}/storage/${selectedPayment.student.profile_picture}`}
                        className="w-full h-full object-cover"
                        alt="Profile" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#09314F] text-[#C5A97A] flex items-center justify-center text-5xl font-black">
                        {(selectedPayment.student?.firstname?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 gap-y-4 w-full">
                  <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</span>
                    <span className="text-xl font-black text-[#09314F] dark:text-white">₦{Number(selectedPayment.amount).toLocaleString()}</span>
                  </div>
                  <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Type</span>
                    <span className="text-sm font-semibold text-[#C5A97A]">{getPaymentType(selectedPayment, payments)}</span>
                  </div>
                  <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</span>
                    <div className="mt-1"><PaymentStatusBadge status={selectedPayment.status} /></div>
                  </div>
                </div>
              </div>

              {/* Grid Section for details */}
              <div className="space-y-6">
                
                <div>
                   <h4 className="text-[11px] font-black text-[#C5A97A] uppercase tracking-widest mb-3 ml-1 border-b border-gray-100 dark:border-white/10 pb-2">Student Info</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                       <p className="font-semibold text-sm">{selectedPayment.student?.firstname ? `${selectedPayment.student.firstname} ${selectedPayment.student.surname || ''}` : selectedPayment.student?.fullname || 'Unknown'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                       <p className="font-semibold text-sm break-all">{selectedPayment.student?.email || 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                       <p className="font-semibold text-sm">{selectedPayment.student?.tel || 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Department</p>
                       <p className="font-semibold text-sm capitalize">{selectedPayment.student?.department || 'N/A'}</p>
                     </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-[11px] font-black text-[#C5A97A] uppercase tracking-widest mb-3 ml-1 border-b border-gray-100 dark:border-white/10 pb-2">Enrollment Details</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Course</p>
                       <p className="font-semibold text-sm">{selectedPayment.enrollment?.course?.title || 'Unknown'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cycle</p>
                       <p className="font-semibold text-sm capitalize">{selectedPayment.billing_cycle || 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start Date</p>
                       <p className="font-semibold text-sm">{selectedPayment.enrollment?.start_date ? new Date(selectedPayment.enrollment.start_date).toLocaleDateString() : 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">End Date</p>
                       <p className="font-semibold text-sm">{selectedPayment.enrollment?.end_date ? new Date(selectedPayment.enrollment.end_date).toLocaleDateString() : 'N/A'}</p>
                     </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-[11px] font-black text-[#C5A97A] uppercase tracking-widest mb-3 ml-1 border-b border-gray-100 dark:border-white/10 pb-2">Transaction Metadata</h4>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Gateway</p>
                       <p className="font-semibold text-sm capitalize">{selectedPayment.gateway || 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Method</p>
                       <p className="font-semibold text-sm capitalize">{selectedPayment.payment_method || 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3 col-span-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reference ID</p>
                       <p className="font-semibold text-sm break-all text-[#C5A97A]">{selectedPayment.gateway_reference || 'N/A'}</p>
                     </div>
                     <div className="bg-[#fcfcfc] dark:bg-[#09314F] border border-gray-200 dark:border-white/10 rounded-xl p-3 col-span-2">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date Paid</p>
                       <p className="font-semibold text-sm">{new Date(selectedPayment.paid_at || selectedPayment.created_at).toLocaleString()}</p>
                     </div>
                   </div>
                </div>

              </div>
            </div>

            {/* Footer Action */}
            <div className="px-8 pb-8">
              <button 
                onClick={() => setSelectedPayment(null)}
                className="w-full py-4 bg-[#09314F] text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-[#C5A97A]/30 hover:border-[#C5A97A]"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffDashboardLayout>
  );
}