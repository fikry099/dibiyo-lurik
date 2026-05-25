// /api/kategori/[id]/route.js
import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { checkFKReferences, formatFKErrorMessage } from '@/lib/crud-helper'

// =====================================================
// PATCH: Update Kategori Berdasarkan ID
// =====================================================
export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID kategori wajib diisi' }, { status: 400 })
    }

    const body = await request.json()
    const nama = body.nama?.trim()

    // Validasi input nama
    if (!nama) {
      return NextResponse.json({ message: 'Nama kategori wajib diisi' }, { status: 400 })
    }
    if (nama.length > 255) {
      return NextResponse.json({ message: 'Nama kategori terlalu panjang (maksimal 255 karakter)' }, { status: 400 })
    }

    // Eksekusi update langsung ke Supabase
    const { data, error } = await supabaseAdmin
      .from('kategori')
      .update({ nama })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Handle jika nama kategori kembar (Unique Constraint Error)
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Nama kategori sudah ada' }, { status: 409 })
      }
      throw error
    }

    if (!data) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ data, message: 'Kategori berhasil diupdate' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}

// =====================================================
// DELETE: Hapus Kategori Berdasarkan ID
// =====================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ message: 'ID kategori wajib diisi' }, { status: 400 })
    }

    // Cek apakah kategori ini masih dipakai oleh tabel produk (Foreign Key Check)
    const fkResult = await checkFKReferences(id, [
      { table: 'produk', column: 'kategori_id', label: 'produk' },
    ])
    
    if (fkResult.used) {
      return NextResponse.json({ message: formatFKErrorMessage(fkResult.usedIn) }, { status: 409 })
    }

    // Eksekusi hapus data
    const { error } = await supabaseAdmin
      .from('kategori')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Kategori berhasil dihapus' }, { status: 200 })

  } catch (err) {
    return NextResponse.json({ message: 'Internal Server Error: ' + err.message }, { status: 500 })
  }
}