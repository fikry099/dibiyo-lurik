import React from 'react';
import { Eye } from 'lucide-react';

export default function OrderTable({ orders }) {
  return (
    <div className="w-full overflow-hidden bg-[#F5F5F5] border rounded-lg shadow-sm border-stone-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#A67C5B] text-white">
          <tr>
            <th className="px-6 py-4">No.</th>
            <th className="px-6 py-4">Tanggal</th>
            <th className="px-6 py-4">Id Pesanan</th>
            <th className="px-6 py-4">Motif</th>
            <th className="px-6 py-4">Jml Order</th>
            <th className="px-6 py-4">Lebar</th>
            <th className="px-6 py-4">Panjang</th>
            <th className="px-6 py-4">Total Harga</th>
            <th className="px-6 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order, orderIndex) => (
            order.items.map((item, itemIndex) => (
              <tr key={`${order.id}-${itemIndex}`} className="hover:bg-stone-50">
                {itemIndex === 0 && (
                  <>
                    <td rowSpan={order.items.length} className="px-6 py-4 text-[#A47352] font-medium border-r">{orderIndex + 1}</td>
                    <td rowSpan={order.items.length} className="px-6 py-4 text-[#A47352] border-r">
                      {new Date(order.tanggal_order).toLocaleDateString('id-ID')}
                    </td>
                    <td rowSpan={order.items.length} className="px-6 py-4 text-[#A47352] font-bold border-r">{order.id}</td>
                  </>
                )}
                <td className="px-6 py-4 text-[#A47352]">{item.gulungan?.produk?.motif?.nama || '-'}</td>
                <td className="px-6 py-4 text-[#A47352]">{item.jumlah_order}</td>
                <td className="px-6 py-4">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold">
                        {item.gulungan?.lebar} cm
                    </span>
                </td>
                <td className="px-6 py-4 text-[#A47352]">{item.jumlah_order} Meter</td>
                {itemIndex === 0 && (
                  <td rowSpan={order.items.length} className="px-6 py-4 text-[#A47352] font-semibold">
                    Rp{order.total_harga.toLocaleString('id-ID')}
                  </td>
                )}
                {itemIndex === 0 && (
                  <td rowSpan={order.items.length} className="px-6 py-4 text-center">
                    <button className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-1 rounded-md text-xs hover:bg-[#059669]">
                      <Eye size={14} /> Detail
                    </button>
                  </td>
                )}
              </tr>
            ))
          ))}
        </tbody>
      </table>
    </div>
  );
}