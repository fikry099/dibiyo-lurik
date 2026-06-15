// D:\dibiyo-lurik\src\app\components\produk\CardProdukKatalog.jsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ShoppingBag } from "lucide-react";
import ModalBeliKain from "./ModalBeliKain";

export default function CardProdukKatalog({ product }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // SAFE GUARD: Jika product kosong dari parent, hentikan proses agar tidak crash
  if (!product) return null;

  // Menghitung total stok sisa dari seluruh gulungan yang tersedia
  const totalStokSisa = product?.gulungan?.reduce((acc, curr) => acc + (curr.panjang_sisa || 0), 0) || 0;
  
  // Ambil rentang harga termurah untuk display awal
  const daftarHarga = product?.gulungan?.map(g => g.harga).filter(Boolean) || [];
  const hargaTermurah = daftarHarga.length > 0 ? Math.min(...daftarHarga) : 0;

  // Normalisasi data teks/objek untuk menghindari string kosong atau 'undefined' di UI
  const namaKategori = typeof product?.kategori === 'object' ? product?.kategori?.nama : (product?.kategori || "Kain");
  const kodeProduk = typeof product?.kode_produk === 'object' ? product?.kode_produk?.nama : (product?.kode_produk || "-");
  const namaMotif = typeof product?.motif === 'object' ? product?.motif?.nama : (product?.motif || "Polos");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="group relative flex flex-col w-full bg-[#1A1917] border border-[#E5BA73]/10 rounded-2xl overflow-hidden shadow-xl hover:border-[#E5BA73]/30 transition-all duration-300"
      >
        {/* Badge Sisa Kain Terakumulasi */}
        <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/5 text-[10px] font-bold text-[#E5BA73] tracking-wide">
          {totalStokSisa > 0 ? `Tersedia: ${totalStokSisa} m` : "Stok Habis"}
        </div>

        {/* Area Gambar Utama dengan Hover Overlay */}
        <div className="relative aspect-square w-full bg-[#12110F] overflow-hidden">
          <img
            src={product?.gambar_url || "/placeholder-kain.jpg"}
            alt={`Lurik ${namaMotif}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1917] via-transparent to-transparent opacity-60" />
          
          {/* Quick Action Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="p-3 bg-[#E5BA73] text-[#12110F] rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
              title="Pilih Gulungan Kain"
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Konten Detail Kain */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-[#F9F6F0]">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A19E]">
                {namaKategori}
              </span>
              <span className="text-[10px] font-mono text-[#E5BA73]/70">
                {kodeProduk}
              </span>
            </div>
            
            <h4 className="text-sm font-bold tracking-wide line-clamp-1 group-hover:text-[#E5BA73] transition-colors">
              Lurik {namaMotif}
            </h4>
            
            <p className="text-[11px] text-[#A3A19E] line-clamp-2 leading-relaxed">
              {product?.deskripsi || "Kain tenun lurik tradisional premium dengan benang katun murni berkualitas tinggi."}
            </p>
          </div>

          {/* Bagian Harga & Action Utama */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] text-[#A3A19E] uppercase tracking-wider">Mulai Dari</p>
              <p className="text-xs font-black text-[#E5BA73]">
                Rp {hargaTermurah.toLocaleString("id-ID")}<span className="text-[10px] font-normal text-[#A3A19E]">/m</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#E5BA73] text-[#F9F6F0] hover:text-[#12110F] text-[10px] font-bold rounded-lg border border-white/10 hover:border-[#E5BA73] transition-all"
            >
              <Layers size={12} />
              Pilih Kain
            </button>
          </div>
        </div>
      </motion.div>

      {/* Portal Modal Pemilihan Roll */}
      <ModalBeliKain
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
}