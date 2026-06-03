'use client';

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Box, CreditCard, Calendar, Plus, Trash2, Minus, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// =====================================================
// KONSTANTA STYLE & HELPER
// =====================================================
const LABEL = "block text-black font-medium mb-1";
const INPUT_CYAN = "w-full border border-[#1A335A] bg-[#5AE3ED1C] rounded-lg p-2 focus:outline-none";
const INPUT_WHITE = "w-full border border-[#1A335A] rounded-lg bg-white p-1.5 focus:outline-none";

const BACKDROP_STYLE = {
  backgroundColor: '#1A335A7A',
  backdropFilter: 'blur(2px)',
  WebkitBackdropFilter: 'blur(2px)',
};

const formatRibuan = (val) => (Number(String(val).replace(/\D/g, "")) || 0).toLocaleString("id-ID");
const parseRibuan = (str) => Number(String(str).replace(/\D/g, "")) || 0;

const itemKosong = () => ({
  id: Date.now() + Math.random(),
  id_produk: "",      
  nama_produk: "",    
  qty: 1,
  harga_satuan: 0,    
  isFromDb: false,
});

export default function PoRegulerEditModal({ 
  isOpen = false, 
  onClose = () => {}, 
  item = {}, 
  onRefresh = () => {} // 💡 SINKRON: Menggunakan nama onRefresh sesuai operan parent page.jsx
}) {
  const [masterProduk, setMasterProduk] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STATE DATA FORM ---
  const [customer, setCustomer] = useState({ nama_customer: "", kontak_customer: "", alamat_customer: "" });
  const [items, setItems] = useState([]);
  const [pembayaran, setPembayaran] = useState({ status_pembayaran: "dp", total_dp: 0, metode_pembayaran: "cash", diskon: 0 });
  const [produksi, setProduksi] = useState({ tanggal_selesai: "", status: "dalam_proses", catatan: "" });

  const [hargaLamaDariDb, setHargaLamaDariDb] = useState(0);
  const [dpLamaDariDb, setDpLamaDariDb] = useState(0);

  // --- Fetch Master Data Produk Reguler ---
  useEffect(() => {
    if (isOpen) {
      fetch("/api/produk-reguler")
        .then((res) => res.json())
        .then((res) => setMasterProduk(res.data || []))
        .catch((err) => console.error("Gagal ambil master produk reguler:", err));
    }
  }, [isOpen]);

  // --- Set Data Awal Dari Props Saat Modal Terbuka ---
  useEffect(() => {
    if (!isOpen || !item) return;

    setCustomer({
      nama_customer: item?.nama_customer || "",
      kontak_customer: item?.kontak_customer || "",
      alamat_customer: item?.alamat_customer || "",
    });

    const dbItems = item?.items || item?.item_pre_order_reguler || [];
    setItems(
      dbItems.length > 0
        ? dbItems.map((i) => ({
            id: i?.id,
            id_produk: i?.id_produk || i?.produk_id || "",
            nama_produk: i?.nama_produk || i?.produk?.nama_produk || "Kain Lurik",
            qty: Number(i?.jumlah || i?.qty || 1),
            harga_satuan: Number(i?.harga_satuan || i?.produk?.harga_jual || i?.produk?.harga || 0),
            isFromDb: true,
          }))
        : [itemKosong()]
    );

    const rawStatus = (item?.status_pembayaran || "dp").toLowerCase();
    setPembayaran({
      status_pembayaran: ["dp", "lunas"].includes(rawStatus) ? rawStatus : "dp",
      total_dp: Number(item?.total_dp || 0),
      metode_pembayaran: item?.metode_pembayaran?.toLowerCase() || "cash",
      diskon: Number(item?.diskon || 0),
    });

    setHargaLamaDariDb(Number(item?.total_harga || 0));
    setDpLamaDariDb(Number(item?.total_dp || 0));

    setProduksi({
      tanggal_selesai: item?.tanggal_selesai ? item.tanggal_selesai.split('T')[0] : "",
      status: item?.status || "dalam_proses",
      catatan: item?.catatan || "",
    });
  }, [isOpen, item]);

  if (!isOpen) return null;

  // =====================================================
  // KUMPULAN DERIVED VALUES (Kalkulasi Otomatis Aman)
  // =====================================================
  const hitungSubtotalItem = (it) => Number(it?.harga_satuan || 0) * Number(it?.qty || 1);

  const subTotalLama = items?.filter((i) => i.isFromDb).reduce((acc, c) => acc + hitungSubtotalItem(c), 0) || 0;
  const subTotalBaru = items?.filter((i) => !i.isFromDb).reduce((acc, c) => acc + hitungSubtotalItem(c), 0) || 0;
  const subTotal = subTotalLama + subTotalBaru;

  const nilaiDiskon = subTotalLama * (Number(pembayaran?.diskon || 0) / 100);
  const totalHargaAkhir = Math.max(0, subTotal - nilaiDiskon);
  const minDpRequired = totalHargaAkhir * 0.3;

  const isLunas = pembayaran?.status_pembayaran === "lunas";
  const isOriginallyLunas = item?.status_pembayaran?.toLowerCase() === "lunas";
  const isOriginallyDp = item?.status_pembayaran?.toLowerCase() === "dp";
  const hasNewItems = items?.some((i) => !i.isFromDb);

  const isDiskonLocked = isOriginallyLunas;
  const showSimpleLunasView = isOriginallyLunas && !hasNewItems;
  const isDpLocked = isOriginallyDp && !hasNewItems;

  const dibayarSebelumnya = isOriginallyLunas ? hargaLamaDariDb : dpLamaDariDb;
  const tagihanItemBaru = subTotalBaru;
  const minDpItemBaru = tagihanItemBaru * 0.3;

  const bayarSekarang = isLunas
    ? Math.max(0, totalHargaAkhir - dibayarSebelumnya)
    : hasNewItems
      ? (pembayaran?.total_dp > 0 ? pembayaran.total_dp : Math.ceil(minDpItemBaru))
      : pembayaran?.total_dp || 0;

  const dpFinal = isLunas
    ? totalHargaAkhir
    : hasNewItems
      ? dibayarSebelumnya + bayarSekarang
      : pembayaran?.total_dp || 0;

  const sisaTagihan = Math.max(0, totalHargaAkhir - dpFinal);

  const isDpInvalid =
    pembayaran?.status_pembayaran === "dp" &&
    (hasNewItems
      ? (bayarSekarang < minDpItemBaru || bayarSekarang > tagihanItemBaru)
      : (dpFinal < minDpRequired || dpFinal > totalHargaAkhir));

  const inputTerkunci = isLunas || (isDpLocked && !hasNewItems) || (!hasNewItems);

  // =====================================================
  // HANDLERS CHANGE & AKSI
  // =====================================================
  const updateItemReguler = (id, idProdukTerpilih) => {
    setItems((prev) =>
      prev.map((prodItem) => {
        if (prodItem.id !== id) return prodItem;

        const produkCocok = masterProduk.find((p) => String(p.id) === String(idProdukTerpilih));
        return {
          ...prodItem,
          id_produk: idProdukTerpilih,
          nama_produk: produkCocok ? produkCocok.nama_produk : "",
          harga_satuan: produkCocok ? Number(produkCocok.harga || produkCocok.harga_jual || 0) : 0,
        };
      })
    );
  };

  const updateQtyReguler = (id, newQty) => {
    setItems((prev) =>
      prev.map((prodItem) => (prodItem.id === id ? { ...prodItem, qty: Math.max(1, Number(newQty)) } : prodItem))
    );
  };

  const handleUpdateSubmit = async () => {
    if (!customer?.nama_customer) return Swal.fire("Peringatan", "Nama customer wajib diisi!", "warning");
    if (totalHargaAkhir <= 0) return Swal.fire("Peringatan", "Total harga transaksi tidak boleh Rp 0.", "warning");

    for (let i = 0; i < items.length; i++) {
      if (!items[i].id_produk) {
        return Swal.fire("Peringatan", `Item ke-${i + 1}: Produk kain reguler belum dipilih!`, "warning");
      }
    }

    if (pembayaran?.status_pembayaran === "dp") {
      if (hasNewItems) {
        if (bayarSekarang < minDpItemBaru) {
          return Swal.fire("Akses Ditolak", `Tambahan DP item baru minimal 30%: Rp ${Math.ceil(minDpItemBaru).toLocaleString("id-ID")}`, "error");
        }
        if (bayarSekarang > tagihanItemBaru) {
          return Swal.fire("Kesalahan Input", "DP penambahan item tidak boleh melebihi total harga item baru tersebut.", "error");
        }
      } else {
        if (dpFinal < minDpRequired) {
          return Swal.fire("Akses Ditolak", `Total DP minimal harus 30%: Rp ${Math.ceil(minDpRequired).toLocaleString("id-ID")}`, "error");
        }
      }
    }

    setLoading(true);
    try {
      const cleanItems = items.map((i) => ({
        id: i.isFromDb ? i.id : undefined,
        id_produk: i.id_produk,
        nama_produk: i.nama_produk,
        jumlah: Number(i.qty),
        harga_satuan: Number(i.harga_satuan),
        subtotal: hitungSubtotalItem(i),
      }));

      const response = await fetch(`/api/pre-order-reguler/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          status_pembayaran: pembayaran.status_pembayaran,
          metode_pembayaran: pembayaran.metode_pembayaran,
          diskon: pembayaran.diskon,
          total_dp: dpFinal,
          tanggal_selesai: produksi.tanggal_selesai ? new Date(produksi.tanggal_selesai).toISOString() : null,
          catatan: produksi.catatan,
          total_harga: totalHargaAkhir,
          items: cleanItems,
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.message || "Gagal menyimpan data modifikasi reguler");

      Swal.fire("Berhasil", "Perubahan order reguler aman tersimpan.", "success");
      onClose();
      onRefresh(); // 💡 SINKRON: Panggil sesuai prop terbaru
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const modalUI = (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 font-inter animate-in fade-in duration-200"
      style={BACKDROP_STYLE}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #1A335A transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #1A335A; border-radius: 10px; }
        .react-datepicker-wrapper { width: 100% !important; }
        .react-datepicker { font-family: 'Inter', sans-serif !important; border: 1px solid #1A335A !important; border-radius: 10px !important; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important; overflow: hidden; }
        .react-datepicker__header { background-color: #1A335A !important; border-bottom: 1px solid #1A335A !important; padding: 8px 0 !important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color: white !important; font-weight: 700 !important; }
        .react-datepicker__day-name { color: rgba(255,255,255,0.7) !important; }
        .react-datepicker__navigation-icon::before { border-color: white !important; }
        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected { background-color: #f2b600 !important; color: white !important; font-weight: bold !important; border-radius: 6px !important; }
        .react-datepicker__day:hover { background-color: #5AE3ED30 !important; border-radius: 6px !important; }
      `}} />

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-black tracking-wide">Pre-Order Reguler</h2>
          <button onClick={onClose} className="text-[#1A335A] hover:opacity-70 transition-opacity cursor-pointer">
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* SECTION 1: DATA CUSTOMER */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
              <User size={14} className="text-[#1A335A]" />
              <span>Data Customer</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div>
                <label className={LABEL}>Nama Customer</label>
                <input type="text" value={customer?.nama_customer || ""} onChange={(e) => setCustomer({ ...customer, nama_customer: e.target.value })} className={INPUT_CYAN} />
              </div>
              <div>
                <label className={LABEL}>No Telepon</label>
                <input type="text" value={customer?.kontak_customer || ""} onChange={(e) => setCustomer({ ...customer, kontak_customer: e.target.value })} className={INPUT_CYAN} />
              </div>
              <div>
                <label className={LABEL}>Tanggal Pre-Order</label>
                <input type="text" value={item?.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : ""} disabled className={`${INPUT_CYAN} text-gray-500 cursor-not-allowed`} />
              </div>
            </div>
            <div className="text-[11px]">
              <label className={LABEL}>Alamat</label>
              <textarea rows={2} value={customer?.alamat_customer || ""} onChange={(e) => setCustomer({ ...customer, alamat_customer: e.target.value })} className={`${INPUT_CYAN} resize-none`} />
            </div>
          </div>

          {/* SECTION 2: DATA PRODUK REGULER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1">
              <div className="flex items-center gap-2 text-xs font-bold text-black">
                <Box size={14} className="text-[#1A335A]" />
                <span>Data Produk Kain Reguler</span>
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => [...(prev || []), itemKosong()])}
                className="flex items-center gap-1 text-[10px] bg-[#1A335A] text-white px-3 py-1 rounded hover:bg-[#11223C] transition-all cursor-pointer"
              >
                <Plus size={12} /> Tambah Item Baru
              </button>
            </div>

            {items?.map((prodItem) => (
              <div key={prodItem?.id} className={`flex flex-row items-center gap-4 border rounded-xl p-4 relative group ${prodItem?.isFromDb ? "bg-[#5AE3ED1C] border-dashed border-[#1A335A]" : "bg-emerald-50/60 border-dashed border-emerald-400"}`}>

                {!prodItem?.isFromDb && (
                  <span className="absolute -top-2 left-3 bg-emerald-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">Item Baru</span>
                )}

                <div className="flex flex-1 flex-row items-end gap-3 text-[11px]">
                  <div className="flex-1 min-w-[200px]">
                    <label className={LABEL}>Pilih Kain Reguler (Katalog)</label>
                    <div className="relative">
                      <select 
                        value={prodItem?.id_produk || ""} 
                        onChange={(e) => updateItemReguler(prodItem.id, e.target.value)} 
                        disabled={prodItem?.isFromDb && isOriginallyLunas}
                        className={`${INPUT_WHITE} capitalize cursor-pointer pr-8 ${prodItem?.isFromDb && isOriginallyLunas ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300" : ""}`}
                      >
                        <option value="">-- Pilih Katalog Kain Ready --</option>
                        {masterProduk?.map((p) => (
                          <option key={p?.id} value={p?.id}>
                            {p?.nama_produk} (Rp {Number(p?.harga || p?.harga_jual || 0).toLocaleString("id-ID")})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col items-center flex-shrink-0">
                    <label className={`${LABEL} text-center w-full`}>Jumlah (Qty)</label>
                    <div className="flex items-center border border-[#1A335A] rounded-md bg-white h-8 overflow-hidden">
                      <button 
                        type="button" 
                        onClick={() => updateQtyReguler(prodItem.id, Math.max(1, (prodItem?.qty || 1) - 1))} 
                        className="px-2 text-[#1A335A] hover:bg-gray-100 h-full cursor-pointer"
                      >
                        <Minus size={10} strokeWidth={3} />
                      </button>
                      <span className="px-3 font-bold text-gray-800 text-xs min-w-[24px] text-center">
                        {prodItem?.qty || 1}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => updateQtyReguler(prodItem.id, (prodItem?.qty || 1) + 1)} 
                        className="px-2 text-[#1A335A] hover:bg-gray-100 h-full cursor-pointer"
                      >
                        <Plus size={10} strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <div className="w-28 flex-shrink-0">
                    <label className={`${LABEL} text-center`}>Harga Satuan</label>
                    <div className="w-full border border-gray-200 bg-gray-50 rounded-md p-1.5 text-center font-medium text-gray-600 text-xs shadow-sm">
                      Rp {Number(prodItem?.harga_satuan || 0).toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="w-32 flex-shrink-0">
                    <label className={`${LABEL} text-center font-semibold`}>Subtotal</label>
                    <div className="w-full border border-[#1A335A]/30 bg-white rounded-md p-1.5 text-center font-bold text-[#1A335A] text-xs shadow-sm">
                      Rp {hitungSubtotalItem(prodItem).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>

                {items?.length > 1 && (!prodItem?.isFromDb || (!isOriginallyLunas && pembayaran?.status_pembayaran !== "lunas")) && (
                  <button 
                    type="button" 
                    onClick={() => setItems((prev) => prev.filter((i) => i.id !== prodItem.id))} 
                    className="absolute -top-1.5 -right-1.5 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SECTION 3: DETAIL PEMBAYARAN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
              <CreditCard size={14} className="text-[#1A335A]" />
              <span>Detail Pembayaran</span>
            </div>

            {hasNewItems && (isOriginallyLunas || isOriginallyDp) && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px]">
                <span className="font-bold flex items-center gap-1 text-amber-700">⚠️ Penambahan Item Reguler Baru</span>
                <p className="text-amber-900 mt-1">
                  {isOriginallyLunas
                    ? <>Transaksi sebelumnya sudah dinyatakan <strong>LUNAS</strong> (Rp {dibayarSebelumnya.toLocaleString("id-ID")}). Penambahan item kain baru diperlakukan sebagai porsi tagihan tersendiri: pilih opsi <strong>Lunas</strong> untuk eksekusi bayar penuh, atau <strong>DP</strong> minimal 30% dari total item baru.</>
                    : <>Penerimaan dana DP yang sudah masuk (Rp {dibayarSebelumnya.toLocaleString("id-ID")}) dipertahankan di basis data. Item baru memerlukan penyesuaian: pilih opsi <strong>Lunas</strong> untuk melunasi seluruh kekurangan kontrak, atau sesuaikan penambahan <strong>DP</strong> baru minimal 30% dari harga item baru.</>}
                </p>
                <div className="mt-2 flex items-baseline justify-between bg-white border border-amber-200 rounded-md px-3 py-2">
                  <span className="text-[10px] text-gray-500 font-medium">Subtotal Harga Item Baru</span>
                  <span className="text-sm font-black text-emerald-700">Rp {tagihanItemBaru.toLocaleString("id-ID")}</span>
                </div>
              </div>
            )}

            <div className="bg-[#5AE3ED1C] border border-[#1A335A]/20 rounded-xl p-5 space-y-4 text-[11px]">
              {showSimpleLunasView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="p-3 bg-white border border-[#1A335A]/20 rounded-lg shadow-sm">
                    <span className="block text-black font-medium mb-1">Metode Pembayaran</span>
                    <span className="text-xs font-bold text-gray-800 capitalize">{pembayaran?.metode_pembayaran || "cash"}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm space-y-1.5">
                    <div className="flex justify-between text-gray-500 text-[10px]">
                      <span>Subtotal: Rp {subTotal.toLocaleString("id-ID")}</span>
                      <span className="text-emerald-700 font-medium">Diskon: {pembayaran?.diskon || 0}%</span>
                    </div>
                    <hr className="border-emerald-200" />
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="block text-emerald-600 font-medium text-[9px]">Status</span>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">LUNAS</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-gray-400 text-[9px]">Total Nilai Kontrak</span>
                        <span className="text-xs font-black text-gray-800">Rp {totalHargaAkhir.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-black font-semibold mb-1">Status Pembayaran</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        disabled={isDpLocked}
                        onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "dp" })}
                        className={`py-2 rounded-lg font-bold text-center text-xs border transition-all cursor-pointer ${
                          pembayaran?.status_pembayaran === "dp" ? "bg-[#1A335A] text-white border-[#1A335A] shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        } ${isDpLocked ? "bg-gray-100 text-gray-700 border-gray-300 !cursor-not-allowed shadow-none" : ""}`}
                      >
                        {isDpLocked ? "DP (Sudah Dibayar)" : "DP (Uang Muka)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPembayaran({ ...pembayaran, status_pembayaran: "lunas" })}
                        className={`py-2 rounded-lg font-bold text-center text-xs border transition-all cursor-pointer ${
                          isLunas ? "bg-[#1A335A] text-white border-[#1A335A] shadow-sm" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Lunas
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-black font-semibold mb-1">
                      {isLunas
                        ? "Dibayar Sekarang (Pelunasan)"
                        : hasNewItems
                          ? "Nominal Tambahan DP Item Baru"
                          : "Total DP"}
                    </label>
                    <div className={`flex rounded-lg border overflow-hidden px-3 py-2.5 items-center bg-white transition-colors ${isDpInvalid ? "border-red-400" : isLunas ? "border-emerald-300 bg-emerald-50/40" : "border-[#1A335A]"}`}>
                      <span className="text-gray-500 text-xs mr-2 font-medium">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        name="nominal-dp-reguler"
                        autoComplete="off"
                        data-lpignore="true"
                        value={formatRibuan(bayarSekarang)}
                        disabled={inputTerkunci}
                        onChange={(e) => setPembayaran({ ...pembayaran, total_dp: parseRibuan(e.target.value) })}
                        className={`nominal-input w-full bg-transparent focus:outline-none text-sm font-bold tracking-wide ${inputTerkunci ? (isLunas ? "text-emerald-700 cursor-not-allowed" : "text-gray-600 cursor-not-allowed") : "text-gray-900"}`}
                      />
                    </div>

                    {pembayaran?.status_pembayaran === "dp" && hasNewItems && (
                      <span className={`text-[10px] block mt-1 ${bayarSekarang < minDpItemBaru ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                        * Batas DP item baru minimal 30%: <strong>Rp {Math.ceil(minDpItemBaru).toLocaleString("id-ID")}</strong>, maksimal nominal penuh senilai <strong>Rp {tagihanItemBaru.toLocaleString("id-ID")}</strong>.
                      </span>
                    )}

                    {pembayaran?.status_pembayaran === "dp" && (
                      <div className="flex justify-between items-center mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-[10px]">
                        <span className="text-red-700 font-medium">Sisa Kekurangan yang Belum Dibayar:</span>
                        <span className="font-black text-red-600 text-xs">Rp {sisaTagihan.toLocaleString("id-ID")}</span>
                      </div>
                    )}

                    {isLunas && hasNewItems && (
                      <div className="flex justify-between items-center mt-2 bg-emerald-50 border border-emerald-300 rounded-lg p-2 text-[10px]">
                        <span className="text-emerald-800 font-bold flex items-center gap-1">💰 Total Kas Masuk Saat Ini:</span>
                        <span className="font-black text-emerald-700 text-xs bg-white border border-emerald-300 rounded px-2 py-0.5">Rp {bayarSekarang.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 relative">
                      <label className="block text-black font-semibold mb-1">Metode Pembayaran</label>
                      <div className="relative">
                        <select value={pembayaran?.metode_pembayaran || "cash"} onChange={(e) => setPembayaran({ ...pembayaran, metode_pembayaran: e.target.value })} className="w-full border border-[#1A335A] bg-white rounded-lg p-2.5 pr-10 focus:outline-none text-gray-700 appearance-none text-xs cursor-pointer">
                          <option value="cash">Cash</option>
                          <option value="transfer">Transfer</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#1A335A]">
                          <ChevronDown size={14} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-black font-semibold mb-1">Diskon</label>
                      <input
                        type="text"
                        value={pembayaran?.diskon ? `${pembayaran.diskon}%` : ""}
                        placeholder="0%"
                        disabled={isDiskonLocked}
                        onChange={(e) => setPembayaran({ ...pembayaran, diskon: Number(e.target.value.replace("%", "")) || 0 })}
                        className={`w-full border rounded-lg p-2.5 text-center focus:outline-none font-medium text-xs ${isDiskonLocked ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed" : "border-[#1A335A] bg-white"}`}
                      />
                      {isDiskonLocked && (
                        <span className="text-[9px] text-gray-400 block mt-1 leading-tight">Terkunci (Sudah Lunas)</span>
                      )}
                    </div>

                    <div className="md:col-span-5">
                      <label className="block text-black font-semibold mb-1">Rincian Nilai Nota</label>
                      <div className="bg-white border border-[#1A335A] rounded-lg p-3 space-y-1.5 text-[11px] shadow-sm">
                        <div className="flex justify-between text-gray-500"><span>Subtotal Produk</span><span className="font-semibold text-gray-700">Rp {subTotal.toLocaleString("id-ID")}</span></div>
                        <div className="flex justify-between text-gray-500">
                          <span>{hasNewItems ? "Diskon (Item Lama)" : "Diskon"}</span>
                          <span className="font-semibold text-gray-700">{pembayaran?.diskon || 0}% (- Rp {nilaiDiskon.toLocaleString("id-ID")})</span>
                        </div>
                        {hasNewItems && (
                          <div className="flex justify-between text-gray-500"><span>Tambahan Item Baru (Penuh)</span><span className="font-semibold text-gray-700">Rp {subTotalBaru.toLocaleString("id-ID")}</span></div>
                        )}
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-gray-900 font-bold pt-0.5"><span>Total Akhir Kontrak</span><span>Rp {totalHargaAkhir.toLocaleString("id-ID")}</span></div>

                        {hasNewItems && (
                          <>
                            <hr className="border-dashed border-gray-200" />
                            <div className="flex justify-between text-emerald-600 font-medium">
                              <span>Dana Masuk Sebelumnya</span>
                              <span>- Rp {dibayarSebelumnya.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-medium">
                              <span>Kas Masuk Hari Ini</span>
                              <span>- Rp {bayarSekarang.toLocaleString("id-ID")}</span>
                            </div>
                            <div className={`flex justify-between font-bold p-1 rounded ${sisaTagihan > 0 ? "text-red-600 bg-red-50/50" : "text-emerald-700 bg-emerald-50/50"}`}>
                              <span>{sisaTagihan > 0 ? "Sisa Piutang" : "Kondisi Pembayaran"}</span>
                              <span>{sisaTagihan > 0 ? `Rp ${sisaTagihan.toLocaleString("id-ID")}` : "LUNAS"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SECTION 4: ESTIMASI & STATUS PRODUKSI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
                <Calendar size={14} className="text-[#1A335A]" />
                <span>Estimasi Pengambilan / Ready</span>
              </div>
              <div>
                <label className={LABEL}>Tanggal Estimasi Selesai</label>
                <div className="relative flex items-center">
                  <Calendar size={14} className="absolute left-3 text-[#A47352] pointer-events-none z-10" />
                  <DatePicker
                    selected={produksi?.tanggal_selesai ? new Date(produksi.tanggal_selesai) : null}
                    onChange={(date) => {
                      if (date) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, "0");
                        const dd = String(date.getDate()).padStart(2, "0");
                        setProduksi({ ...produksi, tanggal_selesai: `${yyyy}-${mm}-${dd}` });
                      } else {
                        setProduksi({ ...produksi, tanggal_selesai: "" });
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Pilih Tanggal Selesai"
                    className="w-full border border-[#A47352] bg-[#FFE176] rounded-lg py-2 pl-9 pr-3 focus:outline-none font-bold text-black text-xs cursor-pointer text-left"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-black border-b pb-1">
                <Box size={14} className="text-[#1A335A]" />
                <span>Status Pemrosesan</span>
              </div>
              <div>
                <label className={LABEL}>Status Pengadaan / Jahit</label>
                <div className="w-full bg-gray-100 border border-gray-300 text-gray-700 font-bold rounded-lg p-2.5 text-xs capitalize">
                 {produksi?.status ? produksi.status.replace(/_/g, " ") : "Belum diproses"}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: CATATAN */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-black border-b pb-1">Catatan Tambahan</label>
            <textarea rows={3} value={produksi?.catatan || ""} onChange={(e) => setProduksi({ ...produksi, catatan: e.target.value })} className={`${INPUT_CYAN} text-[11px] resize-none`} placeholder="Tambahkan instruksi potong kain atau kemasan khusus produk reguler di sini..." />
          </div>

          {/* SUBMIT BUTTON */}
          <button type="button" disabled={loading} onClick={handleUpdateSubmit} className="w-full py-3 bg-[#f2b600] hover:bg-[#d9a300] text-white rounded-lg font-bold text-xs transition-all tracking-wide shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {loading ? "Menyimpan Perubahan Nota..." : "Simpan Perubahan Nota"}
          </button>

        </div>
      </div>
    </div>
  );

  return createPortal(modalUI, document.body);
}