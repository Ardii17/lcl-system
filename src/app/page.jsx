"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";
import {
  Ship,
  Globe,
  Clock,
  ShieldCheck,
  ArrowRight,
  Search,
  X,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTracking = async (e) => {
    e.preventDefault();
    if (!trackId) return;

    setLoading(true);
    setTrackResult(null);
    setErrorMsg("");

    const cleanId = trackId.replace(/\D/g, "");

    if (!cleanId) {
      setErrorMsg("Format ID tidak valid. Gunakan angka atau format LCL001");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("id, barang, tujuan, status, tanggal")
        .eq("id", cleanId)
        .single();

      if (error || !data) {
        setErrorMsg("Data pengiriman tidak ditemukan. Cek kembali ID Anda.");
      } else {
        setTrackResult(data);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans scroll-smooth">
      {/* --- NAVBAR (Tema Biru Gelap) --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#001f54] text-white shadow-lg">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Ship size={28} className="text-white" />
            <span className="text-xl font-bold tracking-tight">
              Sistem Pengiriman Ekspor LCL
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-semibold text-blue-100">
            <a href="#tracking" className="hover:text-white transition-colors">
              Tracking
            </a>
            <a href="#layanan" className="hover:text-white transition-colors">
              Layanan
            </a>
            <a href="#tentang" className="hover:text-white transition-colors">
              Tentang
            </a>
          </div>

          <Link href="/login">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-sm font-bold transition-all shadow-md">
              Masuk Sistem
            </button>
          </Link>
        </div>
      </nav>

      <main className="pt-20">
        {/* --- HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-[#001f54]">
              Solusi Logistik <br />
              <span className="text-blue-600">Ekspor Terintegrasi</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-xl leading-relaxed">
              Kelola pengiriman barang ekspor LCL Anda dengan sistem digital
              yang transparan, efisien, dan terpercaya.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <button className="bg-[#1e3a68] hover:bg-[#001f54] text-white px-10 py-4 rounded font-bold transition-all flex items-center gap-2 mx-auto md:mx-0 shadow-lg">
                  Mulai Sekarang <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 rounded-2xl h-64 md:h-96 w-full flex items-center justify-center border-2 border-dashed border-gray-300">
            <Ship size={120} className="text-gray-300" />
          </div>
        </section>

        {/* --- SECTION: TRACKING (Biru Gelap) --- */}
        <section id="tracking" className="py-20 bg-[#001f54]">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Lacak Kiriman Anda
            </h2>
            <p className="text-blue-200 mb-10">
              Masukkan nomor Booking ID untuk melihat status terkini barang
              Anda.
            </p>

            <form
              onSubmit={handleTracking}
              className="flex flex-col md:flex-row gap-2 bg-white p-2 rounded shadow-xl"
            >
              <div className="flex-1 flex items-center px-4 py-2">
                <Search className="text-gray-400 mr-3" size={20} />
                <input
                  type="text"
                  placeholder="Contoh: LCL001"
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-900 w-full text-sm"
                />
              </div>
              <button
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-3 rounded transition-colors"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Cek Status"
                )}
              </button>
            </form>

            {trackResult && (
              <div className="mt-10 bg-white text-left p-8 rounded-lg max-w-xl mx-auto shadow-2xl relative animate-in zoom-in-95">
                <button
                  onClick={() => setTrackResult(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                >
                  <X size={20} />
                </button>
                <h3 className="font-bold text-[#001f54] text-xl mb-4 border-b pb-2">
                  Detail Pengiriman
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">No Booking:</span>
                    <span className="font-bold">
                      LCL{String(trackResult.id).padStart(3, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama Barang:</span>
                    <span className="font-bold">{trackResult.barang}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-500">Status:</span>
                    <span
                      className={`px-4 py-1 rounded font-bold uppercase text-xs ${
                        trackResult.status === "Selesai"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {trackResult.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {errorMsg && (
              <div className="mt-6 text-red-300 font-medium">{errorMsg}</div>
            )}
          </div>
        </section>

        {/* --- SECTION: LAYANAN --- */}
        <section id="layanan" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold text-[#001f54] mb-16">
              Layanan Kami
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm">
                <Globe size={40} className="text-blue-600 mb-6 mx-auto" />
                <h3 className="text-lg font-bold mb-3">Jaringan Global</h3>
                <p className="text-gray-500 text-sm">
                  Pengiriman ke berbagai pelabuhan utama di seluruh dunia.
                </p>
              </div>
              <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm">
                <ShieldCheck size={40} className="text-blue-600 mb-6 mx-auto" />
                <h3 className="text-lg font-bold mb-3">Keamanan Terjamin</h3>
                <p className="text-gray-500 text-sm">
                  Sistem monitoring dan asuransi kargo untuk setiap pengiriman.
                </p>
              </div>
              <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm">
                <Clock size={40} className="text-blue-600 mb-6 mx-auto" />
                <h3 className="text-lg font-bold mb-3">Real-time Update</h3>
                <p className="text-gray-500 text-sm">
                  Status terbaru mengenai posisi barang Anda kapan saja.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: TENTANG (ID: tentang) - DIKEMBALIKAN --- */}
        <section id="tentang" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-[#001f54]">
                Tentang LCL System
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Kami adalah platform logistik modern yang didedikasikan untuk
                membantu UMKM dan perusahaan besar dalam mengelola pengiriman
                Less than Container Load (LCL). Misi kami adalah mendigitalkan
                proses ekspor-impor agar lebih transparan, cepat, dan hemat
                biaya.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                  Legalitas Terjamin
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  Jaringan Gudang Luas
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  Support 24/7
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e3a68] p-8 rounded-2xl text-white text-center shadow-lg">
                  <h3 className="text-4xl font-black mb-1">5+</h3>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    Tahun Pengalaman
                  </p>
                </div>
                <div className="bg-blue-600 p-8 rounded-2xl text-white text-center shadow-lg mt-8">
                  <h3 className="text-4xl font-black mb-1">10k+</h3>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    Pengiriman Sukses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#001f54] text-white py-10 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-sm opacity-60">
            &copy; 2026 LCL System - Logistik Ekspor Modern.
          </p>
        </div>
      </footer>
    </div>
  );
}
