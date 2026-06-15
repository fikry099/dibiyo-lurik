// D:\dibiyo-lurik\src\app\components\produk\FloatingComboBar.jsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Wand2, ArrowRight } from "lucide-react";
import Swal from "sweetalert2";
import { useComboStore } from "@/app/store/useComboStore";

export default function FloatingComboBar() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tarik data & fungsi dari Zustand useComboStore
  const combination = useComboStore((state) => state.combination);
  const resetCombo = useComboStore((state) => state.resetCombo);
  const getTotalPrice = useComboStore((state) => state.getTotalPrice);
  const isValidCombo = useComboStore((state) => state.isValidCombo());
  const getCartPayload = useComboStore((state) => state.getCartPayload);

  // FUNGSI UTAMA: Checkout Masal & Penyesuaian Kondisi Login 🔒
  const handleBulkCheckout = async () => {
    setIsSubmitting(true);
    try {
      // 1. Ekstraksi Cookie user-role secara manual di client-side
      const cookies = document.cookie.split("; ");
      const roleCookie = cookies.find((row) => row.startsWith("user-role="));
      const userRole = roleCookie ? roleCookie.split("=")[1] : null;

      // 2. KONDISI PENYESUAIAN LOGIN: Wajib login & wajib bermutasi sebagai 'customer'
      if (!userRole || userRole !== "customer") {
        Swal.fire({
          icon: "warning",
          title: "Sesi Masuk Diperlukan",
          text: "Silahkan login menggunakan akun pelanggan Anda untuk memproses rakitan kain ke keranjang.",
          confirmButtonText: "Login Sekarang",
          confirmButtonColor: "#E5BA73",
          background: "#1A1917",
          color: "#F9F6F0",
          iconColor: "#E5BA73",
        });
        
        // Alihkan paksa ke halaman login yang sudah dimodifikasi hybrid router-nya
        router.push("/auth/login");
        setIsSubmitting(false);
        return;
      }

      // 3. Ekstraksi payload masal dari Selector Zustand Store
      const payloads = getCartPayload(); // Berisi array [{ gulungan_id, jumlah_order, catatan_kustom }]

      // 4. Pengiriman sekuensial berseri ke API Keranjang
      for (const item of payloads) {
        const response = await fetch("/api/keranjang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error("Gagal menginjeksi salah satu komponen");
      }

      // 5. Sinkronisasi global event navbar badge keranjang belanja
      window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { count: payloads.length } }));
      window.dispatchEvent(new CustomEvent("sync-cart-bounce"));

      // 6. Notifikasi Sukses & Reset Sandbox
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Kombinasi masuk keranjang!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: "#1A1917",
        color: "#F9F6F0",
        iconColor: "#E5BA73",
        width: "260px",
        customClass: { popup: "text-[11px] p-2 border border-[#E5BA73]/20 rounded-xl" }
      });

      resetCombo();
      router.refresh();

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Mengeksekusi",
        text: "Terjadi gangguan sistem koneksi saat memproses paket kain kustom.",
        confirmButtonColor: "#E5BA73",
        background: "#1A1917",
        color: "#F9F6F0"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isValidCombo && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-full max-w-4xl px-4"
        >
          <div className="bg-[#12110F]/95 backdrop-blur-xl border border-[#E5BA73]/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl shadow-black/80">
            
            {/* Bagian Kiri: Status Rakitan Mini-Slot Dashboard */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex -space-x-3 overflow-hidden">
                {["badan", "lengan", "aksen"].map((slot) => {
                  const item = combination[slot];
                  return (
                    <div
                      key={slot}
                      className={`w-10 h-10 rounded-full border-2 bg-[#1A1917] flex items-center justify-center relative group overflow-hidden transition-transform hover:z-30 hover:scale-110
                        ${item ? "border-[#E5BA73]" : "border-white/10 opacity-40"}`}
                    >
                      {item?.gambar_url ? (
                        <img src={item.gambar_url} className="w-full h-full object-cover" alt={slot} />
                      ) : (
                        <span className="text-[8px] font-bold text-[#A3A19E] uppercase">{slot[0]}</span>
                      )}
                      
                      {/* Mini Tooltip Metadata */}
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black text-[#F9F6F0] text-[9px] px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 font-sans">
                        <span className="capitalize font-bold text-[#E5BA73]">{slot}</span>: {item ? `Roll #${item.nomor_gulungan || '01'} (${item.panjang_order}m)` : "Kosong"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col text-left">
                <span className="text-[10px] text-[#E5BA73] font-bold tracking-wider uppercase">Lurik Customizer Slot Active</span>
                <h5 className="text-xs font-medium text-[#F9F6F0]/90">
                  {combination.lengan || combination.aksen 
                    ? "Kombinasi baju multi-motif siap dirakit" 
                    : "Komponen utama badan kain dikonfigurasi"}
                </h5>
              </div>
            </div>

            {/* Bagian Kanan: Kalkulator Akrual Harga & Komparasi Aksi */}
            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider">Estimasi Akumulasi Biaya</p>
                <p className="text-sm font-black text-[#E5BA73]">
                  Rp {getTotalPrice().toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Clear Sandbox */}
                <button
                  type="button"
                  onClick={resetCombo}
                  disabled={isSubmitting}
                  className="p-2.5 bg-white/5 hover:bg-red-950/40 text-[#A3A19E] hover:text-red-400 rounded-xl border border-white/10 hover:border-red-500/20 transition-all active:scale-95 disabled:opacity-40"
                  title="Reset Desain"
                >
                  <Trash2 size={14} />
                </button>

                {/* Lompat ke Laboratorium 3D/Customizer Studio */}
                <button
                  type="button"
                  onClick={() => router.push("/customizer")}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 text-[#F9F6F0] text-[11px] font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40"
                >
                  <Wand2 size={13} className="text-[#E5BA73]" />
                  Studio Desain
                </button>

                {/* Bulk Inject ke Core API Basket */}
                <button
                  type="button"
                  onClick={handleBulkCheckout}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#E5BA73] text-[#12110F] text-[11px] font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#12110F] rounded-full border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={13} />
                      Beli Paket Combo
                      <ArrowRight size={12} strokeWidth={2.5} />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}