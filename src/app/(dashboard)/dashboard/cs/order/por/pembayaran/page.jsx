'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CornerDownLeft, ReceiptText, CalendarDays, Factory } from 'lucide-react'
import Swal from 'sweetalert2'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrderStore } from '../../../../../../store/useOrderStore'

export default function PembayaranPOR() {
  const router = useRouter()
  const { orderData, setOrderData } = useOrderStore()
  const [isAnimating, setIsAnimating] = useState(false)

  // State Lokal sesuai Gambar
  const [statusBayar, setStatusBayar] = useState(orderData.paymentData?.statusBayar || 'dp')
  const [formData, setFormData] = useState({
    nominal: orderData.paymentData?.nominal || '',
    metode: orderData.paymentData?.metode || 'cash',
    diskon: orderData.paymentData?.diskon || 0,
    tgl_selesai: orderData.paymentData?.tgl_selesai || '',
    catatan: orderData.paymentData?.catatan || '',
    status_prod: 'dalam_proses'
  })

  // Sinkronisasi Store (Autosave agar saat kembali data tidak hilang)
  useEffect(() => {
    setOrderData({
      ...orderData,
      paymentData: { ...formData, statusBayar }
    })
  }, [formData, statusBayar])

  // Kalkulasi Harga
  const subTotal = orderData.items.reduce((acc, item) => acc + (Number(item.totalHargaItem || 0)), 0);
  const total = subTotal - (subTotal * (Number(formData.diskon) / 100));

  const handleSubmit = async () => {
    Swal.fire({ 
      title: 'Memproses...', 
      allowOutsideClick: false, 
      didOpen: () => Swal.showLoading() 
    })

    // Transformasi item agar sesuai dengan kebutuhan API (memastikan data yang dikirim bersih)
    const itemsPayload = orderData.items.map(item => ({
      produk_id: item.id, 
      lebar: Number(item.lebar),
      panjang: Number(item.panjang),
      jumlah: Number(item.qty)
    }));

    const payload = {
      nama_customer: orderData.customer.nama,
      kontak_customer: orderData.customer.telpon,
      alamat_customer: orderData.customer.alamat,
      tanggal_selesai: formData.tgl_selesai,
      metode_pembayaran: formData.metode,
      status_pembayaran: statusBayar,
      total_dp: Number(formData.nominal),
      diskon: Number(formData.diskon),
      catatan: formData.catatan || '',
      items: itemsPayload 
    }

    try {
      const res = await fetch('/api/pre-order-reguler', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        Swal.close()
        setIsAnimating(true)
        
        // Reset Store
        setOrderData({ customer: { nama: "", telpon: "", tgl: "", alamat: "" }, items: [], paymentData: null })

        setTimeout(() => {
          router.push('/dashboard/cs/po/reguler')
        }, 2000)
      } else {
        const result = await res.json()
        // Tambahkan log untuk melihat pesan error dari server
        console.error("Error from server:", result); 
        Swal.fire({ icon: 'error', title: 'Gagal', text: result.error || 'Terjadi kesalahan' })
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'Terjadi kesalahan jaringan' })
    }
}

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Pre-Order Reguler</h1>
      </div>

      {/* Bagian 1: Detail Pembayaran */}
      <div className="relative p-6 bg-[#5AE3ED1C] shadow-sm rounded-lg ">
        <button 
          onClick={() => router.push("/dashboard/cs/order/por")} 
          className="absolute flex items-center gap-2 px-3 py-1 text-sm font-medium transition-all bg-[#1A335A] border border-[#1A335A] rounded-xl top-4 right-4 text-[#f7efe9] hover:bg-[#284d87]"
        >
          <CornerDownLeft size={16} /> kembali
        </button>

        <h2 className="flex items-center gap-2 mb-6 font-semibold text-stone-700">
          <ReceiptText size={20} /> Detail Pembayaran
        </h2>

        <div className="space-y-4">
          {/* Toggle DP/Lunas */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-black">Status Pembayaran</label>
            <div className="flex gap-4">
              <button 
                onClick={() => setStatusBayar('dp')} 
                className={`flex-1 py-3 font-bold rounded-xl border transition-all ${statusBayar === 'dp' ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'bg-white/50 text-stone-500 border-stone-300'}`}
              >
                DP
              </button>
              <button 
                onClick={() => setStatusBayar('lunas')} 
                className={`flex-1 py-3 font-bold rounded-xl border transition-all ${statusBayar === 'lunas' ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'bg-white/50 text-stone-500 border-stone-300'}`}
              >
                Lunas
              </button>
            </div>
          </div>

          {/* Nominal */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-black">Nominal {statusBayar === 'dp' ? 'DP' : 'Pembayaran'}</label>
            <input 
              type="number" 
              placeholder="Rp" 
              value={formData.nominal}
              className="w-full p-3 bg-[#5AE3ED1C] border rounded-lg border-[#1A335A] text-black outline-none" 
              onChange={(e) => setFormData({...formData, nominal: e.target.value})} 
            />
          </div>

          {/* Grid Metode & Diskon */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-black">Metode Pembayaran</label>
              <select 
                value={formData.metode}
                className="w-full p-3 bg-[#5AE3ED1C] border rounded-lg border-[#1A335A] text-black outline-none appearance-none"
                onChange={(e) => setFormData({...formData, metode: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-black">Diskon (optional)</label>
              <input 
                type="number" 
                placeholder="%" 
                value={formData.diskon}
                className="w-full p-3 bg-[#5AE3ED1C] border rounded-lg border-[#1A335A] text-black outline-none" 
                onChange={(e) => setFormData({...formData, diskon: e.target.value})} 
              />
            </div>
            <div className="p-4 bg-[#5AE3ED1C] rounded-xl text-stone-800">
              <p className="text-[10px] font-bold mb-2 uppercase opacity-80">Total Harga</p>
              <div className="flex justify-between text-xs py-1 border-b border-[#1A335A]/20">
                <span>Sub Total</span> <span>Rp.{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-[#1A335A]/20">
                <span>Diskon</span> <span>{formData.diskon}%</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span>Total</span> <span>Rp.{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      {/* Grid Estimasi & Status */}
      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
        <div className="p-6 bg-[#5AE3ED1C] border shadow-sm rounded-2xl border-stone-200 space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-stone-700">
            <CalendarDays size={20} /> Estimasi Produk Jadi
          </h2>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black">Tanggal Estimasi Selesai</label>
            <input 
              type="date" 
              value={formData.tgl_selesai}
              className="w-full p-4 bg-[#FFD454B5] border rounded-xl border-[#1A335A] text-black outline-none" 
              onChange={(e) => setFormData({...formData, tgl_selesai: e.target.value})} 
            />
          </div>
        </div>

        <div className="p-6 bg-[#5AE3ED1C] border shadow-sm rounded-2xl border-stone-200 space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-stone-700">
            <Factory size={20} /> Status Produksi
          </h2>
          <div className="space-y-1">
            <label className="text-xs font-bold text-black">Status Produksi</label>
            <div className="w-full p-4 bg-[#A63636] border rounded-xl border-[#1A335A] text-stone-200 font-medium italic">
              Dalam Proses
            </div>
          </div>
        </div>
      </div>
      {/* Tambahkan bagian ini setelah Grid Estimasi & Status */}
<div className="mt-4 space-y-1">
  <label className="text-xs font-bold text-black">Catatan (Optional)</label>
  <textarea 
    placeholder="Tambahkan catatan untuk pesanan ini..."
    value={formData.catatan}
    className="w-full p-4 bg-[#5AE3ED1C] border rounded-xl border-[#1A335A] text-black outline-none min-h-[100px]"
    onChange={(e) => setFormData({...formData, catatan: e.target.value})}
  />
</div>
      </div>


      {/* Button Submit */}
      <button 
        onClick={handleSubmit} 
        className="w-full py-4 bg-[#F2B600] text-white rounded-xl font-bold text-lg hover:bg-[#d7a201] shadow-lg transition-all"
      >
        Submit Pre Order Reguler
      </button>

      {/* Overlay Animasi Sukses (Kertas Remas) */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center justify-center w-48 h-48 overflow-hidden bg-white rounded-lg shadow-2xl"
              initial={{ scale: 1.5, rotate: 0, borderRadius: "20%" }}
              animate={{ 
                scale: [1.5, 0.4, 0], 
                rotate: [0, 180, 720],
                x: [0, 100, 500],
                y: [0, -100, -500],
                borderRadius: ["20%", "50%", "50%"] 
              }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            >
              <div className="p-4 text-center">
                <ReceiptText size={48} className="mx-auto mb-2 text-stone-400" />
                <p className="text-sm font-bold text-stone-800">Saving Order...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}