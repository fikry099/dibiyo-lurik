import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import supabaseAdmin from '@/lib/supabase-admin';
import crypto from 'crypto';

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
      .from('cart')
      .select(`
        id,
        jumlah_order,
        user_id,
        session_id,
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
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("=== SUPABASE ERROR IN GET CART ===", error);
      throw error;
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("=== SERVER CRASH IN GET CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// POST: Tambah item ke keranjang (Akumulasi otomatis)
export const POST = async (request) => {
  try {
    const cookieStore = await cookies();
    const { userId, sessionId } = await dapatkanIdentitasUser(cookieStore);
    const { gulungan_id, jumlah_order } = await request.json();

    if (!gulungan_id) {
      return NextResponse.json({ message: 'Gulungan ID wajib diisi' }, { status: 400 });
    }

    let checkQuery = supabaseAdmin.from('cart').select('id, jumlah_order');
    if (userId) {
      checkQuery = checkQuery.eq('user_id', userId).eq('gulungan_id', gulungan_id);
    } else {
      checkQuery = checkQuery.eq('session_id', sessionId).eq('gulungan_id', gulungan_id);
    }

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

    return NextResponse.json({ 
      message: 'Berhasil menambahkan item ke keranjang',
      data: hasil 
    }, { status: 201 });

  } catch (err) {
    console.error("=== SERVER CRASH IN POST CART ===", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
};

// DELETE: Hapus item dari keranjang
export const DELETE = async (request) => {
  try {
    const cookieStore = await cookies();
    const { userId, sessionId } = await dapatkanIdentitasUser(cookieStore);

    const { searchParams } = new URL(request.url);
    let itemId = searchParams.get("id");

    if (!itemId) {
      try {
        const body = await request.json();
        itemId = body.id || body.cartId || body.gulungan_id;
      } catch (e) {}
    }

    if (!itemId) {
      return NextResponse.json({ message: "ID item wajib dikirim" }, { status: 400 });
    }

    let deleteQuery = supabaseAdmin.from('cart').delete().eq('id', itemId);
    if (userId) {
      deleteQuery = deleteQuery.eq('user_id', userId);
    } else {
      deleteQuery = deleteQuery.eq('session_id', sessionId);
    }

    const { error } = await deleteQuery;

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