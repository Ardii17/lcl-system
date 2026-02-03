"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "", // Sesuai gambar, labelnya "Username" (bisa diisi email)
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Supabase login tetap pakai email, jadi kita asumsikan input username = email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.username,
        password: formData.password,
      });

      if (error) throw error;

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
    // Background Biru Gelap (Sesuai Gambar)
    <div className="min-h-screen flex items-center justify-center bg-[#001f54] font-sans">
      {/* Container Putih */}
      <div className="w-full max-w-[400px] p-4">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-black mb-4">
              Login Sistem Pengiriman LCL
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Username */}
            <div className="space-y-1">
              <label className="text-sm text-black block">Username</label>
              <input
                type="text" // Bisa diisi email
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-blue-800"
                required
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="text-sm text-black block">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-blue-800"
                required
              />
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a68] hover:bg-[#162d50] text-white py-2 text-sm font-medium transition-colors mt-4 disabled:opacity-70"
            >
              {loading ? "Memuat..." : "Login"}
            </button>

            {/* Link Daftar (Opsional, agar user tidak stuck) */}
            <div className="text-center mt-4">
              <Link
                href="/register"
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Belum punya akun? Daftar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
