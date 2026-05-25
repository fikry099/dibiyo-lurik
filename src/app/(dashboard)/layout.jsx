import React, { Suspense } from 'react' // 1. Import Suspense dari React
import Sidebar from '../components/Sidebar' 

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#FDF9F5]">
      {/* 2. Bungkus komponen Sidebar dengan Suspense */}
      <Suspense fallback={<div className="w-64 bg-[#8B5E3C] min-h-screen animate-pulse" />}>
        <Sidebar />
      </Suspense>

      {/* Wadah Content di Sebelah Kanan */}
      <main className="flex-1 min-h-screen p-6 ml-64">
        {children}
      </main>
    </div>
  )
}