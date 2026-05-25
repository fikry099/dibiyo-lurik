'use client'

import React from 'react'
import { Edit3, Trash2, Loader2 } from 'lucide-react'

export default function HargaTable({ hargas, isLoading, error, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-[10px] border border-[#a47352]/30 overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#a47352] text-white font-medium">
            <tr>
              <th className="w-20 px-6 py-4 text-center">No.</th>
              <th className="px-6 py-4 text-center">Jenis Pewarna</th>
              <th className="px-6 py-4 text-center">Lebar</th>
              <th className="px-6 py-4 text-center">Motif (Spesifik)</th>
              <th className="px-6 py-4 text-center">Harga / Meter</th>
              <th className="w-32 px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#a47352]/15">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin text-[#a47352]" size={20} />
                    <span>Memuat struktur master harga...</span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 font-medium text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : hargas.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                  Belum ada aturan harga terdefinisi.
                </td>
              </tr>
            ) : (
              hargas.map((harga, index) => (
                <tr key={harga.id} className="transition-colors hover:bg-[#a47352]/5 border-b border-b-[#a47352]/10">
                  {/* Perubahan: Mengganti py-2 menjadi py-1 untuk merampingkan baris */}
                  <td className="px-6 py-1 text-sm font-medium text-center text-gray-500">{index + 1}.</td>
                  
                  {/* ── KOLOM JENIS PEWARNA ── */}
                  <td className="px-6 py-1 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-sm inline-block ${
                      harga.jenis_pewarna === 'alami' 
                        ? 'bg-[#5797FD]' 
                        : 'bg-[#B639FF]'
                    }`}>
                      {harga.jenis_pewarna === 'alami' ? 'Alami' : 'Sintetis'}
                    </span>
                  </td>
                  
                  {/* ── KOLOM LEBAR ── */}
                  <td className="px-6 py-1 text-center">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-sm inline-block min-w-[65px] ${
                      parseInt(harga.lebar) === 70 
                        ? 'bg-[#B639FF]' 
                        : 'bg-[#5797FD]'
                    }`}>
                      {harga.lebar} cm
                    </span>
                  </td>
                  
                  <td className="px-6 py-1 font-semibold text-xs text-center text-[#a47352]">
                    {harga.motif?.nama ? (
                      <span>{harga.motif.nama}</span>
                    ) : (
                      <span className="italic font-normal text-xs text-gray-400">Umum (semua motif)</span>
                    )}
                  </td>
                  <td className="px-6 py-1 font-bold text-xs text-center text-[#a47352]">
                    Rp {harga.harga_per_meter?.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-1 text-center">
                    <div className="flex items-center justify-center gap-2 p-0.5">
                      {/* Tombol Edit */}
                      <button
                        onClick={() => onEdit(harga)}
                        className="flex flex-col items-center justify-center gap-0.5 
                                  aspect-square w-10 sm:w-[40px] md:w-[40px]
                                  bg-[#F0A864] hover:bg-[#F0A864]/85 text-white 
                                  rounded-[8px] transition-all duration-200 shadow-sm"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[12px] md:h-[12px]" strokeWidth={2.2} />
                        <span className="text-[10px] sm:text-[10px] font-semibold leading-none">Edit</span>
                      </button>

                      {/* Tombol Hapus */}
                      <button
                        onClick={() => onDelete(harga)}
                        className="flex flex-col items-center justify-center gap-0.5 
                                  aspect-square w-10 sm:w-[40px] md:w-[40px]
                                  bg-[#FF695E] hover:bg-[#FF695E]/85 text-white 
                                  rounded-[8px] transition-all duration-200 shadow-sm"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-[12px] md:h-[12px]" strokeWidth={2.2} />
                        <span className="text-[10px] sm:text-[10px] font-semibold leading-none">Hapus</span>
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
  )
}