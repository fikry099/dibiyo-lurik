'use client';

import React from 'react';

export default function LaporanTable({ data, loading }) {
  return (
    <div className="mt-6 overflow-hidden border border-[#E3C2AC]/30 rounded-xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#B37C57] text-white text-xs font-semibold uppercase tracking-wider">
              <th className="px-4 py-3.5 text-center w-12">No.</th>
              <th className="px-4 py-3.5">Tanggal</th>
              <th className="px-4 py-3.5">Id Pesanan</th>
              <th className="px-4 py-3.5">Motif</th>
              <th className="px-4 py-3.5">Kategori</th>
              <th className="px-4 py-3.5 text-center">Jumlah Order</th>
              <th className="px-4 py-3.5 text-center">Lebar</th>
              <th className="px-4 py-3.5 text-center">Panjang</th>
              <th className="px-4 py-3.5 text-right">Total Harga</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium divide-y divide-stone-100 text-stone-700">
            {loading ? (
              // Skeleton Loading State
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="w-6 h-4 mx-auto rounded bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="w-20 h-4 rounded bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="w-24 h-4 rounded bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="h-4 rounded bg-stone-200 w-28"></div></td>
                  <td className="px-4 py-4"><div className="w-16 h-4 rounded bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="w-12 h-4 mx-auto rounded bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="w-16 h-6 mx-auto rounded-full bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="w-16 h-4 mx-auto rounded bg-stone-200"></div></td>
                  <td className="px-4 py-4"><div className="w-24 h-4 ml-auto rounded bg-stone-200"></div></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={9} className="py-12 text-center text-stone-400">
                  Tidak ada data order pada periode ini.
                </td>
              </tr>
            ) : (
              // Data State
              data.map((row, index) => (
                <tr key={index} className="transition-colors hover:bg-stone-50/60">
                  <td className="px-4 py-4 text-xs text-center text-stone-400">{index + 1}.</td>
                  <td className="px-4 py-4 text-xs text-stone-500">
                    {new Date(row.tanggal).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-4 text-xs font-bold text-amber-900">{row.id_pesanan}</td>
                  <td className="px-4 py-4 text-stone-800">{row.motif}</td>
                  <td className="px-4 py-4 text-xs text-stone-500">{row.kategori}</td>
                  <td className="px-4 py-4 font-semibold text-center">{row.jumlah_order}</td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white ${
                        row.lebar === 110 ? 'bg-indigo-500' : 'bg-purple-700'
                      }`}
                    >
                      {row.lebar} cm
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-center text-stone-600">
                    {row.panjang} Meter
                  </td>
                  <td className="px-4 py-4 font-bold text-right text-stone-900">
                    Rp {Number(row.total_harga || 0).toLocaleString('id-ID')},00
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}