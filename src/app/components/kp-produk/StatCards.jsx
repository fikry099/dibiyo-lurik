import React from 'react'
import { Package, ShoppingBag, RefreshCw, ClipboardList } from 'lucide-react'

export default function StatCards({ stats }) {
  // Fungsi pembantu untuk menentukan ikon yang pas berdasarkan mockup dashboard
  const getIcon = (stat) => {
    // Jika dari page.jsx sudah mengirimkan komponen objek ikon, utamakan itu
    if (stat.icon) {
      const IconComponent = stat.icon
      return <IconComponent size={42} className="text-[#A47352] stroke-[1.5]" />
    }

    // Mekanisme cadangan (fallback) berdasarkan kecocokan label teks
    switch (stat.label) {
      case 'Produk Tersedia':
        return <Package size={42} className="text-[#A47352] stroke-[1.5]" />
      case 'Produk Sold':
        return <ShoppingBag size={42} className="text-[#A47352] stroke-[1.5]" />
      case 'Produk Belum di-Proses':
        return <RefreshCw size={36} className="text-[#A47352] stroke-[1.5]" />
      case 'Produk Sedang di-Proses':
        return <ClipboardList size={42} className="text-[#A47352] stroke-[1.5]" />
      default:
        return <Package size={42} className="text-[#A47352] stroke-[1.5]" />
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="flex justify-between items-start p-5 h-32 bg-[#F4EAE1]/80 border border-[#DDB892]/60 rounded-xl shadow-xs transform transition-all duration-300 ease-in-out hover:bg-[#F4EAE1] hover:-translate-y-1.5 hover:shadow-md"
        >
          {/* Sisi Kiri: Label Status & Angka Nilai Utama */}
          <div className="flex flex-col justify-between h-full">
            <p className="text-sm font-semibold text-[#A47352]/90 tracking-wide">
              {stat.label}
            </p>
            {/* mt-auto mendorong nilai angka agar selalu konsisten berada di bagian bawah */}
            <p className="text-3xl font-bold text-[#A47352] tracking-tight mt-auto">
              {stat.value}
            </p>
          </div>

          {/* Sisi Kanan: Ikon polos bersih */}
          <div className="pt-1 pl-3 transition-transform duration-300 shrink-0 hover:scale-105">
            {getIcon(stat)}
          </div>
        </div>
      ))}
    </div>
  )
}