"use client";
//Registration form, Pharmacist only

import { useState }  from "react";
import { useRouter } from "next/navigation";
import Link          from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username:        "",
    fullName:        "",
    employeeId:      "",
    password:        "",
    confirmPassword: "",
  });
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    //client-side validation 
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          username:        form.username,
          password:        form.password,
          confirmPassword: form.confirmPassword,
          fullName:        form.fullName,
          employeeId:      form.employeeId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      //Show success message then redirect to login 
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => router.push("/login"), 2000);

    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-sm p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1">
            Subsystem: Inventory
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-400 mt-1">
            Registering as{" "}
            <span className="font-semibold text-gray-600">Pharmacist</span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="e.g. Juan dela Cruz"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. jdelacruz"
              autoComplete="username"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          {/* Employee ID (optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Employee ID{" "}
              <span className="normal-case font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              placeholder="e.g. P0001"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Back to login */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-700 font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}