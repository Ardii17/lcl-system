"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Check,
  X,
  Edit,
  Save,
  Search,
  Bell,
  User,
  Ship,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);

  // STATE INTERAKSI
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [tempBerat, setTempBerat] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // --- 1. FETCH DATA ---
  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("id", { ascending: false });
    if (data) setBookings(data);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .is("user_id", null)
      .order("created_at", { ascending: false });
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // --- 2. LOGIKA ADMIN ---
  const filteredBookings = bookings.filter(
    (item) =>
      item.barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.id).includes(searchTerm),
  );

  const updateStatus = async (id, newStatus, customerId, barangName) => {
    if (newStatus === "Ditolak" && !confirm("Tolak booking ini?")) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      if (customerId) {
        await supabase.from("notifications").insert([
          {
            message: `Booking "${barangName}" Anda telah diupdate menjadi: ${newStatus}`,
            user_id: customerId,
            is_read: false,
          },
        ]);
      }
      fetchBookings();
    }
  };

  const saveBerat = async (id) => {
    await supabase.from("bookings").update({ berat: tempBerat }).eq("id", id);
    setEditingId(null);
    fetchBookings();
  };

  const markAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
      fetchNotifications();
    }
  };

  // --- STATS & LAPORAN ---
  const stats = {
    totalBooking: bookings.length,
    pengirimanAktif: bookings.filter((b) => b.status === "Proses Pengiriman")
      .length,
    selesai: bookings.filter((b) => b.status === "Selesai").length,
  };

  const laporanGrouped = Object.values(
    bookings.reduce((acc, curr) => {
      const date = curr.tanggal;
      if (!acc[date]) acc[date] = { tanggal: date, total: 0, selesai: 0 };
      acc[date].total += 1;
      if (curr.status === "Selesai") acc[date].selesai += 1;
      return acc;
    }, {}),
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* NAVBAR */}
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
              Admin Panel
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                if (!showNotif) markAsRead();
              }}
              className="p-2 rounded-full hover:bg-slate-100 relative text-slate-600"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-sm">Notifikasi Admin</h3>
                  <span className="text-xs text-slate-400">
                    {unreadCount} baru
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-center text-slate-400">
                      Belum ada notif.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-slate-50 hover:bg-slate-50 ${!notif.is_read ? "bg-blue-50/20" : ""}`}
                      >
                        <p
                          className={`text-sm ${!notif.is_read ? "font-bold" : ""}`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white">
              <User size={18} />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 text-red-500 hover:bg-red-50 p-2 rounded-lg"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ROW 1: STATISTIK & VERIFIKASI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STATISTIK */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-400 text-xs uppercase mb-4 tracking-wider">
              Statistik Sistem
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded bg-slate-50">
                <span className="text-slate-600 text-sm">Total Booking</span>
                <span className="font-bold text-lg text-slate-900">
                  {stats.totalBooking}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-blue-50/50">
                <span className="text-blue-800 text-sm">Aktif</span>
                <span className="font-bold text-lg text-blue-700">
                  {stats.pengirimanAktif}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-green-50/50">
                <span className="text-green-800 text-sm">Selesai</span>
                <span className="font-bold text-lg text-green-700">
                  {stats.selesai}
                </span>
              </div>
            </div>
          </div>

          {/* VERIFIKASI (Tabel Scrollable) */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900">
                Verifikasi & Manajemen
              </h3>
              <div className="relative">
                <Search
                  className="absolute left-2 top-2 text-slate-300"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Cari ID / Barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-48 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* --- MODIFIKASI DISINI: Menambahkan max-height dan overflow-y --- */}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto relative border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                {/* --- MODIFIKASI DISINI: Menambahkan sticky header --- */}
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 bg-slate-50">No Booking</th>
                    <th className="px-4 py-3 bg-slate-50">Barang</th>
                    <th className="px-4 py-3 text-center bg-slate-50">
                      Berat (Kg)
                    </th>
                    <th className="px-4 py-3 text-center bg-slate-50">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center min-w-[120px] bg-slate-50">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-4 text-center text-slate-400"
                      >
                        Tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-4 font-mono font-bold text-blue-600">
                          LCL{String(item.id).padStart(3, "0")}
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-800">
                            {item.barang}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.tujuan}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {editingId === item.id ? (
                            <input
                              type="number"
                              className="w-16 border border-blue-400 rounded px-1 py-1 text-center bg-white"
                              value={tempBerat}
                              onChange={(e) => setTempBerat(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span className="font-bold text-slate-700">
                              {item.berat}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              item.status === "Proses Pengiriman"
                                ? "bg-blue-50 text-blue-600 border-blue-200"
                                : item.status === "Ditolak"
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : item.status === "Selesai"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-yellow-50 text-yellow-600 border-yellow-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center flex justify-center gap-1">
                          {editingId === item.id ? (
                            <button
                              onClick={() => saveBerat(item.id)}
                              className="p-1.5 bg-blue-600 text-white rounded"
                            >
                              <Save size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setTempBerat(item.berat);
                              }}
                              className="p-1.5 bg-slate-100 text-slate-500 rounded hover:bg-slate-200"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          {!editingId &&
                            item.status === "Menunggu Verifikasi" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "Proses Pengiriman",
                                      item.user_id,
                                      item.barang,
                                    )
                                  }
                                  className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "Ditolak",
                                      item.user_id,
                                      item.barang,
                                    )
                                  }
                                  className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}
                          {!editingId &&
                            item.status === "Proses Pengiriman" && (
                              <button
                                onClick={() =>
                                  updateStatus(
                                    item.id,
                                    "Selesai",
                                    item.user_id,
                                    item.barang,
                                  )
                                }
                                className="px-2 py-1 bg-indigo-600 text-white text-[10px] rounded hover:bg-indigo-700"
                              >
                                Selesai
                              </button>
                            )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ROW 2: LAPORAN PENGIRIMAN */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-6 text-slate-900 border-b border-gray-100 pb-2">
            Laporan Pengiriman
          </h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left bg-gray-50">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">
                    Total Booking Masuk
                  </th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700">
                    Total Selesai
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {laporanGrouped.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-400">
                      Belum ada data laporan.
                    </td>
                  </tr>
                ) : (
                  laporanGrouped.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {row.tanggal}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold text-sm">
                        {row.total}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-bold text-sm">
                        {row.selesai}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
