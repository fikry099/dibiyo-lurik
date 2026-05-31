'use client'

import { X, Printer } from 'lucide-react'

export default function PODustomDetailModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null

  // Helper untuk memformat tanggal 2026-06-03 menjadi format Indonesia yang rapi (03/06/2026 atau 3 Juni 2026)
  const formatEstimasiJadi = (dateString) => {
    if (!dateString) return '00/00/0000';
    try {
      const date = new Date(dateString);
      // Mengembalikan format dd/mm/yyyy standar lokal Indonesia
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString; // Fallback jika format string bermasalah
    }
  };

  // Ambil properti tanggal selesai dari item (sesuaikan fallback key-nya jika di backend namanya berbeda)
  const tanggalSelesaiRaw = item.tanggal_selesai || item.estimasi_selesai || item.estimasi_jadi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A335A7A] font-inter backdrop-blur-sm">
      {/* Container Modal */}
      <div className="w-full max-w-5xl overflow-hidden duration-200 bg-white rounded-lg shadow-lg animate-in fade-in zoom-in-95">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1A335A]">Pre-Order Custom</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-black">
          
          {/* BARIS 1: Data Customer & Detail Pembayaran */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            
            {/* Box Data Customer */}
            <div className="md:col-span-7 bg-[#FFECA7] border border-black rounded-lg p-4 text-[11px] space-y-3">
              <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
                <span>👤</span> Data Customer
              </div>
              
              <div className="grid grid-cols-3 pt-2 pb-2 border-t border-b border-black">
                <div className="pr-3 border-r border-black">
                  <p className="font-medium text-gray-500">Nama Customer</p>
                  <p className="font-bold mt-0.5 break-words">{item.nama_customer || '-'}</p>
                </div>
                
                <div className="px-3 border-r border-black">
                  <p className="font-medium text-gray-500">No Telpon</p>
                  <p className="font-bold mt-0.5">{item.kontak_customer || '-'}</p>
                </div>
                
                <div className="pl-3">
                  <p className="font-medium text-gray-500">Tanggal Pre-Order</p>
                  <p className="font-bold mt-0.5">
                    {item.tanggal_po ? formatEstimasiJadi(item.tanggal_po) : '01/05/2026'}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-500">Alamat</p>
                <p className="font-semibold mt-0.5 leading-relaxed">
                  {item.alamat_customer || 'Alamat tidak dicantumkan.'}
                </p>
              </div>
            </div>

            {/* Box Detail Pembayaran */}
            <div className="md:col-span-5 bg-[#FFECA7] border border-black rounded-lg p-4 text-[11px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs mb-3">
                  <span>💳</span> Detail Pembayaran
                </div>
                
                <div className="grid grid-cols-2 pt-2 pb-2 border-t border-b border-black">
                  <div className="pr-3 border-r border-black">
                    <p className="font-medium text-gray-500">Status Pembayaran</p>
                    <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-md text-white ${
                      item.status_pembayaran?.toLowerCase() === 'lunas' ? 'bg-[#1DB793]' : 'bg-[#F0A864]'
                    }`}>
                      {item.status_pembayaran?.toUpperCase() || 'DP'}
                    </span>
                  </div>
                  
                  <div className="pl-3">
                    <p className="font-medium text-gray-500">Metode Pembayaran</p>
                    <p className="mt-1 font-bold">{item.metode_pembayaran || 'Cash'}</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="font-medium text-gray-500">Total Harga</p>
                <p className="text-sm font-bold text-black mt-0.5">
                  Rp. {item.total_harga?.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

          </div>

          {/* BARIS 2: Data Produk */}
          <div className="p-4 space-y-3 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
              <span>📦</span> Data Produk
            </div>
            
            <div className="bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px]">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-red-800 to-amber-900 rounded-lg shadow-inner shrink-0 flex items-center justify-center text-white text-[9px] font-bold overflow-hidden">
                  <div className="w-full h-full opacity-40 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:8px_8px]"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Kode Produksi</p>
                  <p className="font-bold text-gray-700">{item.kode_produksi || 'AKLBL-CUSTOM'}</p>
                  <p className="mt-1 font-medium text-gray-400">Kategori / Motif</p>
                  <p className="font-semibold">Custom Design / Lurik Klasik</p>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 text-left sm:grid-cols-4 gap-x-6 gap-y-2 sm:w-auto sm:text-center">
                <div>
                  <p className="font-medium text-gray-400">Lebar Kain</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[70px]">
                    {item.lebar_kain || 'Lebar 110 cm'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Jumlah PO</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[40px]">
                    {item.jumlah_po || 1}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-400">Panjang Kain</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[60px]">
                    {item.panjang_kain || '30 m'}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="font-medium text-gray-400">Harga</p>
                  <p className="border border-gray-200 bg-white rounded px-2 py-0.5 font-bold text-gray-700 mt-0.5 inline-block min-w-[90px] text-right">
                    Rp.{item.total_harga?.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

{/* BARIS 3: Estimasi Produk Jadi & Status Produksi */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-12">
  
  {/* Estimasi (Lebih Pendek) */}
  <div className="md:col-span-5 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-2 flex flex-col justify-between">
    <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
      <span>🕒</span> Estimasi Produk Jadi
    </div>
    {/* Tetap w-full agar memenuhi kotak pembungkusnya yang berukuran col-span-5 */}
    <div className="w-full bg-[#F2B600C4] text-black font-bold text-center py-1.5 rounded-lg tracking-wider text-xs">
      {formatEstimasiJadi(tanggalSelesaiRaw)}
    </div>
  </div>

  {/* Status Produksi (Lebih Panjang) */}
  <div className="md:col-span-7 bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-2 flex flex-col justify-between">
    <div className="flex items-center gap-2 font-bold text-[#1A335A] text-xs">
      <span>⚙️</span> Status Produksi
    </div>
    <div className={`w-full text-white font-bold text-center py-1.5 rounded-lg text-xs tracking-wide ${
      item.status === 'selesai_diproses' ? 'bg-[#409643]' : item.status === 'dalam_proses' ? 'bg-[#F2B600C4]' : 'bg-[#A63636]'
    }`}>
      {item.status?.replace('_', ' ').toUpperCase() || 'BELUM DIPROSES'}
    </div>
  </div>

</div>

          {/* BARIS 4: Catatan Khusus */}
          <div className="bg-[#5AE3ED]/5 border border-gray-100 rounded-lg p-4 text-[11px] space-y-1.5">
            <p className="font-bold text-[#1A335A] text-xs">Catatan</p>
            <div className="w-full bg-white border border-gray-200 rounded-lg p-2.5 min-h-[50px] font-medium text-gray-600">
              {item.catatan || 'Tidak ada catatan khusus untuk kustomisasi pesanan ini.'}
            </div>
          </div>

        </div>

        {/* FOOTER MODAL */}
        <div className="flex justify-end px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => window.print()} 
            className="bg-[#1A335A] hover:bg-[#11223d] text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer size={13} />
            Cetak Struk
          </button>
        </div>

      </div>
    </div>
  )
}