'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X, Plus, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function DetailModalKp({ isOpen, onClose, productId, raks = [], prices = [] }) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [produk, setProduk] = useState(null)
  
  // State Input Form
  const [tempLebar, setTempLebar] = useState('110')
  const [tempPanjang, setTempPanjang] = useState('')
  const [tempRakId, setTempRakId] = useState('') // Rak baru
  const [tempHarga, setTempHarga] = useState(0)
  
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isOpen && productId) fetchDetail()
  }, [isOpen, productId])

  // Logika Auto-Fill Harga
  // Mencocokkan: jenis_pewarna, lebar, dan motif_id
  useEffect(() => {
    if (!produk || !tempLebar) return
    
    const lebarInt = parseInt(tempLebar)
    const pewarnaLower = (produk?.jenis_pewarna || '').toLowerCase()
    const motifId = produk?.motif?.id

    const matchedPrice = prices.find(p => {
      const isMatchPewarna = p.jenis_pewarna?.toLowerCase() === pewarnaLower
      const isMatchLebar = p.lebar === lebarInt
      // Harga cocok jika motif sama ATAU harga default (motif_id null)
      const isMatchMotif = (p.motif?.id === motifId || p.motif_id === null)
      
      return isMatchPewarna && isMatchLebar && isMatchMotif
    })

    setTempHarga(matchedPrice?.harga_per_meter || 0)
  }, [produk, tempLebar, prices])

  const fetchDetail = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/produk/${productId}`, { credentials: 'include' })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      setProduk(result.data)
      // Reset input setelah fetch
      setTempPanjang('')
      setTempRakId('')
    } catch (err) {
      Swal.fire({ title: 'Gagal Memuat', text: err.message, icon: 'error', confirmButtonColor: '#A47352' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSimpanGulungan = async () => {
    if (!tempPanjang || !tempRakId || tempHarga <= 0) {
      Swal.fire({ title: 'Oops', text: 'Lengkapi semua data (Lebar, Panjang, Rak) dan pastikan harga ditemukan', icon: 'warning', confirmButtonColor: '#A47352' })
      return
    }
    
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('gulungan_data', JSON.stringify([{
        lebar: parseInt(tempLebar),
        panjang_total: parseFloat(tempPanjang),
        harga_per_meter: tempHarga,
        rak_id: tempRakId // Rak yang dipilih dari dropdown
      }]))

      const res = await fetch(`/api/produk/${productId}`, { method: 'PATCH', body: formData })
      if (!res.ok) throw new Error('Gagal menyimpan gulungan')
      
      fetchDetail()
      Swal.fire({ title: 'Berhasil', icon: 'success', timer: 1500, showConfirmButton: false })
    } catch (err) {
      Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', confirmButtonColor: '#A47352' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteGulungan = async (gulunganId) => {
    const confirm = await Swal.fire({ 
        title: 'Hapus gulungan?', 
        icon: 'warning', 
        showCancelButton: true,
        confirmButtonColor: '#A47352'
    })
    if (!confirm.isConfirmed) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('deleted_gulungan_ids', JSON.stringify([gulunganId]))
      const res = await fetch(`/api/produk/${productId}`, { method: 'PATCH', body: formData })
      if (!res.ok) throw new Error('Gagal hapus')
      fetchDetail()
    } catch (err) {
      Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', confirmButtonColor: '#A47352' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9998] flex items-center justify-center bg-[#ae834e]/50 backdrop-blur-[2px] p-4 cursor-default animate-in fade-in duration-100">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white shadow-2xl rounded-[24px] w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-[22px] font-medium text-[#a47352] tracking-tight">Detail Produk</h3>
          <button onClick={onClose} className="text-[#a47352] hover:text-[#8c5f3f] transition-colors rounded-full">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20">
            <Loader2 className="animate-spin text-[#A3704C]" size={36} />
          </div>
        ) : (
          <div className="flex-1 pr-1 space-y-5 overflow-y-auto custom-scrollbar">
            <div className="bg-[#E3C2AC]/20 p-5 rounded-[14px] border border-[#A47352]/10">
              <h1 className="text-2xl font-bold text-[#A47352]">{produk?.kode_produk}</h1>
              <p className="text-[#A47352]/80 font-medium text-sm">{produk?.kategori.nama} | {produk?.motif.nama}</p>
            </div>

            {/* Form Tambah Gulungan */}
            <div className="bg-[#F5EBE1]/40 p-4 border border-[#A47352]/20 rounded-[14px] grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#A47352] tracking-wide">Lebar</label>
                <select className="w-full border border-[#A47352]/30 p-2.5 rounded-lg text-[#A47352] text-sm bg-white" value={tempLebar} onChange={(e) => setTempLebar(e.target.value)}>
                    <option value="70">70 cm</option>
                    <option value="110">110 cm</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#A47352] tracking-wide">Panjang (m)</label>
                <input type="number" className="w-full border border-[#A47352]/30 p-2.5 rounded-lg text-[#A47352] text-sm bg-white" value={tempPanjang} onChange={(e) => setTempPanjang(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#A47352] tracking-wide">Rak</label>
                <select className="w-full border border-[#A47352]/30 p-2.5 rounded-lg text-[#A47352] text-sm bg-white" value={tempRakId} onChange={(e) => setTempRakId(e.target.value)}>
                    <option value="">Pilih Rak</option>
                    {raks.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-[#A47352] tracking-wide">Harga (Auto)</label>
                <div className="w-full border border-[#A47352]/30 p-2.5 rounded-lg bg-[#E3C2AC]/30 text-[#A47352] font-semibold text-sm">
                    {tempHarga > 0 ? `Rp ${tempHarga.toLocaleString()}` : '-'}
                </div>
              </div>
            </div>

            <button 
                onClick={handleSimpanGulungan} 
                disabled={isProcessing || tempHarga === 0}
                className="w-full bg-[#A47352] text-white p-3 rounded-lg font-bold hover:bg-[#8d6245] transition-all disabled:opacity-50"
            >
                {isProcessing ? 'Menyimpan...' : 'Simpan Gulungan'}
            </button>

            {/* Tabel Gulungan */}
            <div className="overflow-hidden border border-[#A47352]/20 rounded-[14px]">
              <table className="w-full text-xs">
                <thead className="bg-[#A47352] text-white">
                  <tr>
                    {['No', 'Lebar', 'Panjang', 'Rak', 'Harga', 'Aksi'].map(h => <th key={h} className="p-3 font-semibold text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#A47352]/10 bg-white">
                  {produk?.gulungan.map((g, i) => (
                    <tr key={g.id} className="hover:bg-[#E3C2AC59]">
                      <td className="p-3 text-[#A47352]">{i + 1}</td>
                      <td className="p-3 text-[#A47352]">{g.lebar} cm</td>
                      <td className="p-3 text-[#A47352]">{g.panjang_total} m</td>
                      <td className="p-3 text-[#A47352]">{g.rak?.nama || '-'}</td>
                      <td className="p-3 text-[#A47352]">Rp {Number(g.harga_per_meter).toLocaleString()}</td>
                      <td className="p-3"><button onClick={() => handleDeleteGulungan(g.id)} className="text-red-500"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}