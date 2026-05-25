'use client';

import React from 'react';

export default function LaporanPoTable({ data, loading }) {
  // Fungsi helper untuk styling badge status produksi
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SELESAI':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DIPROSES':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DIAMBIL':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  // Fungsi helper untuk styling badge status pembayaran
  const getPaymentBadge = (pembayaran) => {
    switch (pembayaran) {
      case 'LUNAS':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DP':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'BELUM_BAYAR':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  // Format ke IDR Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div className="w-full overflow-hidden bg-white border shadow-sm border-stone-200 rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-stone-50 border-stone-200 text-stone-600">
              <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase w-[60px] text-center">No.</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase">Tanggal Buat</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase">Id POC</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase">Nama Customer</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider text-center uppercase">Status Produksi</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider text-center uppercase">Status Bayar</th>
              <th className="px-6 py-4 text-xs font-bold tracking-wider text-right uppercase">Total Harga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {loading ? (
              // Skeleton Loading Animasi Pas Data Dimuat
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="w-6 h-4 mx-auto rounded bg-stone-200"></div></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 rounded bg-stone-200"></div></td>
                  <td className="px-6 py-4"><div className="h-4 rounded bg-stone-200 w-28"></div></td>
                  <td className="px-6 py-4"><div className="h-4 rounded bg-stone-200 w-36"></div></td>
                  <td className="px-6 py-4"><div className="w-20 h-6 mx-auto rounded-full bg-stone-200"></div></td>
                  <td className="px-6 py-4"><div className="w-20 h-6 mx-auto rounded-full bg-stone-200"></div></td>
                  <td className="px-6 py-4"><div className="w-24 h-4 ml-auto rounded bg-stone-200"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Tampilan jika data kosong / tidak ditemukan filter
              <tr>
                <td colSpan="7" className="px-6 py-12 font-medium text-center text-stone-400">
                  Tidak ada data Pre-Order Custom pada periode atau filter ini.
                </td>
              </tr>
            ) : (
              // Tampilan Data Asli
              data.map((row, index) => {
                const formattedDate = new Date(row.created_at).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });

                return (
                  <tr key={row.id} className="transition-colors hover:bg-stone-50/50">
                    <td className="px-6 py-4 text-sm font-medium text-center text-stone-400">
                      {index + 1}.
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-stone-800">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-stone-600">
                      {row.nama_customer}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-full ${getStatusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-full ${getPaymentBadge(row.status_pembayaran)}`}>
                        {row.status_pembayaran?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-stone-800">
                      {formatRupiah(row.total_harga || 0)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}