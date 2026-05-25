'use client'
import React from 'react';
import { Eye } from 'lucide-react';

export default function PreOrderCustomTable({ data }) {
  return (
    <div className="w-full overflow-hidden bg-white border rounded-lg shadow-sm border-stone-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#A67C5B] text-white">
          <tr>
            <th className="px-6 py-4">No.</th>
            <th className="px-6 py-4">Tanggal</th>
            <th className="px-6 py-4">Id Pre-Order</th>
            <th className="px-6 py-4">Nama Pelanggan</th>
            <th className="px-6 py-4">Nomor Telepon</th>
            <th className="px-6 py-4">Jumlah PO</th>
            <th className="px-6 py-4">Total Harga</th>
            <th className="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">{data.map((item, index) => (
          <tr key={item.id} className="hover:bg-stone-50">
            <td className="px-6 py-4 text-stone-600">{index + 1}</td>
            <td className="px-6 py-4 text-stone-600">
              {new Date(item.created_at).toLocaleDateString('id-ID')}
            </td>
            <td className="px-6 py-4 font-bold text-[#8B5E3C]">ID {item.id.slice(0, 8)}</td>
            <td className="px-6 py-4 text-stone-600">{item.nama_customer}</td>
            <td className="px-6 py-4 text-stone-600">{item.kontak_customer}</td>
            <td className="px-6 py-4 text-stone-600">{item.item_pre_order_custom?.length || 0}</td>
            <td className="px-6 py-4 font-semibold text-stone-600">
              Rp {item.total_harga?.toLocaleString('id-ID') || 0}
            </td>
            <td className="px-6 py-4 text-center">
              <button className="flex items-center gap-1 mx-auto bg-[#10B981] text-white px-3 py-1 rounded-md text-xs hover:bg-[#059669]">
                <Eye size={14} /> Detail
              </button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}