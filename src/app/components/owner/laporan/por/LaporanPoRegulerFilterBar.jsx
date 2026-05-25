'use client';

import React, { useRef } from 'react';
import { Calendar, FileText, Loader2 } from 'lucide-react';

export default function LaporanPoRegulerFilterBar({ 
  startDate, setStartDate, endDate, setEndDate, status, setStatus, pembayaran, setPembayaran, onExport, exportLoading 
}) {
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  return (
    <div className="p-6 bg-[#F5EBE3]/40 border border-[#E3C2AC]/50 rounded-xl shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-bold text-stone-700">Filter PO Reguler</div>

        <div className="flex flex-wrap items-center justify-end flex-1 gap-4">
          {/* Filter Status Produksi */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-[#E3C2AC] bg-[#F5EBE3]/20 focus:outline-none focus:border-[#8B5E3C] text-xs font-semibold text-stone-700 cursor-pointer"
          >
            <option value="">Semua Status Produksi</option>
            <option value="belum_diproses">Belum Diproses</option>
            <option value="dalam_proses">Dalam Proses</option>
            <option value="sedang_diproses">Sedang Diproses</option>
            <option value="selesai_diproses">Selesai Diproses</option>
          </select>

          {/* Filter Status Pembayaran */}
          <select
            value={pembayaran}
            onChange={(e) => setPembayaran(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-[#E3C2AC] bg-[#F5EBE3]/20 focus:outline-none focus:border-[#8B5E3C] text-xs font-semibold text-stone-700 cursor-pointer"
          >
            <option value="">Semua Pembayaran</option>
            <option value="dp">DP (Uang Muka)</option>
            <option value="lunas">Lunas</option>
          </select>

          {/* Input Range Tanggal */}
          <div className="flex items-center gap-2 bg-[#F5EBE3]/20 border border-[#E3C2AC] rounded-lg px-3 py-2">
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-[#E3C2AC]/20 p-1 rounded transition-colors"
              onClick={() => startDateRef.current?.showPicker()}
            >
              <Calendar className="text-stone-500 shrink-0" size={16} />
              <input
                ref={startDateRef}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-semibold bg-transparent cursor-pointer text-stone-700 focus:outline-none w-[105px] [color-scheme:light]"
              />
            </div>

            <span className="text-xs font-medium select-none text-stone-400">s/d</span>

            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:bg-[#E3C2AC]/20 p-1 rounded transition-colors"
              onClick={() => endDateRef.current?.showPicker()}
            >
              <Calendar className="text-stone-500 shrink-0" size={16} />
              <input
                ref={endDateRef}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-semibold bg-transparent cursor-pointer text-stone-700 focus:outline-none w-[105px] [color-scheme:light]"
              />
            </div>
          </div>

          {/* Button Export */}
          <button
            onClick={onExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B37C57] hover:bg-[#966341] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:bg-stone-400 shrink-0"
          >
            {exportLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileText size={16} />
            )}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}