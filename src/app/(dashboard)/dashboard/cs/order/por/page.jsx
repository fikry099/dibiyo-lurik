"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, CornerDownLeft, X } from "lucide-react";
import { useOrderStore } from "../../../../../store/useOrderStore";
import ProductSelectionModal from "../../../../../components/cs/produk/ProductSelectionModal";

export default function AddPreOrderReguler() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  const product = orderData.items[0];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [customer, setCustomer] = useState(
    orderData?.customer || {
      nama: "",
      telpon: "",
      tgl: "",
      alamat: "",
    },
  );

  useEffect(() => {
    setOrderData({ ...orderData, customer });
  }, [customer]);

  // Tambahkan di dalam fungsi komponen
  const [daftarHarga, setDaftarHarga] = useState([]);

  useEffect(() => {
    fetch("/api/daftar-harga")
      .then((res) => res.json())
      .then((res) => setDaftarHarga(res.data))
      .catch((err) => console.error("Gagal ambil daftar harga:", err));
  }, []);

  // Fungsi bantu untuk mencari harga dari daftarHarga
  const getHargaPerMeter = () => {
    // Sesuaikan logika pencarian sesuai struktur data daftarHarga Anda
    const found = daftarHarga.find((item) => item.lebar == "70"); // Contoh jika lebar fix 70
    return found ? found.harga_per_meter : 0;
  };

  const updateQty = (val) => {
    const harga = getHargaPerMeter();
    const newQty = Math.max(1, (product.qty || 1) + val);

    const updatedItems = [
      {
        ...product,
        harga: harga, // Pastikan harga disimpan di item
        qty: newQty,
        totalHargaItem: harga * (product.panjang || 0) * newQty,
      },
    ];
    setOrderData({ ...orderData, items: updatedItems });
  };

  const updatePanjang = (val) => {
    const harga = getHargaPerMeter();
    const newPanjang = Math.max(0, val);

    const updatedItems = [
      {
        ...product,
        harga: harga,
        panjang: newPanjang,
        totalHargaItem: harga * newPanjang * (product.qty || 1),
      },
    ];
    setOrderData({ ...orderData, items: updatedItems });
  };

  const handleAddItems = (newSelectedProducts) => {
    const newItems = [
      ...orderData.items,
      ...newSelectedProducts.map((p) => ({
        ...p,
        qty: 1,
        panjang: 0,
        totalHargaItem: 0,
      })),
    ];
    setOrderData({ ...orderData, items: newItems });
  };

  // 1. Fungsi Update yang menerima index
  const updateProductField = (index, field, value) => {
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Logika cari harga otomatis saat lebar/jenis berubah
    if (field === "lebar" || field === "jenis_pewarna") {
      const found = daftarHarga.find(
        (d) =>
          d.lebar === (field === "lebar" ? value : newItems[index].lebar) &&
          d.jenis_pewarna ===
            (field === "jenis_pewarna" ? value : newItems[index].jenis_pewarna),
      );
      newItems[index].harga = found ? parseFloat(found.harga_per_meter) : 0;
    }

    // Kalkulasi total
    newItems[index].totalHargaItem =
      newItems[index].harga *
      (newItems[index].panjang || 0) *
      (newItems[index].qty || 1);

    setOrderData({ ...orderData, items: newItems });
  };

  const removeItem = (index) => {
    // Pastikan setidaknya tersisa 1 item agar tidak kosong total
    if (orderData.items.length > 1) {
      const newItems = orderData.items.filter((_, i) => i !== index);
      setOrderData({ ...orderData, items: newItems });
    } else {
      alert("Minimal harus ada satu item dalam order.");
    }
  };

  if (!product)
    return <div className="p-10 text-center">Data produk tidak ditemukan.</div>;

  return (
    <div className="w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Pre-Order Reguler</h1>
      </div>

      {/* Data Customer */}
      <div className="relative p-6 bg-[#E3C2AC59] border shadow-sm rounded-2xl border-stone-200">
        <button
          onClick={() => router.push("/dashboard/cs/order")}
          className="absolute flex items-center gap-2 px-3 py-1 text-sm font-medium transition-all bg-[#A47352] border border-[#A47352] rounded-xl top-4 right-4 text-[#f7efe9] hover:bg-[#a7704bc7]"
        >
          <CornerDownLeft size={16} /> kembali
        </button>
        <h2 className="mb-4 font-semibold text-stone-700">Data Customer</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">
              Nama Customer
            </label>
            <input
              placeholder="Nama Customer"
              value={customer.nama}
              className="w-full p-2 bg-[#E3C2AC59] border rounded-lg border-[#A47352]"
              onChange={(e) =>
                setCustomer({ ...customer, nama: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">
              No Telpon
            </label>
            <input
              placeholder="No Telpon"
              value={customer.telpon}
              className="w-full p-2 bg-[#E3C2AC59] border rounded-lg border-[#A47352]"
              onChange={(e) =>
                setCustomer({ ...customer, telpon: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600">
              Tanggal Pre-Order Reguler
            </label>
            <input
              type="date"
              value={customer.tgl}
              className="w-full p-2 bg-[#E3C2AC59] border rounded-lg border-[#A47352]"
              onChange={(e) =>
                setCustomer({ ...customer, tgl: e.target.value })
              }
            />
          </div>
          <div className="col-span-1 space-y-1 md:col-span-3">
            <label className="text-xs font-semibold text-stone-600">
              Alamat
            </label>
            <textarea
              placeholder="Alamat lengkap..."
              value={customer.alamat}
              className="w-full h-20 p-2 bg-[#E3C2AC59] border rounded-lg border-[#A47352]"
              onChange={(e) =>
                setCustomer({ ...customer, alamat: e.target.value })
              }
            />
          </div>
        </div>
        {/* Data Produk */}

       <div className="p-6 bg-[#E3C2AC59] border shadow-sm rounded-2xl border-stone-200 mt-3">
  <h2 className="mb-4 font-semibold text-stone-700">Data Produk</h2>
  {orderData.items.map((item, index) => ( // Pastikan menggunakan 'item'
    <div
      key={index}
      className="relative flex flex-col md:flex-row items-center gap-4 p-4 mb-4 bg-[#E3C2AC59] border border-[#A47352] rounded-xl"
    >
      <button
        onClick={() => removeItem(index)}
        className="absolute transition-colors top-2 right-2 text-stone-500 hover:text-red-600"
      >
        <X size={16} />
      </button>

      {/* Gambar Produk: GUNAKAN item.gambar_url BUKAN product.gambar_url */}
      <img
        src={item.gambar_url} 
        className="object-cover w-32 h-32 border rounded-lg border-stone-300"
      />

      <div className="flex flex-col items-center flex-1 gap-6 md:flex-row">
        {/* Kolom 1: Gunakan item.kode_produk, dsb */}
        <div className="flex flex-col gap-2 min-w-[150px]">
          <div>
            <p className="text-xs text-stone-500">Kode Produksi</p>
            <p className="text-sm font-bold">{item.kode_produk}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Kategori</p>
            <p className="text-sm font-semibold">{item.kategori?.nama || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-stone-500">Motif</p>
            <p className="text-sm font-semibold">{item.motif?.nama || "-"}</p>
          </div>
        </div>

        {/* Kolom 2: Pastikan binding input ke item, bukan product */}
        <div className="flex flex-wrap items-center flex-1 gap-4 border-t md:border-t-0 md:border-l border-[#A47352]/20 pt-4 md:pt-0 md:pl-4">
          
          <div className="w-32">
            <p className="text-xs text-stone-500">Lebar Kain</p>
            <select
              className="w-full p-2 bg-[#E3C2AC59] rounded-md border-b border-[#A47352] outline-none text-sm"
              value={item.lebar || ""}
              onChange={(e) => updateProductField(index, "lebar", Number(e.target.value))}
            >
              <option value="">Pilih Lebar</option>
              {[...new Set(daftarHarga.map((d) => d.lebar))].map((lebar) => (
                <option key={lebar} value={lebar}>{lebar} cm</option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <p className="text-xs text-stone-500">Jenis Pewarna</p>
            <select
              className="w-full p-2 bg-[#E3C2AC59] rounded-md border-b border-[#A47352] outline-none text-sm"
              value={item.jenis_pewarna || ""}
              onChange={(e) => updateProductField(index, "jenis_pewarna", e.target.value)}
              disabled={!item.lebar}
            >
              <option value="">Pilih Jenis</option>
              {daftarHarga
                .filter((d) => d.lebar == item.lebar)
                .map((d) => (
                  <option key={d.id} value={d.jenis_pewarna}>{d.jenis_pewarna}</option>
                ))}
            </select>
          </div>

                  {/* Jumlah Order */}
      <div>
        <p className="text-xs text-stone-500">Jumlah Order</p>
        <div className="flex items-center bg-[#E3C2AC59] rounded-md border border-[#A47352] w-24">
          <button onClick={() => updateProductField(index, "qty", Math.max(1, (item.qty || 1) - 1))} className="px-2 py-2.5">
            <Minus size={12} />
          </button>
          <span className="flex-1 text-xs text-center">{item.qty || 1}</span>
          <button onClick={() => updateProductField(index, "qty", (item.qty || 1) + 1)} className="px-2 py-2">
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Panjang (m) */}
      <div className="w-24">
        <p className="text-xs text-stone-500">Panjang (m)</p>
        <input
          type="number"
          value={item.panjang || ""}
          className="w-full p-1.5 border bg-[#E3C2AC59] rounded-md border-[#A47352] text-sm"
          onChange={(e) => updateProductField(index, "panjang", parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* Total Harga */}
      <div className="flex-1 min-w-[120px]">
        <p className="text-xs text-stone-500">Total Harga</p>
        <input
          disabled
          value={`Rp ${(item.totalHargaItem || 0).toLocaleString()}`}
          className="w-full p-2 border bg-[#E3C2AC59] rounded-md border-[#A47352] text-xs font-bold"
        />
      </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Tombol Tambah Item */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-4 py-4 border-2 border-dashed border-[#A47352]/50 rounded-xl text-[#A47352] font-semibold hover:bg-[#A47352]/10 transition-all"
        >
          + Tambah Item
        </button>

        <ProductSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddItems={handleAddItems}
        />
      </div>

      <button
        onClick={() => router.push("/dashboard/cs/order/por/pembayaran")}
        className="w-full py-4 bg-[#8B5E3C] text-white rounded-xl font-bold text-lg hover:bg-[#724d31]"
      >
        Lanjut Pembayaran
      </button>
    </div>
  );
}
