import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET(request) {
  try {
    const roleCookie = request.cookies.get('user-role')?.value || ''
    if (roleCookie.toLowerCase() !== 'owner') {
      return NextResponse.json(Array(12).fill(0))
    }

    const tahunIni = new Date().getFullYear()
    const { data, error } = await supabaseAdmin
      .from('v_pendapatan_bulanan')
      .select('tahun_bulan, total_pendapatan')
      .gte('tahun_bulan', `${tahunIni}-01`)
      .lte('tahun_bulan', `${tahunIni}-12`)

    if (error) throw error
    const monthlyTotal = Array(12).fill(0)
    if (data) {
      for (const row of data) {
        const [, bulan] = row.tahun_bulan.split('-')
        const monthIndex = parseInt(bulan, 10) - 1
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyTotal[monthIndex] += Number(row.total_pendapatan || 0)
        }
      }
    }
    return NextResponse.json(monthlyTotal)
  } catch {
    return NextResponse.json(Array(12).fill(0))
  }
}