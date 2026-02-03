"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LogOut, Search, Bell } from "lucide-react";

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
      {/* HEADER / NAVBAR */}
      <header className="bg-[#1e3a68] text-white px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-wide">
            Sistem Pengiriman Ekspor LCL
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative mx-2">
            <button
              onClick={() => {
                setShowNotif(!showNotif);
                if (!showNotif) markAsRead();
              }}
              className="relative p-1 hover:text-blue-200 transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1e3a68]"></span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm">
                  Notifikasi Admin
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-center text-slate-400">
                      Belum ada notif.
                    </p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-slate-50 text-sm ${
                          !notif.is_read ? "bg-blue-50" : ""
                        }`}
                      >
                        <p className={!notif.is_read ? "font-semibold" : ""}>
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

          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded text-sm font-medium hover:bg-red-500 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Admin</h2>

        {/* ROW 1: KARTU STATISTIK & VERIFIKASI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STATISTIK SISTEM */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h3 className="font-bold text-base mb-6 text-slate-900">
              Statistik Sistem
            </h3>
            <div className="space-y-3 text-sm font-medium text-slate-700">
              <div className="flex justify-between">
                <span>Total Booking:</span>
                <span className="font-bold">{stats.totalBooking}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengiriman Aktif:</span>
                <span className="font-bold">{stats.pengirimanAktif}</span>
              </div>
              <div className="flex justify-between">
                <span>Selesai:</span>
                <span className="font-bold">{stats.selesai}</span>
              </div>
            </div>
          </div>

          {/* VERIFIKASI BOOKING */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-base text-slate-900">
                Verifikasi Booking
              </h3>
              <div className="relative w-48">
                <Search
                  className="absolute left-2 top-2.5 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-xs w-full focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto relative border border-gray-200 rounded">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-200 text-slate-800 text-xs font-bold sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">No Booking</th>
                    <th className="px-4 py-3">Barang / Customer</th>
                    <th className="px-4 py-3 text-center">Berat (Cbm)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-400">
                        Tidak ada data.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">
                          LCL{String(item.id).padStart(3, "0")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">
                            {item.barang}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.tujuan}
                          </div>
                        </td>

                        {/* Kolom Berat: Input muncul jika mode Edit aktif */}
                        <td className="px-4 py-3 text-center">
                          {editingId === item.id ? (
                            <input
                              type="number"
                              className="w-16 border border-blue-400 rounded px-1 py-0.5 text-center bg-white text-xs"
                              value={tempBerat}
                              onChange={(e) => setTempBerat(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <span className="text-slate-700">{item.berat}</span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-600">
                          {item.status}
                        </td>

                        {/* KOLOM AKSI */}
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            {/* LOGIKA TOMBOL EDIT/SIMPAN */}
                            {editingId === item.id ? (
                              // Jika sedang Edit -> Tombol Simpan
                              <button
                                onClick={() => saveBerat(item.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                              >
                                Simpan
                              </button>
                            ) : (
                              // Jika TIDAK sedang Edit -> Cek Status Dulu
                              item.status === "Menunggu Verifikasi" && (
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setTempBerat(item.berat);
                                  }}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                >
                                  Edit
                                </button>
                              )
                            )}

                            {/* Tombol Approve / Reject (Hanya jika Menunggu Verifikasi & Tidak sedang edit) */}
                            {item.status === "Menunggu Verifikasi" &&
                              !editingId && (
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
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                  >
                                    Approve
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
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                            {/* Tombol Selesaikan (Jika Proses Pengiriman) */}
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
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold"
                                >
                                  Selesaikan
                                </button>
                              )}
                          </div>
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
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-base mb-6 text-slate-900">
            Laporan Pengiriman
          </h3>
          <div className="overflow-hidden border border-gray-200 rounded">
            <table className="w-full text-left">
              <thead className="bg-gray-200 text-slate-800 text-xs font-bold">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Total Booking</th>
                  <th className="px-6 py-3">Total Selesai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {laporanGrouped.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-400">
                      Belum ada data laporan.
                    </td>
                  </tr>
                ) : (
                  laporanGrouped.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-slate-700">
                        {row.tanggal}
                      </td>
                      <td className="px-6 py-3 text-slate-900 font-bold">
                        {row.total}
                      </td>
                      <td className="px-6 py-3 text-green-600 font-bold">
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
