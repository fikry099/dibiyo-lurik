'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import { Plus, SlidersHorizontal, AlertTriangle, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useOrderStore } from '../../../../store/useOrderStore';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom'

const ProductCard = dynamic(() => import('../../../../components/cs/produk/ProductCard'), { ssr: false })
const ProdukSearchBar = dynamic(() => import('../../../../components/cs/produk/ProdukSearchBar'), { ssr: false })
const FilterPanel = dynamic(() => import('../../../../components/cs/produk/FilterPanel'), { ssr: false })
const PilihGulunganModal = dynamic(() => import('../../../../components/cs/produk/PilihGulunganModal'), { ssr: false });

export default function CsProdukPage() {
  const router = useRouter();
  const { setOrderData } = useOrderStore();
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    kategori: 'All',
    pewarna: 'All',
    status: 'All'
  })

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertProduct, setAlertProduct] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/produk')
      const result = await res.json()
      setProducts(result.data || [])
    } catch (error) { 
      console.error(error) 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getUniqueValues = (key) => {
    const values = products.map(p => {
      if (key === 'kategori') return p.kategori?.nama;
      if (key === 'pewarna') return p.jenis_pewarna;
      return null;
    });
    return [...new Set(values.filter(Boolean))];
  };

  const filterOptions = {
    Kategori: getUniqueValues('kategori'),
    Pewarna: getUniqueValues('pewarna'),
    Status: ['Ready', 'Sold']
  };

  // Helper reuseable untuk menghitung sisa gulungan valid
  const dapatkanTotalStokAktif = (produk) => {
    if (Array.isArray(produk?.gulungan)) {
      return produk.gulungan.filter(g => (g.panjang_sisa ?? 0) > 0).length
    }
    return produk?.stok ?? 0
  }

  const filteredProducts = products.filter((p) => {
    const currentStokAktif = dapatkanTotalStokAktif(p)

    const matchesSearch = p.kode_produk?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.motif?.nama?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesKategori = filters.kategori === 'All' || p.kategori?.nama === filters.kategori
    const matchesPewarna = filters.pewarna === 'All' || p.jenis_pewarna === filters.pewarna
    const matchesStatus = filters.status === 'All' || (filters.status === 'Ready' ? currentStokAktif > 0 : currentStokAktif === 0)
    
    return matchesSearch && matchesKategori && matchesPewarna && matchesStatus
  })

  const handleAddReguler = (product) => {
    setOrderData({
      customer: { nama: "", telpon: "", tgl: "", alamat: "" },
      items: [{
        id: Date.now(),
        ...product, 
        qty: 1,
        panjang: "",
        harga_per_meter: product.harga || 0, 
        totalHargaItem: 0 
      }],
      paymentData: null
    });
    router.push('/dashboard/cs/order/por');
  };

  /* ================= INTERCEPTOR TOMBOL BELI ================= */
  const handleOpenBuyModal = (product) => {
    // Membaca sisa gulungan aktif secara real-time
    if (dapatkanTotalStokAktif(product) <= 0) {
      setAlertProduct(product);
      setIsAlertModalOpen(true);
      return; 
    }

    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Daftar Produk Kain</h1>

      {/* Baris Search, Filter, dan Tambah */}
      <div className="flex items-center w-full gap-3">
        <div className="flex-1">
          <ProdukSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>

        <div className="flex gap-3 shrink-0">
          <div className="relative md:w-[280px]"> 
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-start gap-2 w-full px-6 py-2.5 text-sm transition-colors bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50"
            >
              <SlidersHorizontal size={16} /> <span>Filter</span>
            </button>

            {isFilterOpen && (
              <div className="absolute top-[calc(100%+8px)] left-0 z-50 w-full bg-white border border-stone-200 rounded-2xl shadow-xl">
                <FilterPanel 
                  options={filterOptions} 
                  filters={filters} 
                  setFilters={setFilters} 
                  onClose={() => setIsFilterOpen(false)} 
                />
              </div>
            )}
          </div>

          <Link 
            href="/dashboard/cs/order/poc"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8B5E3C] text-white rounded-xl text-sm font-medium hover:bg-[#724d31] transition-all whitespace-nowrap shrink-0"
          >
            <Plus size={18} className="text-white shrink-0" /> 
            <span>Tambah Pre-Order Custom</span>
          </Link>
        </div>
      </div>

      {/* List Produk */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 bg-white border border-stone-200/80 rounded-2xl space-y-4 h-[280px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-1/4 h-5 rounded-lg bg-stone-200"></div>
                  <div className="w-1/5 h-5 rounded-lg bg-stone-200"></div>
                </div>
                <div className="w-3/4 h-6 mt-4 rounded-lg bg-stone-200"></div>
                <div className="pt-2 space-y-2">
                  <div className="w-1/2 h-4 rounded bg-stone-200"></div>
                  <div className="w-2/3 h-4 rounded bg-stone-200"></div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 mt-auto border-t border-stone-100">
                <div className="flex-1 h-9 bg-stone-200 rounded-xl"></div>
                <div className="flex-1 h-9 bg-stone-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddReguler={handleAddReguler} 
              onBuy={() => handleOpenBuyModal(p)}
            />
          ))}
        </div>
      )}

      {/* 1. Modal Pilih Gulungan Tradisional */}
      {selectedProduct && (
        <PilihGulunganModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          product={selectedProduct}
          onConfirm={() => {
            setIsModalOpen(false);
          }}
        />
      )}

      {/* 2. MODAL KUSTOM STOK HABIS MENGGUNAKAN REACT PORTAL */}
      {isAlertModalOpen && alertProduct && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#AE834E87] backdrop-blur-sm animate-in fade-in duration-200">
          
          <div className="absolute inset-0" onClick={() => setIsAlertModalOpen(false)} />

          <div className="relative z-10 w-full max-w-xs p-6 duration-200 bg-white border shadow-2xl border-stone-200 rounded-xl font-inter animate-in zoom-in-95">
            
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(false)}
              className="absolute p-1 transition-colors rounded-lg top-3 right-3 text-stone-400 hover:text-[#8B5E3C] hover:bg-stone-100 focus:outline-none"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center mt-2 space-y-2.5 text-center">
              <div className="p-4 text-red-600 bg-red-100 rounded-full">
                <AlertTriangle size={28} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-stone-800">
                Stok Kain Habis!
              </h3>
            </div>

            <div className="mt-3 text-center">
              <p className="text-xs font-medium leading-relaxed text-stone-600">
                Produk <span className="text-[#8B5E3C] font-semibold">
                  {alertProduct?.motif?.nama || alertProduct?.kode_produk || 'Kain ini'}
                </span> saat ini tidak tersedia untuk pembelian langsung. Silakan lakukan Pre-Order Reguler.
              </p>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  )
}