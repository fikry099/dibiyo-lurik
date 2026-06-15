import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import supabaseAdmin from '@/lib/supabase-admin';
import crypto from 'crypto';

<<<<<<< HEAD
// Helper internal untuk memeriksa identitas (Member vs Guest)
async function dapatkanIdentitasUser(cookieStore) {
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  let guestSessionId = cookieStore.get('guest_session_id')?.value;

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  );

  if (accessToken) {
    await supabaseAuth.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });
  }

  const { data: { session } } = await supabaseAuth.auth.getSession();
  
  if (session?.user) {
    return { userId: session.user.id, sessionId: null };
  }

  if (!guestSessionId) {
    guestSessionId = crypto.randomUUID();
    cookieStore.set('guest_session_id', guestSessionId, {
      maxAge: 60 * 60 * 24 * 7, // Aktif 7 hari
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return { userId: null, sessionId: guestSessionId };
}

// GET: Ambil isi keranjang (Semua data terfilter)
export const GET = async () => {
  try {
    const cookieStore = await cookies();
    const { userId, sessionId } = await dapatkanIdentitasUser(cookieStore);

    let query = supabaseAdmin
=======
// =====================================================
// GET: Mengambil daftar isi keranjang belanja
// =====================================================
export const GET = async (request) => {
  try {
    // AMBIL USER ID dari Header atau Sesi Cookie Anda
    // const userId = ... 

    // 🌟 KOMENTAR DI DALAM .SELECT() SUDAH DIHAPUS AGAR TIDAK SYNTAX ERROR 🌟
    const { data, error } = await supabaseAdmin
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de
      .from('cart')
      .select(`
        id,
        jumlah_order,
        user_id,
<<<<<<< HEAD
        session_id,
=======
        is_custom,          
        konfigurasi,        
        custom_metadata,    
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de
        gulungan:gulungan_id (
          id, 
          nomor_gulungan, 
          lebar, 
          panjang_total,
          panjang_sisa, 
          harga_per_meter,
          produk:produk_id (
            id, 
            kode_produk, 
            gambar_url, 
            motif:motif_id(nama), 
            kategori:kategori_id(nama)
          )
        )
<<<<<<< HEAD
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
=======
      `)
      // .eq('user_id', userId) // <--- Aktifkan ini jika sistem auth sudah siap
      .order('created_at', { ascending: false });
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de

    if (error) throw error;
    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN GET CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

<<<<<<< HEAD
// POST: Tambah item ke keranjang (Akumulasi otomatis)
export const POST = async (request) => {
  try {
    const cookieStore = await cookies();
    const { userId, sessionId } = await dapatkanIdentitasUser(cookieStore);
    const { gulungan_id, jumlah_order } = await request.json();
=======
// =====================================================
// POST: Memasukkan item regular atau kustom ke keranjang
// =====================================================
export const POST = async (request) => {
  try {
    const body = await request.json();
    const { 
      gulungan_id, 
      jumlah_order, 
      user_id, 
      is_custom,       
      konfigurasi,     
      custom_metadata  
    } = body;
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de

    if (!is_custom && !gulungan_id) {
      return NextResponse.json({ message: 'Gulungan ID wajib diisi untuk produk regular toko.' }, { status: 400 });
    }

<<<<<<< HEAD
    let checkQuery = supabaseAdmin.from('cart').select('id, jumlah_order');
    if (userId) {
      checkQuery = checkQuery.eq('user_id', userId).eq('gulungan_id', gulungan_id);
    } else {
      checkQuery = checkQuery.eq('session_id', sessionId).eq('gulungan_id', gulungan_id);
    }
=======
    const { data, error } = await supabaseAdmin
      .from('cart')
      .insert({
        gulungan_id: is_custom ? null : gulungan_id, 
        jumlah_order: jumlah_order || 1,
        user_id: user_id, 
        is_custom: is_custom || false,               
        konfigurasi: is_custom ? konfigurasi : null, 
        custom_metadata: is_custom ? custom_metadata : null, 
        created_at: new Date().toISOString()
      })
      .select();
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de

    const { data: itemLama, error: errorCek } = await checkQuery.maybeSingle();
    if (errorCek) throw errorCek;

    let hasil;

    if (itemLama) {
      const totalMeterBaru = itemLama.jumlah_order + (jumlah_order || 1);
      const { data: dataUpdate, error: errorUpdate } = await supabaseAdmin
        .from('cart')
        .update({ jumlah_order: totalMeterBaru })
        .eq('id', itemLama.id)
        .select();
      
      if (errorUpdate) throw errorUpdate;
      hasil = dataUpdate;
    } else {
      const { data: dataInsert, error: errorInsert } = await supabaseAdmin
        .from('cart')
        .insert({
          gulungan_id,
          jumlah_order: jumlah_order || 1,
          user_id: userId,
          session_id: sessionId,
          created_at: new Date().toISOString()
        })
        .select();

      if (errorInsert) throw errorInsert;
      hasil = dataInsert;
    }

<<<<<<< HEAD
    return NextResponse.json({ 
      message: 'Berhasil menambahkan item ke keranjang',
      data: hasil 
    }, { status: 201 });

=======
    return NextResponse.json({ message: 'Berhasil', data }, { status: 201 });
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

<<<<<<< HEAD
// DELETE: Hapus item dari keranjang
export const DELETE = async (request) => {
  try {
    const cookieStore = await cookies();
    const { userId, sessionId } = await dapatkanIdentitasUser(cookieStore);

=======
// =====================================================
// DELETE: Hapus item dari keranjang 
// =====================================================
export const DELETE = async (request) => {
  try {
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de
    const { searchParams } = new URL(request.url);
    let itemId = searchParams.get("id");

    if (!itemId) {
      try {
        const body = await request.json();
        itemId = body.id || body.cartId || body.gulungan_id;
      } catch (e) {}
    }

    if (!itemId) {
<<<<<<< HEAD
      return NextResponse.json({ message: "ID item wajib dikirim" }, { status: 400 });
=======
      console.error("[DELETE CART ERROR] Frontend tidak mengirimkan ID item yang akan dihapus.");
      return NextResponse.json(
        { message: "ID item wajib dikirim (bisa via query ?id= atau body JSON)" },
        { status: 400 } 
      );
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de
    }

    let deleteQuery = supabaseAdmin.from('cart').delete().eq('id', itemId);
    if (userId) {
      deleteQuery = deleteQuery.eq('user_id', userId);
    } else {
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    }

<<<<<<< HEAD
    const { error } = await deleteQuery;
=======
    const { error } = await supabaseAdmin
      .from('cart')
      .delete()
      .eq('id', itemId);
>>>>>>> eca003598b2f15875843057edbe0eeee74b422de

    if (error) {
      console.error("=== SUPABASE ERROR IN DELETE CART ===", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Item berhasil dihapus dari keranjang' }, { status: 200 });

  } catch (err) {
    console.error("=== SERVER CRASH IN DELETE CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};