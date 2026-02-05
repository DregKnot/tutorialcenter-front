import React from 'react';
import AuthLayout from "../../../components/public/SignUpUsables/AuthLayout";
import otp_img_student from "../../../assets/images/otpStudentpic.jpg";

const StepEight = ({
  selectedPayment,
  setSelectedPayment,
  handlePaymentSubmit,
  calculateTotal, // Function or Value
  setStep
}) => {
  const paymentMethods = [
    { id: 'paystack', label: 'Paystack' },
    { id: 'paypal', label: 'Paypal' },
    { id: 'inter-switch', label: 'Inter-switch' }
  ];

  const totalDisplay = typeof calculateTotal === 'function' ? calculateTotal() : calculateTotal;

  return (
    <AuthLayout
      title="Payment Method"
      subtitle="Select a preferred method of payment"
      image={otp_img_student}
      onBack={() => setStep(7)}
    >
      <div className="w-full max-w-[448px] mx-auto my-auto text-center">
        <div className="flex flex-col gap-4 mb-8">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPayment(method.id)}
              className={`w-full h-[55px] rounded-xl border-2 px-6 flex items-center justify-between transition-all
                ${selectedPayment === method.id 
                  ? 'border-[#09314F] bg-[#F9F4F3]' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
            >
              <span className="font-semibold text-[#09314F]">{method.label}</span>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePaymentSubmit(selectedPayment)}
          className="w-full h-[60px] text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(90deg, #0F2C45 0%, #A92429 100%)' }}
        >
          Continue - ₦{totalDisplay}
        </button>
      </div>
    </AuthLayout>
  );
};

export default StepEight;
