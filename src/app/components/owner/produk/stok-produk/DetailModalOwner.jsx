'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'
import Swal from 'sweetalert2'

export default function DetailModal({ isOpen, onClose, productId }) {
  const [isLoading, setIsLoading] = useState(true)
  const [produk, setProduk] = useState(null)
  const [mounted, setMounted] = useState(false)

  // Memastikan portal hanya di-render di sisi client untuk menghindari error hidrasi Next.js
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && productId) fetchDetail()
  }, [isOpen, productId])

  const fetchDetail = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/produk/${productId}`, { credentials: 'include' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      setProduk(result.data)
    } catch (err) {
      Swal.fire({ title: 'Gagal Memuat', text: err.message, icon: 'error', confirmButtonColor: '#A47352' })
    } finally {
      setIsLoading(false)
    }
  }

  // Jika modal ditutup atau belum terpasang di client DOM, jangan render apapun
  if (!isOpen || !mounted) return null

  return createPortal(
    <div 
      style={{ backgroundColor: '#AE834E87' }} 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans backdrop-blur-xs animate-fadeIn"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] transition-all transform scale-100">
        
        {/* ========================== HEADER MODAL ========================== */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#A47352]">Detail Produk</h2>
          <button 
            onClick={onClose} 
            className="text-[#A47352]/60 hover:text-[#A47352] p-1 rounded-lg transition-colors"
          >
            <X size={22} className="stroke-[1.5]" />
          </button>
        </div>

        {/* ========================== BODY CONTAINER ========================== */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-[#A47352]" size={40} />
              <p className="text-sm text-[#A47352]/70 mt-2">Memuat data produk...</p>
            </div>
          ) : (
            <>
              {/* Spanduk Gambar Kain Lurik & Ringkasan Info */}
              <div className="space-y-3">
                <div className="relative w-full overflow-hidden border border-gray-200 rounded-lg h-44 bg-stone-100">
                  <img 
                    src={produk?.gambar_url || '/placeholder-fabric.png'} 
                    alt={produk?.motif?.nama || 'Produk Lurik'} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
                    <p className="font-mono text-xs tracking-wider opacity-90">{produk?.kode_produk}</p>
                    <h3 className="text-lg font-bold">{produk?.kategori?.nama || 'Seri'} - {produk?.motif?.nama || 'Motif'}</h3>
                  </div>
                </div>
              </div>

              {/* ========================== TABEL DAFTAR GULUNGAN ========================== */}
              <div className="space-y-3">
                <span className="text-[#A47352] font-semibold text-base block pl-1">
                  Daftar Gulungan
                </span>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-xs">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-[#A47352] text-white text-xs uppercase tracking-wider font-semibold">
                        <th className="w-12 p-3 text-center">No.</th>
                        <th className="p-3 text-center">Lebar</th>
                        <th className="p-3 text-center">Panjang Total</th>
                        <th className="p-3 text-center">Panjang Sisa</th>
                        <th className="p-3 text-center">Jenis Pewarna</th>
                        <th className="p-3 text-center">Rak</th>
                        <th className="p-3 text-right">Harga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[#A47352] bg-white font-medium">
                      {!produk?.gulungan || produk.gulungan.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-6 text-center text-[#A47352]/60 italic bg-gray-50/50">
                            Belum ada gulungan kain tersedia untuk produk ini.
                          </td>
                        </tr>
                      ) : (
                        produk.gulungan.map((g, i) => (
                          <tr key={g.id} className="transition-colors hover:bg-gray-50/40">
                            <td className="p-3 text-center text-[#A47352]/50">{i + 1}.</td>
                            <td className="p-3 text-center">
                              <span className="inline-block px-3 py-0.5 text-xs font-bold text-white bg-[#4D90FF] rounded-full">
                                {g.lebar} cm
                              </span>
                            </td>
                            <td className="p-3 text-center text-[#A47352]">{g.panjang_total} Meter</td>
                            <td className="p-3 text-center text-[#A47352] font-bold">{g.panjang_sisa} Meter</td>
                            <td className="p-3 text-center text-[#A47352]/85">{produk?.jenis_pewarna || 'Alami'}</td>
                            <td className="p-3 text-center font-mono font-bold text-[#A47352]">{produk?.rak?.nama || 'A'}</td>
                            <td className="p-3 text-right font-bold text-[#A47352]">
                              Rp {Number(g.harga_per_meter).toLocaleString('id-ID')},00
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>,
    document.body
  )
}