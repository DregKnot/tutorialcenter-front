import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Icon } from "@iconify/react";
import GuardianDashboardLayout from "../../components/private/Guardians/GuardianDashboardLayout";

export default function GuardianAddWard() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    email: "",
    tel: "",
    department: "Science",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstname.trim() || !formData.surname.trim()) {
      setToast({ type: "error", message: "Please enter your ward's first name and surname." });
      return;
    }

    if (!formData.email.trim() && !formData.tel.trim()) {
      setToast({ type: "error", message: "Please provide either an email or phone number for the student." });
      return;
    }

    if (formData.password.length < 6) {
      setToast({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match." });
      return;
    }

    const token = localStorage.getItem("guardian_token");
    if (!token) {
      navigate("/guardian/login");
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/guardians/wards/create-or-link`,
        {
          firstname: formData.firstname.trim(),
          surname: formData.surname.trim(),
          email: formData.email.trim() || null,
          tel: formData.tel.trim() || null,
          department: formData.department,
          password: formData.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.success) {
        setToast({
          type: "success",
          message: `Ward ${formData.firstname} added and linked successfully! Redirecting...`,
        });
        setTimeout(() => {
          navigate("/guardian/dashboard");
        }, 1500);
      } else {
        setToast({ type: "error", message: res.data?.message || "Failed to add ward." });
      }
    } catch (err) {
      console.error("Add ward error:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Unable to create/link ward. Please verify the input details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuardianDashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#09314F]/10 dark:bg-white/10 text-[#09314F] dark:text-[#C5A97A] text-[11px] font-black uppercase tracking-wider mb-1.5">
              <Icon icon="lucide:user-plus" className="w-3.5 h-3.5" />
              <span>Ward Management</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#09314F] dark:text-white tracking-tight">
              Add New Ward
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Enroll or link a student account directly to your guardian portal oversight.
            </p>
          </div>

          <Link
            to="/guardian/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors self-start shadow-sm"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
            }`}
          >
            <Icon
              icon={toast.type === "success" ? "lucide:check-circle" : "lucide:alert-circle"}
              className="w-5 h-5 shrink-0"
            />
            <span>{toast.message}</span>
          </div>
        )}

        {/* Add Ward Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 sm:p-8 border border-gray-100 dark:border-gray-700/80 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Ward's First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:user" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="firstname"
                    placeholder="e.g. Samuel"
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Ward's Surname <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:user" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="surname"
                    placeholder="e.g. Adebayo"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Student Email Address
                </label>
                <div className="relative">
                  <Icon icon="lucide:mail" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="samuel@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Student Phone Number (Optional)
                </label>
                <div className="relative">
                  <Icon icon="lucide:phone" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="tel"
                    placeholder="08012345678"
                    value={formData.tel}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Department Track */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Academic Department Track
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Science", "Commercial", "Arts", "General"].map((dept) => {
                  const isSelected = formData.department === dept;
                  return (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => setFormData((prev) => ({ ...prev, department: dept }))}
                      className={`py-3 px-4 rounded-2xl text-xs font-black transition-all border ${
                        isSelected
                          ? "bg-[#09314F] text-white border-[#09314F] shadow-md dark:bg-[#C5A97A] dark:text-[#09314F] dark:border-[#C5A97A]"
                          : "bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Student Login Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Icon icon="lucide:lock" className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C5A97A]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#09314F] hover:bg-[#0d3f66] dark:bg-[#C5A97A] dark:hover:bg-[#b09262] text-white dark:text-[#09314F] font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Icon icon="lucide:loader-2" className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Icon icon="lucide:user-check" className="w-5 h-5" />
                    <span>Create & Link Ward to Portal</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </GuardianDashboardLayout>
  );
}
