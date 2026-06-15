// D:\dibiyo-lurik\src\app\components\produk\ModalBeliKain.jsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, ShoppingCart, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useComboStore } from "@/app/store/useComboStore"; 

export default function ModalBeliKain({
  isOpen,
  onClose,
  product,
  onConfirm,
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [animationType, setAnimationType] = useState(null); 
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [targetSlot, setTargetSlot] = useState("badan"); 

  const setSlot = useComboStore((state) => state.setSlot);
  const setActiveSlot = useComboStore((state) => state.setActiveSlot);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSelect = (id, panjangSisa) => {
    if ((panjangSisa ?? 0) <= 0) return;
    if (isCustomizing) {
      setSelectedIds([id]); 
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  // JALUR 1: MASUK KERANJANG REGULER 🏀 (Menggunakan Efek Lurik Ball Shot!)
  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      for (const id of selectedIds) {
        const response = await fetch('/api/keranjang', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gulungan_id: id, jumlah_order: 1 }),
        });
        if (!response.ok) throw new Error('Gagal menyimpan item');
      }

      window.dispatchEvent(new CustomEvent("updateCartCount", { detail: { count: selectedIds.length } }));
      window.dispatchEvent(new CustomEvent("sync-cart-bounce"));

      // Pemicu Animasi Mengempis jadi bola lalu ditembak
      setAnimationType("lurikBallShotDunk");
      
      // Jeda diatur ke 1400ms agar animasi bola basket selesai masuk target dulu baru toast muncul
      setTimeout(() => {
        if (onConfirm) onConfirm(selectedIds.length);
        setAnimationType(null);
        setSelectedIds([]);
        onClose();
        router.refresh(); 
        
        // Konfigurasi Toast Lebih Ramping & Minimalis
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Masuk keranjang!',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          background: '#1A1917',
          color: '#F9F6F0',
          iconColor: '#E5BA73',
          width: '240px', // Mengunci lebar agar tidak menutupi space animasi akhir
          customClass: {
            popup: 'text-[11px] p-2 border border-[#E5BA73]/20 rounded-xl shadow-lg',
            title: 'font-bold font-sans'
          }
        });
      }, 1400); 

    } catch (error) {
      console.error(error);
      setAnimationType(null);
    } finally {
      setIsLoading(false);
    }
  };

  // JALUR 2: MASUK LABORATORIUM CUSTOMIZER (Tetap Menggunakan Efek Crumple)
  const handleInjectToCustomizer = () => {
    if (selectedIds.length === 0) return;
    
    setIsLoading(true);
    const selectedRoll = product.gulungan.find(g => g.id === selectedIds[0]);
    
    const fabricPayload = {
      ...selectedRoll,
      id: selectedRoll.id,
      gambar_url: product.gambar_url,
      kode_produk: typeof product.kode_produk === 'object' ? product.kode_produk?.nama : product.kode_produk,
      motif: typeof product.motif === 'object' ? product.motif?.nama : product.motif
    };

    setSlot(targetSlot, fabricPayload);
    setActiveSlot(targetSlot);

    setAnimationType("crumple"); 

    setTimeout(() => {
      setAnimationType(null);
      setIsLoading(false);
      setSelectedIds([]);
      onClose();
      router.push('/customizer');
    }, 900); 
  };

  if (!mounted || !product) return null;

  // MANAGEMENT KEYFRAMES VARIANT
  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, rotate: 0, borderRadius: "16px", filter: "blur(0px)",
      boxShadow: "0px 10px 50px rgba(0,0,0,0.5)",
      transition: { type: "spring", duration: 0.5 }
    },
    crumple: {
      scale: [1, 0.7, 0.4, 0.15, 0],
      borderRadius: ["16px", "24px", "60px", "100px", "100px"],
      rotate: [0, -35, 75, -360, -720], 
      x: [0, 20, -15, -350, -680], 
      y: [0, -10, 30, -60, -180], 
      opacity: [1, 1, 0.9, 0.7, 0],
      transition: { duration: 0.9, ease: "easeInOut" }
    },
    // EFEK LURIK BALL SHOT DUNK 🏀
    lurikBallShotDunk: {
      borderRadius: ["16px", "999px", "999px", "999px", "999px"],
      scale: [1, 0.15, 0.15, 0.1, 0], 
      
      x: [0, 0, 200, 600, 650], 
      y: [0, 0, -500, -380, -380], 
      
      rotate: [0, 0, 15, 5, 0],
      opacity: [1, 0.8, 1, 1, 0],
      
      boxShadow: [
        "0px 10px 50px rgba(0,0,0,0.5)",
        "0px 0px 30px rgba(229, 186, 115, 0.8)", 
        "0px 0px 30px rgba(229, 186, 115, 0.8)",
        "0px 0px 30px rgba(229, 186, 115, 0.8)",
        "0px 0px 0px rgba(229, 186, 115, 0)"
      ],

      transition: { 
        duration: 1.3, 
        times: [0, 0.3, 0.6, 0.9, 1], 
        ease: [
          [0.6, -0.28, 0.735, 0.045], 
          [0.42, 0, 0.58, 1],         
          [0.42, 0, 0.58, 1],
          [0.25, 1, 0.5, 1]          
        ]
      }
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden">
          
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate={animationType ? animationType : "visible"}
            exit="hidden"
            className="w-full max-w-4xl text-[#F9F6F0] origin-center bg-[#1A1917] border border-[#E5BA73]/20 shadow-2xl will-change-transform rounded-2xl overflow-hidden font-sans"
          >
            <motion.div
              animate={animationType === "lurikBallShotDunk" ? { opacity: [1, 0, 0] } : { opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="will-change-opacity"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#12110F]/50">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-[#E5BA73] tracking-wide">
                    {isCustomizing ? "Kirim Kain ke Lurik Customizer Studio" : "Pilih Gulungan Kain Lurik"}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => { setIsCustomizing(!isCustomizing); setSelectedIds([]); }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-all ${
                      isCustomizing ? 'bg-[#E5BA73] text-[#12110F] border-[#E5BA73]' : 'border-white/20 text-[#A3A19E] hover:border-[#E5BA73]'
                    }`}
                  >
                    {isCustomizing ? "Mode: Padu Padan Baju" : "Beralih ke Kustomisasi Desain"}
                  </button>
                </div>
                <button onClick={onClose} className="text-[#A3A19E] transition-colors hover:text-white">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Product Info Banner */}
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between p-3 bg-[#0A1715] rounded-xl border border-[#E5BA73]/10 text-[11px]">
                  <div className="flex items-center gap-4">
                    <img 
                      src={product.gambar_url || '/placeholder-kain.jpg'} 
                      className="object-cover w-24 border rounded-lg shadow-sm h-14 shrink-0 border-white/5" 
                      alt="Kain" 
                    />
                    <div className="flex flex-col gap-0.5">
                      <div><span className="text-[#A3A19E]">Kode: </span><span className="font-bold text-[#F9F6F0]">{typeof product.kode_produk === 'object' ? product.kode_produk?.nama : product.kode_produk}</span></div>
                      <div><span className="text-[#A3A19E]">Kategori: </span><span className="font-bold text-[#E5BA73]">{typeof product.kategori === 'object' ? product.kategori?.nama : product.kategori}</span></div>
                      <div><span className="text-[#A3A19E]">Motif: </span><span className="font-semibold text-[#F9F6F0]/90">{typeof product.motif === 'object' ? product.motif?.nama : product.motif}</span></div>
                    </div>
                  </div>

                  {/* Slot Selector */}
                  {isCustomizing && (
                    <div className="flex flex-col gap-1.5 border-l border-white/10 pl-4 items-end">
                      <span className="text-[10px] text-[#E5BA73] font-bold tracking-wider">PASANG PADA SLOT BAGIAN BAJU:</span>
                      <div className="flex gap-1 bg-[#12110F] p-1 rounded-lg border border-white/5">
                        {['badan', 'lengan', 'aksen'].map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setTargetSlot(slot)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                              targetSlot === slot ? 'bg-[#E5BA73] text-[#12110F]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
                          }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* List Gulungan */}
              <div className="p-4 pt-2 space-y-3 max-h-[280px] overflow-y-auto chunk-scroll">
                {product.gulungan?.map((g) => {
                  const isSelected = selectedIds.includes(g.id);
                  const isHabis = (g.panjang_sisa ?? 0) <= 0;

                  return (
                    <div
                      key={g.id}
                      onClick={() => !animationType && toggleSelect(g.id, g.panjang_sisa)}
                      className={`flex items-center gap-4 p-2.5 border rounded-xl transition-all text-[11px]
                        ${isHabis 
                          ? "bg-white/5 border-white/5 opacity-40 cursor-not-allowed select-none" 
                          : isSelected
                            ? "bg-[#E5BA73]/10 border-[#E5BA73] cursor-pointer shadow-lg shadow-[#E5BA73]/5"
                            : "bg-[#12110F] border-white/5 hover:border-[#E5BA73]/30 cursor-pointer shadow-md"
                        }`}
                    >
                      <img src={product.gambar_url || '/placeholder-kain.jpg'} className="object-cover w-12 h-8 border rounded-md shrink-0 border-white/5" alt="mini-roll" />

                      <div className="grid flex-1 grid-cols-5 font-medium text-left text-[#F9F6F0]/80">
                        <div><p className="text-[10px] text-[#A3A19E]">No Gulungan</p><p className={`font-bold mt-0.5 ${isHabis ? "text-[#A3A19E] line-through" : "text-[#F9F6F0]"}`}>{g.nomor_gulungan || '01'}</p></div>
                        <div><p className="text-[10px] text-[#A3A19E]">Lebar</p><p className="font-bold text-[#F9F6F0] mt-0.5">{g.lebar_kain || g.lebar || '70'} cm</p></div>
                        <div><p className="text-[10px] text-[#A3A19E]">Panjang Total</p><p className="font-bold text-[#F9F6F0] mt-0.5">{g.panjang_total || '-'} m</p></div>
                        <div><p className="text-[10px] text-[#A3A19E]">Sisa Kain</p><p className={`font-bold mt-0.5 ${isHabis ? "text-red-400" : "text-[#E5BA73]"}`}>{isHabis ? "Habis" : `${g.panjang_sisa} m`}</p></div>
                        <div><p className="text-[10px] text-[#A3A19E]">Harga Per Meter</p><p className="font-bold text-[#E5BA73] mt-0.5">Rp {g.harga?.toLocaleString('id-ID') || '0'}</p></div>
                      </div>

                      <div className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors shrink-0
                        ${isHabis ? "border-white/10 bg-white/5 text-transparent" : isSelected ? "bg-[#E5BA73] border-[#E5BA73] text-[#12110F]" : "border-[#E5BA73]/40 bg-[#12110F] text-transparent"}`}
                      >
                        <Check size={12} strokeWidth={3} className={isSelected && !isHabis ? "block" : "invisible"} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-6 py-3 border-t border-white/5 bg-[#12110F]/50">
                <p className="text-[10px] text-[#A3A19E]">
                  {isCustomizing ? "*Kain terpilih akan langsung dikonfigurasi ke dalam perakitan baju." : "*Pilih satu atau beberapa gulungan kain untuk dimasukkan keranjang belanja."}
                </p>
                
                <div className="flex gap-2">
                  {isCustomizing ? (
                    <button
                      type="button"
                      onClick={handleInjectToCustomizer}
                      disabled={selectedIds.length === 0 || isLoading || animationType}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#E5BA73] to-[#bfa065] text-[#12110F] text-xs px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLoading && animationType !== "crumple" ? (
                        <div className="w-4 h-4 border-2 border-[#12110F] rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <Wand2 size={14} />
                          Terapkan & Desain Baju Sekarang
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={selectedIds.length === 0 || isLoading || animationType}
                      className="flex items-center gap-2 bg-[#E5BA73] hover:bg-[#f3cb85] text-[#12110F] text-xs px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
                    >
                      {isLoading && animationType !== "lurikBallShotDunk" ? (
                        <div className="w-4 h-4 border-2 border-[#12110F] rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          Masukkan Keranjang ({selectedIds.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}