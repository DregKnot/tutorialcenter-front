import React from "react";

export default function PaymentStatusBadge({ status }) {

  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {

      case "successful":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "refunded":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusStyles()}`}
    >
      {status || "Unknown"}
    </span>
  );
}