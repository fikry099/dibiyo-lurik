import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

export default function POFilter({ 
  search, 
  setSearch, 
  tipe, 
  status, 
  setStatus, 
  statusPembayaran, 
  setStatusPembayaran 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = status !== '' || statusPembayaran !== '';

  const handleReset = () => {
    setStatus('');
    setStatusPembayaran('');
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-sm font-bold text-black min-w-max">
          List Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}
        </h2>
        
        <div className="flex flex-col items-center justify-end flex-1 w-full gap-3 sm:flex-row md:w-auto">
          {/* Input Pencarian Nama */}
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Search size={14} />
            </span>
            <input 
              type="text"
              placeholder="Cari nama pelanggan..."
              className="w-full h-[38px] bg-[#5AE3ED1C] pl-9 pr-4 border border-[#1A335A]/20 rounded-md text-xs text-stone-800 font-medium outline-none placeholder-gray-400"
              value={search}
              onChange={(e) => setSearchKey(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-center gap-2 h-[38px] px-4 border rounded-md text-xs font-bold transition-all w-full sm:w-auto ${
              isOpen || hasActiveFilters 
                ? 'bg-[#1A335A] text-white border-[#1A335A]' 
                : 'border-[#1A335A]/20 text-black bg-[#5AE3ED1C] hover:bg-[#5AE3ED33]'
            }`}
          >
            <SlidersHorizontal size={12} />
            Filter
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block ml-1"></span>
            )}
          </button>
        </div>
      </div>

      {/* Dropdown Panel Filter */}
      {isOpen && (
        <div className="p-4 border border-[#1A335A]/10 bg-[#5AE3ED1C] rounded-md grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-200">
          <div>
            <label className="block text-[10px] font-bold text-black uppercase mb-1">Status Produksi</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-[36px] px-2 bg-white border border-[#1A335A]/20 rounded-md text-xs text-black font-medium outline-none cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="belum_diproses">Belum Diproses</option>
              <option value="dalam_proses">Dalam Proses</option>
              <option value="sedang_diproses">Sedang Diproses</option>
              <option value="selesai_diproses">Selesai Diproses</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-black uppercase mb-1">Status Pembayaran</label>
            <div className="flex gap-2">
              <select
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value)}
                className="w-full h-[36px] px-2 bg-white border border-[#1A335A]/20 rounded-md text-xs text-black font-medium outline-none cursor-pointer"
              >
                <option value="">Semua Pembayaran</option>
                <option value="belum_bayar">Belum Bayar</option>
                <option value="dp">DP</option>
                <option value="lunas">Lunas</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center h-[36px] px-3 text-white bg-[#A63636] rounded-md hover:bg-[#852b2b] transition-colors shadow-sm"
                  title="Reset Filter"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}