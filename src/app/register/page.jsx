"use client";

import React, { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // State Data Input
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak sama!");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      alert("Registrasi Berhasil! Akun Anda sudah aktif. Silakan login.");
      router.push("/login");
    } catch (error) {
      alert("Gagal Mendaftar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Background Biru Gelap (Sama dengan Login)
    <div className="min-h-screen flex items-center justify-center bg-[#001f54] font-sans py-10">
      {/* Container Putih */}
      <div className="w-full max-w-[450px] p-4">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-black mb-1">
              Daftar Akun Baru
            </h1>
            <p className="text-sm text-gray-500">
              Lengkapi data untuk akses sistem
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Input Nama Lengkap */}
            <div className="space-y-1">
              <label className="text-sm text-black block">Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-blue-800"
                required
              />
            </div>

            {/* Grid Email & Username */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-black block">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-blue-800"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-black block">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-blue-800"
                  required
                />
              </div>
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

            {/* Konfirmasi Password */}
            <div className="space-y-1">
              <label className="text-sm text-black block">
                Konfirmasi Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 text-sm text-black focus:outline-none focus:border-blue-800"
                required
              />
            </div>

            {/* Tombol Register */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e3a68] hover:bg-[#162d50] text-white py-2 text-sm font-medium transition-colors mt-6 disabled:opacity-70"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>

            {/* Link Login */}
            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
