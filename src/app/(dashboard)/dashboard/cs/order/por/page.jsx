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

const updateProductField = (index, field, value) => {
  const newItems = [...orderData.items];
  newItems[index] = { ...newItems[index], [field]: value };

  // Ambil motif_id dari item produk yang bersangkutan
  const currentMotifId = newItems[index].motif_id || newItems[index].motif?.id;

  // Logika cari harga otomatis wajib menyertakan motif_id agar sinkron dengan API Backend
  if (field === "lebar" || field === "jenis_pewarna") {
    const targetLebar = field === "lebar" ? Number(value) : Number(newItems[index].lebar);
    const targetPewarna = field === "jenis_pewarna" ? value : newItems[index].jenis_pewarna;

    const found = daftarHarga.find(
      (d) =>
        Number(d.lebar) === targetLebar &&
        d.jenis_pewarna === targetPewarna &&
        d.motif_id === currentMotifId // <-- KUNCI DI SINI
    );
    
    newItems[index].harga = found ? parseFloat(found.harga_per_meter) : 0;
  }

  // Kalkulasi total per item
  newItems[index].totalHargaItem =
    (newItems[index].harga || 0) *
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
      <div className="relative p-6 bg-[#5AE3ED1C] border shadow-sm rounded-lg">
        <button
          onClick={() => router.push("/dashboard/cs/order")}
          className="absolute flex items-center gap-2 px-3 py-1 text-sm font-medium transition-all bg-[#1A335A] border border-[#1A335A] rounded-xl top-4 right-4 text-[#f7efe9] hover:bg-[#264982]"
        >
          <CornerDownLeft size={16} /> kembali
        </button>
        <h2 className="mb-4 font-semibold text-stone-700">Data Customer</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-black">
              Nama Customer
            </label>
            <input
              placeholder="Nama Customer"
              value={customer.nama}
              className="w-full p-2 bg-[#F1E9E987] text-black border rounded-lg border-[#1A335A] "
              onChange={(e) =>
                setCustomer({ ...customer, nama: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-black">
              No Telpon
            </label>
            <input
              placeholder="No Telpon"
              value={customer.telpon}
              className="w-full p-2 bg-[#F1E9E987] text-black border rounded-lg border-[#1A335A]"
              onChange={(e) =>
                setCustomer({ ...customer, telpon: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-black">
              Tanggal Pre-Order Reguler
            </label>
            <input
              type="date"
              value={customer.tgl}
              className="w-full p-2 bg-[#F1E9E987] text-black border rounded-lg border-[#1A335A]"
              onChange={(e) =>
                setCustomer({ ...customer, tgl: e.target.value })
              }
            />
          </div>
          <div className="col-span-1 space-y-1 md:col-span-3">
            <label className="text-xs font-semibold text-black">
              Alamat
            </label>
            <textarea
              placeholder="Alamat lengkap..."
              value={customer.alamat}
              className="w-full h-20 p-2 bg-[#F1E9E987] text-black border rounded-lg border-[#1A335A]"
              onChange={(e) =>
                setCustomer({ ...customer, alamat: e.target.value })
              }
            />
          </div>
        </div>
        {/* Data Produk */}

       <div className="p-6 bg-[#5AE3ED1C] border shadow-sm rounded-lg mt-3">
  <h2 className="mb-4 font-semibold text-stone-700">Data Produk</h2>
  {orderData.items.map((item, index) => ( // Pastikan menggunakan 'item'
    <div
      key={index}
      className="relative flex flex-col md:flex-row items-center gap-4 p-4 mb-4 bg-[#F1E9E987] border border-[#1A335A] rounded-xl"
    >
      <button
        onClick={() => removeItem(index)}
        className="absolute text-black transition-colors top-2 right-2 hover:text-red-600"
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
            <p className="text-xs text-gray-500">Kode Produksi</p>
            <p className="text-sm font-bold text-black">{item.kode_produk}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Kategori</p>
            <p className="text-sm font-semibold text-black">{item.kategori?.nama || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Motif</p>
            <p className="text-sm font-semibold text-black">{item.motif?.nama || "-"}</p>
          </div>
        </div>

        {/* Kolom 2: Pastikan binding input ke item, bukan product */}
        <div className="flex flex-wrap items-center flex-1 gap-4 border-t md:border-t-0 md:border-l border-[#1A335A]/20 pt-4 md:pt-0 md:pl-4">
          
          <div className="w-32">
            <p className="text-xs text-black">Lebar Kain</p>
            <select
              className="w-full p-2 bg-[#5AE3ED1C] text-black rounded-md border-b border-[#1A335A] outline-none text-sm"
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
            <p className="text-xs text-black">Jenis Pewarna</p>
            <select
              className="w-full p-2 bg-[#5AE3ED1C] text-black rounded-md border-b border-[#1A335A] outline-none text-sm"
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
        <p className="text-xs text-black">Jumlah Order</p>
        <div className="flex items-center bg-[#5AE3ED1C] text-black rounded-md border border-[#1A335A] w-24">
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
        <p className="text-xs text-black">Panjang (m)</p>
        <input
          type="number"
          value={item.panjang || ""}
          className="w-full p-1.5 border bg-[#5AE3ED1C] text-black rounded-md border-[#1A335A] text-sm"
          onChange={(e) => updateProductField(index, "panjang", parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* Total Harga */}
      <div className="flex-1 min-w-[120px]">
        <p className="text-xs text-black">Total Harga</p>
        <input
          disabled
          value={`Rp ${(item.totalHargaItem || 0).toLocaleString()}`}
          className="w-full p-2 border bg-[#5AE3ED1C] text-black rounded-md border-[#1A335A] text-xs font-bold"
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
          className="w-full mt-4 py-4 border-2 border-dashed border-[#1A335A]/50 rounded-xl text-[#1A335A] font-semibold hover:bg-[#1A335A]/10 transition-all"
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
        className="w-full py-4 bg-[#F2B600] text-white rounded-xl font-bold text-lg hover:bg-[#d7a201]"
      >
        Lanjut Pembayaran
      </button>
    </div>
  );
}
