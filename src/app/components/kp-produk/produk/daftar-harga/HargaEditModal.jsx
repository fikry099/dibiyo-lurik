'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Loader2, ThumbsUp } from 'lucide-react'

const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function HargaEditModal({ isOpen, onClose, onSuccess, hargaData, swal }) {
  const [hargaPerMeter, setHargaPerMeter] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen && hargaData) {
      setHargaPerMeter(hargaData.harga_per_meter || '')
      setErrorMessage('')
    }
  }, [isOpen, hargaData])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedHarga = hargaPerMeter.toString().trim()
    if (!trimmedHarga || parseFloat(trimmedHarga) < 0) {
      setErrorMessage('Harga per meter wajib diisi dengan benar')
      return
    }

    const targetId = hargaData?.id
    if (!targetId) {
      swal.fire({ 
        title: 'Error ❌', 
        text: 'ID Aturan Harga tidak valid atau tidak ditemukan.', 
        icon: 'error',
        confirmButtonColor: '#a47352'
      })
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/daftar-harga/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          harga_per_meter: parseFloat(trimmedHarga),
          lebar: hargaData?.lebar ? parseInt(hargaData.lebar) : 110
        }),
        credentials: 'include'
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal mengubah data harga')

      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
        if (onSuccess) onSuccess()
      }, 1600)

    } catch (err) {
      setErrorMessage(err.message)
      setIsSubmitting(false)
      swal.fire({
        title: 'Gagal Memperbarui',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#a47352'
      })
    }
  }

  const handleClose = () => {
    if (isSubmitting) return
    setErrorMessage('')
    onClose()
  }

  const hargaAsli = hargaData?.harga_per_meter || ''
  const adaPerubahan = parseFloat(hargaPerMeter) !== parseFloat(hargaAsli)

  if (showSuccess) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
        <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative">
          <button onClick={() => { setShowSuccess(false); onClose(); if (onSuccess) onSuccess(); }} className="absolute top-3.5 right-3.5 text-[#a47352] hover:text-[#8c5f3f]">
            <X size={18} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <ThumbsUp size={56} className="text-[#a47352] mb-5" strokeWidth={1.5} />
            <p className="text-[#a47352] text-[18px] font-medium tracking-[0.18px] text-center leading-snug">
              Harga Berhasil Diperbarui
            </p>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
      <div className="absolute inset-0" onClick={!isSubmitting ? handleClose : undefined} />
      <div className="relative z-10 bg-white rounded-[20px] shadow-[2px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h4 className="text-[#a47352] text-[22px] font-medium tracking-[-0.24px]">Edit Harga</h4>
          <button type="button" onClick={handleClose} disabled={isSubmitting} className="text-[#a47352] hover:text-[#8c5f3f]">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        <div className="border-t border-[#a47352]/40 mx-5" />
        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-5">
          <div className="p-3.5 mb-4 rounded-[10px] border border-[#a47352]/30 space-y-3" style={{ backgroundColor: 'rgba(227, 194, 172, 0.18)' }}>
            <div className="text-[11px] font-bold text-[#a47352] tracking-wide uppercase opacity-90">KOMBINASI (TIDAK BISA DI UBAH) :</div>
            <div className="grid grid-cols-3 gap-2 text-left">
              <div>
                <div className="text-[11px] text-[#a47352]/60 font-medium">Pewarna</div>
                <div className="text-[13px] font-semibold text-[#a47352]">{hargaData?.jenis_pewarna === 'alami' ? 'Alami' : 'Sintetis'}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#a47352]/60 font-medium">Lebar</div>
                <div className="text-[13px] font-semibold text-[#a47352]">{hargaData?.lebar ? `${hargaData.lebar} cm` : '-'}</div>
              </div>
              <div>
                <div className="text-[11px] text-[#a47352]/60 font-medium">Motif</div>
                <div className="text-[13px] font-semibold text-[#a47352]">{hargaData?.motif?.nama || 'Umum'}</div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[15px] font-medium text-[#a47352] tracking-[0.18px] mb-2">Harga Per Meter</label>
            <div className="relative flex items-center">
              <span className="absolute text-sm font-medium text-[#a47352]/70 left-3">Rp</span>
              <input
                type="number"
                value={hargaPerMeter}
                onChange={(e) => setHargaPerMeter(e.target.value)}
                disabled={isSubmitting}
                autoFocus
                className="w-full h-[46px] pl-9 pr-3 rounded-[10px] border border-[#a47352] text-[#a47352] text-sm focus:outline-none focus:ring-1 focus:ring-[#a47352] transition-all font-semibold disabled:opacity-60"
                style={{ backgroundColor: 'rgba(227, 194, 172, 0.35)' }}
                required
              />
            </div>
            <div className="text-[12px] text-[#a47352]/70 font-medium pl-0.5 pt-0.5">
              Harga Sekarang: Rp {hargaAsli ? parseFloat(hargaAsli).toLocaleString('id-ID') : '0'},00
            </div>
          </div>

          {errorMessage && <p className="text-xs text-red-500 mt-2 font-medium">{errorMessage}</p>}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#a47352]/20 mt-6">
            <button type="button" onClick={handleClose} disabled={isSubmitting} className="min-w-[89px] h-[33px] px-4 rounded-[10px] border border-[#a47352] text-[#a47352] hover:bg-[#a47352]/5 text-sm font-medium transition-colors">Batal</button>
            <button type="submit" disabled={isSubmitting || !hargaPerMeter || !adaPerubahan} className="min-w-[89px] h-[33px] px-4 rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
              {isSubmitting ? <><Loader2 className="animate-spin" size={14} /><span>Update...</span></> : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}