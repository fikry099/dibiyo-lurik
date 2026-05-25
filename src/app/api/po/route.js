import { NextResponse } from 'next/server';
import supabaseAdmin from '@/lib/supabase-admin';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tipePO = searchParams.get('tipe') || 'reguler';
  
  const isCustom = tipePO === 'custom';
  const table = isCustom ? 'pre_order_custom' : 'pre_order_reguler';
  
  const relationTable = isCustom ? 'item_pre_order_custom' : 'item_pre_order_reguler';
  
  const qtyColumn = 'jumlah'; 

  const { data, error } = await supabaseAdmin
    .from(table)
    .select(`*, ${relationTable}(${qtyColumn})`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dataWithCount = (data || []).map(item => {
    const items = item[relationTable] || [];
    const totalQty = items.reduce((sum, row) => sum + (Number(row[qtyColumn]) || 0), 0);
    return { ...item, jumlah_item: totalQty };
  });

  return NextResponse.json({ data: dataWithCount });
}

// Tambahkan ekspor fungsi PATCH ini di bawah fungsi GET Anda pada berkas app/api/po/route.js

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, tipe, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing ID or Status' }, { status: 400 });
    }

    // Tentukan tabel target pembaruan status
    const table = tipe === 'custom' ? 'pre_order_custom' : 'pre_order_reguler';

    // Update kolom status saja berdasarkan id pesanan
    const { data, error } = await supabaseAdmin
      .from(table)
      .update({ status: status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase Patch Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Status updated successfully', data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}