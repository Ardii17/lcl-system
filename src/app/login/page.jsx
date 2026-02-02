"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Untuk redirect halaman
import { supabase } from "@/app/lib/supabaseClient"; // Import Supabase
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"; // Ganti icon User jadi Mail

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk menampung input
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Fungsi menangani ketikan user
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi Login ke Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // --- LOGIKA PENENTUAN ARAH (REDIRECT) ---
      // Ambil metadata role dari user yang baru login
      const role = data.user.user_metadata.role;

      if (role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/customer");
      }
    } catch (error) {
      alert("Gagal Login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-[420px] p-4">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-10 shadow-xl shadow-slate-200/60">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
              Log In
            </h1>
            <p className="text-slate-500 text-sm">Sistem Pengiriman LCL</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input Email */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Masukkan Email Anda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                  Lupa?
                </a>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-11 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Memuat..." : "Login"}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-slate-500">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 font-bold hover:underline"
                >
                  Daftar
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
