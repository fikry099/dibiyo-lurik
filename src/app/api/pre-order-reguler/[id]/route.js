import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

function localCalculateItemSubtotal(panjang, jumlah, hargaPerMeter) {
  return Number(panjang || 0) * Number(jumlah || 0) * Number(hargaPerMeter || 0);
}

async function localLookupHargaPerMeter(jenisPewarna, motifId, lebar) {
  const { data: hargaData } = await supabaseAdmin
    .from('daftar_harga')
    .select('harga_per_meter')
    .eq('jenis_pewarna', jenisPewarna)
    .eq('motif_id', motifId)
    .eq('lebar', Number(lebar))
    .maybeSingle();

  return hargaData ? Number(hargaData.harga_per_meter) : 0;
}

async function localRecalculateTotalPOR(poId) {
  const { data: items } = await supabaseAdmin
    .from('item_pre_order_reguler')
    .select('subtotal')
    .eq('pre_order_reguler_id', poId);

  const sumItems = (items || []).reduce((acc, curr) => acc + Number(curr.subtotal || 0), 0);

  const { data: header } = await supabaseAdmin
    .from('pre_order_reguler')
    .select('diskon')
    .eq('id', poId)
    .single();

  const diskon = header ? Number(header.diskon || 0) : 0;
  const totalHarga = Math.max(0, sumItems - (sumItems * (diskon / 100)));

  await supabaseAdmin
    .from('pre_order_reguler')
    .update({ total_harga: totalHarga })
    .eq('id', poId);
}

// =====================================================
// GET - Ambil Detail Single Pre-Order Reguler Berdasarkan ID
// =====================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('pre_order_reguler')
      .select(`
        id, 
        nama_customer, 
        kontak_customer, 
        alamat_customer, 
        tanggal_selesai, 
        status, 
        metode_pembayaran, 
        status_pembayaran, 
        status_pengambilan,
        total_dp, 
        diskon, 
        total_harga, 
        catatan,
        created_at,
        updated_at,
        items:item_pre_order_reguler(
          id,
          jumlah,
          panjang,
          lebar,
          harga_per_meter,
          subtotal,
          jenis_pewarna,
          produk_id,
          produk:produk(
            id,
            gambar_url,
            kode_produk
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: 'Data Pre-Order Reguler tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// =====================================================
// PATCH - Update Field Umum & Sinkronisasi Items POR (Mengikuti Logika POC)
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

    const body = await request.json();

    // 1. Ekstrak data untuk tabel induk (Menghapus kontrol langsung status produksi agar tidak ter-overwrite)
    const allowedFields = [
      'nama_customer',
      'kontak_customer',
      'alamat_customer',
      'tanggal_selesai',
      'metode_pembayaran',
      'status_pembayaran',
      'status_pengambilan', // Digunakan untuk konfirmasi penerimaan barang oleh CS
      'total_dp',
      'diskon',
      'catatan'
    ];

    const updateData = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === 'nama_customer' && typeof body[key] === 'string') {
          updateData[key] = body[key].trim();
        } else if (['metode_pembayaran', 'status_pembayaran', 'status_pengambilan'].includes(key) && body[key] !== null) {
          updateData[key] = body[key].toString().toLowerCase();
        } else if (['total_dp', 'diskon'].includes(key)) {
          updateData[key] = Number(body[key] || 0);
        } else {
          updateData[key] = body[key];
        }
      }
    }

    updateData.updated_at = new Date().toISOString();

    // Jalankan update data induk pre_order_reguler
    const { error: poError } = await supabaseAdmin
      .from('pre_order_reguler')
      .update(updateData)
      .eq('id', id);

    if (poError) throw poError;

    // 2. PROSES SINKRONISASI ITEMS POR
    if (body.items && Array.isArray(body.items)) {
      // Ambil data item yang saat ini tersimpan di DB
      const { data: currentDbItems, error: fetchItemsError } = await supabaseAdmin
        .from('item_pre_order_reguler')
        .select('id')
        .eq('pre_order_reguler_id', id);

      if (fetchItemsError) throw fetchItemsError;

      // Filter item yang dihapus oleh user dari form/modal frontend
      const incomingIds = body.items.filter(i => i.id).map(i => i.id);
      const idsToDelete = currentDbItems
        .filter(dbItem => !incomingIds.includes(dbItem.id))
        .map(dbItem => dbItem.id);

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabaseAdmin
          .from('item_pre_order_reguler')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) throw deleteError;
      }

      // Pisahkan Data Baru (Insert) & Data Lama (Update) serta hitung ulang subtotal dan harga_per_meter secara dinamis
      const itemsToInsert = [];
      const itemsToUpdate = [];

      for (const item of body.items) {
        const { data: produk } = await supabaseAdmin
          .from('produk')
          .select('id, jenis_pewarna, motif_id')
          .eq('id', item.produk_id)
          .maybeSingle();

        if (!produk) throw new Error(`Produk tidak ditemukan untuk ID: ${item.produk_id}`);

        // Ambil harga per meter terbaru dari master daftar_harga
        const hargaPerMeter = await localLookupHargaPerMeter(produk.jenis_pewarna, produk.motif_id, item.lebar);
        if (hargaPerMeter === 0) throw new Error(`Harga untuk kain dengan lebar ${item.lebar} belum diset di master daftar harga.`);

        const subtotalItem = localCalculateItemSubtotal(item.panjang, item.jumlah, hargaPerMeter);

        const payload = {
          pre_order_reguler_id: id,
          produk_id: item.produk_id,
          lebar: Number(item.lebar),
          panjang: Number(item.panjang),
          jumlah: Number(item.jumlah),
          harga_per_meter: hargaPerMeter,
          subtotal: subtotalItem,
          jenis_pewarna: produk.jenis_pewarna
        };

        if (item.id) {
          payload.id = item.id;
          itemsToUpdate.push(payload);
        } else {
          itemsToInsert.push(payload);
        }
      }

      // Eksekusi Insert item baru jika ada
      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('item_pre_order_reguler')
          .insert(itemsToInsert);

        if (insertError) throw insertError;
      }

      // Eksekusi Upsert item lama yang diedit jika ada
      if (itemsToUpdate.length > 0) {
        const { error: upsertError } = await supabaseAdmin
          .from('item_pre_order_reguler')
          .upsert(itemsToUpdate);

        if (upsertError) throw upsertError;
      }
    }

    // 3. Hitung ulang total_harga akhir setelah perubahan item/diskon selesai dilakukan
    await localRecalculateTotalPOR(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Pre-Order Reguler beserta item spesifikasinya berhasil diperbarui' 
    }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ message: 'Gagal update: ' + err.message }, { status: 500 });
  }
}

// =====================================================
// DELETE - Hapus Data Pre-Order Reguler Beserta Items-nya
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ message: 'ID wajib diisi' }, { status: 400 });

    // Hapus item-item terlebih dahulu demi konsistensi data sebelum menghapus record induk
    const { error: itemsError } = await supabaseAdmin
      .from('item_pre_order_reguler')
      .delete()
      .eq('pre_order_reguler_id', id);

    if (itemsError) throw itemsError;

    const { error: poError } = await supabaseAdmin
      .from('pre_order_reguler')
      .delete()
      .eq('id', id);

    if (poError) throw poError;

    return NextResponse.json({ 
      success: true, 
      message: 'Pre-Order Reguler beserta seluruh item spesifikasinya berhasil dihapus' 
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Gagal hapus: ' + err.message }, { status: 500 });
  }
}