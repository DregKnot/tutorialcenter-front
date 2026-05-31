import PaymentStatusBadge from "./PaymentStatusBadge";

export default function MobilePaymentCard({
  payment,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

      <div className="flex items-start justify-between mb-4">

        <div>
          <h3 className="font-bold text-[#09314F]">
            {payment.student?.fullname || "Unknown"}
          </h3>

          <p className="text-sm text-gray-500 capitalize">
            {payment.payment_method}
          </p>
        </div>

        <PaymentStatusBadge
          status={payment.status}
        />
      </div>

      <div className="space-y-2">

        <div className="flex justify-between">
          <span className="text-gray-500">
            Amount
          </span>

          <span className="font-bold text-[#09314F]">
            ₦{Number(payment.amount).toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">
            Date
          </span>

          <span className="text-gray-700">
            {new Date(
              payment.created_at
            ).toLocaleDateString()}
          </span>
        </div>

      </div>

    </div>
  );
}