'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, SlidersHorizontal } from 'lucide-react'

const PORegulerTable = dynamic(() => import('../../../../../components/cs/po/por/PORegulerTable'), {
  ssr: false,
})

// Komponen Skeleton Loader untuk Baris Tabel PO Reguler
function TableSkeleton() {
  return (
    <div className="w-full overflow-x-auto border rounded-sm border-stone-100 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-[#1A335A]/90 h-11 w-full flex items-center px-4 justify-between gap-4">
        <div className="w-12 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 w-32 h-4 rounded bg-stone-300/30"></div>
        <div className="flex-1 hidden h-4 rounded bg-stone-300/30 w-28 sm:block"></div>
        <div className="flex-1 h-4 rounded bg-stone-300/30 w-36"></div>
        <div className="flex-1 hidden w-24 h-4 rounded bg-stone-300/30 md:block"></div>
        <div className="flex-1 w-24 h-4 rounded bg-stone-300/30"></div>
        <div className="w-16 h-4 rounded bg-stone-300/30"></div>
      </div>
      
      {/* Rows Skeleton (5 Baris Konten) */}
      <div className="bg-white divide-y divide-stone-100">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center justify-between h-16 gap-4 px-4 py-4">
            <div className="w-8 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 w-32 h-4 rounded bg-stone-200"></div>
            <div className="flex-1 hidden h-4 rounded bg-stone-200 w-28 sm:block"></div>
            <div className="flex-1 h-4 rounded bg-stone-200 w-36"></div>
            <div className="flex-1 hidden w-24 h-4 rounded bg-stone-200 md:block"></div>
            <div className="flex-1 w-24 h-4 rounded bg-stone-200"></div>
            <div className="w-16 rounded-lg h-7 bg-stone-200 shrink-0"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PreOrderRegulerPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchData(true) // Set true agar skeleton muncul saat pertama kali load halaman
  }, [])

  // Tambahkan parameter isInitial untuk mengontrol kemunculan skeleton loader
  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true)
    try {
      const res = await fetch('/api/pre-order-reguler')
      if (!res.ok) throw new Error('Gagal mengambil data')
      const json = await res.json()
      
      if (json && Array.isArray(json.data)) {
        setData(json.data)
      } else {
        setData([])
      }
    } catch (err) {
      setData([])
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  // Fungsi Optimistic Update: Hapus data dari UI seketika, baru sync di background
  const handleConfirmReceiptSuccess = (confirmedId) => {
    // 1. Langsung hapus item dari state lokal agar hilang dari layar tanpa delay
    setData((prevData) => prevData.filter((item) => item.id !== confirmedId))
    
    // 2. Ambil data valid terbaru dari server di background (tanpa memicu skeleton)
    fetchData(false)
  }

  // Logika Filter & Search
  const filteredData = data.filter(item => {
    const matchSearch = (item.nama_customer || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'all' || item.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="w-full mx-auto space-y-4 text-black font-inter">
      {/* Judul Atas Standar Desain */}
      <div className="relative overflow-x-visible">
        <h2 className="text-lg sm:text-[24px] font-medium text-black pb-2 sm:pb-5 border-b border-gray-500 tracking-wide -mx-4 px-4 sm:-mx-6 sm:px-6">
          Pre Order Reguler
        </h2>
      </div>

      {/* Container Card Putih */}
      <div className="border border-gray-100 rounded-lg p-6 bg-white shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] space-y-5">
        
        {/* Top Bar Kontrol: List Header + Search + Filter (Sejajar Horizontal) */}
        <div className="flex flex-col justify-between gap-4 pb-4 border-b border-gray-400 sm:flex-row sm:items-center">
          <h2 className="text-sm font-bold text-black min-w-max">List Pre Order Reguler</h2>
          
          <div className="flex items-center flex-1 w-full max-w-2xl gap-3 sm:justify-end ">
            {/* Input Pencarian Nama */}
            <div className="relative flex-1 max-w-md">
              <input 
                type="text"
                placeholder="nama Pelanggan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] pl-9 pr-3 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-md text-xs font-medium outline-none placeholder-gray-400 text-stone-800"
              />
              <Search size={14} className="absolute text-black -translate-y-1/2 left-3 top-1/2" />
            </div>

            {/* Dropdown Filter Berdasarkan Status */}
            <div className="relative max-w-[160px] w-full">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-[38px] pl-9 pr-3 bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-md text-xs font-bold outline-none text-black cursor-pointer appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="dalam_proses">Dalam Proses</option>
                <option value="sedang_diproses">Sedang diproses</option>
                <option value="selesai_diproses">Selesai diproses</option>
              </select>
              <SlidersHorizontal size={14} className="absolute text-black -translate-y-1/2 pointer-events-none left-3 top-1/2" />
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <PORegulerTable 
              data={filteredData} 
              onConfirmReceipt={handleConfirmReceiptSuccess}
            />
          </div>
        )}
      </div>
    </div>
  )
}