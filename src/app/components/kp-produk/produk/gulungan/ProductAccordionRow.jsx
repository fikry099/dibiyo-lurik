'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from 'lucide-react'
import Swal from 'sweetalert2'
import ModalEditGulungan from './ModalEditGulungan'

export default function ProductAccordionRow({ product, onTambahGulunganKlik, onRefresh }) {
  // Amankan logging untuk meninjau struktur objek data
  useEffect(() => {
    console.log("Product object di row:", product);
    if (product.items && product.items.length > 0) {
      console.log("Contoh item pertama:", product.items[0]);
    }
  }, [product]);
  
  const [isOpen, setIsOpen] = useState(false)
  
  // State untuk kontrol visibilitas Modal Edit Gulungan
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGulungan, setSelectedGulungan] = useState(null)

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0)
  }

  // Handler Hapus Gulungan Tunggal — Disinkronkan dengan proteksi & credentials API Backend
  const handleHapusGulungan = async (gulunganId, nomorUrut) => {
    try {
      const result = await Swal.fire({
        title: 'Apakah Anda yakin? ⚠️',
        text: `Gulungan ke-${nomorUrut} dari produk ${product.kode_produk} akan dihapus secara permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#A3704C',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
      })

      if (result.isConfirmed) {
        // Menyertakan credentials: 'include' agar session login terbaca oleh middleware backend
        const res = await fetch(`/api/gulungan/${gulunganId}`, {
          method: 'DELETE',
          credentials: 'include'
        })
        const json = await res.json()

        if (!res.ok) throw new Error(json.message || 'Gagal menghapus gulungan')

        Swal.fire({
          title: 'Terhapus! 🗑️',
          text: 'Data gulungan berhasil dibersihkan.',
          icon: 'success',
          timer: 1300,
          showConfirmButton: false
        })
        onRefresh()
      }
    } catch (err) {
      Swal.fire('Gagal Hapus ❌', err.message, 'error')
    }
  }

  const handleEditClick = (item) => {
    setSelectedGulungan(item)
    setIsEditModalOpen(true)
  }

  return (
    <>
      <div className="bg-[#F5EBE1]/40 border border-[#D4C5B9]/50 rounded-[14px] overflow-hidden shadow-sm transition-all duration-200">
        
        {/* BARIS UTAMA PRODUK ACCORDION */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#F2EAE4]/50 transition-colors select-none"
        >
          <div className="flex items-center gap-4">
            <img 
              src={product.gambar_url || '/placeholder-fabric.png'} 
              alt={product.kode_produk} 
              className="object-cover w-14 h-14 border border-[#D4C5B9]/40 rounded-[10px] shadow-sm bg-white"
            />
            <div className="flex items-center gap-2">
              <div>
                <span className="text-[11px] text-[#a47352]/70 block font-medium">Kode Produksi</span>
                <h5 className="text-sm font-bold text-[#5C4033] uppercase tracking-wide">{product.kode_produk}</h5>
              </div>
              <div className="text-[#a47352] opacity-80 mt-3.5 transition-transform duration-200">
                {isOpen ? <ChevronUp size={16} strokeWidth={2.5} /> : <ChevronDown size={16} strokeWidth={2.5} />}
              </div>
            </div>
          </div>

          {/* Tombol Tambah diletakkan di dalam Accordion Header sesuai visual gambar */}
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onTambahGulunganKlik}
              className="flex items-center gap-1.5 bg-[#A3704C] hover:bg-[#8c5f3f] text-white px-4 py-2 rounded-[8px] text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Tambah Gulungan</span>
            </button>
          </div>
        </div>

        {/* DROPDOWN TABEL GULUNGAN KAIN ANAK */}
        {isOpen && (
          <div className="border-t border-[#D4C5B9]/40 bg-white/40 p-4 animate-in fade-in duration-200">
            <div className="overflow-hidden rounded-[10px] border border-[#D4C5B9]/40 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#A3704C] text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="w-14 p-3.5 text-center">No.</th>
                    <th className="p-3.5">Lebar</th>
                    <th className="p-3.5">Panjang Total</th>
                    <th className="p-3.5">Panjang Sisa</th>
                    <th className="p-3.5">Rak</th>
                    <th className="p-3.5">Harga</th>
                    <th className="p-3.5 text-center w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-[#5C4033] font-medium">
                  {(!product.items || product.items.length === 0) ? (
                    <tr>
                      <td colSpan="7" className="p-8 italic text-center text-[#a47352]/60 bg-gray-50/50">
                        Belum ada gulungan terdaftar untuk kain ini. Silakan klik tombol tambah gulungan kain.
                      </td>
                    </tr>
                  ) : (
                    product.items.map((item, index) => (
                      <tr key={item.id} className="transition-colors hover:bg-[#F2EAE4]/20">
                        <td className="p-3.5 font-bold text-center text-gray-400">{index + 1}.</td>
                        <td className="p-3.5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${
                            item.lebar === 110 ? 'bg-[#2b87e3]' : 'bg-[#9333ea]'
                          }`}>
                            {item.lebar} cm
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-gray-500">{item.panjang_total} Meter</td>
                        <td className="p-3.5 font-bold text-[#A3704C]">{item.panjang_sisa} Meter</td>
                        <td className="p-3.5 font-bold text-gray-600 uppercase">{item.nama_rak || '-'}</td>
                        <td className="p-3.5 font-bold text-[#5C4033]">{formatRupiah(item.harga_per_meter || item.harga)}</td>
                        
                        {/* AKSI TOMBOL EDIT & HAPUS */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditClick(item)}
                              className="flex items-center gap-1.5 bg-[#EFAA52] hover:bg-[#da943d] text-white px-3 py-1.5 rounded-[6px] text-[10px] font-bold transition-all active:scale-[0.95] shadow-sm"
                            >
                              <Edit size={12} strokeWidth={2.5} />
                              <span>Edit</span>
                            </button>
                            
                            <button
                              onClick={() => handleHapusGulungan(item.id, index + 1)}
                              className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-[6px] text-[10px] font-bold transition-all active:scale-[0.95] shadow-sm"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RENDER MODAL EDIT GULUNGAN KAIN SECARA UPSTREAM */}
      {isEditModalOpen && selectedGulungan && (
        <ModalEditGulungan
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedGulungan(null)
          }}
          onSuccess={onRefresh}
          currentProduct={product}
          currentGulungan={selectedGulungan}
        />
      )}
    </>
  )
}