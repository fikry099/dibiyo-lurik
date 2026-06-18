// src/app/components/home/Catalog.jsx
"use client";

import { useState, useEffect } from "react";
import ModalDetail from "./catalog/ModalDetail";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch("/api/produk?page=1&limit=9");

        if (!res.ok) {
          throw new Error("Gagal mengambil data dari server");
        }

        const result = await res.json();
        setProducts(result.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const formatRupiah = (number) => {
    if (!number) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // --- VARIASI ANIMASI KONTEN (Selaras dengan Hero & Features) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Efek kartu muncul berurutan satu per satu
        delayChildren: 0.05,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 16 },
    },
  };

  return (
    <section
      id="produk"
      className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* --- HEADER SEKSI (Memicu Animasi Bolak-Balik) --- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={headerVariants}
        className="max-w-2xl mx-auto mb-16 space-y-3 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-[#2D2219]">
          Koleksi Eksklusif
        </h2>
        <p className="text-sm text-[#6E655C] font-light">
          Temukan keindahan wastra Nusantara yang ditenun dengan presisi tinggi
          tingkat tinggi, memadukan tradisi berabad-abad dengan estetika
          kontemporer.
        </p>
      </motion.div>

      {/* --- STATUS LOADING (SKELETON DENGAN EMIT ANIMASI PREMIUM) --- */}
      {loading && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-[#EFEBE3]/60 border border-[#2D2219]/5 rounded-2xl h-[420px] flex flex-col justify-between p-6 animate-pulse"
            >
              <div className="w-full aspect-[4/3] bg-[#2D2219]/5 rounded-xl"></div>
              <div className="w-2/3 h-4 mt-4 rounded bg-[#2D2219]/10"></div>
              <div className="w-1/2 h-3 mt-2 rounded bg-[#2D2219]/5"></div>
              <div className="w-full h-10 mt-auto rounded-lg bg-[#2D2219]/10"></div>
            </div>
          ))}
        </div>
      )}

      {/* --- STATUS ERROR --- */}
      {error && !loading && (
        <div className="py-12 text-center border border-red-500/20 bg-red-500/5 rounded-2xl">
          <p className="text-sm text-red-600">
            Gagal memuat katalog produk: {error}
          </p>
        </div>
      )}

      {/* --- KONDISI DATA KOSONG --- */}
      {products.length === 0 && !loading && !error && (
        <div className="py-12 text-center border border-[#2D2219]/5 bg-[#F5F2EB]/50 rounded-2xl">
          <p className="text-sm text-[#6E655C]">
            Belum ada produk yang tersedia saat ini.
          </p>
        </div>
      )}

      {/* --- TAMPILAN DATA PRODUK UTAMA --- */}
      {!loading && !error && products.length > 0 && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.1 }} // Mulai berjalan ketika 10% area grid terlihat
          variants={containerVariants}
          className="grid grid-cols-1 gap-8 md:grid-cols-3"
        >
          {products.map((prod) => {
            const totalStokSisa =
              prod.gulungan?.reduce(
                (acc, curr) => acc + (curr.panjang_sisa || 0),
                0,
              ) || 0;
            const daftarHarga =
              prod.gulungan
                ?.map((g) => g.harga || g.harga_per_meter)
                .filter(Boolean) || [];
            const hargaTermurah =
              daftarHarga.length > 0 ? Math.min(...daftarHarga) : 0;

            const namaKategori =
              typeof prod.kategori === "object"
                ? prod.kategori?.nama
                : prod.kategori || "Kain";
            const kodeProduk =
              typeof prod.kode_produk === "object"
                ? prod.kode_produk?.nama
                : prod.kode_produk || "-";
            const namaMotif =
              typeof prod.motif === "object"
                ? prod.motif?.nama
                : prod.motif || "Polos";
            const productTitle = `Lurik ${namaMotif}`;

            return (
              <motion.div
                key={prod.id}
                variants={cardVariants}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2, ease: "easeInOut" },
                }}
                className="bg-[#F5F2EB]/70 border border-[#2D2219]/5 rounded-2xl overflow-hidden shadow-md hover:shadow-xl group flex flex-col h-full transition-shadow duration-300"
              >
                {/* Visual Gambar Produk */}
                <div className="w-full aspect-[4/3] bg-[#EFEBE3] relative flex items-center justify-center overflow-hidden">
                  <span
                    className={`absolute top-3 left-3 text-[9px] font-bold tracking-widest px-2 py-1 rounded shadow-sm uppercase z-10 text-white ${
                      totalStokSisa > 0 ? "bg-[#D48C45]" : "bg-[#6E655C]"
                    }`}
                  >
                    {totalStokSisa > 0
                      ? `Tersedia: ${totalStokSisa} m`
                      : "Stok Habis"}
                  </span>

                  {prod.gambar_url ? (
                    <img
                      src={prod.gambar_url}
                      alt={productTitle}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#E5E1D7] to-[#D8D3C5]">
                      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#2D2219_1px,transparent_1px)] bg-[size:6px]"></div>
                      <span className="text-2xl opacity-30">🧵</span>
                      <span className="text-[10px] text-[#6E655C] mt-2 tracking-widest font-mono">
                        {kodeProduk}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detail Informasi & Tombol Aksi */}
                <div className="flex flex-col justify-between flex-1 p-5 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-[#6E655C]">
                      <span>{namaKategori}</span>
                      <span className="font-mono text-[#A67D45]">
                        {kodeProduk}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#2D2219] tracking-tight line-clamp-1 group-hover:text-[#A67D45] transition-colors">
                      {productTitle}
                    </h3>

                    <div className="flex items-center justify-between pt-0.5">
                      <p className="text-sm text-[#A67D45] font-bold">
                        {formatRupiah(hargaTermurah)}{" "}
                        <span className="text-[#6E655C]/70 text-xs font-light">
                          / meter
                        </span>
                      </p>
                      <span className="text-[10px] font-medium text-[#6E655C] bg-[#2D2219]/5 px-2.5 py-0.5 rounded-md border border-[#2D2219]/5 capitalize">
                        {prod.jenis_pewarna ? `${prod.jenis_pewarna}` : "ATBM"}
                      </span>
                    </div>
                  </div>

                  {/* Tombol Beli */}
                  <div className="mt-auto pt-4 border-t border-[#2D2219]/10">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedProduct(prod)}
                      className="w-full py-3 bg-[#9e6d3c79] hover:bg-[#C59B5F] text-white text-xs font-bold tracking-wide rounded-xl shadow-sm transition-colors duration-300 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={13} className="stroke-[2.5]" />
                      Beli
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* --- MODAL DETAIL PRODUK --- */}
      <ModalDetail
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
