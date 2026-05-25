'use client';

import React, { useEffect, useState } from 'react';
import { Search, Calendar } from 'lucide-react';
import dynamic from "next/dynamic";
const OrderTable = dynamic(() => import('../../../../../components/cs/rp/order/OrderTable'), { ssr: false });

export default function RiwayatOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders'); 
      const result = await res.json();
      if (res.ok) setOrders(result.data);
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter sederhana untuk pencarian
  const filteredOrders = orders.filter(o => 
    o.nomor_order?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-stone-800 border-b pb-4 border-[#8B5E3C]">Order</h1>

<div className="p-6 border rounded-lg shadow-lg border-[#8B5E3C] space-y-4">
    
      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Cari Id Pesanan..."
            className="w-full p-3 pl-10 border rounded-lg bg-stone-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 bg-white border rounded-lg border-stone-200 text-stone-600">
          <Calendar size={18} /> Pilih Tanggal
        </button>
      </div>

      {loading ? (
        <div className="py-10 text-center">Memuat data...</div>
      ) : (
        <OrderTable orders={filteredOrders} />
      )}
    </div>
</div>
  );
}