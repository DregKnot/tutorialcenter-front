import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
      <div className="text-center animate-in fade-in zoom-in-95 duration-500">
        <h1 className="text-9xl font-black text-[#09314F] dark:text-white opacity-10">403</h1>
        <div className="-mt-16">
          <h2 className="text-3xl font-black text-[#09314F] dark:text-white uppercase tracking-tight">Access Denied</h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs italic">
            You are not authorized to access this page.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#09314F]/10 border-t-[#09314F] rounded-full animate-spin" />
            <p className="text-[#E83831] font-black text-xs uppercase tracking-[0.2em] animate-pulse">
              Returning to home page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
