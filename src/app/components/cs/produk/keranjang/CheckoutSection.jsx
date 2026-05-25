'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function CheckoutSection({ items, onBack, onOrderSuccess }) {
  const [diskon, setDiskon] = useState(0);
  const [loading, setLoading] = useState(false);
  const [metodePembayaran, setMetodePembayaran] = useState('cash');
  const router = useRouter();

  // Hitung subtotal: Meter Diorder (input_panjang) * Harga Per Meter
  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const panjangDiorder = item.input_panjang || 0;
      const hargaKain = item.gulungan?.harga_per_meter || 0;
      return acc + (panjangDiorder * hargaKain);
    }, 0);
  }, [items]);

  const total = useMemo(() => {
    const discountAmount = subTotal * (diskon / 100);
    return subTotal - discountAmount;
  }, [subTotal, diskon]);

  const handleBuatPesanan = async () => {
    setLoading(true);
    try {
      // 1. Kirim data untuk membuat pesanan baru & update sisa meteran serta produk terjual
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metode_pembayaran: metodePembayaran,
          diskon: diskon,
          items: items.map(item => ({
            cart_id: item.id,
            gulungan_id: item.gulungan.id,
            jumlah_order: item.input_panjang // Mengirimkan data panjang meteran yang dibeli
          }))
        }),
      });

      const apiResult = await response.json(); 

      if (!response.ok) throw new Error(apiResult.message);

      // =====================================================================
      // AKSI UTAMA: Bersihkan data keranjang di Database (DB) via API
      // =====================================================================
      try {
        await fetch('/api/keranjang', {
          method: 'DELETE', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: items.map(item => item.id) })
        });
      } catch (clearErr) {
        console.error("Gagal otomatis mengosongkan database keranjang:", clearErr);
      }

      // REALTIME BADGE SYNC: Paksa badge di Sidebar langsung menjadi 0
      const resetBadgeEvent = new CustomEvent("updateCartCount", {
        detail: { count: -items.length } 
      });
      window.dispatchEvent(resetBadgeEvent);

      // 2. Tampilkan notifikasi SweetAlert2 sukses
      Swal.fire({
        title: 'Pesanan Berhasil dibuat',
        text: 'Apakah Anda ingin mencetak struk?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Ya, Cetak Struk',
        cancelButtonText: 'Tidak',
        confirmButtonColor: '#8B5E3C',
        cancelButtonColor: '#d33'
      }).then((swalResult) => {

        onOrderSuccess(); 
        router.refresh();

        if (swalResult.isConfirmed) {
          router.push(`/dashboard/cs/cetak/${apiResult.data.id}`);
        } else {
          router.push('/dashboard/cs/rp/order');
        }
      });

    } catch (err) {
      Swal.fire('Gagal Memproses Pesanan', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <h1 className="mb-6 text-2xl pb-4 font-bold border-b border-[#8B5E3C] text-stone-800">Keranjang</h1>
      <div className="p-6 bg-[#F5EBE3] rounded-xl border border-[#E3C2AC]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-800">Check-out</h2>
          <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-[#8B5E3C] text-white rounded-lg hover:bg-[#724d31] transition-colors">
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>

        {/* Data Produk */}
        <div className="mb-6 space-y-4">
          <h3 className="flex items-center gap-2 font-semibold text-stone-700">📦 Detail Kain Diorder</h3>
          {items.map((item) => {
            const hargaKain = item.gulungan?.harga_per_meter || 0;
            const meteran = item.input_panjang || 0;
            return (
              <div key={item.id} className="flex items-center gap-6 p-4 bg-white border rounded-lg shadow-sm border-stone-100">
                <img src={item.gulungan?.produk?.gambar_url || '/placeholder-kain.jpg'} className="object-cover w-20 h-20 border rounded" alt="produk" />
                <div className="grid items-center flex-1 grid-cols-5 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Kode Produk</p>
                    <p className="font-bold text-[#8B5E3C]">{item.gulungan?.produk?.kode_produk}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">No Gulungan</p>
                    <p className="font-semibold text-stone-700">G-{item.gulungan?.nomor_gulungan}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Lebar</p>
                    <p className="font-medium text-stone-700">{item.gulungan?.lebar} cm</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Panjang Potong</p>
                    <p className="font-bold text-amber-800">{meteran} meter</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Subtotal Kain</p>
                    <p className="font-bold text-stone-800">Rp{(meteran * hargaKain).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Pembayaran */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E3C2AC]/30">
          <h3 className="mb-4 font-semibold text-stone-700">💳 Detail Pembayaran</h3>
          <div className="grid items-center grid-cols-3 gap-6">
            <label className="flex flex-col text-xs font-semibold text-stone-500">
              Metode Pembayaran
              <select 
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
                className="p-3 mt-1 border rounded-lg bg-stone-50 font-medium text-stone-800 focus:outline-none focus:border-[#8B5E3C]"
              >
                <option value="cash">Cash (Tunai)</option>
                <option value="transfer">Transfer Bank</option>
              </select>
            </label>
            <label className="flex flex-col text-xs font-semibold text-stone-500">
              Diskon (%)
              <input 
                type="number" 
                min="0"
                max="100"
                value={diskon}
                onChange={(e) => setDiskon(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="p-3 mt-1 border rounded-lg bg-stone-50 font-bold text-stone-800 focus:outline-none focus:border-[#8B5E3C]" 
              />
            </label>
            
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-stone-700 space-y-1.5">
              <div className="flex justify-between text-xs font-medium"><span>Subtotal Gross</span><span>Rp{subTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs font-medium text-red-500"><span>Diskon ({diskon}%)</span><span>-Rp{(subTotal * (diskon/100)).toLocaleString()}</span></div>
              <div className="pt-2 border-t flex justify-between text-base font-bold text-[#8B5E3C]"><span>Total Net</span><span>Rp{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleBuatPesanan}
          disabled={loading}
          className="w-full mt-6 py-4 bg-[#10B981] text-white font-bold rounded-lg hover:bg-[#059669] transition-colors shadow-md flex justify-center items-center gap-2 text-lg disabled:bg-stone-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Memproses Stok...
            </>
          ) : (
            'Konfirmasi & Bayar Pesanan'
          )}
        </button>
      </div>
    </div>
  );
}