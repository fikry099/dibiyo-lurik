import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

// =====================================================
// PATCH: Update Nominal Harga Per Meter & Lebar Kain
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID harga wajib diisi' }, { status: 400 })
    }

    const body = await request.json()
    const harga = parseFloat(body.harga_per_meter)
    const lebarBaru = parseInt(body.lebar)

    // Validasi Harga
    if (body.harga_per_meter === undefined || isNaN(harga) || harga < 0) {
      return NextResponse.json({ message: 'Harga per meter tidak valid' }, { status: 400 })
    }

    // Validasi Lebar
    if (body.lebar === undefined || ![70, 110].includes(lebarBaru)) {
      return NextResponse.json({ message: 'Lebar kain harus 70 atau 110 cm' }, { status: 400 })
    }

    // 1. Ambil data saat ini untuk mengecek apakah lebar memang berubah
    const { data: currentData, error: currentError } = await supabaseAdmin
      .from('daftar_harga')
      .select('jenis_pewarna, motif_id, lebar')
      .eq('id', id)
      .single()

    if (currentError || !currentData) {
      return NextResponse.json({ message: 'Data harga tidak ditemukan' }, { status: 404 })
    }

    // 2. Jika lebar diubah, cek dulu apakah kombinasi baru ini sudah dimiliki data/baris lain
    if (currentData.lebar !== lebarBaru) {
      let queryCek = supabaseAdmin
        .from('daftar_harga')
        .select('id')
        .eq('jenis_pewarna', currentData.jenis_pewarna)
        .eq('lebar', lebarBaru)
        .neq('id', id) // Jangan cek data diri sendiri

      if (currentData.motif_id === null) {
        queryCek = queryCek.is('motif_id', null)
      } else {
        queryCek = queryCek.eq('motif_id', currentData.motif_id)
      }

      const { data: duplikat } = await queryCek.maybeSingle()
      if (duplikat) {
        return NextResponse.json({ 
          message: 'Gagal update! Kombinasi aturan harga dengan lebar tersebut sudah ada di tabel.' 
        }, { status: 409 })
      }
    }

    // 3. Proses Update Data Aman
    const { data, error } = await supabaseAdmin
      .from('daftar_harga')
      .update({ 
        harga_per_meter: harga,
        lebar: lebarBaru,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, jenis_pewarna, lebar, harga_per_meter, motif:motif_id(id, nama)')
      .single()

    if (error) throw error

    return NextResponse.json({ data, message: 'Harga dan lebar berhasil diperbarui' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// DELETE: Tetap Sama Sesuai Kode Anda Sebelumnya
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID harga wajib diisi' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('daftar_harga')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({
          message: 'Gagal menghapus! Aturan harga ini sedang terikat pada relasi data transaksi atau modul lain.'
        }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ message: 'Aturan harga berhasil dihapus' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Gagal menghapus data harga: ' + err.message }, { status: 500 })
  }
}