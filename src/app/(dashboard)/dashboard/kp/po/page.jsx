'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { Trash2, EyeIcon } from 'lucide-react';
import POModalDetail from '.././../../../components/kp-produk/po/POModalDetail'; 

export default function ManagePOPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[#A47352] font-medium">Memuat halaman...</div>}>
      <ManagePOContent />
    </Suspense>
  );
}

function ManagePOContent() {
  const searchParams = useSearchParams();
  const tipe = searchParams.get('tipe') || 'reguler';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchPOData = () => {
    setLoading(true);
    fetch(`/api/po?tipe=${tipe}`)
      .then(res => res.json())
      .then(res => {
        setData(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPOData();
  }, [tipe]);

  const filteredData = Array.isArray(data) 
    ? data.filter(item => item?.nama_customer?.toLowerCase().includes(search.toLowerCase()))
    : [];

  const getStatusColor = (status) => {
    switch(status) {
      case 'belum_diproses': return 'bg-gray-400';
      case 'sedang_diproses': return 'bg-blue-400';
      case 'selesai_diproses': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="max-w-full">
      {/* Breadcrumb */}
      <div className="flex items-center mb-2 text-sm text-gray-500">
        <span>Pre-Order</span>
        <ChevronRight size={16} className="mx-2" />
        <span className="text-[#A47352] font-medium">Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}</span>
      </div>

      {/* Judul Utama */}
      <h1 className="text-2xl font-bold mb-6 text-[#A47352]">
        Pre-Order - Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}
      </h1>

      <div className="border border-[#D4C5B9] font-inter shadow-sm bg-white rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between w-full gap-4">
            <h2 className="text-lg font-semibold text-[#A47352] whitespace-nowrap">
              List Pre-Order {tipe === 'reguler' ? 'Reguler' : 'Custom'}
            </h2>
            
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute text-gray-400 left-3 top-3" size={18} />
                <input 
                  type="text"
                  placeholder="Nama Pelanggan..."
                  className="w-full pl-10 pr-4 py-2 border bg-[#E3C2AC59] border-[#E0D3C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A47352] text-[#A47352]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#E0D3C9] rounded-lg text-gray-600 hover:bg-gray-50">
                <SlidersHorizontal size={18} />
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Wrapper */}
        <div className="w-full overflow-x-auto bg-white border-t border-[#E0D3C9]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#A47352] text-white">
                <th className="w-16 p-4">No.</th>
                <th className="p-4">Id Pre-Order</th>
                <th className="p-4">Nama Pelanggan</th>
                <th className="p-4">Jumlah Pre-Order</th>
                <th className="p-4">Status Produksi</th>
                <th className="p-4">Status Pembayaran</th>
                <th className="p-4">Total Harga</th>
                <th className="w-40 p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D3C9]">
              {loading ? (
                /* ================= SKELETON TABLE ROWS ================= */
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="bg-white animate-pulse">
                    <td className="p-4">
                      <div className="w-4 h-4 rounded bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="w-24 h-4 font-mono rounded bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 rounded w-36 bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="w-16 h-4 rounded bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 rounded-full w-28 bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="w-20 h-6 rounded bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="w-24 h-4 rounded bg-stone-200"></div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <div className="rounded-lg h-9 w-14 bg-stone-200"></div>
                        <div className="rounded-lg h-9 w-14 bg-stone-200"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* ================= RENDER DATA ASLI ================= */
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#f9f5f2] transition-colors">
                    <td className="p-4 text-[#A47352]">{index + 1}.</td>
                    <td className="p-4 text-[#A47352] font-mono text-sm">
                      ID {item.id ? item.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}
                    </td>
                    <td className="p-4 text-[#A47352] font-medium">{item.nama_customer}</td>
                    <td className="p-4 text-[#A47352]">{item.jumlah_item} item</td>
                    <td className="p-4 text-[#A47352]">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(item.status)}`}>
                        {item.status ? item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1) : '-'}
                      </span>
                    </td>
                    <td className="p-4 text-[#A47352]">
                      <span className="px-3 py-1 text-xs font-semibold text-white bg-[#8B5E3C] rounded-md">
                        {item.status_pembayaran ? item.status_pembayaran.toUpperCase() : '-'}
                      </span>
                    </td>
                    <td className="p-4 text-[#A47352]">
                      Rp. {item.total_harga ? item.total_harga.toLocaleString('id-ID') : '0'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="flex flex-col items-center px-3 py-2 text-xs text-[#0b5df5] bg-[#c7ddfe] rounded-lg hover:bg-blue-100 transition-all duration-200"
                        >
                          <EyeIcon size={18} />
                          <span>Detail</span>
                        </button>

                        <button className="flex flex-col items-center px-3 py-2 text-xs text-[#EF4444] bg-[#FEE2E2] rounded-lg hover:bg-red-100 transition-all duration-200">
                          <Trash2 size={18} />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Info Data Kosong */}
          {!loading && filteredData.length === 0 && (
            <p className="p-8 font-medium text-center text-gray-400">Data Pre-Order tidak ditemukan.</p>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      {selectedItem && (
        <POModalDetail
          item={selectedItem}
          tipe={tipe}
          onClose={() => setSelectedItem(null)}
          onRefresh={fetchPOData}
        />
      )}
    </div>
  );
}