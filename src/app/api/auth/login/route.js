// import { successResponse, errorResponse } from '@/lib/helpers'
// import supabaseAdmin from '@/lib/supabase-admin'
// import supabasePublic from '@/lib/supabase-public'
// import { cookies } from 'next/headers' // 1. Import helper cookies Next.js

// export async function POST(request) {
//   try {
//     const body = await request.json()
//     const { username, password } = body

//     if (!username || !password) {
//       return errorResponse('Username dan password wajib diisi', 400)
//     }

//     // Step 1: cari profile by username
//     const { data: profile, error: profileError } = await supabaseAdmin
//       .from('profiles')
//       .select('id, username, email, nama, role, avatar_url')
//       .eq('username', username)
//       .single()

//     if (profileError || !profile) {
//       return errorResponse('Username atau password salah', 401)
//     }

//     // Step 2: sign in dengan email
//     const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
//       email: profile.email,
//       password: password,
//     })

//     if (authError || !authData.session) {
//       return errorResponse('Username atau password salah', 401)
//     }

//     // --- 2. SET COOKIE SECARA AMAN DI SISI SERVER ---
//     const cookieStore = await cookies()
    
//     // Simpan access token (Umur disesuaikan dengan expires_in dari response, misal 1 jam)
//     cookieStore.set('sb-access-token', authData.session.access_token, {
//       httpOnly: true, // Amankan dari serangan XSS scripts
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: authData.session.expires_in, 
//     })

//     // Simpan refresh token untuk menjaga sesi tetap aktif jangka panjang
//     cookieStore.set('sb-refresh-token', authData.session.refresh_token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 60 * 60 * 24 * 7, // Berlaku 7 Hari
//     })

//     cookieStore.set('user-role', profile.role, {
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       path: '/',
//       maxAge: 60 * 60 * 24 * 7, // Samakan saja dengan umur refresh token
//     })

//     // Step 3: return session + profile
//     return successResponse({
//       session: authData.session,
//       user: authData.user,
//       profile: profile,
//     })
//   } catch (error) {
//     return errorResponse(error.message, 500)
//   }
// }