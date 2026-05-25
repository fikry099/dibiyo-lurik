'use client';

import React from 'react';
import { Search, Calendar, FileText, Loader2 } from 'lucide-react';

export default function LaporanFilterBar({
  search,
  setSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExport,
  exportLoading,
}) {
  return (
    <div className="p-6 bg-[#F5EBE3]/40 border border-[#E3C2AC]/50 rounded-xl shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-bold text-stone-700">List Order</div>

        <div className="flex items-center flex-1 max-w-3xl gap-4">
          {/* Input Search */}
          <div className="relative flex-1">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Motif/Kategori"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E3C2AC] bg-[#F5EBE3]/20 focus:outline-none focus:border-[#8B5E3C] text-sm text-stone-700 placeholder-stone-400 font-medium"
            />
          </div>

          {/* Input Range Tanggal */}
          <div className="flex items-center gap-2 bg-[#F5EBE3]/20 border border-[#E3C2AC] rounded-lg px-3 py-1.5">
            <Calendar className="text-stone-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-medium bg-transparent cursor-pointer text-stone-700 focus:outline-none"
            />
            <span className="text-xs text-stone-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-medium bg-transparent cursor-pointer text-stone-700 focus:outline-none"
            />
          </div>

          {/* Button Export */}
          <button
            onClick={onExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B37C57] hover:bg-[#966341] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:bg-stone-400"
          >
            {exportLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FileText size={16} />
            )}
            Export
          </button>
        </div>
      </div>
    </div>
  );
}