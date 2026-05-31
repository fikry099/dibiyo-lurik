'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import POFilter from './POFilter';
import POTable from './POTable';
import POModalDetail from './POModalDetail';

export default function ManagePOContent() {
  const searchParams = useSearchParams();
  const tipe = searchParams.get('tipe') || 'reguler';

  // State Data & UI
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // State Filter Baru untuk Sinkronisasi ke API Backend
  const [status, setStatus] = useState('');
  const [statusPembayaran, setStatusPembayaran] = useState('');

  const fetchPOData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    
    // 1. Tentukan path endpoint berdasarkan tipe dokumen
    const apiPath = tipe === 'reguler' ? '/api/pre-order-reguler' : '/api/pre-order-custom';
    
    // 2. Susun query params sesuai kebutuhan route backend
    let queryParams = [`page=1`, `limit=50`];
    if (status) queryParams.push(`status=${status}`);
    if (statusPembayaran) queryParams.push(`status_pembayaran=${statusPembayaran}`);

    const url = `${apiPath}?${queryParams.join('&')}`;

    try {
      const res = await fetch(url);
      const resJson = await res.json();
      setData(resJson.data || []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Trigger fetch ulang setiap kali tipe halaman, filter status, atau filter bayar berubah
  useEffect(() => {
    fetchPOData(true);
  }, [tipe, status, statusPembayaran]);

  // Fungsi callback pasca penghapusan sukses (Optimistic Update)
  const handleDeleteSuccess = (deletedId) => {
    setData((prevData) => prevData.filter(item => item.id !== deletedId));
    fetchPOData(false); // Refetch data terbaru di background tanpa nunggu skeleton
  };

  // Pencarian lokal berbasis nama customer
  const filteredData = Array.isArray(data) 
    ? data.filter(item => item?.nama_customer?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <>
      <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-stone-200 font-inter">
        {/* Sub-Komponen Filter */}
        <POFilter 
          search={search} 
          setSearch={setSearch} 
          tipe={tipe} 
          status={status}
          setStatus={setStatus}
          statusPembayaran={statusPembayaran}
          setStatusPembayaran={setStatusPembayaran}
        />

        {/* Sub-Komponen Tabel */}
        <POTable 
          data={filteredData} 
          loading={loading} 
          setSelectedItem={setSelectedItem} 
          onDeleteSuccess={handleDeleteSuccess}
          tipe={tipe}
        />
      </div>

      {/* Modal Detail */}
      {selectedItem && (
        <POModalDetail
          item={selectedItem}
          tipe={tipe}
          onClose={() => setSelectedItem(null)}
          onRefresh={() => fetchPOData(false)}
        />
      )}
    </>
  );
}