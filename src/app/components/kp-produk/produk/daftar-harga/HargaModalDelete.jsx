'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Trash, Loader2 } from 'lucide-react'

const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function HargaModalDelete({ isOpen, hargaItem, isDeleting, onConfirm, onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !hargaItem || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={BACKDROP_STYLE}>
      <div className="absolute inset-0" onClick={!isDeleting ? onClose : undefined} />

      <div className="relative bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex flex-col items-center pt-10 pb-7 px-6">
          
          <div className="text-[#a47352] mb-4">
            <Trash size={40} strokeWidth={1.8} />
          </div>

          <p className="text-[#a47352] text-[15px] font-semibold text-center leading-snug mb-7">
            Apakah Anda Yakin Ingin<br />Menghapus Daftar Harga ini
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 h-[47px] rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white font-semibold text-base transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 h-[47px] rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white font-semibold text-base transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isDeleting ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                'Ya, Hapus'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}