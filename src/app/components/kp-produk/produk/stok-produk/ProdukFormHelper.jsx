// /src/app/components/kp-produk/produk/stok-produk/ProdukFormHelper.jsx
import React from 'react'
import { Trash2 } from 'lucide-react'

export const BACKDROP_STYLE = {
  backgroundColor: 'rgba(174, 131, 78, 0.53)',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
}

export const ARROW_UP_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a47352' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M4.5 15.75l7.5-7.5 7.5 7.5'/%3E%3C/svg%3E")`
export const ARROW_DOWN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a47352' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`

export const JENIS_PEWARNA_OPTIONS = ['Sintetis', 'Alami']

export function FormField({ label, children }) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[14px] font-medium text-[#a47352]">{label}</label>
      {children}
    </div>
  )
}

export function SelectInput({ value, onChange, options, placeholder, disabled, customBg }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-[40px] px-3 pr-10 rounded-[10px] border border-[#a47352] text-[#a47352]/80 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#a47352] transition-all disabled:opacity-50 appearance-none bg-no-repeat duration-200"
      style={{
        backgroundColor: customBg || 'rgba(227, 194, 172, 0.35)',
        backgroundImage: ARROW_UP_SVG,
        backgroundPosition: 'right 12px center',
        backgroundSize: '14px'
      }}
      onClick={(e) => {
        const isUp = e.target.style.backgroundImage.includes("M4.5")
        e.target.style.backgroundImage = isUp ? ARROW_DOWN_SVG : ARROW_UP_SVG
      }}
      onBlur={(e) => {
        e.target.style.backgroundImage = ARROW_UP_SVG
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[#e3c2ac] text-[10px] leading-tight">{label}</p>
      <p className="text-[#a47352] text-[12px] font-semibold leading-tight truncate">{value}</p>
    </div>
  )
}

export function GulunganRow({ index, gulungan, rakName, onRemove, disabled }) {
  return (
    <div className="grid grid-cols-[40px_1fr_auto] gap-3 items-center px-3 py-2.5 bg-white hover:bg-[#a47352]/5 transition-colors">
      <span className="text-[#a47352] font-semibold text-sm text-center">#{index + 1}</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Info label="Lebar" value={`${gulungan.lebar} cm`} />
        <Info label="Panjang" value={`${gulungan.panjang_total} m`} />
        <Info label="Harga/m" value={`Rp ${Number(gulungan.harga_per_meter).toLocaleString('id-ID')}`} />
        <Info label="Rak" value={rakName} />
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="p-1.5 rounded-md bg-[#ff695e] hover:bg-[#ff695e]/85 text-white transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}