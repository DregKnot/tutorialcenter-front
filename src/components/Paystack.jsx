import { useEffect, useState } from "react";

const Paystack = ({
  amount,
  email,
  reference,
  metadata = {},
  onSuccess,
  onClose,
}) => {
  const [paystackReady, setPaystackReady] = useState(false);

  const paystackPublicKey =
    process.env.REACT_APP_PAYSTACK_PUBLIC_KEY ||
    "pk_live_f1017d3c645e69b33b1f8cc538b306088b655244";
    // "pk_test_d810e0935d60a336bea860384aabbc753cdd78ff";

  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      setPaystackReady(true);
    };

    document.body.appendChild(script);
  }, []);

  const pay = () => {
    if (!window.PaystackPop) {
      alert("Payment gateway still loading. Please try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: email,
      amount: amount * 100,
      currency: "NGN",
      ref: reference,
      metadata: metadata,

      callback: (response) => {
        if (onSuccess) onSuccess(response);
      },

      onClose: () => {
        if (onClose) onClose();
      },
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={pay}
      disabled={!paystackReady}
      className="w-full py-5 rounded-xl bg-[#0F2843] text-white font-black text-lg shadow-xl hover:shadow-[#0F284344] transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
    >
      {paystackReady ? "Pay with Paystack" : "Loading Gateway..."}
    </button>
  );
};

export default Paystack;