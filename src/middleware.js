import { NextResponse } from 'next/server'

export function middleware(request) { // Wajib bernama middleware
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // LOGGING: Memantau semua cookie yang masuk
  const allCookies = request.cookies.getAll()
  // console.log('--- Middleware Request ---')
  // console.log('Path:', pathname)
  // console.log('All Cookies:', allCookies.map(c => c.name))
  
  const hasToken = request.cookies.has('sb-access-token')
  const userRole = request.cookies.get('user-role')?.value?.toLowerCase()
  
  // console.log('Has Token:', hasToken)
  // console.log('User Role:', userRole)

  const isAuthPage = pathname === '/auth/login' || pathname.startsWith('/auth/')
  const isDashboardPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/kepala-produksi')

  // KONDISI 1: User sudah login tapi mencoba kembali ke form login
  if (hasToken && isAuthPage) {
    // // console.log('Redirecting: Already logged in, going to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // KONDISI 2: User belum login tapi memaksa masuk ke area internal
  if (!hasToken && isDashboardPage) {
    // // console.log('Redirecting: No token, going to login')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // KONDISI KETAT 3: Role-Based Access Control
  if (hasToken) {
    if (userRole === 'customer_service') {
      if (pathname.startsWith('/dashboard/kepala-produksi') || pathname.startsWith('/dashboard/owner')) {
        // // console.log('Redirecting: CS unauthorized access')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (userRole === 'kepala-produksi') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/owner')) {
        // // console.log('Redirecting: KP unauthorized access')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (userRole === 'owner') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/kepala-produksi')) {
        // // console.log('Redirecting: Owner unauthorized access')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // KONDISI 4: Penanganan halaman root murni (/)
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/auth/login',
    '/auth/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/api/:path*',
  ],
}