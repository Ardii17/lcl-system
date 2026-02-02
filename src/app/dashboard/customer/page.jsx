"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Package,
  MapPin,
  Search,
  X,
  Clock,
  CheckCircle2,
  Ship,
  Bell,
  User,
} from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  // STATE INTERAKSI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNotif, setShowNotif] = useState(false);

  const [form, setForm] = useState({
    namaBarang: "",
    negaraTujuan: "",
    berat: "",
    tanggal: "",
    pembayaran: "",
  });

  // --- 1. REVISI FETCH DATA (Hanya ambil data milik user sendiri) ---
  const fetchBookings = async () => {
    // Ambil data user yang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id) // <--- FILTER PENTING: Hanya user_id yang cocok
        .order("id", { ascending: false });

      if (!error) setBookings(data);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- 2. REVISI INPUT DATA (Sertakan user_id saat simpan) ---
  const handleInputData = async (e) => {
    e.preventDefault();
    if (!form.namaBarang || !form.negaraTujuan)
      return alert("Mohon lengkapi data!");

    setLoading(true);

    // Ambil user ID user yang sedang login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Sesi habis, silakan login ulang");
      return router.push("/login");
    }

    const { error } = await supabase.from("bookings").insert([
      {
        barang: form.namaBarang,
        tujuan: form.negaraTujuan,
        berat: form.berat,
        tanggal: form.tanggal || new Date().toISOString().split("T")[0],
        pembayaran: form.pembayaran,
        status: "Menunggu Verifikasi",
        user_id: user.id, // <--- PENTING: Menandai ini milik siapa
      },
    ]);

    setLoading(false);
    if (!error) {
      alert("Booking berhasil!");
      setForm({
        namaBarang: "",
        negaraTujuan: "",
        berat: "",
        tanggal: "",
        pembayaran: "",
      });
      fetchBookings();
    } else {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // ... (SISA KODE DI BAWAH SAMA PERSIS SEPERTI SEBELUMNYA, TIDAK PERLU DIUBAH) ...
  // Langsung copy paste saja return JSX dari jawaban sebelumnya,
  // karena perubahannya hanya di logika fetchBookings dan handleInputData di atas.

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* ... Header & Konten lainnya ... */}
      {/* (Gunakan JSX dari jawaban sebelumnya, fiturnya sudah benar) */}

      {/* Agar tidak terlalu panjang, saya persingkat di sini. 
           Pastikan Anda menggunakan JSX lengkap dari jawaban sebelumnya 
           tetapi menggunakan fetchBookings dan handleInputData yang BARU di atas. 
       */}

      <header className="bg-white px-8 py-4 flex justify-between items-center shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Ship size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">
              LCL System
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              Customer Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="p-2 rounded-full hover:bg-slate-100 relative text-slate-600 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-sm">Notifikasi</h3>
                </div>
                <div className="p-4 text-sm text-slate-500 text-center">
                  Belum ada notifikasi baru
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700">Halo, Customer</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                Basic Member
              </p>
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
              <User size={18} />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="ml-2 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-400 text-xs uppercase mb-4 tracking-wider">
              Ringkasan Akun
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span className="text-slate-600 text-sm font-medium">
                  Total Booking
                </span>
                <span className="font-bold text-xl text-slate-900">
                  {bookings.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50/50 rounded-lg">
                <span className="text-blue-800 text-sm font-medium">Aktif</span>
                <span className="font-bold text-xl text-blue-700">
                  {
                    bookings.filter(
                      (b) => b.status !== "Selesai" && b.status !== "Ditolak",
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900">
              <Package className="text-blue-600" size={20} /> Booking Pengiriman
              Baru
            </h3>
            <form
              onSubmit={handleInputData}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={form.namaBarang}
                  onChange={(e) =>
                    setForm({ ...form, namaBarang: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Mesin Kopi"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Negara Tujuan
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute right-3 top-2.5 text-slate-300"
                    size={16}
                  />
                  <input
                    type="text"
                    value={form.negaraTujuan}
                    onChange={(e) =>
                      setForm({ ...form, negaraTujuan: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Contoh: Japan"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Berat (Kg)
                </label>
                <input
                  type="number"
                  value={form.berat}
                  onChange={(e) => setForm({ ...form, berat: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Rencana Kirim
                </label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold uppercase text-slate-400">
                  Metode Pembayaran
                </label>
                <select
                  value={form.pembayaran}
                  onChange={(e) =>
                    setForm({ ...form, pembayaran: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Pilih Metode</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="Virtual Account">Virtual Account</option>
                  <option value="Kredit">Kartu Kredit / Debit</option>
                </select>
              </div>
              <button
                disabled={loading}
                className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-md shadow-blue-100 mt-2 disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Simpan Booking"}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900">
              Riwayat Pengiriman
            </h3>
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-slate-300"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari ID Resi..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">No Booking</th>
                <th className="px-6 py-4">Barang</th>
                <th className="px-6 py-4">Tujuan</th>
                <th className="px-6 py-4">Tanggal Input</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                bookings.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openModal(item)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 group-hover:text-blue-700">
                      LCL{String(item.id).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {item.barang}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.tujuan}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.tanggal}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          item.status === "Proses Pengiriman"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : item.status === "Menunggu Verifikasi"
                              ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                              : item.status === "Selesai"
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-red-50 text-red-600 border-red-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Detail Pengiriman</h3>
                <p className="text-blue-100 text-xs">
                  ID Resi: LCL{String(selectedItem.id).padStart(3, "0")}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${true ? "bg-blue-600 border-blue-600 text-white" : ""}`}
                  >
                    <Clock size={14} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-blue-600">
                    Pending
                  </span>
                </div>
                <div className="h-0.5 flex-1 mx-2 bg-slate-200"></div>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${selectedItem.status !== "Menunggu Verifikasi" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-300"}`}
                  >
                    <Ship size={14} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Kirim
                  </span>
                </div>
                <div className="h-0.5 flex-1 mx-2 bg-slate-200"></div>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${selectedItem.status === "Selesai" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-300"}`}
                  >
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Selesai
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Barang</span>
                  <span className="font-bold text-slate-800">
                    {selectedItem.barang}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tujuan</span>
                  <span className="font-bold text-slate-800">
                    {selectedItem.negaraTujuan || selectedItem.tujuan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Berat</span>
                  <span className="font-bold text-slate-800">
                    {selectedItem.berat} Kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
