import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET - list PO custom
// =====================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const filterStatus = searchParams.get('status');
    const filterPembayaran = searchParams.get('status_pembayaran');
    let query = supabaseAdmin
      .from('pre_order_custom')
      .select(`
        id, 
        nama_customer, 
        kontak_customer, 
        alamat_customer,
        tanggal_selesai, 
        status, 
        metode_pembayaran, 
        status_pembayaran, 
        total_dp, 
        diskon, 
        total_harga, 
        catatan,
        created_at,
        item_pre_order_custom (
          id,
          lebar,
          panjang,
          jumlah,
          harga_per_meter,
          subtotal,
          gambar_custom
        )
      `, { count: 'exact' });

    if (filterStatus) query = query.eq('status', filterStatus);
    if (filterPembayaran) query = query.eq('status_pembayaran', filterPembayaran);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      meta: { 
        total: count, 
        page, 
        limit 
      }
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// =====================================================
// POST - create PO custom & its detail items (WITH MULTIPLE IMAGES PER ITEM)
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json();

    // LOG DEBUG 1: Melihat data mentah yang dikirim oleh frontend
    console.log("=== [DEBUG PO CUSTOM] DATA MASUK FROM FRONTEND ===");
    console.log(JSON.stringify(body, null, 2));

    // 1. Validasi data utama wajib diisi
    if (!body.nama_customer || !body.metode_pembayaran || !body.status_pembayaran) {
      console.log("❌ [DEBUG PO CUSTOM] Gagal Validasi: Data utama tidak lengkap.");
      return NextResponse.json({ message: 'Data wajib diisi tidak lengkap' }, { status: 400 });
    }

    // 2. Validasi minimal harus ada 1 item yang didaftarkan
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.log("❌ [DEBUG PO CUSTOM] Gagal Validasi: Array items kosong atau tidak valid.");
      return NextResponse.json({ message: 'Gagal: Pre-Order custom harus memiliki minimal 1 item produk' }, { status: 400 });
    }

    console.log("🚀 [DEBUG PO CUSTOM] Menjalankan TAHAP 1: Insert tabel pre_order_custom...");
    
    // TAHAP 1: Masukkan data utama ke tabel 'pre_order_custom' (Tanpa kolom gambar_custom)
    const { data: poCustom, error: poError } = await supabaseAdmin
      .from('pre_order_custom')
      .insert({
        nama_customer: body.nama_customer.trim(),
        kontak_customer: body.kontak_customer || null,
        alamat_customer: body.alamat_customer || null,
        tanggal_selesai: body.tanggal_selesai || null, 
        metode_pembayaran: body.metode_pembayaran.toString().toLowerCase(),
        status_pembayaran: body.status_pembayaran.toString().toLowerCase(),
        status: body.status ? body.status.toString().toLowerCase() : 'dalam_proses',
        total_dp: Number(body.nominal_bayar || body.total_dp || 0), 
        diskon: Number(body.diskon || 0),
        total_harga: Number(body.total_harga || 0),
        catatan: body.catatan || null,
      })
      .select()
      .single();

    if (poError) {
      console.error("❌ [DEBUG PO CUSTOM] ERROR TAHAP 1 (pre_order_custom):", poError);
      throw poError;
    }

    console.log("✅ [DEBUG PO CUSTOM] TAHAP 1 Berhasil. ID PO Baru:", poCustom.id);
    console.log("🚀 [DEBUG PO CUSTOM] Menjalankan TAHAP 2: Mapping items...");

    // TAHAP 2: Mapping Items (Sekarang gambar disimpan per item)
    const preparedItems = body.items.map((item) => {
      return {
        pre_order_custom_id: poCustom.id,
        lebar: Number(item.lebar),
        panjang: Number(item.panjang),
        jumlah: Number(item.jumlah || item.qty || 1),
        harga_per_meter: Number(item.harga_per_meter || item.hargaPerMeter || 0),
        subtotal: Number(item.subtotal || item.totalHargaItem || 0),
        gambar_custom: item.image || null // <-- URL Gambar dari upload state frontend dimasukkan ke sini
      };
    });

    console.log("📋 [DEBUG PO CUSTOM] Hasil Mapping Items siap insert:");
    console.log(JSON.stringify(preparedItems, null, 2));

    console.log("🚀 [DEBUG PO CUSTOM] Menjalankan TAHAP 3: Bulk Insert ke item_pre_order_custom...");

    // TAHAP 3: Simpan seluruh item secara massal (Bulk Insert) ke 'item_pre_order_custom'
    const { error: itemsError } = await supabaseAdmin
      .from('item_pre_order_custom')
      .insert(preparedItems);

    if (itemsError) {
      console.error("❌ [DEBUG PO CUSTOM] ERROR TAHAP 3 (item_pre_order_custom):", itemsError);
      console.log("🧹 [DEBUG PO CUSTOM] Menjalankan Rollback: Menghapus kembali data induk ID:", poCustom.id);
      
      // Rollback data induk jika detail gagal disisipkan agar data tidak menggantung/yatim
      await supabaseAdmin.from('pre_order_custom').delete().eq('id', poCustom.id);
      throw itemsError;
    }

    console.log("🎉 [DEBUG PO CUSTOM] SEMUA TAHAP BERHASIL!");

    return NextResponse.json({ 
      data: {
        ...poCustom,
        items: preparedItems
      }, 
      message: 'Berhasil menyimpan Pre-Order Custom beserta item produksinya.' 
    }, { status: 201 });

  } catch (err) {
    console.error("💥 [DEBUG PO CUSTOM] GLOBAL CATCH ERROR STACK TRACE:");
    console.error(err);

    return NextResponse.json({ 
      message: 'Gagal: ' + err.message,
      debug_details: err 
    }, { status: 500 });
  }
}