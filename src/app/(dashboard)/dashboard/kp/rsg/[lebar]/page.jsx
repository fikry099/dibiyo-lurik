'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function RekapStokPage() {
  const params = useParams();
  const lebar = params?.lebar;
  const angkaLebar = lebar?.replace('lebar', '');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk interaksi
  const [expandedRaks, setExpandedRaks] = useState({}); 
  const [limitRaks, setLimitRaks] = useState(4); 

  useEffect(() => {
    if (!angkaLebar) return;
    fetch(`/api/rekap-gulungan?lebar=${angkaLebar}`)
      .then((res) => res.json())
      .then((res) => {
        const grouped = res.data.items.reduce((acc, item) => {
          const rakNama = item.rak?.nama || 'Tanpa Rak';
          if (!acc[rakNama]) acc[rakNama] = [];
          acc[rakNama].push(item);
          return acc;
        }, {});
        setData(grouped);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [angkaLebar]);

  if (error) return <div className="p-10 text-red-500">Error: {error}</div>;

  const rakEntries = data ? Object.entries(data) : [];
  const totalKeseluruhan = data ? Object.values(data).flat().reduce((sum, item) => sum + (item.panjang_sisa || 0), 0) : 0;

  return (
    <div className="mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-2 text-sm">
        <h3 className="flex items-center text-gray-500">Rekap Stok Gulungan</h3>
        <ChevronRight className="w-4 h-4 mx-1 text-gray-500" />
        <span className="text-gray-500">Lebar {angkaLebar || '...'} cm</span>
      </div>

      {/* Judul Besar */}
      <h1 className="pb-2 mb-6 text-2xl font-bold border-b text-[#A47352]">
        Rekap Stok - Lebar {angkaLebar || '...'} cm
      </h1>

      {loading ? (
        /* ========================================================= */
        /* TEMPLATE SKELETON LOADING MASTER                          */
        /* ========================================================= */
        
        <div className="space-y-6 animate-pulse">
          {/* Skeleton Box Total Keseluruhan */}
          <div className="bg-[#E3C2AC59] p-4 rounded-lg shadow-sm border border-[#E0D3C9]">
            <div className="w-1/3 h-6 rounded bg-stone-300/60"></div>
          </div>

          {/* Skeleton List Blok Rak (Looping 2 container rak tiruan) */}
          {[...Array(2)].map((_, rIdx) => (
            <div key={rIdx} className="mb-5">
              {/* Kepala Rak */}
              <div className="bg-[#E3C2AC59] p-4 rounded-t-lg border-b border-[#D8C4B6]">
                <div className="w-24 h-5 rounded bg-stone-300/60"></div>
              </div>
              {/* Badan Tabel Rak */}
              <div className="bg-[#E3C2AC59] border-x border-b border-[#E0D3C9] rounded-b-lg p-4 space-y-4">
                <div className="w-full h-10 bg-[#A47352]/30 rounded"></div> {/* Kepala kolom semu */}
                <div className="space-y-3">
                  {[...Array(2)].map((_, rowIdx) => (
                    <div key={rowIdx} className="flex items-center gap-4 p-3 border rounded-lg bg-white/50 border-stone-200/40">
                      <div className="w-6 h-4 rounded bg-stone-300/60"></div>
                      <div className="w-12 h-12 rounded bg-stone-300/60"></div>
                      <div className="grid flex-1 grid-cols-5 gap-3">
                        <div className="h-4 rounded bg-stone-300/60"></div>
                        <div className="h-4 rounded bg-stone-300/60"></div>
                        <div className="h-4 rounded bg-stone-300/60"></div>
                        <div className="h-4 rounded bg-stone-300/60"></div>
                        <div className="h-4 rounded bg-stone-300/60"></div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Total bawah tiruan */}
                <div className="flex justify-end pr-4">
                  <div className="h-4 rounded w-28 bg-stone-300/60"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ========================================================= */
        /* RENDER DATA AKTIF SETELAH API SELESAI                     */
        /* ========================================================= */
        <>
          {/* Box Total Keseluruhan */}
          <div className="bg-[#E3C2AC59] p-4 rounded-lg mb-6 shadow-sm border border-[#E0D3C9]">
            <p className="text-lg font-semibold text-[#A47352]">Total Keseluruhan : {totalKeseluruhan} meter</p>
          </div>

          <div className="rak-container">
            {rakEntries.slice(0, limitRaks).map(([rakNama, items]) => {
              const isExpanded = expandedRaks[rakNama];
              const displayItems = isExpanded ? items : [items[0]];
              const totalPerRak = items.reduce((sum, item) => sum + (item.panjang_sisa || 0), 0);

              return (
                <div key={rakNama} className="mb-5">
                  <div className="bg-[#E3C2AC59] p-4 rounded-t-lg font-semibold text-[#8B5E3C] border-b border-[#D8C4B6]">
                    Rak {rakNama}
                  </div>
                  
                  <div className="bg-[#E3C2AC59] border-x border-b border-[#E0D3C9] rounded-b-lg p-4 overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                      <thead>
                        <tr className="border-b bg-[#A47352] border-[#E0D3C9] text-gray-100 rounded-md">
                          <th className="p-3">No.</th>
                          <th className="p-3">Gambar</th>
                          <th className="p-3">Kode Produk</th>
                          <th className="p-3">Lebar</th>
                          <th className="p-3">Motif</th>
                          <th className="p-3">Jenis Pewarna</th>
                          <th className="p-3">Panjang sisa</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white/30 divide-y divide-[#E0D3C9]/40">
                        {displayItems.map((item, idx) => (
                          <tr key={item.id} className="border border-[#A47352] hover:bg-[#976b3954] transition-all">
                            <td className="p-3 text-[#A47352]">{idx + 1}.</td>
                            <td className="p-3 text-[#A47352]">
                              {item.produk?.gambar_url ? (
                                <img src={item.produk.gambar_url} className="object-cover w-12 h-12 rounded" alt="produk" />
                              ) : (
                                <div className="flex items-center justify-center w-12 h-12 text-xs text-[#A47352] bg-stone-200/80 rounded">No Img</div>
                              )}
                            </td>
                            <td className="p-3 text-[#A47352] font-medium">{item.produk?.kode_produk}</td>
                            <td className="p-3 text-[#A47352]">{item.lebar} cm</td>
                            <td className="p-3 text-[#A47352]">{item.produk?.motif?.nama}</td>
                            <td className="p-3 text-[#A47352]">{item.produk?.jenis_pewarna}</td>
                            <td className="p-3 text-[#A47352] font-bold">{item.panjang_sisa} Meter</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Total per Rak */}
                    <div className="pr-4 mt-4 font-bold text-right text-[#A47352]">
                      Total : {totalPerRak} Meter
                    </div>

                    {/* Tombol panah bawah untuk expand gulungan */}
                    {items.length > 1 && (
                      <button 
                        onClick={() => setExpandedRaks(prev => ({...prev, [rakNama]: !isExpanded}))}
                        className="w-full mt-2 flex justify-center text-[#A47352]"
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Tombol panah untuk load lebih banyak rak */}
            {rakEntries.length > limitRaks && (
              <button 
                onClick={() => setLimitRaks(prev => prev + 4)}
                className="w-full py-4 flex justify-center text-[#8B5E3C] animate-bounce"
              >
                <ChevronDown size={32} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}