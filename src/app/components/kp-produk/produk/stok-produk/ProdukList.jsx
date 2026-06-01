// D:\dibiyo-lurik\src\app\components\kp-produk\produk\stok-produk\ProdukList.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, Plus, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Import Komponen Lokal
import ProdukCard from './ProdukCard'
import ProdukFilter from './ProdukFilter'
import ModalTambahProduk from './ModalTambahProduk'
import DetailModalKp from './DetailModalKp'

const ModalEditProduk = dynamic(() => import('./ModalEditProduk'), { ssr: false })

export default function ProdukList() {
  const router = useRouter()
  const [produks, setProduks] = useState([])
  const [categories, setCategories] = useState([])
  const [motifs, setMotifs] = useState([])
  const [raks, setRaks] = useState([])
  const [prices, setPrices] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    kategori_id: '',
    jenis_pewarna: '',
    status: ''
  })

  const initLoadData = async () => {
    setIsLoading(true)
    try {
      const [resProd, resKat, resMot, resRak, resHarga] = await Promise.all([
        fetch('/api/produk?limit=500', { credentials: 'include' }),
        fetch('/api/kategori?limit=100', { credentials: 'include' }),
        fetch('/api/motif?limit=100', { credentials: 'include' }),
        fetch('/api/rak?limit=100', { credentials: 'include' }),
        fetch('/api/daftar-harga', { credentials: 'include' })
      ])

      const [dProd, dKat, dMot, dRak, dHarga] = await Promise.all([
        resProd.json(), resKat.json(), resMot.json(), resRak.json(), resHarga.json()
      ])

      setProduks(dProd.data || [])
      setCategories(dKat.data?.items || dKat.data || [])
      setMotifs(dMot.data?.items || dMot.data || [])
      setRaks(dRak.data?.items || dRak.data || [])
      setPrices(dHarga.data || [])
    } catch (err) {
      console.error(err)
      Swal.fire({ title: 'Error', text: 'Gagal memuat data.', icon: 'error', confirmButtonColor: '#1A335A' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    initLoadData()
  }, [])

  const normalizeStatus = (statusStr) => {
    const s = statusStr?.toLowerCase()
    if (s === 'ready' || s === 'tersedia') return 'tersedia'
    if (s === 'sold' || s === 'habis') return 'habis'
    return s
  }

const filteredProduks = produks.filter((produk) => {
    const query = searchQuery.toLowerCase()
    const matchSearch = query === '' || 
                        produk.kode_produk?.toLowerCase().includes(query) || 
                        produk.motif?.nama?.toLowerCase().includes(query)

    const matchKategori = filters.kategori_id === '' || produk.kategori?.id === filters.kategori_id

    const matchPewarna = filters.jenis_pewarna === '' || produk.jenis_pewarna === filters.jenis_pewarna
    
    const matchStatus = filters.status === '' || normalizeStatus(produk.status) === normalizeStatus(filters.status)

    return matchSearch && matchKategori && matchPewarna && matchStatus
  })

  const hasActiveFilter = filters.kategori_id || filters.jenis_pewarna || filters.status

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        {/* Search Input Box */}
        <div className="relative flex-1 w-full">
          <Search className="absolute font-bold text-black -translate-y-1/2 left-4 top-1/2" size={20} />
          <input
            type="text"
            placeholder="nama motif/kode produk"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-[48px] rounded-[8px] border border-gray-300 bg-[#EBF5FA] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1A335A] focus:border-[#1A335A] text-sm"
          />
        </div>

        {/* Action Buttons: Filter */}
        <div className="relative w-fit">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center gap-2 w-[225px] h-[48px] rounded-[8px] border text-sm font-bold transition-colors ${
              hasActiveFilter ? 'bg-[#1A335A] text-white border-[#1A335A]' : 'border-gray-300 bg-[#EBF5FA] text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal size={18} /> Filter
          </button>

          {/* Render Dropdown Tepat Di Bawah Tombol */}
          {isFilterOpen && (
            <ProdukFilter
              categories={categories}
              currentFilters={filters}
              setFilters={setFilters}
              onClose={() => setIsFilterOpen(false)}
            />
          )}
        </div>
        
        {/* Tombol Tambah Produk */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 h-[48px] bg-[#1A335A] hover:bg-[#11223d] text-white px-10 rounded-[8px] text-sm font-semibold transition-transform active:scale-[0.98] lg:ml-auto shadow-sm"
        >
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {/* Grid Produk */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="p-5 space-y-4 overflow-hidden bg-white border shadow-xs border-stone-200/60 rounded-xl animate-pulse">
              <div className="w-full h-48 rounded-lg bg-stone-200"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-4 rounded bg-stone-200"></div>
                  <div className="h-4 rounded bg-stone-200"></div>
                  <div className="h-4 rounded bg-stone-200"></div>
                </div>
                <div className="w-3/4 h-5 rounded bg-stone-200"></div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <div className="h-12 rounded-lg w-14 bg-stone-200"></div>
                <div className="h-12 rounded-lg w-14 bg-stone-200"></div>
                <div className="h-12 rounded-lg w-14 bg-stone-200"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProduks.map((produk) => (
            <ProdukCard
              key={produk.id}
              produk={produk}
              onRefresh={initLoadData}
              onEditClick={(id) => { setSelectedProductId(id); setIsEditModalOpen(true); }}
              onDetailClick={(id) => { setSelectedProductId(id); setIsDetailModalOpen(true); }}
            />
          ))}
        </div>
      )}

      {/* Modal Tambah Produk */}
      <ModalTambahProduk
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={initLoadData}
        categories={categories}
        motifs={motifs}
        raks={raks}
        prices={prices}
      />

      {/* Modal Edit Produk */}
      {isEditModalOpen && selectedProductId && (
        <ModalEditProduk
          isOpen={isEditModalOpen}
          productId={selectedProductId}
          onClose={() => { setIsEditModalOpen(false); setSelectedProductId(null); }}
          onSuccess={initLoadData}
          categories={categories}
          motifs={motifs}
          raks={raks}
          prices={prices}
        />
      )}

      {/* Modal Detail Produk */}
      <DetailModalKp
        isOpen={isDetailModalOpen}
        productId={selectedProductId}
        onClose={() => { setIsDetailModalOpen(false); setSelectedProductId(null); }}
        raks={raks}
        prices={prices}
      />
    </div>
  )
}