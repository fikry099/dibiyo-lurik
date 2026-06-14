// src/app/api/auth/logout/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('sb-') || cookie.name === 'user-role') {
        cookieStore.set({
          name: cookie.name,
          value: '',
          path: '/',
          expires: new Date(0), 
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      }
    })

    return NextResponse.json({ success: true, message: 'Berhasil keluar dari sistem' })
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}