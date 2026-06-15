"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const fetchKeranjang = async () => {
    try {
      const res = await fetch('/api/keranjang')
      const json = await res.json()
      setCartItems(json.data || [])
      
      const cekUser = json.data?.some(item => item.user_id !== null)
      setIsLoggedIn(cekUser)
    } catch (err) {
      console.error("Gagal memuat keranjang", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeranjang()
  }, [])

  const handleHapusItem = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Kain?',
      text: 'Apakah Anda yakin ingin mengeluarkan kain ini dari keranjang?',
      icon: 'question',
      showCancelButton: true,
      background: '#1A1917', color: '#F9F6F0',
      confirmButtonColor: '#E5BA73', cancelButtonColor: '#444',
      confirmButtonText: 'Ya, Hapus', cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/keranjang?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          Swal.fire({ title: 'Terhapus', icon: 'success', timer: 1000, showConfirmButton: false, background: '#1A1917', color: '#F9F6F0' })
          fetchKeranjang()
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Swal.fire({
        title: 'Keranjang Kosong',
        text: 'Silakan pilih kain lurik pilihan Anda terlebih dahulu.',
        icon: 'warning',
        background: '#1A1917', color: '#F9F6F0', confirmButtonColor: '#E5BA73'
      })
      return
    }

    if (!isLoggedIn) {
      await Swal.fire({
        title: 'Perlu Akun Member',
        text: 'Untuk melanjutkan checkout aman, silakan masuk ke akun Anda terlebih dahulu.',
        icon: 'info',
        background: '#1A1917', color: '#F9F6F0',
        confirmButtonColor: '#E5BA73', confirmButtonText: 'Login Sekarang',
        showCancelButton: true, // Berfungsi normal
        cancelButtonText: 'Kembali', cancelButtonColor: '#444'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/auth/login?redirectTo=/cart')
        }
      })
      return
    }

    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1917] flex items-center justify-center text-[#E5BA73]">
        Membuka Ruang Keranjang Biyo Lurik...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1917] p-8 text-[#F9F6F0]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-8 text-[#E5BA73] tracking-wide border-b border-[#333230] pb-4">
          Keranjang Belanja
        </h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-[#232220] rounded-2xl border border-[#333230]">
            <p className="text-gray-400 mb-4">Belum ada gulungan kain di keranjang Anda.</p>
            <button onClick={() => router.push('/produk')} className="border border-[#E5BA73] text-[#E5BA73] px-6 py-2 rounded-lg text-sm hover:bg-[#E5BA73] hover:text-[#1A1917] transition-all">
              Lihat Koleksi Produk
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="p-5 bg-[#232220] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center border border-[#333230] hover:border-[#444340] transition-all gap-4">
                <div className="flex items-center gap-4">
                  {item.gulungan?.produk?.gambar_url && (
                    <img src={item.gulungan.produk.gambar_url} alt="Kain" className="w-16 h-16 object-cover rounded-lg border border-[#444]" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-[#E5BA73]">{item.gulungan?.produk?.kode_produk || "Kain Premium Biyo"}</h3>
                    <p className="text-xs text-gray-400">No. Gulungan: {item.gulungan?.nomor_gulungan} | Lebar: {item.gulungan?.lebar}m</p>
                    <p className="text-sm mt-1 text-gray-300 font-medium">{item.jumlah_order} Meter</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                  <p className="font-semibold text-xl text-[#F9F6F0]">
                    Rp {(item.gulungan?.harga_per_meter * item.jumlah_order).toLocaleString('id-ID')}
                  </p>
                  <button onClick={() => handleHapusItem(item.id)} className="text-red-400 text-xs hover:underline bg-transparent border-none cursor-pointer">
                    Hapus Kain
                  </button>
                </div>
              </div>
            ))}

            <div className="pt-6 border-t border-[#333230] mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Pembayaran Estimasi:</p>
                <p className="text-2xl font-bold text-[#E5BA73]">
                  Rp {cartItems.reduce((acc, item) => acc + (item.gulungan?.harga_per_meter * item.jumlah_order), 0).toLocaleString('id-ID')}
                </p>
              </div>
              <button onClick={handleCheckout} className="w-full sm:w-auto bg-[#E5BA73] text-[#1A1917] px-10 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-xl tracking-wider">
                Lanjutkan ke Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}