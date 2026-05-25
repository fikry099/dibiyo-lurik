'use client'
import { Eye, Edit, Trash2 } from 'lucide-react'

export default function PORegulerTable({ data }) {
  if (!data || !Array.isArray(data)) {
    return <p className="py-4 text-center">Data tidak tersedia.</p>;
  }

  const getStatusProduksiClass = (status) => {
    const map = {
      'belum_diproses': 'bg-[#FF6B6B]',
      'selesai_diproses': 'bg-[#4AD3B0]',
      'dalam_proses': 'bg-[#7CD4FF]',
      'sedang_diproses': 'bg-[#7CD4FF]'
    };
    return `${map[status] || 'bg-gray-400'} text-white text-xs px-3 py-1 rounded-full font-medium inline-block shadow-sm`;
  };

  const getStatusPembayaranClass = (status) => {
    return status === 'lunas'
      ? 'bg-[#B07C49] text-white'
      : 'bg-[#D4A373] text-white';
  };

  return (
    <table className="w-full text-center border-collapse">
      <thead>
        <tr className="bg-[#B07C49] text-white text-sm font-medium">
          <th className="px-2 py-3 font-normal rounded-l-lg">No.</th>
          <th className="px-3 py-3 font-normal">Id Pre-Order</th>
          <th className="px-4 py-3 font-normal">Nama Pelanggan</th>
          <th className="px-3 py-3 font-normal">Status Produksi</th>
          <th className="px-3 py-3 font-normal">Status Pembayaran</th>
          <th className="px-4 py-3 font-normal">Total Harga</th>
          <th className="px-4 py-3 font-normal rounded-r-lg">Aksi</th>
        </tr>
      </thead>
      <tbody className="text-sm text-gray-700">
        {data.map((item, index) => (
          <tr key={item.id} className="border-b border-[#D4A373]/20 hover:bg-amber-50/20 transition-colors">
            <td className="px-2 py-4 text-gray-500">{index + 1}.</td>
            <td className="py-4 px-3 text-[#B07C49] font-medium">{item.id.slice(0, 8)}</td>
            <td className="px-4 py-4">{item.nama_customer}</td>
            <td className="px-3 py-4">
              <span className={getStatusProduksiClass(item.status)}>
                {item.status.replace('_', ' ')}
              </span>
            </td>
            <td className="px-3 py-4">
              <span className={`${getStatusPembayaranClass(item.status_pembayaran)} text-xs px-3 py-0.5 rounded-full font-medium shadow-sm`}>
                {item.status_pembayaran.charAt(0).toUpperCase() + item.status_pembayaran.slice(1)}
              </span>
            </td>
            <td className="px-4 py-4 font-medium text-gray-600">Rp. {item.total_harga?.toLocaleString()}</td>
            <td className="px-4 py-4">
              <div className="flex items-center justify-center gap-1.5">
                <button className="bg-[#8B5E3C] hover:bg-[#724c30] text-white text-[11px] px-2 py-1 rounded shadow-sm transition-colors font-medium">
                  Produk di Terima
                </button>
                <button className="bg-[#4AD3B0] hover:bg-[#3bc2a0] text-white p-1 rounded shadow-sm" title="Detail"><Eye size={14} /></button>
                <button className="bg-[#F0A55D] hover:bg-[#e0944b] text-white p-1 rounded shadow-sm" title="Edit"><Edit size={14} /></button>
                <button className="bg-[#FF6B6B] hover:bg-[#f05656] text-white p-1 rounded shadow-sm" title="Hapus"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}