'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CornerDownLeft, CreditCard, CalendarDays, Package, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useOrderStore } from '../../../../../../store/useOrderStore';
import Swal from 'sweetalert2';

export default function PembayaranPO() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  const [statusBayar, setStatusBayar] = useState(orderData.paymentData?.statusBayar || 'dp');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nominal: orderData.paymentData?.nominal || '',
    metode: orderData.paymentData?.metode || 'Cash',
    diskon: orderData.paymentData?.diskon || 0,
    tgl_selesai: orderData.paymentData?.tgl_selesai || '',
    catatan: orderData.paymentData?.catatan || ''
  });

  const subTotal = orderData.items.reduce((acc, item) => acc + (Number(item.totalHargaItem || 0)), 0);
  const total = subTotal - (subTotal * (Number(formData.diskon) / 100));

  useEffect(() => {
    if (statusBayar === 'lunas') {
      setFormData(prev => ({ ...prev, nominal: total.toString() }));
    } else if (statusBayar === 'dp') {
      const dp50 = total * 0.5;
      setFormData(prev => ({ ...prev, nominal: dp50.toString(), diskon: 0 }));
    }
  }, [statusBayar, total]);

  const handleSubmit = async () => {
    if (!formData.tgl_selesai) {
      Swal.fire({
        icon: 'warning',
        title: 'Validasi Gagal',
        text: 'Silakan tentukan tanggal estimasi produk jadi terlebih dahulu.',
        confirmButtonColor: '#A47352'
      });
      return;
    }

    setLoading(true);

    const payload = {
      nama_customer: orderData.customer?.nama || 'Pelanggan Biasa',
      kontak_customer: orderData.customer?.telpon || '',
      alamat_customer: orderData.customer?.alamat || '',
      total_harga: total,
      status_pembayaran: statusBayar,
      status: 'dalam_proses',
      catatan: formData.catatan,
      tanggal_selesai: formData.tgl_selesai, 
      metode_pembayaran: formData.metode,
      nominal_bayar: Number(formData.nominal),
      diskon: Number(formData.diskon),
      items: orderData.items 
    };

    try {
      const res = await fetch('/api/pre-order-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (!res.ok) throw new Error(responseData.error || 'Terjadi kendala saat menyimpan order');

      await Swal.fire({
        icon: 'success',
        title: 'Transaksi Berhasil',
        text: 'Data Pre-Order berhasil disimpan ke sistem.',
        confirmButtonColor: '#10B981'
      });

      router.push('/dashboard/cs/po/custom'); 

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: error.message,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto font-inter text-[#A47352]">
      {/* Judul Utama Atas Halaman */}
      <div className="border-b border-[#D4C5B9] pb-2 mb-4">
        <h1 className="text-2xl font-bold text-[#A47352]">Pre-Order Custom</h1>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#F5EBE1] border border-[#D4C5B9] rounded-md p-6 space-y-6 shadow-sm">
        
        {/* Kontainer Utama 1: Detail Pembayaran */}
        <div className="bg-[#E3C2AC59] border border-[#A47352]/20 rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#A47352] font-bold text-sm select-none">
              <CreditCard size={18} strokeWidth={2.5} />
              <h2>Detail Pembayaran</h2>
            </div>
            <button 
              type="button"
              onClick={() => router.back()} 
              className="flex items-center gap-1.5 bg-[#A47352] text-white text-xs px-4 py-1.5 rounded-full font-medium transition-all hover:bg-[#8c5f3f]"
            >
              <CornerDownLeft size={14} strokeWidth={2.5} />
              <span>kembali</span>
            </button>
          </div>

          {/* Baris Pilihan Status Pembayaran */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold text-[#A47352]">Setatus Pembayaran</label>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setStatusBayar('dp')} 
                className={`flex-1 h-[38px] font-bold rounded-md text-xs transition-all border ${statusBayar === 'dp' ? 'bg-[#A47352] text-white border-[#A47352]' : 'bg-[#A47352]/10 text-[#A47352] border-[#A47352]'}`}
              >
                DP
              </button>
              <button 
                type="button"
                onClick={() => setStatusBayar('lunas')} 
                className={`flex-1 h-[38px] font-bold rounded-md text-xs transition-all border ${statusBayar === 'lunas' ? 'bg-[#A47352] text-white border-[#A47352]' : 'bg-[#A47352]/10 text-[#A47352] border-[#A47352]'}`}
              >
                Lunas
              </button>
            </div>
          </div>

          {/* PERUBAHAN: Baris Input Nominal Hanya Muncul saat DP & Ter-disabled */}
          {statusBayar === 'dp' && (
            <div className="flex flex-col space-y-1.5 animate-fade-in">
              <label className="text-[11px] font-bold text-[#A47352]">Nominal DP (50%)</label>
              <input 
                type="number" 
                value={formData.nominal} 
                placeholder="Rp" 
                className="w-full h-[36px] px-3 border border-[#A47352] rounded-md text-[#A47352] font-bold outline-none text-xs bg-[#A47352]/10 cursor-not-allowed" 
                disabled={true} 
              />
            </div>
          )}

          {/* Baris Tiga Kolom Horizontal Sejajar */}
          <div className="grid items-start grid-cols-1 gap-4 pt-1 md:grid-cols-12">
            <div className="md:col-span-5 flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-[#A47352]">Metode Pembayaran</label>
              <select 
                value={formData.metode} 
                className="w-full h-[36px] px-2 bg-[#A47352]/20 border border-[#A47352] rounded-md text-[#A47352] font-bold outline-none text-xs cursor-pointer" 
                onChange={(e) => setFormData({...formData, metode: e.target.value})}
              >
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>

            <div className="md:col-span-3 flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold text-[#A47352]">Diskon (opsional)</label>
              <input 
                type="number" 
                value={formData.diskon} 
                placeholder="10%" 
                disabled={statusBayar === 'dp'}
                className={`w-full h-[36px] px-3 border border-[#A47352] rounded-md text-[#A47352] font-bold outline-none text-xs ${
                  statusBayar === 'dp' ? 'bg-[#A47352]/10 cursor-not-allowed opacity-50' : 'bg-[#A47352]/20'
                }`}
                onChange={(e) => setFormData({...formData, diskon: e.target.value})} 
              />
            </div>
            
            <div className="md:col-span-4 flex flex-col space-y-1.5 w-full">
              <label className="text-[11px] font-bold text-[#A47352]">Total Harga</label>
              <div className="bg-[#A47352]/10 border border-[#A47352]/30 p-3 rounded-md text-[#A47352] text-[11px] font-bold flex flex-col gap-1.5 shadow-inner">
                <div className="flex justify-between"><span>Sub Total</span> <span>Rp.{subTotal.toLocaleString('id-ID')},00</span></div>
                <div className="flex justify-between"><span>Diskon</span> <span>{formData.diskon}%</span></div>
                <div className="flex justify-between font-black text-xs border-t border-[#A47352]/30 pt-1.5 mt-0.5">
                  <span>Total</span> <span>Rp.{total.toLocaleString('id-ID')},00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Estimasi Selesai & Status Produksi */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="bg-[#E3C2AC59] border border-[#A47352]/20 rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#A47352] select-none">
              <CalendarDays size={18} strokeWidth={2.5} /> 
              <h3>Estimasi Produk Jadi</h3>
            </div>
            <div className="flex flex-col space-y-1.5 bg-[#A47352]/5 border border-[#A47352]/10 p-3 rounded-md">
              <label className="text-[10px] font-bold text-[#A47352]">Tanggal Estimasi Selesai</label>
              <div className="relative w-full">
                <DatePicker
                  selected={formData.tgl_selesai ? new Date(formData.tgl_selesai) : null}
                  onChange={(date) => setFormData({...formData, tgl_selesai: date?.toISOString().split('T')[0]})}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="00/00/0000"
                  wrapperClassName="w-full"
                  className="w-full h-[36px] px-3 bg-[#A47352]/20 border border-[#A47352] rounded-md text-[#A47352] font-bold outline-none text-xs placeholder-[#A47352]/40 cursor-pointer"
                />
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A47352] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#E3C2AC59] border border-[#A47352]/20 rounded-md p-5 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-[#A47352] select-none">
              <Package size={18} strokeWidth={2.5} /> 
              <h3>Status Produksi</h3>
            </div>
            <div className="flex flex-col space-y-1.5 bg-[#A47352]/5 border border-[#A47352]/10 p-3 rounded-md">
              <label className="text-[10px] font-bold text-[#A47352]">Status Produksi</label>
              <select 
                value="dalam_proses" 
                disabled
                className="w-full h-[36px] px-3 bg-[#A47352]/10 border border-[#A47352]/40 rounded-md text-[#A47352]/70 font-bold outline-none text-xs cursor-not-allowed"
              >
                <option value="dalam_proses">Dalam Proses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Isian Lembar Catatan Tambahan */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#A47352] pl-1">Catatan</label>
          <textarea 
            value={formData.catatan} 
            placeholder="Tulis catatan..." 
            className="w-full h-24 p-3 bg-[#A47352]/20 border border-[#A47352]/30 rounded-md text-[#A47352] font-medium outline-none text-xs placeholder-[#A47352]/40 resize-none" 
            onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
          />
        </div>

        <button 
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-[46px] bg-[#10B981] hover:bg-[#0d9a6b] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-bold text-sm transition-colors shadow-md flex items-center justify-center active:scale-[0.99]"
        >
          {loading ? 'Menyimpan Pre-Order...' : 'Submit Pre-Order Custom'}
        </button>

      </div>

      <style jsx global>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker { border: 1px solid #A47352 !important; background: #F5EBE1 !important; font-family: inherit; }
        .react-datepicker__header { background: #E3C2AC !important; border-bottom: 1px solid #A47352 !important; }
        .react-datepicker__day--selected { background: #A47352 !important; color: white !important; }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: #A47352 !important; font-weight: 600; }
        .react-datepicker__input-container input { color: #A47352 !important; font-weight: bold; }
        .react-datepicker__input-container input::placeholder { color: rgba(164, 115, 82, 0.4) !important; }
      `}</style>
    </div>
  );
}