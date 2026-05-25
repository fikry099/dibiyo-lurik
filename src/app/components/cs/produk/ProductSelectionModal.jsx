"use client";
import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Search, SlidersHorizontal } from "lucide-react";

export default function ProductSelectionModal({ isOpen, onClose, onAddItems }) {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ motif: "", jenis_pewarna: "" });

  useEffect(() => {
    fetch("/api/produk")
      .then((res) => res.json())
      .then((res) => setProducts(res.data));
  }, []);

  const toggleSelect = (product) => {
    if (selectedProducts.find((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.kode_produk.toLowerCase().includes(search.toLowerCase());
    const matchesMotif = filters.motif ? p.motif?.nama === filters.motif : true;
    const matchesWarna = filters.jenis_pewarna ? p.jenis_pewarna === filters.jenis_pewarna : true;
    return matchesSearch && matchesMotif && matchesWarna;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-stone-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Pilih Item</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100"><X size={20} /></button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input 
              placeholder="Cari kode produk..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`p-3 rounded-xl border ${showFilter ? 'bg-[#E3C2AC]/20 border-[#A47352]' : 'bg-stone-50 border-stone-200'}`}
          >
            <SlidersHorizontal size={20} className="text-stone-600" />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="grid grid-cols-2 gap-4 p-4 mb-6 border bg-stone-50 rounded-2xl border-stone-100">
            <div>
              <label className="block mb-1 text-xs font-bold text-stone-500">MOTIF</label>
              <select className="w-full p-2 text-sm border rounded-lg" onChange={(e) => setFilters({...filters, motif: e.target.value})}>
                <option value="">Semua Motif</option>
                {[...new Set(products.map(p => p.motif?.nama))].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-xs font-bold text-stone-500">JENIS PEWARNA</label>
              <select className="w-full p-2 text-sm border rounded-lg" onChange={(e) => setFilters({...filters, jenis_pewarna: e.target.value})}>
                <option value="">Semua</option>
                <option value="Alami">Alami</option>
                <option value="Sintetis">Sintetis</option>
              </select>
            </div>
          </div>
        )}

        {/* Grid Produk */}
        <div className="grid grid-cols-2 gap-4 pr-2 overflow-y-auto md:grid-cols-3 custom-scrollbar">
          {filteredProducts.map((product) => {
            const isSelected = selectedProducts.find((p) => p.id === product.id);
            return (
              <div key={product.id} onClick={() => toggleSelect(product)} 
                className={`p-3 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? "border-[#A47352] bg-[#E3C2AC]/10" : "border-stone-100"}`}>
                <div className="relative">
                    <img src={product.gambar_url} className="object-cover w-full mb-2 h-28 rounded-xl" />
                    {isSelected && <CheckCircle2 className="absolute top-2 right-2 text-[#A47352]" fill="white" />}
                </div>
                <p className="text-xs font-bold text-stone-800">{product.kode_produk}</p>
                <p className="text-[10px] text-stone-500">{product.kategori?.nama} | {product.motif?.nama}</p>
                <div className="flex justify-between mt-2 pt-2 border-t text-[10px]">
                    <span>Stok: {product.stok}</span>
                    <span className="font-bold">{product.jenis_pewarna}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          disabled={selectedProducts.length === 0}
          onClick={() => { onAddItems(selectedProducts); onClose(); }}
          className="w-full py-4 mt-6 bg-[#8B5E3C] text-white rounded-2xl font-bold disabled:bg-stone-300"
        >
          Tambahkan {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ""} Item
        </button>
      </div>
    </div>
  );
}