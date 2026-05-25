// import { NextResponse } from 'next/server'

// export function middleware(request) { // Wajib bernama middleware
//   const { pathname } = request.nextUrl
//   if (pathname.startsWith('/api/')) {
//     return NextResponse.next()
//   }
  
//   // LOGGING: Memantau semua cookie yang masuk
//   const allCookies = request.cookies.getAll()
//   // console.log('--- Middleware Request ---')
//   // console.log('Path:', pathname)
//   // console.log('All Cookies:', allCookies.map(c => c.name))
  
//   const hasToken = request.cookies.has('sb-access-token')
//   const userRole = request.cookies.get('user-role')?.value?.toLowerCase()
  
//   // console.log('Has Token:', hasToken)
//   // console.log('User Role:', userRole)

//   const isAuthPage = pathname === '/auth/login' || pathname.startsWith('/auth/')
//   const isDashboardPage = pathname === '/dashboard' || pathname.startsWith('/dashboard/') || pathname.startsWith('/kepala-produksi')

//   // KONDISI 1: User sudah login tapi mencoba kembali ke form login
//   if (hasToken && isAuthPage) {
//     // // console.log('Redirecting: Already logged in, going to dashboard')
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }

//   // KONDISI 2: User belum login tapi memaksa masuk ke area internal
//   if (!hasToken && isDashboardPage) {
//     // // console.log('Redirecting: No token, going to login')
//     return NextResponse.redirect(new URL('/auth/login', request.url))
//   }

//   // KONDISI KETAT 3: Role-Based Access Control
//   if (hasToken) {
//     if (userRole === 'customer_service') {
//       if (pathname.startsWith('/dashboard/kepala-produksi') || pathname.startsWith('/dashboard/owner')) {
//         // // console.log('Redirecting: CS unauthorized access')
//         return NextResponse.redirect(new URL('/dashboard', request.url))
//       }
//     }

//     if (userRole === 'kepala-produksi') {
//       if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/owner')) {
//         // // console.log('Redirecting: KP unauthorized access')
//         return NextResponse.redirect(new URL('/dashboard', request.url))
//       }
//     }

//     if (userRole === 'owner') {
//       if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/kepala-produksi')) {
//         // // console.log('Redirecting: Owner unauthorized access')
//         return NextResponse.redirect(new URL('/dashboard', request.url))
//       }
//     }
//   }

//   // KONDISI 4: Penanganan halaman root murni (/)
//   if (pathname === '/') {
//     if (hasToken) {
//       return NextResponse.redirect(new URL('/dashboard', request.url))
//     } else {
//       return NextResponse.redirect(new URL('/auth/login', request.url))
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/',
//     '/auth/login',
//     '/auth/:path*',
//     '/dashboard',
//     '/dashboard/:path*',
//     '/api/:path*',
//   ],
// }



import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // 1. Amankan API & Aset Statis / Internal Next.js agar tidak sengaja ter-redirect
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  const hasToken = request.cookies.has('sb-access-token')
  const userRole = request.cookies.get('user-role')?.value?.toLowerCase()

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/kepala-produksi')

  // KONDISI 1: User sudah login tapi memaksa ke halaman login/register -> Lempar ke dashboard
  if (hasToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // KONDISI 2: User BELUM login tapi memaksa masuk ke area dashboard -> Lempar ke login
  if (!hasToken && isDashboardPage) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // KONDISI 3: Role-Based Access Control (Hanya jika user memiliki token)
  if (hasToken) {
    if (userRole === 'customer_service') {
      if (pathname.startsWith('/dashboard/kepala-produksi') || pathname.startsWith('/dashboard/owner')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (userRole === 'kepala-produksi') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/owner')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    if (userRole === 'owner') {
      if (pathname.startsWith('/dashboard/cs') || pathname.startsWith('/dashboard/kepala-produksi')) {
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

// Matcher dikencangkan agar mencakup seluruh rute krusial secara konsisten
export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/dashboard/:path*',
    '/kp/:path*',
    '/cs/:path*',
    '/owner/:path*',
  ],
}