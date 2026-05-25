'use client';

import React from 'react';
import { User, Calendar } from 'lucide-react'; // Menambah ikon Calendar
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function CustomerForm({ customer, setCustomer }) {
  return (
    <div className="bg-[#E3C2AC59] border border-[#A47352]/40 rounded-[20px] p-6 shadow-sm font-inter space-y-5">
      
      {/* CSS Global untuk DatePicker */}
      <style jsx global>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker {
          border: 1px solid #A47352 !important;
          background-color: #F5EBE1 !important;
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #E3C2AC !important;
          border-bottom: 1px solid #A47352 !important;
        }
        .react-datepicker__day--selected { background-color: #A47352 !important; }
        .react-datepicker__current-month, 
        .react-datepicker__day-name,
        .react-datepicker__day { color: #A47352 !important; }
      `}</style>

      {/* Judul Sub-bab */}
      <div className="flex items-center gap-2 text-[#A47352] font-semibold text-sm select-none">
        <User size={18} strokeWidth={2.5} className="opacity-90" />
        <h2 className="text-[#A47352]">Data Customer</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
        
        {/* Nama Customer */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-[#A47352] font-bold tracking-wide">Nama Customer</label>
          <input 
            type="text"
            placeholder="Masukkan Nama" 
            value={customer.nama} 
            className="w-full h-[38px] px-3 bg-[#F5EBE1]/40 border border-[#A47352] rounded-[10px] text-[#A47352] placeholder-[#A47352]/60 outline-none focus:border-[#A47352] transition-colors" 
            onChange={(e) => setCustomer({ ...customer, nama: e.target.value })} 
          />
        </div>

        {/* No Telpon */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-[#A47352] font-bold tracking-wide">No Telpon</label>
          <input 
            type="text"
            placeholder="Masukkan No Telpon" 
            value={customer.telpon} 
            className="w-full h-[38px] px-3 bg-[#F5EBE1]/40 border border-[#A47352] rounded-[10px] text-[#A47352] placeholder-[#A47352]/60 outline-none focus:border-[#A47352] transition-colors" 
            onChange={(e) => setCustomer({ ...customer, telpon: e.target.value })} 
          />
        </div>

        {/* Tanggal PO dengan Ikon */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-[#A47352] font-bold tracking-wide">Tanggal PO</label>
          <div className="relative w-full">
            <DatePicker
              selected={customer.tgl ? new Date(customer.tgl) : null}
              onChange={(date) => setCustomer({ ...customer, tgl: date?.toISOString().split('T')[0] })}
              dateFormat="yyyy-MM-dd"
              placeholderText="Pilih Tanggal"
              wrapperClassName="w-full"
              className="w-full h-[38px] px-3 bg-[#F5EBE1]/40 border border-[#A47352] rounded-[10px] text-[#A47352] font-bold outline-none focus:border-[#A47352] transition-colors cursor-pointer placeholder-[#A47352]/60"
            />
            <Calendar 
              size={14} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A47352] pointer-events-none" 
            />
          </div>
        </div>

        {/* Alamat */}
        <div className="col-span-1 md:col-span-3 space-y-1.5">
          <label className="text-[11px] text-[#A47352] font-bold tracking-wide">Alamat</label>
          <textarea 
            placeholder="Alamat lengkap..." 
            value={customer.alamat} 
            className="w-full h-[60px] p-3 bg-[#F5EBE1]/40 border border-[#A47352] rounded-[10px] text-[#A47352] placeholder-[#A47352]/60 outline-none focus:border-[#A47352] transition-colors resize-none" 
            onChange={(e) => setCustomer({ ...customer, alamat: e.target.value })} 
          />
        </div>
      </div>
    </div>
  );
}