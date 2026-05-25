// /src/app/(dashboard)/dashboard/kepala-produksi/produk/rak/page.jsx
import React from 'react'
import RakList from '../../../../../components/kp-produk/produk/rak/RakList'

export const metadata = {
  title: 'Manajemen Rak - Dibyo Lurik',
}

export default function RakPage() {
  return (
    <div className="space-y-3">
      {/* Header Utama Navigasi & Deskripsi Alur Informasi */}
      <header className="border-b border-gray-150 pb-1">
        <h2 className="text-2xl font-bold text-[#8B5E3C]">Rak Produk</h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-2xl leading-relaxed">
          Pusat Informasi Rak — Kelola Rak Produk Anda di sini.
        </p>
      </header>

      {/* Komponen Tabel & Modal */}
      <RakList />
    </div>
  )
}