'use client';
import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function POModalDetail({ item, tipe, onClose, onRefresh }) {
  const [status, setStatus] = useState(item.status);
  const [submitting, setSubmitting] = useState(false);

  // Mengunci alur agar tidak bisa diubah jika sudah selesai
  const isAlreadyFinished = item.status === 'selesai_diproses';

  const handleSaveStatus = async () => {
    // Jika status tidak berubah, tidak perlu tembak API
    if (status === item.status) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/po', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          tipe: tipe,
          status: status,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal memperbarui status');
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status produksi berhasil diperbarui!',
        confirmButtonColor: '#A47352',
      });

      onRefresh();
      onClose();

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message,
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-inter">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-[#D4C5B9] overflow-hidden">
        {/* Header */}
        <div className="bg-[#A47352] p-4 text-white flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detail Pre-Order</h3>
          <button onClick={onClose} className="p-1 transition-colors rounded-lg hover:bg-amber-800">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm text-gray-700">
          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">ID Pre-Order</span>
            <span className="col-span-2 font-mono font-semibold text-[#A47352]">{item.id}</span>
          </div>

          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">Nama Pelanggan</span>
            <span className="col-span-2 font-semibold text-gray-900">{item.nama_customer}</span>
          </div>

          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">Kontak</span>
            <span className="col-span-2">{item.kontak_customer || '-'}</span>
          </div>

          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">Alamat</span>
            <span className="col-span-2">{item.alamat_customer || '-'}</span>
          </div>

          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">Total Item</span>
            <span className="col-span-2 font-medium">{item.jumlah_item} item</span>
          </div>

          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">Total Harga</span>
            <span className="col-span-2 font-semibold text-gray-900">Rp. {item.total_harga.toLocaleString('id-ID')}</span>
          </div>

          <div className="grid grid-cols-3 pb-2 border-b border-gray-100">
            <span className="font-medium text-gray-500">Status Bayar</span>
            <span className="col-span-2">
              <span className="px-2 py-0.5 text-xs font-semibold text-white bg-[#8B5E3C] rounded">
                {item.status_pembayaran.toUpperCase()}
              </span>
            </span>
          </div>

          {item.catatan && (
            <div className="p-3 border rounded-lg bg-amber-50/60 border-amber-100">
              <span className="block mb-1 font-medium text-amber-800">Catatan Internal:</span>
              <p className="italic text-amber-900">"{item.catatan}"</p>
            </div>
          )}

          {/* Edit Status Dropdown Conditional Rendering */}
          <div className="bg-[#f9f5f2] p-4 rounded-xl border border-[#E0D3C9] space-y-2 mt-4">
            <label className="block font-semibold text-[#A47352]">
              {isAlreadyFinished ? "Status Produksi Akhir" : "Update Status Produksi"}
            </label>
            
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isAlreadyFinished} // Kunci dropdown jika sudah selesai_diproses
              className="w-full p-2.5 bg-white border border-[#E0D3C9] rounded-lg focus:ring-2 focus:ring-[#A47352] focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {/* Jika status awal 'belum_diproses' atau 'dalam_proses' */}
              {(item.status === 'belum_diproses' || item.status === 'dalam_proses') && (
                <>
                  <option value={item.status}>Dalam Proses</option>
                  <option value="sedang_diproses">Sedang Diproses</option>
                </>
              )}

              {/* Jika status awal 'sedang_diproses' */}
              {item.status === 'sedang_diproses' && (
                <>
                  <option value="sedang_diproses">Sedang Diproses</option>
                  <option value="selesai_diproses">Selesai Diproses</option>
                </>
              )}

              {/* Jika status awal 'selesai_diproses' */}
              {item.status === 'selesai_diproses' && (
                <option value="selesai_diproses">Selesai Diproses</option>
              )}
            </select>

            {isAlreadyFinished && (
              <p className="mt-1 text-xs italic text-gray-400">
                *Pesanan telah selesai diproses dan alur produksi tidak dapat dikembalikan.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Kembali
          </button>
          
          {/* Sembunyikan atau nonaktifkan tombol simpan jika sudah selesai */}
          {!isAlreadyFinished && (
            <button
              onClick={handleSaveStatus}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#A47352] text-white rounded-lg hover:bg-amber-800 text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Perubahan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}