'use client'
import React, { useEffect, useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import dengan ssr: false sesuai permintaan
const PreOrderTable = dynamic(() => import('../../../../../components/cs/rp/por/PreOrderTable'), { ssr: false });

export default function PreOrderRegulerPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pre-order-reguler');
      const result = await res.json();
      if (res.ok) setData(result.data);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-800 border-b pb-4 border-[#8B5E3C]">Pre-order Reguler</h1>

      <div className="p-6 border rounded-lg shadow-lg border-[#8B5E3C] bg-white space-y-4">
        {/* Filter Bar */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input
              type="text"
              placeholder="Motif/Kategori"
              className="w-full p-3 pl-10 border rounded-lg bg-stone-50"
            />
          </div>
          <button className="flex items-center gap-2 px-6 bg-white border rounded-lg border-stone-200 text-stone-600">
            <Calendar size={18} /> Pilih Tanggal
          </button>
        </div>

        {loading ? (
          <div className="py-10 text-center text-[#8B5E3C]">Memuat data...</div>
        ) : (
          <PreOrderTable data={data} />
        )}
      </div>
    </div>
  );
}