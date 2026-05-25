'use client'

import React from 'react'
import { X } from 'lucide-react'

export default function ProdukFilter({ categories, currentFilters, setFilters, onClose }) {
  
  // Fungsi untuk update filter langsung
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? '' : value // Toggle: jika diklik lagi maka jadi kosong (reset)
    }))
  }

  // Helper untuk tombol pilihan
  const FilterButton = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all duration-200 ${
        active
          ? 'bg-[#A3704C] text-white shadow-md'
          : 'bg-[#F2EAE4] text-[#A3704C] hover:bg-[#EBDDCC]'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="absolute right-0 z-50 p-6 mt-3 space-y-6 bg-white border border-[#A3704C]/20 shadow-2xl w-80 rounded-[24px] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center">
        <h4 className="text-[16px] font-bold text-[#A3704C]">Pilih Filter</h4>
        <button onClick={onClose} className="text-[#A3704C]/60 hover:text-[#A3704C]">
          <X size={18} />
        </button>
      </div>
      
      {/* Kategori Filter */}
      <div className="space-y-3">
        <label className="text-[12px] font-bold text-[#A3704C]/60 block uppercase tracking-wide">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <FilterButton
              key={cat.id}
              active={currentFilters.kategori_id === cat.id}
              onClick={() => handleFilterChange('kategori_id', cat.id)}
            >
              {cat.nama}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Pewarna Filter */}
      <div className="space-y-3">
        <label className="text-[12px] font-bold text-[#A3704C]/60 block uppercase tracking-wide">Pewarna</label>
        <div className="flex flex-wrap gap-2">
          {['sintetis', 'alami'].map((type) => (
            <FilterButton
              key={type}
              active={currentFilters.jenis_pewarna === type}
              onClick={() => handleFilterChange('jenis_pewarna', type)}
            >
              Pewarna {type.charAt(0).toUpperCase() + type.slice(1)}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <label className="text-[12px] font-bold text-[#A3704C]/60 block uppercase tracking-wide">Status Produk</label>
        <div className="flex flex-wrap gap-2">
          {['ready', 'sold'].map((st) => (
            <FilterButton
              key={st}
              active={currentFilters.status === st}
              onClick={() => handleFilterChange('status', st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Tombol Reset (Opsional, tapi tetap berguna) */}
      <div className="pt-2">
        <button
          onClick={() => setFilters({ kategori_id: '', jenis_pewarna: '', status: '' })}
          className="w-full py-3 text-center text-sm font-bold bg-gray-100 text-[#A3704C] rounded-[12px] hover:bg-gray-200 transition-colors"
        >
          Reset Filter
        </button>
      </div>
    </div>
  )
}