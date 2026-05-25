'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2, SlidersHorizontal } from 'lucide-react'
import Swal from 'sweetalert2'
import ProductAccordionRow from '../../../../../components/kp-produk/produk/gulungan/ProductAccordionRow'
import PopupTambahGulungan from '../../../../../components/kp-produk/produk/gulungan/ModalTambahGulungan'

export default function GulunganPage() {
  const [productsData, setProductsData] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterActive, setFilterActive] = useState('all') 
  const [filterLebar, setFilterLebar] = useState('all')  
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProductCtx, setSelectedProductCtx] = useState(null)

  useEffect(() => {
    document.title = 'Manajemen Gulungan Kain - Dibyo Lurik'
  }, [])

  const fetchGroupedGulungan = async (searchStr = '', activeStatus = 'all', lebarStatus = 'all') => {
    setIsLoading(true)
    try {
      let url = `/api/gulungan?search=${encodeURIComponent(searchStr)}`
      
      if (activeStatus !== 'all') {
        url += `&is_active=${activeStatus}`
      }
      if (lebarStatus !== 'all') {
        url += `&lebar=${lebarStatus}`
      }

      const res = await fetch(url)
      const json = await res.json()
      setProductsData(json.data || [])
    } catch (err) {
      console.error(err)
      Swal.fire('Error ❌', 'Gagal memuat list gulungan kain.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupedGulungan(searchQuery, filterActive, filterLebar)
  }, [filterActive, filterLebar])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchGroupedGulungan(searchQuery, filterActive, filterLebar)
  }

  const openTambahModalForProduct = (product) => {
    const defaultRakId = product.items && product.items.length > 0 
      ? product.items[0].rak_id 
      : "";

    setSelectedProductCtx({
      id: product.id,
      kode_produk: product.kode_produk,
      motif_nama: product.motif_nama,
      gambar_url: product.gambar_url,
      rak_id: defaultRakId, 
    })
    setIsModalOpen(true)
  }

  const getFilteredProducts = () => {
    if (filterLebar === 'all') return productsData

    return productsData
      .map((prod) => {
        const keyGulungan = prod.gulungan ? 'gulungan' : prod.items ? 'items' : 'gulungan_kain'
        const rawList = prod[keyGulungan] || []

        const filteredGulungan = rawList.filter(
          (g) => String(g.lebar) === String(filterLebar)
        )

        return {
          ...prod,
          [keyGulungan]: filteredGulungan,
        }
      })
      .filter((prod) => {
        const keyGulungan = prod.gulungan ? 'gulungan' : prod.items ? 'items' : 'gulungan_kain'
        return prod[keyGulungan]?.length > 0
      })
  }

  const processedProducts = getFilteredProducts()

  return (
    <div className="w-full space-y-5">
      
      {/* JUDUL DAN DESKRIPSI HALAMAN SESUAIFIGMA MOCKUP */}
      <div className="space-y-1">
        <span className="text-[11px] text-[#A3704C]/70 font-medium block tracking-wide">
          Master Data &gt; Gulungan
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#8C5F3F]">
          Master Data - Gulungan
        </h1>
      </div>
      
      {/* HEADER KONTROL TOOLBAR: SEARCH BOX & FILTER DROP-DOWNS */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-1">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center flex-1 w-full gap-3">
          
          {/* Input Search Box Pill Styled */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute text-[#a47352]/60 -translate-y-1/2 left-4 top-1/2" size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F5EBE1] border border-[#D4C5B9]/50 rounded-[12px] text-xs focus:outline-none focus:border-[#A3704C] shadow-sm text-gray-700 font-medium placeholder-[#a47352]/40"
            />
          </div>
          
          {/* Filter Dropdown Ukuran Lebar */}
          <div className="relative flex items-center bg-[#F5EBE1] border border-[#D4C5B9]/50 rounded-[12px] px-4 py-2.5 shadow-sm">
            <SlidersHorizontal size={15} className="text-[#A3704C] mr-2" />
            <select
              value={filterLebar}
              onChange={(e) => setFilterLebar(e.target.value)}
              className="text-xs font-semibold text-[#A3704C] bg-transparent cursor-pointer select-none focus:outline-none pr-1"
            >
              <option value="all">Semua Lebar</option>
              <option value="110">Lebar 110 cm</option>
              <option value="70">Lebar 70 cm</option>
            </select>
          </div>

          {/* Filter Dropdown Status Ketersediaan */}
          <div className="relative flex items-center bg-[#F5EBE1] border border-[#D4C5B9]/50 rounded-[12px] px-4 py-2.5 shadow-sm">
            <SlidersHorizontal size={15} className="text-[#A3704C] mr-2" />
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="text-xs font-semibold text-[#A3704C] bg-transparent cursor-pointer select-none focus:outline-none pr-1"
            >
              <option value="all">Semua Status</option>
              <option value="true">Aktif (Tersedia)</option>
              <option value="false">Kosong (Non-Aktif)</option>
            </select>
          </div>

        </form>
      </div>

      {/* KONTEN UTAMA: LIST ACCORDION */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-36">
          <Loader2 className="animate-spin text-[#A3704C]" size={36} />
          <p className="text-xs font-semibold text-[#a47352]/60">Memuat struktur data gulungan kain...</p>
        </div>
      ) : processedProducts.length === 0 ? (
        <div className="p-16 text-xs text-center text-gray-400 bg-white border border-gray-100 shadow-sm rounded-2xl">
          Tidak ada data gulungan kain yang sesuai dengan kriteria pencarian.
        </div>
      ) : (
        <div className="space-y-3.5 pt-2">
          {processedProducts.map((prod) => (
            <ProductAccordionRow 
              key={prod.id} 
              product={prod} 
              onTambahGulunganKlik={() => openTambahModalForProduct(prod)}
              onRefresh={() => fetchGroupedGulungan(searchQuery, filterActive, filterLebar)} 
            />
          ))}
        </div>
      )}

      {/* POPUP MODAL TAMBAH DATA GULUNGAN */}
      {isModalOpen && (
        <PopupTambahGulungan
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProductCtx(null)
          }}
          onSuccess={() => {
            setIsModalOpen(false)
            setSelectedProductCtx(null)
            fetchGroupedGulungan(searchQuery, filterActive, filterLebar)
          }}
          currentProduct={selectedProductCtx}
        />
      )}
    </div>
  )
}