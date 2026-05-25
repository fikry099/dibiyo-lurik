import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET() {
  try {
    const [regResult, cusResult] = await Promise.all([
      supabaseAdmin.from('pre_order_reguler').select('id, nomor_po, nama_customer, status_pembayaran, status, created_at, items:item_pre_order_reguler(jumlah)').order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('pre_order_custom').select('id, nomor_po, nama_customer, status_pembayaran, status, created_at').order('created_at', { ascending: false }).limit(5),
    ])

    const reguler = (regResult.data || []).map((row) => ({
      id_preorder: row.nomor_po,
      nama_pelanggan: row.nama_customer,
      qty: (row.items || []).reduce((sum, item) => sum + (Number(item.jumlah) || 0), 0),
      jenis: 'Reguler',
      status_pembayaran: row.status_pembayaran === 'lunas' ? 'Lunas' : 'DP',
      tanggal_pemesanan: row.created_at,
      status_order: row.status === 'selesai' ? 'Selesai' : row.status === 'sedang_diproses' ? 'Sedang Diproses' : 'Belum diproses',
    }))

    const custom = (cusResult.data || []).map((row) => ({
      id_preorder: row.nomor_po,
      nama_pelanggan: row.nama_customer,
      qty: '-',
      jenis: 'Custom',
      status_pembayaran: row.status_pembayaran === 'lunas' ? 'Lunas' : 'DP',
      tanggal_pemesanan: row.created_at,
      status_order: row.status === 'selesai' ? 'Selesai' : row.status === 'sedang_diproses' ? 'Sedang Diproses' : 'Belum diproses',
    }))

    const combined = [...reguler, ...custom]
      .sort((a, b) => new Date(b.tanggal_pemesanan) - new Date(a.tanggal_pemesanan))
      .slice(0, 5)

    return NextResponse.json(combined)
  } catch (err) {
    return NextResponse.json([], { status: 500 })
  }
}