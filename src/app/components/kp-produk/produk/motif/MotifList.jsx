'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Loader2, Trash, X, ThumbsUp } from 'lucide-react'
import Swal from 'sweetalert2'
import dynamic from 'next/dynamic'

// Lazy load komponen modal agar rendering awal halaman super cepat
const MotifModal = dynamic(() => import('./MotifModal'), { ssr: false })
const MotifEditModal = dynamic(() => import('./MotifEditModal'), { ssr: false })

// Style backdrop konsisten dengan Figma: cokelat semi-transparan + blur
const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export default function MotifList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedMotif, setSelectedMotif] = useState(null)
  
  const [motifs, setMotifs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State untuk kontrol Modal Konfirmasi Hapus Manual Modul Motif
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [motifToDelete, setMotifToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // State untuk Modal Success setelah hapus (menggantikan Swal success)
  const [isDeleteSuccessOpen, setIsDeleteSuccessOpen] = useState(false)

  const fetchMotif = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/motif', { credentials: 'include' })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengambil data motif')
      }

      setMotifs(result.data?.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMotif()
  }, [])

  const handleEditClick = (motif) => {
    setSelectedMotif(motif)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (id, nama) => {
    setMotifToDelete({ id, nama })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!motifToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/motif/${motifToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || 'Gagal menghapus motif')
      }

      setMotifs(current => current.filter(item => item.id !== motifToDelete.id))
      setIsDeleteModalOpen(false)
      setMotifToDelete(null)

      // Tampilkan custom success modal sesuai Figma (auto-close 1.6s)
      setIsDeleteSuccessOpen(true)
      setTimeout(() => setIsDeleteSuccessOpen(false), 1600)

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
    <div className="bg-white rounded-[10px] border border-[#a47352]/30 min-h-[500px] flex flex-col justify-between overflow-hidden relative">
      <div>
        {/* ── Header Tabel ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#a47352]/20">
          <h3 className="text-lg font-semibold text-[#a47352]">Daftar Motif Produk</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#a47352] hover:bg-[#8c5f3f] text-white px-4 py-2.5 rounded-[10px] text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>Tambah Motif</span>
          </button>
        </div>

        {/* ── Kontainer Tabel Utama ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#a47352] text-white font-medium">
              <tr>
                <th className="w-20 px-6 py-4 text-center">No.</th>
                <th className="px-6 py-4">Nama Motif</th>
                <th className="px-6 py-4 text-center">Tanggal Dibuat</th>
                <th className="w-32 px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#a47352]/15">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin text-[#a47352]" size={20} />
                      <span>Memuat data motif...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 font-medium text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : motifs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                    Belum ada data motif.
                  </td>
                </tr>
              ) : (
                motifs.map((motif, index) => (
                  <tr key={motif.id} className="transition-colors hover:bg-[#a47352]/5 border-b border-b-[#a47352]/10">
                    <td className="px-6 py-2 text-center text-gray-500">{index + 1}.</td>
                    <td className="px-6 py-2 font-semibold text-[#a47352]">{motif.nama}</td>
                    <td className="px-6 py-2 text-center text-gray-500">
                      {motif.created_at ? new Date(motif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-2">
                      <div className="flex items-center justify-center gap-2 p-1">
                        {/* Tombol Edit */}
                        <button 
                          onClick={() => handleEditClick(motif)}
                          className="flex flex-col items-center justify-center gap-0.5 
                                    aspect-square w-10 sm:w-[42px] md:w-[45px]
                                    bg-[#F0A864] hover:bg-[#F0A864]/85 text-white rounded-[8px] transition-all duration-200 shadow-sm" 
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[12px] md:h-[12px]" strokeWidth={2.2} />
                          <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Edit</span>
                        </button>
                        
                        {/* Tombol Hapus */}
                        <button 
                          onClick={() => openDeleteModal(motif.id, motif.nama)}
                          className="flex flex-col items-center justify-center gap-0.5 
                                    aspect-square w-10 sm:w-[42px] md:w-[45px]
                                    bg-[#FF695E] hover:bg-[#FF695E]/85 text-white rounded-[8px] transition-all duration-200 shadow-sm" 
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[15px] md:h-[15px]" strokeWidth={2.2} />
                          <span className="text-[10px] sm:text-[11px] font-semibold leading-none">Hapus</span>
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

      {/* Baris kosong penyeimbang estetika halaman */}
      {!isLoading && motifs.length < 4 && (
        <div className="flex-1 bg-white divide-y divide-[#a47352]/10">
          {[...Array(4 - motifs.length)].map((_, i) => (
            <div key={i} className="w-full h-[60px] border-b border-[#a47352]/5"></div>
          ))}
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS — sesuai Figma node 1310-13272 ── */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={BACKDROP_STYLE}
        >
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative overflow-hidden">
            
            {/* Tombol X */}
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setMotifToDelete(null)
              }}
              disabled={isDeleting}
              className="absolute top-3.5 right-3.5 text-[#a47352] hover:text-[#8c5f3f] transition-colors disabled:opacity-50"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Konten */}
            <div className="flex flex-col items-center pt-10 pb-7 px-6">
              {/* Ikon Trash */}
              <div className="text-[#a47352] mb-4">
                <Trash size={40} strokeWidth={1.8} />
              </div>

              {/* Teks Konfirmasi */}
              <p className="text-[#a47352] text-[15px] font-semibold text-center leading-snug mb-7">
                Apakah Anda Yakin Ingin<br />Menghapus Motif ini
              </p>

              {/* Tombol Batal & Ya, Hapus */}
              <div className="flex items-center gap-3 w-full">
                <button
                  disabled={isDeleting}
                  onClick={() => {
                    setIsDeleteModalOpen(false)
                    setMotifToDelete(null)
                  }}
                  className="flex-1 h-[47px] rounded-[10px] bg-[#a47352] hover:bg-[#8c5f3f] text-white font-semibold text-base transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
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
        </div>
      )}

      {/* ── MODAL SUCCESS setelah Hapus — pola Figma node 1310-12284 ── */}
      {isDeleteSuccessOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={BACKDROP_STYLE}
        >
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] w-[372px] relative">
            <button
              onClick={() => setIsDeleteSuccessOpen(false)}
              className="absolute top-3.5 right-3.5 text-[#a47352] hover:text-[#8c5f3f] transition-colors"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center justify-center py-12 px-6">
              <ThumbsUp size={56} className="text-[#a47352] mb-5" strokeWidth={1.5} />
              <p className="text-[#a47352] text-[18px] font-medium tracking-[0.18px] text-center">
                Motif Berhasil Dihapus
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instance Input Modal Tambah */}
      <MotifModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMotif} />

      {/* Instance Input Modal Edit */}
      <MotifEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedMotif(null)
        }}
        onSuccess={fetchMotif}
        motifData={selectedMotif}
      />
    </div>
  )
}