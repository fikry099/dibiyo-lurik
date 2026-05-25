import React from 'react'
import Sidebar from '../components/Sidebar' // Sesuaikan dengan lokasi file Sidebar Anda

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#FDF9F5]">
      {/* Panggil komponen Sidebar */}
      <Sidebar />

      {/* Wadah Content di Sebelah Kanan (wajib ada ml-64 agar tidak tertutup sidebar yang posisinya fixed) */}
      <main className="flex-1 min-h-screen p-6 ml-64">
        {children}
      </main>
    </div>
  )
}