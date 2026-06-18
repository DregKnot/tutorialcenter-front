import PaymentStatusBadge from "./PaymentStatusBadge";

export default function MobilePaymentCard({
  payment,
}) {
  const studentName = payment.student?.firstname 
    ? `${payment.student.firstname} ${payment.student.surname || ''}` 
    : payment.student?.fullname || "Unknown";

  return (
    <div className="bg-white dark:bg-[#09314F]/40 dark:backdrop-blur-md border border-gray-200 dark:border-[#09314F] rounded-2xl p-5 shadow-sm">

      <div className="flex items-start justify-between mb-4">

        <div>
          <h3 className="font-bold text-[#09314F] dark:text-white">
            {studentName}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-300 capitalize">
            {payment.payment_method}
          </p>
        </div>

        <PaymentStatusBadge
          status={payment.status}
        />
      </div>

      <div className="space-y-2">

        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            Amount
          </span>

          <span className="font-bold text-[#09314F] dark:text-white">
            ₦{Number(payment.amount).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">
            Date
          </span>

          <span className="text-gray-700 dark:text-gray-300">
            {new Date(
              payment.created_at
            ).toLocaleDateString()}
          </span>
        </div>

      </div>

    </div>
  );
}