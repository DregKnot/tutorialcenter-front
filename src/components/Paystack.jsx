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

  const isLocalHost = 
    typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || 
     window.location.hostname === "127.0.0.1" || 
     window.location.hostname.endsWith(".test") ||
     process.env.NODE_ENV === "development");

  const paystackPublicKey =
    process.env.REACT_APP_PAYSTACK_PUBLIC_KEY ||
    "pk_test_d810e0935d60a336bea860384aabbc753cdd78ff";

  if (!isLocalHost && !process.env.REACT_APP_PAYSTACK_PUBLIC_KEY) {
    console.warn(
      "[Paystack] REACT_APP_PAYSTACK_PUBLIC_KEY is not defined in production environment. Defaulting to sandbox test key."
    );
  }

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
      amount: Math.round(Number(amount) * 100),
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
