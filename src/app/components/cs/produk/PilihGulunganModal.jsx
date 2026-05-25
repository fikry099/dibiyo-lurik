"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ShoppingCart, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';

export default function PilihGulunganModal({
  isOpen,
  onClose,
  product,
  onConfirm,
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCrumpling, setIsCrumpling] = useState(false); 

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSelect = (id, panjangSisa) => {
    // JIKA STOK HABIS / KOSONG: Jangan izinkan untuk dipilih
    if ((panjangSisa ?? 0) <= 0) return;

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      for (const id of selectedIds) {
        const response = await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gulungan_id: id,
            jumlah_order: 1, 
          }),
        });
        if (!response.ok) throw new Error('Gagal menyimpan item');
      }

      const updateEvent = new CustomEvent("updateCartCount", {
        detail: { count: selectedIds.length }
      });
      window.dispatchEvent(updateEvent);

      setIsCrumpling(true);
      
      setTimeout(() => {
        if (onConfirm) onConfirm(selectedIds.length);
        setIsCrumpling(false);
        setSelectedIds([]);
        onClose();
        
        router.refresh(); 
        
        setTimeout(() => {
          router.push('/dashboard/cs/keranjang');
        }, 50);
        
      }, 850);

    } catch (error) {
      console.error("Gagal masuk keranjang:", error);
      alert("Terjadi kesalahan saat menambah ke keranjang.");
      setIsCrumpling(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen || !mounted) return null;

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      borderRadius: "16px",
      x: 0,
      y: 0,
      rotate: 0,
      filter: "blur(0px)",
      transition: { type: "spring", duration: 0.5 }
    },
    crumpleAndFly: {
      scale: [1, 0.6, 0.15, 0],
      borderRadius: ["16px", "40px", "100px", "100px"],
      filter: ["blur(0px)", "blur(1px)", "blur(2px)", "blur(4px)"],
      rotate: [0, 45, -180, -360],
      x: [0, 50, -300, -600],
      y: [0, -100, 200, 400],
      opacity: [1, 0.9, 0.8, 0],
      transition: {
        duration: 0.85,
        ease: [0.25, 1, 0.5, 1]
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#AE834E50] backdrop-blur-sm">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate={isCrumpling ? "crumpleAndFly" : "visible"}
          exit="hidden"
          className="w-full max-w-2xl overflow-hidden origin-center bg-white shadow-2xl will-change-transform"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold text-stone-800">Pilih Gulungan</h3>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
              <X size={20} />
            </button>
          </div>

          {/* Product Info */}
          <div className="px-4 py-2 pb-0">
            <div className="flex items-start gap-4 p-2 bg-[#E3C2AC59] rounded-2xl">
              <img src={product.gambar_url || '/placeholder-kain.jpg'} className="object-cover rounded-lg w-38 h-28 shrink-0" alt={product.kode_produk} />
              <div className="flex flex-col min-w-0 gap-1">
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Kode Produksi</p>
                  <p className="text-sm font-semibold text-[#8B5E3C] truncate">{product.kode_produk}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-wider">Kategori</p>
                  <p className="text-sm font-semibold truncate text-stone-700">{product.kategori?.nama}</p>
                </div>
              </div>
            </div>
          </div>

          {/* List Gulungan */}
          <div className="p-4 space-y-3 max-h-[280px] overflow-y-auto">
            {product.gulungan?.map((g) => {
              const isSelected = selectedIds.includes(g.id);
              const isHabis = (g.panjang_sisa ?? 0) <= 0;

              return (
                <div
                  key={g.id}
                  onClick={() => !isCrumpling && toggleSelect(g.id, g.panjang_sisa)}
                  className={`flex items-center gap-4 p-2 border rounded-xl transition-all 
                    ${isHabis 
                      ? "bg-stone-100 border-stone-200 opacity-60 cursor-not-allowed select-none" 
                      : isSelected 
                        ? "bg-[#8B5E3C]/5 border-[#8B5E3C] shadow-lg cursor-pointer" 
                        : "bg-[#E3C2AC59] border-stone-200 hover:border-stone-300 cursor-pointer"
                    }`}
                >
                  <div className="grid flex-1 grid-cols-5 text-xs text-stone-600">
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase">No Gulungan</p>
                      <p className={`font-medium ${isHabis ? "text-stone-400 line-through" : "text-stone-800"}`}>
                        {g.nomor_gulungan} {isHabis && <span className="text-red-500 font-bold not-line-through text-[10px] ml-1">(Habis)</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase">Sisa Kain</p>
                      <p className={`font-semibold ${isHabis ? "text-stone-400" : "text-stone-700"}`}>
                        {isHabis ? "0 m" : `${g.panjang_sisa} m`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase">Harga/m</p>
                      <p className={`font-medium ${isHabis ? "text-stone-400" : "text-[#8B5E3C]"}`}>
                        Rp{g.harga?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox / Status Circle */}
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors 
                    ${isHabis 
                      ? "border-stone-300 bg-stone-200 text-stone-400" 
                      : isSelected 
                        ? "bg-[#8B5E3C] border-[#8B5E3C]" 
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isHabis ? (
                      <Ban size={12} />
                    ) : (
                      isSelected && <Check size={14} className="text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t">
            <button
              onClick={handleAddToCart}
              disabled={selectedIds.length === 0 || isLoading || isCrumpling}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#8B5E3C] text-white rounded-xl font-semibold hover:bg-[#724d31] disabled:opacity-50 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Masuk Keranjang ({selectedIds.length})
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}