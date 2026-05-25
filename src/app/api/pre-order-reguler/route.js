import { NextResponse } from 'next/server';
import {
  lookupHargaPerMeter,
  calculateItemSubtotal,
  recalculateTotalPOR,
} from '@/lib/preorder-helper';
import supabaseAdmin from '@/lib/supabase-admin';

// =====================================================
// GET - list PO reguler (Tanpa nomor_po dan created_by)
// =====================================================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const filterStatus = searchParams.get('status');
  const filterPembayaran = searchParams.get('status_pembayaran');

  let query = supabaseAdmin
    .from('pre_order_reguler')
    .select(`
      id, nama_customer, kontak_customer, tanggal_selesai, status, 
      metode_pembayaran, status_pembayaran, total_dp, diskon, total_harga, 
      created_at
    `, { count: 'exact' });

  if (filterStatus) query = query.eq('status', filterStatus);
  if (filterPembayaran) query = query.eq('status_pembayaran', filterPembayaran);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, meta: { total: count, page, limit } });
}

// =====================================================
// POST - create PO reguler (Tanpa Auth)
// =====================================================
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Items wajib diisi' }, { status: 400 });
    }

    // 1. Insert header PO
    const { data: poHeader, error: headerErr } = await supabaseAdmin
      .from('pre_order_reguler')
      .insert({
        // created_by dihapus karena tidak memerlukan pengecekan auth
        nama_customer: body.nama_customer?.trim(),
        kontak_customer: body.kontak_customer || null,
        alamat_customer: body.alamat_customer || null,
        tanggal_selesai: body.tanggal_selesai || null,
        metode_pembayaran: body.metode_pembayaran,
        status_pembayaran: body.status_pembayaran,
        total_dp: Number(body.total_dp || 0),
        diskon: Number(body.diskon || 0),
        catatan: body.catatan || null,
        total_harga: 0,
        status: 'dalam_proses',
      })
      .select()
      .single();

    if (headerErr) throw new Error(headerErr.message);

    // 2. Process items
    const itemsToInsert = [];
    for (const item of body.items) {
      const { data: produk } = await supabaseAdmin
        .from('produk')
        .select('id, jenis_pewarna, motif_id')
        .eq('id', item.produk_id)
        .maybeSingle();

      if (!produk) throw new Error(`Produk tidak ditemukan: ${item.produk_id}`);

      const hargaPerMeter = await lookupHargaPerMeter(produk.jenis_pewarna, produk.motif_id, item.lebar);
      
      if (hargaPerMeter === 0) throw new Error(`Harga untuk ${produk.jenis_pewarna} ${item.lebar}cm belum diset`);

      itemsToInsert.push({
        pre_order_reguler_id: poHeader.id,
        produk_id: item.produk_id,
        lebar: item.lebar,
        panjang: Number(item.panjang),
        jumlah: Number(item.jumlah),
        harga_per_meter: hargaPerMeter,
        subtotal: calculateItemSubtotal(item.panjang, item.jumlah, hargaPerMeter),
      });
    }

    const { error: itemsErr } = await supabaseAdmin
      .from('item_pre_order_reguler')
      .insert(itemsToInsert);

    if (itemsErr) throw new Error(itemsErr.message);

    // 3. Recalculate & Finalize
    await recalculateTotalPOR(poHeader.id);

    const { data: poComplete } = await supabaseAdmin
      .from('pre_order_reguler')
      .select(`*, items:item_pre_order_reguler(*)`)
      .eq('id', poHeader.id)
      .single();

    return NextResponse.json({ data: poComplete }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}