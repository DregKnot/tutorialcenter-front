// components/Paystack.jsx
import { useEffect } from "react";

const Paystack = ({
  amount,
  email,
  reference,
  metadata = {},
  onSuccess,
  onClose,
}) => {
  const paystackPublicKey =
    process.env.REACT_APP_PAYSTACK_PUBLIC_KEY ||
    "pk_test_baecdbe89b4c293f6a4564d49843b1fcd8c937f9";

  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const pay = () => {
    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email,
      amount: amount * 100, // Kobo
      currency: "NGN",
      ref: reference,
      metadata,
      callback: (response) => {
        onSuccess?.(response);
      },
      onClose: () => {
        onClose?.();
      },
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={pay}
      className="w-full py-3 rounded bg-gradient-to-r from-[#09314F] to-[#E83831] text-white font-semibold"
    >
      Pay with Paystack
    </button>
  );
};

export default Paystack;
