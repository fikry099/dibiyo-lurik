'use client'
import { useState } from 'react'
import { Eye, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'
import PORegulerDetailModal from './PORegulerDetailModal' 

export default function PORegulerTable({ data, onConfirmReceipt, onEdit, onDelete }) {

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  if (!data || data.length === 0) {
    return <p className="py-8 text-xs font-medium text-center text-gray-400">Data tidak tersedia.</p>;
  }

  const handleOpenDetail = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseDetail = () => {
    setSelectedItem(null)
    setIsModalOpen(false)
  }

  const getStatusProduksiClass = (status) => {
    const map = {
      'belum_diproses': 'bg-[#A63636]',
      'sedang_diproses': 'bg-[#E0A21B]',
      'dalam_proses': 'bg-[#E0A21B]',
      'selesai_diproses': 'bg-[#409643]'
    };
    return `${map[status] || 'bg-gray-400'} text-white text-[10px] px-3 py-1 rounded-full font-bold inline-block`;
  };

  const getStatusPembayaranClass = (status) => {
    return status?.toLowerCase() === 'lunas'
      ? 'bg-[#1DB793] text-white'
      : 'bg-[#F0A864] text-white';
  };

  const handleConfirmReceipt = (item) => {
    Swal.fire({
      title: 'Konfirmasi Pengambilan',
      text: `Apakah Anda yakin barang untuk customer "${item.nama_customer}" sudah diambil?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#A63636',
      confirmButtonText: 'Ya, Sudah Diambil',
      cancelButtonText: 'Batal',
      fontFamily: 'Inter',
      showLoaderOnConfirm: true, 
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          const res = await fetch('/api/pre-order-reguler', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id })
          });

          if (!res.ok) {
            throw new Error('Gagal memperbarui status penerimaan.');
          }

          return true; 
        } catch (error) {
          Swal.showValidationMessage(`Error: ${error.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Status penerimaan barang berhasil diperbarui.',
          icon: 'success',
          confirmButtonColor: '#1A335A'
        });
        
        if (onConfirmReceipt) onConfirmReceipt(item.id);
      }
    });
  };

  return (
    <>
      <table className="w-full text-center border-collapse font-inter">
        <thead>
          <tr className="bg-[#1A335A] text-white text-[11px] font-bold">
            <th className="px-3 py-3 font-semibold rounded-l-md">No.</th>
            <th className="px-3 py-3 font-semibold">Id Pre-Order</th>
            <th className="px-4 py-3 font-semibold">Nama Pelanggan</th>
            <th className="px-3 py-3 font-semibold">Jumlah Pre-Order</th>
            <th className="px-3 py-3 font-semibold">Status Prosedur</th>
            <th className="px-3 py-3 font-semibold">Status Pembayaran</th>
            <th className="px-4 py-3 font-semibold">Total Harga</th>
            <th className="px-4 py-3 font-semibold rounded-r-md">Aksi</th>
          </tr>
        </thead>
        <tbody className="text-[11px] text-black font-medium">
          {data.map((item, index) => (
            <tr key={item.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50/50">
              <td className="px-3 py-4 font-bold text-black">{index + 1}.</td>
              <td className="px-3 py-4 font-bold text-black">ID {item.id?.slice(0, 8).toUpperCase()}</td>
              <td className="px-4 py-4 font-bold text-left sm:text-center">{item.nama_customer}</td>
              
              <td className="px-3 py-4 font-bold">
                {item.items && item.items.length > 0 
                  ? item.items.reduce((sum, i) => sum + (Number(i.jumlah) || 0), 0) 
                  : (item.jumlah_pre_order || 0)}
              </td>

              <td className="px-3 py-4">
                <span className={getStatusProduksiClass(item.status)}>
                  {item.status === 'belum_diproses' ? 'Belum diproses' : 
                   item.status === 'selesai_diproses' ? 'Selesai diproses' : 'Sedang diproses'}
                </span>
              </td>
              <td className="px-3 py-4">
                <span className={`${getStatusPembayaranClass(item.status_pembayaran)} text-[10px] px-3 py-1 rounded-full font-bold`}>
                  {item.status_pembayaran?.toUpperCase()}
                </span>
              </td>
              <td className="px-4 py-4 font-bold text-black">
                Rp. {item.total_harga?.toLocaleString('id-ID')},00
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-1">
                  
                  {/* TOMBOL KONFIRMASI PRODUK DITERIMA */}
                  <div className="relative inline-block group">
                    <button 
                      onClick={() => handleConfirmReceipt(item)}
                      className="bg-[#1A335A] hover:bg-[#11223d] text-white p-2 rounded shadow-sm transition-colors"
                    >
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                    </button>
                    {/* Tooltip Keterangan */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-stone-900 text-white text-[10px] font-medium py-1 px-2 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                      Konfirmasi Produk Diterima
                      <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-0.5"></div>
                    </div>
                  </div>
                  
                  {/* TOMBOL DETAIL MATA */}
                  <button 
                    onClick={() => handleOpenDetail(item)}
                    className="bg-[#F2B600] hover:bg-[#d49f00] text-white p-2 rounded shadow-sm transition-colors" 
                  >
                    <Eye size={14} strokeWidth={2.5} />
                  </button>

                  {/* TOMBOL EDIT */}
                  <button 
                    onClick={() => onEdit && onEdit(item)}
                    className="bg-[#1A335A] hover:bg-[#12243f] text-white p-2 rounded shadow-sm transition-colors"
                  >
                    <Edit size={14} strokeWidth={2.5} />
                  </button>

                  {/* TOMBOL HAPUS */}
                  <button 
                    onClick={() => onDelete && onDelete(item)}
                    className="bg-[#A63636] hover:bg-[#852a2a] text-white p-2 rounded shadow-sm transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Render Komponen Modal Detail */}
      <PORegulerDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseDetail}
        item={selectedItem}
      />
    </>
  )
}