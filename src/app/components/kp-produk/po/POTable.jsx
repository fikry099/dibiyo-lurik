import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import POTableSkeleton from './POTableSkeleton';

export default function POTable({ data, loading, setSelectedItem, onDeleteSuccess, tipe }) {
  
  const getStatusProduksiClass = (status) => {
    const map = {
      'belum_diproses': 'bg-[#A63636]',
      'sedang_diproses': 'bg-[#E0A21B]',
      'dalam_proses': 'bg-[#E0A21B]',
      'selesai_diproses': 'bg-[#409643]'
    };
    return `${map[status] || 'bg-gray-500'} text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide inline-block`;
  };

  const getStatusPembayaranClass = (status) => {
    return status?.toLowerCase() === 'lunas'
      ? 'bg-[#1DB793] text-white'
      : 'bg-[#F0A864] text-white';
  };

  // LOGIKA INTEGRASI SWEETALERT2 DENGAN LOADING DI TOMBOL SUBMIT UNTUK HAPUS DATA
  const handleDeleteRow = (item) => {
    const apiPath = tipe === 'reguler' ? '/api/pre-order-reguler' : '/api/pre-order-custom';

    Swal.fire({
      title: 'Hapus Pesanan',
      text: `Apakah Anda yakin ingin menghapus data pre-order atas nama "${item.nama_customer}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#A63636', // Selaras merah hapus
      cancelButtonColor: '#1A335A',  // Batal navy
      confirmButtonText: 'Ya, Hapus Data',
      cancelButtonText: 'Batal',
      fontFamily: 'Inter',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          // Sesuaikan query payload DELETE Anda (biasanya dikirim lewat body atau query params)
          const res = await fetch(apiPath, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id })
          });

          if (!res.ok) {
            throw new Error('Gagal menghapus data dari database.');
          }

          return true;
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Terhapus!',
          text: 'Data pre-order berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#1A335A'
        });

        // Trigger optimistic filter update di komponen parent
        if (onDeleteSuccess) onDeleteSuccess(item.id);
      }
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-center border-collapse text-[11px] font-inter">
        <thead>
          <tr className="bg-[#1A335A] text-white text-xs font-bold">
            <th className="px-3 py-3 font-bold rounded-l-md">No.</th>
            <th className="px-3 py-3 font-bold">Id Pre-Order</th>
            <th className="px-4 py-3 font-bold">Nama Pelanggan</th>
            <th className="px-3 py-3 font-bold">Jumlah Pre-Order</th>
            <th className="px-3 py-3 font-bold">Status Produksi</th>
            <th className="px-3 py-3 font-bold">Status Pembayaran</th>
            <th className="px-4 py-3 font-bold">Total Harga</th>
            <th className="px-4 py-3 font-bold rounded-r-md">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-[11px] text-black font-medium">
          {loading ? (
            <tr>
              <td colSpan="8" className="p-0">
                <POTableSkeleton />
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr key={item.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50/80">
                <td className="px-3 py-3.5 text-black font-bold">{index + 1}.</td>
                <td className="py-3.5 px-3 text-[#1A335A] font-bold">
                  {item.id ? item.id.slice(0, 8).toUpperCase() : 'UNKNOWN'}
                </td>
                <td className="px-4 py-3.5 font-medium text-left sm:text-center">{item.nama_customer}</td>
                <td className="px-3 py-3.5 font-bold">
                  {/* Handle total item fleksibel */}
                  {item.items && item.items.length > 0 
                    ? item.items.reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0) 
                    : (item.jumlah_item || item.jumlah_pre_order || 0)} item
                </td>
                <td className="px-3 py-3.5">
                  <span className={getStatusProduksiClass(item.status)}>
                    {item.status ? item.status.replace('_', ' ').toUpperCase() : '-'}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`${getStatusPembayaranClass(item.status_pembayaran)} text-[10px] px-2.5 py-0.5 rounded-md font-bold tracking-wide shadow-sm`}>
                    {item.status_pembayaran ? item.status_pembayaran.toUpperCase() : '-'}
                  </span>
                </td>
                <td className="px-4 py-3.5 font-bold text-gray-700">
                  Rp. {item.total_harga ? item.total_harga.toLocaleString('id-ID') : '0'}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    
                    {/* BUTTON EYE DETAIL */}
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="bg-[#F2B600] hover:bg-[#d4a001] text-white p-2.5 rounded-md shadow-sm transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={13} strokeWidth={2.5} />
                    </button>

                    {/* BUTTON TRASH HAPUS */}
                    <button 
                      onClick={() => handleDeleteRow(item)}
                      className="bg-[#A63636] hover:bg-[#852b2b] text-white p-2.5 rounded-md shadow-sm transition-colors"
                      title="Hapus Data"
                    >
                      <Trash2 size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {!loading && data.length === 0 && (
        <p className="p-8 font-medium text-center text-gray-400">Data Pre-Order tidak ditemukan.</p>
      )}
    </div>
  );
}