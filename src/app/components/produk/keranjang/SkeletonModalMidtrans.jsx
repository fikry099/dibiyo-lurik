"use client";

import React from "react";

export default function SkeletonModalMidtrans() {
  return (
    <div className="flex-1 bg-[#12110F] p-6 flex flex-col justify-between animate-pulse h-full min-h-[500px]">
      
      {/* Bagian Atas: Nominal & Order ID */}
      <div className="space-y-4 w-full">
        {/* Garis batas simulasi kelompok/toko */}
        <div className="h-12 bg-white/5 border border-white/5 rounded-xl w-full flex items-center px-4 justify-between">
          <div className="h-3 bg-zinc-700 rounded w-1/3"></div>
          <div className="h-4 bg-[#E5BA73]/20 rounded w-12"></div>
        </div>

        {/* Simulasi Besar Nominal */}
        <div className="space-y-2 pt-2">
          <div className="h-8 bg-[#E5BA73]/20 rounded-lg w-1/2"></div>
          <div className="h-3 bg-zinc-700 rounded w-2/3"></div>
        </div>

        {/* Batas Waktu Transaksi */}
        <div className="h-7 bg-zinc-800/50 rounded-lg w-full mt-2"></div>
      </div>

      {/* Bagian Tengah: List Pilihan Metode Pembayaran Semu */}
      <div className="flex-1 my-6 space-y-3 justify-center flex flex-col">
        <div className="text-[10px] text-[#A3A19E] uppercase tracking-widest font-semibold mb-1 px-1">
          Mengamankan Jalur Transaksi...
        </div>
        
        {/* Item List 1 */}
        <div className="h-16 bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0"></div>
            <div className="space-y-2 w-full">
              <div className="h-3 bg-zinc-700 rounded w-1/4"></div>
              <div className="h-2 bg-zinc-800 rounded w-1/2"></div>
            </div>
          </div>
          <div className="w-4 h-4 bg-zinc-800 rounded-full"></div>
        </div>

        {/* Item List 2 */}
        <div className="h-16 bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0"></div>
            <div className="space-y-2 w-full">
              <div className="h-3 bg-zinc-700 rounded w-1/3"></div>
              <div className="h-2 bg-zinc-800 rounded w-1/4"></div>
            </div>
          </div>
          <div className="w-4 h-4 bg-zinc-800 rounded-full"></div>
        </div>
      </div>

      {/* Bagian Bawah: Pesan Keamanan */}
      <div className="border-t border-white/5 pt-4 text-center space-y-2">
        <div className="h-3 bg-zinc-800 rounded w-3/4 mx-auto"></div>
        <div className="h-2 bg-zinc-900 rounded w-1/2 mx-auto"></div>
      </div>

    </div>
  );
}