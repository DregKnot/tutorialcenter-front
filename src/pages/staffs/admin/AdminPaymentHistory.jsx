import { useState, useEffect, useCallback } from "react";
import axios from "axios";

import DataTable from "../../../components/common/tables/DataTable";
import FilterBar from "../../../components/common/filters/FilterBar";
import PaymentStatusBadge from "../../../components/common/tables/PaymentStatusBadge";
import MobilePaymentCard from "../../../components/common/tables/MobilePaymentCard";
import TablePagination from "../../../components/common/tables/TablePagination";



export default function AdminPaymentHistory() {

  const [payments, setPayments] = useState([]);

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

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/payments/all`
      );

      const apiPayments =
        response.data.payments || [];

      const paymentData = apiPayments;

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

  const columns = [
    {
      key: "student.fullname",
      label: "Student",
    },
    {
      key: "amount",
      label: "Amount",
    },
    {
      key: "payment_method",
      label: "Method",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "created_at",
      label: "Date",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-black mb-6 text-[#09314F]">
        Admin Payment History
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Total Payments</p>
          <h2 className="text-3xl font-black text-[#09314F]">
            {stats.totalPayments}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Successful</p>
          <h2 className="text-3xl font-black text-green-600">
            {stats.successfulPayments}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Pending</p>
          <h2 className="text-3xl font-black text-yellow-500">
            {stats.pendingPayments}
          </h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-2">Revenue</p>
          <h2 className="text-3xl font-black text-[#09314F]">
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
          renderRow={(payment) => (
            <tr
              key={payment.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
            >
              <td className="px-6 py-4 font-semibold">
                {payment.student?.fullname || "Unknown"}
              </td>

              <td className="px-6 py-4 font-bold text-[#09314F]">
                ₦{Number(payment.amount).toLocaleString()}
              </td>

              <td className="px-6 py-4 capitalize">
                {payment.payment_method}
              </td>

              <td className="px-6 py-4">
                <PaymentStatusBadge
                  status={payment.status}
                />
              </td>

              <td className="px-6 py-4 text-gray-500">
                {new Date(payment.created_at).toLocaleDateString()}
              </td>
            </tr>
          )}
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
            <MobilePaymentCard
              key={payment.id}
              payment={payment}
            />
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
  );
}