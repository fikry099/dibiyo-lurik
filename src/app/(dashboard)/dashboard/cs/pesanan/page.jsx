'use client'

import React, { useState, useEffect } from 'react'
import { Search, Eye, ShoppingBag, CheckCircle2, Truck, Package, Save } from 'lucide-react'
import Swal from 'sweetalert2'

const INITIAL_PESANAN_TERBAYAR = [
  {
    id: 'DIBIYO-1781727099003',
    notification_id: 'notif-001', // Ditambahkan simulasi ID Notifikasi dari DB Supabase
    customer: 'Budi Santoso',
    telpon: '081234567890',
    tgl: '18 Juni 2026',
    status_transaksi: 'Settlement', 
    status_pengerjaan: 'diproses', 
    no_resi: '',
    items: [
      { id: 1, kode_produk: 'PRD-001', nama: 'Kain Lurik Eksklusif Gerimis', kategori: 'Klasik', harga: 420000, qty: 1, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=150' },
      { id: 2, kode_produk: 'PRD-002', nama: 'Kain Lurik Eksklusif Indigo', kategori: 'Modern', harga: 420000, qty: 1, image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=150' }
    ]
  },
  {
    id: 'DIBIYO-1781727084722',
    notification_id: 'notif-002',
    customer: 'Siti Rahma',
    telpon: '085711223344',
    tgl: '18 Juni 2026',
    status_transaksi: 'Settlement', 
    status_pengerjaan: 'dikirim',
    no_resi: 'REG-ATBM-9920394A',
    items: [
      { id: 4, kode_produk: 'PRD-004', nama: 'Kain Lurik Eksklusif Cokelat', kategori: 'Klasik', harga: 420000, qty: 2, image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=150' }
    ]
  }
]

export default function CSManagePesananPage() {
  const [orders, setOrders] = useState(INITIAL_PESANAN_TERBAYAR)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState(INITIAL_PESANAN_TERBAYAR[0]?.id)

  const selectedOrder = orders.find(o => o.id === selectedOrderId)

  const [inputStatusPengerjaan, setInputStatusPengerjaan] = useState(selectedOrder?.status_pengerjaan || 'diproses')
  const [inputNoResi, setInputNoResi] = useState(selectedOrder?.no_resi || '')

  // 1. LIVE MONITORING SISI CS (Mendengarkan Update dari Kepala Produksi)
  useEffect(() => {
    const eventSource = new EventSource('/api/realtime')

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        if (message.event === 'notification.status_changed') {
          const { id_order, status_baru, pesan } = message.data

          // Perbarui daftar antrean CS secara live saat Kepala Produksi merubah status kain
          setOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === id_order ? { ...o, status_pengerjaan: status_baru } : o
            )
          )

          // Memunculkan info ke CS bahwa ada tugas produksi yang selesai
          Swal.fire({
            title: 'Info Produksi Baru!',
            text: pesan,
            icon: 'success',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000
          })
        }
      } catch (err) {
        console.error("Gagal membaca update realtime produksi:", err)
      }
    }

    return () => eventSource.close()
  }, [])

  // 2. SINKRONISASI BADGE: Menandai Notifikasi Dibaca Saat Pesanan Diklik CS
  const handleSelectOrder = async (order) => {
    setSelectedOrderId(order.id)
    setInputStatusPengerjaan(order.status_pengerjaan)
    setInputNoResi(order.no_resi || '')

    if (order.notification_id) {
      try {
        await fetch('/api/notifikasi', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.notification_id }),
        })
      } catch (err) {
        console.error("Gagal sinkronisasi badge notifikasi:", err)
      }
    }
  }

  const totalBayar = selectedOrder
    ? selectedOrder.items.reduce((sum, item) => sum + item.harga * item.qty, 0)
    : 0

  const filteredOrders = orders.filter(order =>
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSimpanPerubahanStatus = (e) => {
    e.preventDefault()

    if (inputStatusPengerjaan === 'dikirim' && !inputNoResi.trim()) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Mohon isi nomor resi pengiriman terlebih dahulu jika status diganti menjadi dikirim.',
        icon: 'warning',
        confirmButtonColor: '#1A335A',
      })
      return
    }

    Swal.fire({
      title: 'Simpan Perubahan?',
      text: `Apakah Anda ingin memperbarui status pengerjaan untuk order ${selectedOrder.id}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Perbarui!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === selectedOrder.id 
            ? { ...o, status_pengerjaan: inputStatusPengerjaan, no_resi: inputStatusPengerjaan === 'dikirim' ? inputNoResi : '' } 
            : o
          )
        )

        Swal.fire({
          title: 'Berhasil Diperbarui!',
          text: 'Status pengerjaan kain lurik berhasil disimpan. Pelanggan kini dapat melihat update di akun mereka.',
          icon: 'success',
          confirmButtonColor: '#1A335A',
        })
      }
    })
  }

  return (
    <div className="flex flex-col min-h-screen gap-6 p-6 bg-gray-50 lg:flex-row">
      
      {/* KIRI: MONITORING ANTRIAN PRODUKSI & PENGIRIMAN */}
      <div className="flex flex-col flex-1 p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
        <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1A335A] flex items-center gap-2">
              <ShoppingBag size={22} /> Validasi Produksi & Resi (Lunas)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Memproses pesanan masuk yang status pembayarannya telah terverifikasi sukses.</p>
          </div>

          {/* Pencarian */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute w-4 h-4 text-gray-400 top-2.5 left-3" />
            <input
              type="text"
              placeholder="Cari nama / ID order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 pr-4 pl-10 w-full text-xs rounded-lg border border-gray-200 outline-none transition-all focus:border-[#1A335A] focus:ring-1 focus:ring-[#1A335A]"
            />
          </div>
        </div>

        {/* Tabel Antrean */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-semibold text-gray-600 border-b border-gray-100 bg-gray-50">
                <th className="p-3">ID Pesanan (Paid)</th>
                <th className="p-3">Nama Pembeli</th>
                <th className="p-3">Status Pembayaran</th>
                <th className="p-3">Status Alur Kain</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => handleSelectOrder(order)}
                  className={`cursor-pointer transition-colors ${
                    selectedOrderId === order.id ? 'bg-[#1A335A]/5 font-medium' : 'hover:bg-gray-50/50'
                  }`}
                >
                  <td className="p-3 font-mono font-bold text-gray-700">{order.id}</td>
                  <td className="p-3 text-gray-800">
                    <div>{order.customer}</div>
                    <div className="text-[10px] text-gray-400">{order.tgl}</div>
                  </td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Berhasil
                    </span>
                  </td>
                  <td className="p-3">
                    {order.status_pengerjaan === 'dikirim' ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        <Truck size={12} /> Dikirim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        <Package size={12} /> Diproses ATBM
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-[#1A335A] hover:text-white transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KANAN: FORM UPDATE PROGRESS (DIKENDALIKAN OLEH CS) */}
      <div className="w-full lg:w-96 shrink-0">
        {selectedOrder ? (
          <div className="sticky top-6 bg-white rounded-xl border border-gray-100 shadow-md p-4 flex flex-col h-[calc(100vh-5rem)]">
            
            {/* Header Profil */}
            <div className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-gray-400">{selectedOrder.id}</span>
                <span className="text-[10px] text-gray-500">{selectedOrder.tgl}</span>
              </div>
              <h2 className="mt-1 text-base font-bold text-gray-800">{selectedOrder.customer}</h2>
              <p className="text-xs text-gray-500">{selectedOrder.telpon}</p>
            </div>

            {/* Form Kontrol Progress untuk CS */}
            <form onSubmit={handleSimpanPerubahanStatus} className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
              <h3 className="text-xs font-bold text-[#1A335A] uppercase tracking-wider">Update Alur Pengerjaan Kain</h3>
              
              {/* Radio Group Status */}
              <div>
                <label className="block text-[11px] text-gray-500 font-medium mb-1.5">Pilih Status Sekarang:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setInputStatusPengerjaan('diproses'); setInputNoResi(''); }}
                    className={`p-2 text-xs rounded-lg font-bold border flex items-center justify-center gap-1 ${
                      inputStatusPengerjaan === 'diproses'
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <Package size={14} /> Diproses
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputStatusPengerjaan('dikirim')}
                    className={`p-2 text-xs rounded-lg font-bold border flex items-center justify-center gap-1 ${
                      inputStatusPengerjaan === 'dikirim'
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <Truck size={14} /> Dikirim
                  </button>
                </div>
              </div>

              {/* Input Nomor Resi */}
              {inputStatusPengerjaan === 'dikirim' && (
                <div className="space-y-1 animate-fadeIn">
                  <label className="block text-[11px] text-gray-600 font-bold">Input Nomor Resi Logistik:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: REG-ATBM-XXXXX"
                    value={inputNoResi}
                    onChange={(e) => setInputNoResi(e.target.value)}
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg outline-none uppercase font-mono font-bold bg-white focus:border-blue-500"
                  />
                </div>
              )}

              {/* Tombol Simpan Aksi CS */}
              <button
                type="submit"
                className="w-full mt-2 bg-[#1A335A] text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Save size={13} /> Simpan Perubahan Status
              </button>
            </form>

            {/* List Item Barang */}
            <div className="mt-4 text-xs font-semibold text-gray-500">Daftar Item Belanja:</div>
            <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-2 border border-gray-100 rounded-lg bg-gray-50/50">
                  <img src={item.image} alt={item.nama} className="object-cover w-10 h-10 bg-white border border-gray-200 rounded shrink-0" />
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-800 truncate">{item.nama}</h4>
                    <div className="flex items-center justify-between mt-0.5 text-[10px] text-gray-500">
                      <span>{item.qty} Pcs / Gulung</span>
                      <span className="font-bold text-[#1A335A]">Rp {item.harga.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Ringkasan */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total Transaksi</span>
              <span className="text-base font-bold text-[#1A335A]">Rp {totalBayar.toLocaleString('id-ID')}</span>
            </div>
            
          </div>
        ) : (
          <div className="sticky p-8 text-center text-gray-400 bg-white border border-gray-100 top-6 rounded-xl">
            Pilih salah satu transaksi lunas untuk mengelola pengiriman.
          </div>
        )}
      </div>

    </div>
  )
}