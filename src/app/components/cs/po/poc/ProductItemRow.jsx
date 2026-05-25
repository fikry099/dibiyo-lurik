'use client';

import React from 'react';
import { Minus, Plus, X, Upload } from 'lucide-react';

export default function ProductItemRow({ 
  item, 
  daftarHarga, 
  updateItem, 
  removeItem, 
  handleImageChange, 
  calculateTotal,
  canRemove 
}) {
  return (
    <div className="relative border border-[#A47352] bg-[#E3C2AC59] rounded-[12px] p-4 flex flex-col md:flex-row gap-4 items-center w-full font-inter">
      
      {/* Tombol Hapus */}
      {canRemove && (
        <button 
          type="button"
          onClick={() => removeItem(item.id)} 
          className="absolute top-2 right-2 text-[#A47352] hover:text-rose-600 transition-colors"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Box Upload */}
      <label className="flex flex-col items-center justify-center h-[90px] w-[140px] border border-dashed border-[#A47352] bg-transparent rounded-[10px] cursor-pointer hover:bg-[#A47352]/10 overflow-hidden relative flex-shrink-0 transition-colors">
        {item.image ? (
          <img src={item.image} alt="Sketsa" className="object-cover w-full h-full" />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#A47352]">
            <Upload size={18} strokeWidth={2} />
            <span className="text-[9px] mt-1 text-center font-bold">Upload Photo</span>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(item.id, e)} />
      </label>

      {/* Container Input (Menggunakan flex agar lebih fleksibel) */}
      <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-5 gap-3 items-end text-[#A47352]">
        
        {/* Lebar */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Lebar Kain</label>
          <select 
            className="h-[34px] w-full px-2 bg-[#D4C5B9]/40 border border-[#A47352] rounded-[8px] font-bold text-[11px] outline-none" 
            value={item.lebar} 
            onChange={(e) => updateItem(item.id, "lebar", e.target.value)}
          >
            <option value="">Pilih</option>
            {[...new Set(daftarHarga.map((d) => d.lebar))].map((l) => (
              <option key={l} value={l}>Lebar {l} cm</option>
            ))}
          </select>
        </div>

        {/* Pewarna */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Pilih Pewarna</label>
          <select 
            className="h-[34px] w-full px-2 bg-[#D4C5B9]/40 border border-[#A47352] rounded-[8px] font-bold text-[11px] outline-none" 
            value={item.jenis_pewarna} 
            onChange={(e) => updateItem(item.id, "jenis_pewarna", e.target.value)}
          >
            <option value="">Pilih</option>
            {daftarHarga.filter((d) => d.lebar == item.lebar).map((d) => (
              <option key={d.id} value={d.jenis_pewarna}>{d.jenis_pewarna}</option>
            ))}
          </select>
        </div>

        {/* Jumlah */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Jumlah</label>
          <div className="flex items-center border border-[#A47352] bg-[#D4C5B9]/40 rounded-[8px] h-[34px] w-full overflow-hidden">
            <button type="button" onClick={() => updateItem(item.id, "qty", Math.max(1, item.qty - 1))} className="px-2 h-full flex items-center justify-center font-bold">
              <Minus size={10} />
            </button>
            <span className="flex-1 text-center font-bold text-[11px]">{item.qty}</span>
            <button type="button" onClick={() => updateItem(item.id, "qty", item.qty + 1)} className="px-2 h-full flex items-center justify-center font-bold">
              <Plus size={10} />
            </button>
          </div>
        </div>

        {/* Panjang */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold">Panjang (m)</label>
          <input 
            type="number" 
            value={item.panjang} 
            className="h-[34px] w-full px-2 bg-[#D4C5B9]/40 border border-[#A47352] rounded-[8px] font-bold text-[11px] outline-none" 
            onChange={(e) => updateItem(item.id, "panjang", e.target.value)} 
          />
        </div>

        {/* Harga */}
        <div className="flex flex-col space-y-1 justify-center md:items-center">
          <label className="text-[10px] font-bold">Harga</label>
          <span className="font-black text-[13px] pt-1">
            Rp {calculateTotal(item).toLocaleString('id-ID')}
          </span>
        </div>

      </div>
    </div>
  );
}