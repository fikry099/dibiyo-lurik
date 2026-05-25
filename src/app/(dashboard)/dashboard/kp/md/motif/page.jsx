// /src/app/(dashboard)/dashboard/kepala-produksi/motif/page.jsx
import React from 'react'
// PERBAIKAN: Ubah nama variabel 'KategoriList' menjadi 'MotifList'
import MotifList from '../../../../../components/kp-produk/produk/motif/MotifList' 

export const metadata = {
  title: 'Manajemen Motif - Dibyo Lurik',
}

export default function MotifPage() {
  return (
    <div className="space-y-3">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <header className="border-b border-gray-150 pb-1">
        <h2 className="text-2xl font-bold text-[#8B5E3C]">Motif Produk</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
          Pusat Informasi Motif — Kelola Motif Produk Anda di sini.
        </p>
      </header>

      {/* Komponen Tabel & Modal */}
      <MotifList />
    </div>
  )
}