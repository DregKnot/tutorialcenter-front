import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TC_logo from "../../../assets/images/tutorial_logo.png";
import ReturnArrow from "../../../assets/svg/return arrow.svg";
import signup_img from "../../../assets/images/student_sign_up.jpg";
import Paystack from "../../../components/Paystack";

export const StudentTrainingPayment = () => {
  const navigate = useNavigate();

  const [trainingDurations, setTrainingDurations] = useState({});
  const [paymentGateway, setPaymentGateway] = useState(null);
  const [showModal, setShowModal] = useState(false);

  /* ================= INIT ================= */
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("trainingDurations"));

    if (!stored || Object.keys(stored).length === 0) {
      navigate("/register/student/training/duration");
      return;
    }

    setTrainingDurations(stored);
  }, [navigate]);

  /* ================= TOTAL ================= */
  const totalAmount = useMemo(() => {
    return Object.values(trainingDurations).reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );
  }, [trainingDurations]);

  /* ================= HANDLERS ================= */
  const openGateway = (gateway) => {
    setPaymentGateway(gateway);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPaymentGateway(null);
  };

  /* ================= PAYSTACK CALLBACK ================= */
  const handlePaystackSuccess = (response) => {
    console.log("Payment successful:", response);

    // TODO: Verify payment on backend
    // POST /verify-paystack

    closeModal();
    navigate("/student/dashboard");
  };

  return (
    <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT */}
      <div className="w-full md:w-1/2 bg-[#F4F4F4] px-6 py-10 lg:px-[100px] overflow-y-auto">
        {/* NAV */}
        <div className="relative flex justify-center mb-6">
          <button
            onClick={() =>
              navigate("/register/student/training/duration")
            }
            className="absolute left-0 p-2"
          >
            <img src={ReturnArrow} alt="Back" className="h-6 w-6" />
          </button>
          <img src={TC_logo} alt="Logo" className="h-[70px]" />
        </div>

        <h1 className="text-center text-2xl font-bold text-[#09314F] mb-6">
          Select Payment Method
        </h1>

        {/* TOTAL */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border">
          <div className="flex justify-between font-bold text-[#09314F]">
            <span>Total Payable</span>
            <span>₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* PAYMENT OPTIONS */}
        <div className="space-y-4">
          {["Paystack", "Flutterwave", "PayPal", "Interswitch"].map(
            (gateway) => (
              <button
                key={gateway}
                onClick={() => openGateway(gateway)}
                className="w-full flex items-center justify-between bg-white border rounded-lg px-4 py-4 font-semibold text-[#09314F] hover:shadow transition-all"
              >
                <span>{gateway}</span>
                <span>→</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div
        className="w-full md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${signup_img})` }}
      />

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#09314F] mb-4">
              {paymentGateway} Payment
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              You are about to pay:
            </p>

            <div className="text-2xl font-bold text-center text-[#09314F] mb-6">
              ₦{totalAmount.toLocaleString()}
            </div>

            {/* PAYSTACK */}
            {paymentGateway === "Paystack" && (
              <Paystack
                amount={totalAmount}
                email="student@email.com"
                reference={`TC-${Date.now()}`}
                metadata={{ source: "training_payment" }}
                onSuccess={handlePaystackSuccess}
                onClose={closeModal}
              />
            )}

            {/* OTHER GATEWAYS PLACEHOLDER */}
            {paymentGateway !== "Paystack" && (
              <button
                disabled
                className="w-full py-3 rounded bg-gray-300 text-gray-600 font-semibold cursor-not-allowed"
              >
                {paymentGateway} integration coming next
              </button>
            )}

            <button
              onClick={closeModal}
              className="mt-4 w-full py-2 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};






// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import TC_logo from "../../../assets/images/tutorial_logo.png";
// import ReturnArrow from "../../../assets/svg/return arrow.svg";
// import signup_img from "../../../assets/images/student_sign_up.jpg";

// export const StudentTrainingPayment = () => {
//   const navigate = useNavigate();

//   const [paymentGateway, setPaymentGateway] = useState(null);
//   const [trainingDurations, setTrainingDurations] = useState({});
//   const [showModal, setShowModal] = useState(false);

//   /* ================= INIT ================= */
//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem("trainingDurations"));

//     if (!stored || Object.keys(stored).length === 0) {
//       navigate("/register/student/training/duration");
//       return;
//     }

//     setTrainingDurations(stored);
//   }, [navigate]);

//   /* ================= TOTAL ================= */
//   const totalAmount = useMemo(() => {
//     return Object.values(trainingDurations).reduce(
//       (sum, item) => sum + item.price,
//       0
//     );
//   }, [trainingDurations]);

//   /* ================= HANDLERS ================= */
//   const openGateway = (gateway) => {
//     setPaymentGateway(gateway);
//     setShowModal(true);
//   };

//   const closeModal = () => {
//     setShowModal(false);
//     setPaymentGateway(null);
//   };

//   const proceedPayment = () => {
//     console.log("Gateway:", paymentGateway);
//     console.log("Amount:", totalAmount);

//     // 🔌 Integrate SDK here later
//     // Paystack / Flutterwave / PayPal / Interswitch

//     closeModal();
//   };

//   return (
//     <div className="w-full min-h-screen md:h-screen flex flex-col md:flex-row font-sans">
//       {/* LEFT */}
//       <div className="w-full md:w-1/2 bg-[#F4F4F4] px-6 py-10 lg:px-[100px] overflow-y-auto">
//         {/* NAV */}
//         <div className="relative flex justify-center mb-6">
//           <button onClick={() => navigate('/register/student/training/duration')} className="absolute left-0 p-2">
//             <img src={ReturnArrow} alt="Back" className="h-6 w-6" />
//           </button>
//           <img src={TC_logo} alt="Logo" className="h-[70px]" />
//         </div>

//         <h1 className="text-center text-2xl font-bold text-[#09314F] mb-6">
//           Select Payment Method
//         </h1>

//         {/* TOTAL */}
//         <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border">
//           <div className="flex justify-between font-bold text-[#09314F]">
//             <span>Total Payable</span>
//             <span>₦{totalAmount.toLocaleString()}</span>
//           </div>
//         </div>

//         {/* PAYMENT OPTIONS */}
//         <div className="space-y-4">
//           {[
//             "Paystack",
//             "Flutterwave",
//             "PayPal",
//             "Interswitch",
//           ].map((gateway) => (
//             <button
//               key={gateway}
//               onClick={() => openGateway(gateway)}
//               className="w-full flex items-center justify-between bg-white border rounded-lg px-4 py-4 font-semibold text-[#09314F] hover:shadow transition-all"
//             >
//               <span>{gateway}</span>
//               <span>→</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* RIGHT */}
//       <div
//         className="w-full md:w-1/2 bg-cover bg-center"
//         style={{ backgroundImage: `url(${signup_img})` }}
//       />

//       {/* ================= MODAL ================= */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
//           <div className="bg-white w-[90%] max-w-md rounded-xl p-6">
//             <h2 className="text-xl font-bold text-[#09314F] mb-4">
//               {paymentGateway} Payment
//             </h2>

//             <p className="text-sm text-gray-600 mb-4">
//               You are about to pay:
//             </p>

//             <div className="text-2xl font-bold text-center text-[#09314F] mb-6">
//               ₦{totalAmount.toLocaleString()}
//             </div>

//             <div className="flex gap-4">
//               <button
//                 onClick={closeModal}
//                 className="w-1/2 py-3 rounded border font-semibold"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={proceedPayment}
//                 className="w-1/2 py-3 rounded bg-gradient-to-r from-[#09314F] to-[#E83831] text-white font-semibold"
//               >
//                 Proceed
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
