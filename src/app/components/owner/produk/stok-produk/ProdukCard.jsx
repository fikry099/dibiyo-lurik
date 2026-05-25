// /src/app/components/kp-produk/stok-produk/StokCard.jsx
'use client'

import React, { useState } from 'react'
import { Eye, Edit3, Trash2, Loader2, Trash, X, ThumbsUp, ImageOff } from 'lucide-react'
import Swal from 'sweetalert2'

const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function StokCard({ produk, onRefresh, onEditClick, onDetailClick }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageError, setImageError] = useState(false)

  const kodeProduk   = produk?.kode_produk   || '-'
  const kategoriNama = produk?.kategori?.nama || '-'
  const motifNama    = produk?.motif?.nama    || '-'
  const rakNama      = produk?.rak?.nama      || '-'
  const jenisPewarna = produk?.jenis_pewarna  || '-'
  const stok         = produk?.stok ?? 0
  const terjual      = produk?.terjual ?? 0
  const gambarUrl    = produk?.gambar_url
  const status       = (produk?.status || 'ready').toLowerCase()

  const statusStyle = {
    ready: { bg: '#76cbf9', label: 'Ready' },
    sold:  { bg: '#ff695e', label: 'Sold' },
    habis: { bg: '#ff695e', label: 'Sold' },
  }[status] || { bg: '#a47352', label: status.charAt(0).toUpperCase() + status.slice(1) }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/produk/${produk.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Gagal menghapus produk')

      setIsDeleteModalOpen(false)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        if (onRefresh) onRefresh()
      }, 1500)
    } catch (err) {
      setIsDeleteModalOpen(false)
      Swal.fire({
        title: 'Gagal Hapus',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#a47352'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-[10px] shadow-[1px_4px_8px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">

        <div className="p-3 pb-0 sm:p-4">
          <div className="w-full aspect-[16/7] rounded-[10px] overflow-hidden bg-[#e3c2ac]/30 flex items-center justify-center">
            {gambarUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={gambarUrl}
                alt={motifNama}
                className="object-cover w-full h-full"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageOff size={36} className="text-[#a47352]/40" />
            )}
          </div>
        </div>

        <div className="flex-1 px-3 pt-4 pb-3 sm:px-4">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-x-3 gap-y-3">
            <InfoBlock label="Kode Produksi" value={kodeProduk} />
            <InfoBlock label="Jenis Pewarna" value={jenisPewarna} />
            <InfoBlock label="Rak" value={rakNama} className="min-w-[55px]" />

            <InfoBlock label="Kategori" value={kategoriNama} />
            <InfoBlock label="Stok" value={`${stok} gulungan`} />
            <div />

            <InfoBlock label="Motif" value={motifNama} />
            <InfoBlock label="Jumlah Terjual" value={`${terjual} gulungan`} />
            <div />
          </div>
        </div>

        {/* Footer: Status + Bigger Action Buttons */}
        <div className="flex flex-wrap items-end justify-between gap-2 px-3 pt-2 pb-4 sm:px-4">
          <span
            className="px-5 py-1.5 rounded-full text-white text-sm font-medium min-w-[100px] text-center shadow-sm"
            style={{ backgroundColor: statusStyle.bg }}
          >
            {statusStyle.label}
          </span>

          <div className="flex items-center gap-2">
            <ActionButton
              color="#4cd0b1"
              icon={<Eye size={18} strokeWidth={2.2} />}
              label="Detail"
              onClick={() => onDetailClick && onDetailClick(produk.id)}
            />
            {/* <ActionButton
              color="#f0a864"
              icon={<Edit3 size={18} strokeWidth={2.2} />}
              label="Edit"
              onClick={() => onEditClick && onEditClick(produk.id)}
            />
            <ActionButton
              color="#ff695e"
              icon={<Trash2 size={18} strokeWidth={2.2} />}
              label="Hapus"
              onClick={() => setIsDeleteModalOpen(true)}
            /> */}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full max-w-[372px] relative">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="absolute top-3.5 right-3.5 text-[#a47352] hover:text-[#8c5f3f] disabled:opacity-50"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center px-6 pt-10 pb-7">
              <Trash size={40} strokeWidth={1.8} className="text-[#a47352] mb-4" />
              <p className="text-[#a47352] text-[15px] font-semibold text-center leading-snug mb-7">
                Apakah Anda Yakin Ingin<br />Menghapus Produk ini
              </p>

              <div className="flex items-center w-full gap-3">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white font-semibold text-base transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white font-semibold text-base transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={BACKDROP_STYLE}>
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-full max-w-[372px] py-12 px-6 flex flex-col items-center">
            <ThumbsUp size={56} className="text-[#a47352] mb-5" strokeWidth={1.5} />
            <p className="text-[#a47352] text-[18px] font-medium text-center">
              Produk Berhasil Dihapus
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function InfoBlock({ label, value, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[#e3c2ac] text-[11px] sm:text-[12px] font-medium tracking-wide leading-tight mb-1">
        {label}
      </p>
      <p className="text-[#a47352] text-[13px] sm:text-[14px] font-semibold leading-tight truncate">
        {value}
      </p>
    </div>
  )
}

function ActionButton({ color, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: color }}
      className="flex flex-col items-center justify-center gap-1 w-[60px] h-[58px] rounded-[10px] text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
    >
      {icon}
      <span className="text-[11px] font-semibold leading-none">{label}</span>
    </button>
  )
}