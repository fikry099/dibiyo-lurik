"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, X, ShieldCheck } from "lucide-react";
import Script from "next/script";
import SkeletonModalMidtrans from "./SkeletonModalMidtrans";

export default function ModalMidtrans({ isOpen, snapToken, isLoadingToken, onClose, onSuccess, onPending, onError }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Fungsi enkapsulasi untuk memicu/merender Snap eksternal secara berulang
  const triggerMidtransEmbed = useCallback(() => {
    if (snapToken && window.snap) {
      const container = document.getElementById("midtrans-snap-container");
      if (container) {
        container.innerHTML = ""; // Reset container agar bersih dari sisa dom lama
      }

      window.snap.embed(snapToken, {
        embedId: "midtrans-snap-container",
        onSuccess: function (result) { if (onSuccess) onSuccess(result); },
        onPending: function (result) { if (onPending) onPending(result); },
        onError: function (result) { if (onError) onError(result); },
        onClose: function () { if (onClose) onClose(); },
      });
    }
  }, [snapToken, onSuccess, onPending, onError, onClose]);

  // Muat otomatis saat token siap pertama kali
  useEffect(() => {
    if (isOpen && snapToken && window.snap && !isLoadingToken) {
      triggerMidtransEmbed();
    }
  }, [isOpen, snapToken, isLoadingToken, triggerMidtransEmbed]);

  // Fungsi tombol kembali di header: Paksa reset ke menu utama pilihan pembayaran Midtrans
  const handleBackToMainMenu = () => {
    if (isLoadingToken || !snapToken) {
      onClose(); // Jika masih loading, langsung tutup modal saja
    } else {
      triggerMidtransEmbed(); // Picu ulang embed untuk mereset tampilan iframe ke menu utama
    }
  };

  if (!isOpen || !mounted) return null;

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.startsWith("Mid-server-");
  const midtransScriptUrl = isProduction 
    ? "https://app.midtrans.com/snap/snap.js" 
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  const modalLayout = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-transparent backdrop-blur-md animate-fade-in">
      
      <Script 
        src={midtransScriptUrl}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive" 
      />

      {/* Card Kontainer Utama */}
      <div className="bg-[#12110F] border border-[#E5BA73]/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(229,186,115,0.15)] flex flex-col h-[85vh] max-h-[660px]">
        
        {/* Header Konten Modal */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#E5BA73]/10 bg-[#0A1715]">
          <div className="flex items-center gap-2">
            {/* Tombol Kembali ke Halaman Utama Pembayaran */}
            <button
              onClick={handleBackToMainMenu}
              className="p-1.5 rounded-xl text-[#A3A19E] hover:text-[#E5BA73] hover:bg-white/5 transition-all duration-200 flex items-center gap-1 text-[11px] font-semibold"
              title="Kembali ke Pilihan Pembayaran Utama"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Menu Utama</span>
            </button>

            <div className="border-l border-white/10 pl-2 flex items-center gap-2">
              <div className="p-1 rounded-lg bg-[#E5BA73]/10 text-[#E5BA73]">
                <ShieldCheck size={14} />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest text-[#E5BA73]">Gerbang Pembayaran</span>
              </div>
            </div>
          </div>

          {/* Tombol Tutup Total Keluar */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A3A19E] hover:text-red-400 hover:bg-white/5 transition-all duration-200"
            title="Tutup Jendela"
          >
            <X size={16} />
          </button>
        </div>

        {/* Isi Wadah Utama: Switch antara Relog Skeleton vs Real Midtrans Iframe */}
        <div className="flex-1 bg-[#F9F6F0] overflow-y-auto relative flex flex-col custom-scrollbar">
          {isLoadingToken || !snapToken ? (
            <SkeletonModalMidtrans />
          ) : (
            <div id="midtrans-snap-container" className="w-full h-full min-h-[500px] bg-[#F9F6F0] animate-fade-in" />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0A1715] border-t border-[#E5BA73]/10 text-center flex items-center justify-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <p className="text-[9px] text-[#A3A19E] font-medium tracking-wide">
            Sistem terenkripsi otomatis jaminan privasi data pelanggan
          </p>
        </div>

      </div>
    </div>
  );

  return createPortal(modalLayout, document.body);
}