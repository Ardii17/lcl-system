"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient"; // Pastikan import ini ada
import {
  Ship,
  Globe,
  Clock,
  ShieldCheck,
  ArrowRight,
  Search,
  X,
  Loader2,
} from "lucide-react";

export default function LandingPage() {
  // STATE UNTUK TRACKING
  const [trackId, setTrackId] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // FUNGSI LACAK KIRIMAN
  const handleTracking = async (e) => {
    e.preventDefault();
    if (!trackId) return;

    setLoading(true);
    setTrackResult(null);
    setErrorMsg("");

    // Normalisasi ID: User mungkin ketik "LCL005" atau cuma "5"
    // Kita ambil angkanya saja untuk dicocokkan dengan ID database
    const cleanId = trackId.replace(/\D/g, ""); // Hapus huruf "LCL", ambil angka saja

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
        .single(); // Ambil satu data saja

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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 scroll-smooth">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-50 blur-[120px] rounded-full opacity-60 pointer-events-none"></div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-md">
              <Ship size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
              LCL<span className="text-blue-600">System</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
            <a
              href="#layanan"
              className="hover:text-blue-600 transition-colors"
            >
              Layanan
            </a>
            <a
              href="#tracking"
              className="hover:text-blue-600 transition-colors"
            >
              Tracking
            </a>
            <a
              href="#tentang"
              className="hover:text-blue-600 transition-colors"
            >
              Tentang
            </a>
          </div>

            <Link href="/login">
              <button className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-full text-sm font-bold transition-all">
                Masuk
              </button>
            </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-24">
        {/* --- HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-8 pt-10 pb-32 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest">
              Logistik Digital Terpercaya
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-slate-900">
              Solusi Pengiriman <br />
              <span className="text-blue-600">LCL Terintegrasi</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
              Kelola pengiriman barang ekspor Anda dengan efisiensi tinggi.
              Pantau status dan dokumen dalam satu platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  Mulai Sekarang <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- SECTION 1: LAYANAN (ID: layanan) --- */}
        <section id="layanan" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Layanan Unggulan
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Kami menyediakan solusi logistik lengkap untuk kebutuhan ekspor
                impor LCL Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Pengiriman Global</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Jangkauan pengiriman ke lebih dari 100 negara dengan rute
                  tercepat dan efisien.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Asuransi Kargo</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Perlindungan menyeluruh untuk setiap barang yang Anda kirimkan
                  melalui sistem kami.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Tepat Waktu</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Jaminan estimasi waktu pengiriman yang akurat dengan sistem
                  monitoring realtime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: TRACKING BERFUNGSI (ID: tracking) --- */}
        <section id="tracking" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <div className="bg-blue-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
              {/* Background blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-50 pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Lacak Kiriman Anda
                </h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                  Masukkan nomor resi atau Booking ID untuk mengetahui posisi
                  terkini barang Anda.
                </p>

                {/* FORM PENCARIAN */}
                <form
                  onSubmit={handleTracking}
                  className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20 relative"
                >
                  <div className="flex-1 flex items-center px-4">
                    <Search className="text-blue-200 mr-3" size={20} />
                    <input
                      type="text"
                      placeholder="Contoh: LCL005 atau 5"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      className="bg-transparent border-none outline-none text-white placeholder-blue-200 w-full"
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Cari"
                    )}
                  </button>
                </form>

                {/* HASIL TRACKING (CARD MUNCUL JIKA DATA ADA) */}
                {trackResult && (
                  <div className="mt-8 bg-white text-left p-6 rounded-2xl max-w-md mx-auto shadow-2xl animate-in zoom-in-95 duration-300 relative">
                    <button
                      onClick={() => setTrackResult(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Ship size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          LCL{String(trackResult.id).padStart(3, "0")}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Tujuan: {trackResult.tujuan}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Barang</span>
                        <span className="text-sm font-bold text-slate-900">
                          {trackResult.barang}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Tanggal</span>
                        <span className="text-sm font-bold text-slate-900">
                          {trackResult.tanggal}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-slate-500">
                          Status Terkini
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trackResult.status === "Proses Pengiriman"
                              ? "bg-blue-100 text-blue-700"
                              : trackResult.status === "Selesai"
                                ? "bg-green-100 text-green-700"
                                : trackResult.status === "Ditolak"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {trackResult.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PESAN ERROR */}
                {errorMsg && (
                  <div className="mt-6 bg-red-500/20 text-red-100 p-4 rounded-xl max-w-md mx-auto border border-red-500/30 animate-in fade-in">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: TENTANG (ID: tentang) --- */}
        <section id="tentang" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm h-48 flex flex-col justify-end border border-slate-100">
                  <h3 className="text-4xl font-black text-blue-600 mb-1">5+</h3>
                  <p className="text-sm font-bold text-slate-700">
                    Tahun Pengalaman
                  </p>
                </div>
                <div className="bg-blue-600 p-6 rounded-2xl shadow-sm h-48 flex flex-col justify-end mt-8">
                  <h3 className="text-4xl font-black text-white mb-1">10k+</h3>
                  <p className="text-sm font-bold text-blue-100">
                    Pengiriman Sukses
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">
                Tentang LCL System
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Kami adalah platform logistik modern yang didedikasikan untuk
                membantu UMKM dan perusahaan besar dalam mengelola pengiriman
                Less than Container Load (LCL).
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <ShieldCheck size={14} />
                  </div>{" "}
                  Legalitas Terjamin
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Globe size={14} />
                  </div>{" "}
                  Jaringan Gudang Luas
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Clock size={14} />
                  </div>{" "}
                  Support 24/7
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Simple */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-sm">
        &copy; 2026 LCL System. All rights reserved.
      </footer>
    </div>
  );
}
