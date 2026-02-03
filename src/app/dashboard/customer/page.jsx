"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Bell,
  X,
  Clock,
  CheckCircle2,
  Ship,
  Search,
} from "lucide-react";

export default function CustomerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  // STATE INTERAKSI & NOTIFIKASI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [form, setForm] = useState({
    namaBarang: "",
    negaraTujuan: "",
    berat: "",
    tanggal: "",
    pembayaran: "",
  });

  // --- LOGIKA (TIDAK BERUBAH) ---

  // 1. FETCH DATA BOOKING
  const fetchBookings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });
      if (data) setBookings(data);
    }
  };

  // 2. FETCH DATA NOTIFIKASI
  const fetchNotifications = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setNotifications(data);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchNotifications();
  }, []);

  // 3. FUNGSI INPUT DATA
  const handleInputData = async (e) => {
    e.preventDefault();
    if (!form.namaBarang || !form.negaraTujuan)
      return alert("Mohon lengkapi data!");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: bookingError } = await supabase.from("bookings").insert([
      {
        barang: form.namaBarang,
        tujuan: form.negaraTujuan,
        berat: form.berat,
        tanggal: form.tanggal || new Date().toISOString().split("T")[0],
        pembayaran: form.pembayaran,
        status: "Menunggu Verifikasi",
        user_id: user.id,
      },
    ]);

    if (!bookingError) {
      // Kirim Notifikasi ke Admin
      await supabase.from("notifications").insert([
        {
          message: `Booking Baru: ${form.namaBarang} tujuan ${form.negaraTujuan} perlu verifikasi.`,
          user_id: null,
          is_read: false,
        },
      ]);

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
      alert(bookingError.message);
    }
    setLoading(false);
  };

  // 4. FUNGSI TANDAI NOTIFIKASI DIBACA
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // --- TAMPILAN BARU (SESUAI GAMBAR) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* HEADER BIRU TUA */}
      <header className="bg-[#1e3a68] text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-wide">
            Sistem Pengiriman Ekspor LCL
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Fitur Notifikasi (Tetap Ada tapi disesuaikan stylenya) */}
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
                <div className="p-3 border-b border-slate-100 bg-slate-50 font-bold text-sm">Notifikasi</div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-center text-slate-400">Tidak ada notifikasi.</p>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 border-b border-slate-50 text-sm ${!notif.is_read ? "bg-blue-50" : ""}`}>
                        <p className={!notif.is_read ? "font-semibold" : ""}>{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
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

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* JUDUL HALAMAN */}
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Customer</h2>

        {/* GRID UTAMA (KIRI: STATS, KANAN: FORM) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* KARTU STATISTIK */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Informasi Pengiriman</h3>
            <div className="space-y-2 text-sm font-medium text-slate-700">
              <div className="flex justify-between">
                <span>Total Booking:</span>
                <span className="font-bold">{bookings.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengiriman Aktif:</span>
                <span className="font-bold">{bookings.filter((b) => b.status !== "Selesai" && b.status !== "Ditolak").length}</span>
              </div>
              <div className="flex justify-between">
                <span>Selesai:</span>
                <span className="font-bold">{bookings.filter((b) => b.status === "Selesai").length}</span>
              </div>
            </div>
          </div>

          {/* KARTU FORM INPUT */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-bold text-lg mb-4 text-slate-900">Booking Pengiriman LCL</h3>
            <form onSubmit={handleInputData} className="space-y-4">
              
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nama Barang"
                  value={form.namaBarang}
                  onChange={(e) => setForm({ ...form, namaBarang: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-800"
                />
                <input
                  type="text"
                  placeholder="Negara Tujuan"
                  value={form.negaraTujuan}
                  onChange={(e) => setForm({ ...form, negaraTujuan: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-800"
                />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Berat (Kg)"
                  value={form.berat}
                  onChange={(e) => setForm({ ...form, berat: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-800"
                />
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-800 text-slate-600"
                />
              </div>

              {/* Row 3: Select */}
              <div>
                <select
                  value={form.pembayaran}
                  onChange={(e) => setForm({ ...form, pembayaran: e.target.value })}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-blue-800 bg-white"
                >
                  <option value="">Pilih Metode Pembayaran</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="Virtual Account">Virtual Account</option>
                  <option value="Kredit">Kartu Kredit / Debit</option>
                </select>
              </div>

              {/* Button */}
              <button
                disabled={loading}
                className="w-full bg-[#1e3a68] hover:bg-[#162d50] text-white font-bold py-2.5 rounded transition-colors mt-2 text-sm"
              >
                {loading ? "Menyimpan..." : "Simpan Booking"}
              </button>
            </form>
          </div>
        </div>

        {/* TABEL TRACKING */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
             <h3 className="font-bold text-lg text-slate-900">Tracking Pengiriman</h3>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-slate-700 text-sm font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">No Booking</th>
                <th className="px-6 py-3">Barang</th>
                <th className="px-6 py-3">Tujuan</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Belum ada data pengiriman.
                  </td>
                </tr>
              ) : (
                bookings.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => openModal(item)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3 text-slate-600">
                      LCL{String(item.id).padStart(3, "0")}
                    </td>
                    <td className="px-6 py-3 text-slate-800">{item.barang}</td>
                    <td className="px-6 py-3 text-slate-800">{item.tujuan}</td>
                    <td className="px-6 py-3">
                      <span className={`
                        ${item.status === 'Proses Pengiriman' ? 'text-blue-600' : 
                          item.status === 'Selesai' ? 'text-green-600' :
                          item.status === 'Ditolak' ? 'text-red-600' :
                          'text-yellow-600'} font-medium
                      `}>
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

      {/* MODAL DETAIL (POPUP) - Tidak berubah, hanya style sedikit menyesuaikan */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-[#1e3a68] p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Detail Pengiriman</h3>
                <p className="text-blue-100 text-xs">ID: LCL{String(selectedItem.id).padStart(3, "0")}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-1.5 rounded-full hover:bg-white/20 transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {/* Timeline Graphic */}
              <div className="flex justify-between items-center px-4 mb-6">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Clock size={16}/></div>
                  <span className="text-[10px] font-bold">PENDING</span>
                </div>
                <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItem.status !== 'Menunggu Verifikasi' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}><Ship size={16}/></div>
                  <span className="text-[10px] font-bold">KIRIM</span>
                </div>
                <div className="h-0.5 flex-1 bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItem.status === 'Selesai' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}><CheckCircle2 size={16}/></div>
                  <span className="text-[10px] font-bold">SELESAI</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Barang</span><span className="font-bold">{selectedItem.barang}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Tujuan</span><span className="font-bold">{selectedItem.negaraTujuan || selectedItem.tujuan}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Berat</span><span className="font-bold">{selectedItem.berat} Kg</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-[#1e3a68]">{selectedItem.status}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}