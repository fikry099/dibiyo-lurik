// 'use client'

// import React, { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { usePathname, useRouter, useSearchParams } from 'next/navigation'
// import { 
//   LayoutDashboard, Package, ShoppingCart, 
//   Database, FileText, User, LogOut, ChevronDown, ClipboardList
// } from 'lucide-react'
// import { motion } from 'framer-motion'
// import Swal from 'sweetalert2';
// import NProgress from 'nprogress';
// import LogoutModal from '@/app/components/LogoutModal';

// // =====================================================================
// // FIX: Fungsi Helper untuk mengambil nilai cookie di client side (Ditambahkan Kembali)
// // =====================================================================
// const getCookie = (name) => {
//   if (typeof document === 'undefined') return null
//   const value = `; ${document.cookie}`
//   const parts = value.split(`; ${name}=`)
//   if (parts.length === 2) return parts.pop().split(';').shift()
//   return null
// }

// export default function Sidebar() {
//   const pathname = usePathname()
//   const router = useRouter()
  
//   const [openSubMenu, setOpenSubMenu] = useState('')
//   const [isLoggingOut, setIsLoggingOut] = useState(false)
//   const searchParams = useSearchParams()
//   const [role, setRole] = useState('cs')
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
  
//   const [cartCount, setCartCount] = useState(0)
//   const [animateBadge, setAnimateBadge] = useState(false)

//   // =====================================================================
//   // FIX 1: Kembalikan Event Listener di Sidebar (Taruh di paling atas useEffect)
//   // =====================================================================
//   useEffect(() => {
//     const handleUpdateCartCount = (e) => {
//       const ditambahkan = e.detail?.count || 1;
//       setCartCount((prev) => prev + ditambahkan);
//       setAnimateBadge(true); // Jalankan animasi memantul
//     };

//     window.addEventListener("updateCartCount", handleUpdateCartCount);
//     return () => window.removeEventListener("updateCartCount", handleUpdateCartCount);
//   }, []); // Kosong agar terpasang sekali saja di awal dan terus mendengarkan event


//   // FIX 2: Efek untuk fetch data awal saat pertama kali masuk sistem atau ganti role
//   useEffect(() => {
//     const fetchInitialCartCount = async () => {
//       try {
//         const res = await fetch("/api/keranjang")
//         const result = await res.json()
//         if (res.ok && result.data) {
//           setCartCount(result.data.length)
//         }
//       } catch (err) {
//         console.error("Gagal mengambil data awal keranjang di sidebar:", err)
//       }
//     }

//     if (role === 'cs' || role === 'customer_service') {
//       fetchInitialCartCount()
//     }
//   }, [role]) 

//   // Reset trigger animasi setelah selesai memantul
//   useEffect(() => {
//     if (animateBadge) {
//       const timer = setTimeout(() => setAnimateBadge(false), 300);
//       return () => clearTimeout(timer);
//     }
//   }, [animateBadge]);

//   useEffect(() => {
//     const userRole = getCookie('user-role')
//     if (userRole) {
//       setRole(userRole.toLowerCase())
//     }
//   }, [])

//   useEffect(() => {
//     if (pathname.startsWith('/dashboard/kepala-produksi/produk')) {
//       setOpenSubMenu('Produk')
//     } else if (pathname.includes('/pre-order')) {
//       setOpenSubMenu('Pre-Order')
//     }
//   }, [pathname])

//   const masterMenuItems = [
//     { 
//       name: 'Dashboard', 
//       icon: <LayoutDashboard size={20} />, 
//       path: '/dashboard',
//       roles: ['kepala_produksi', 'cs', 'customer_service', 'owner'] 
//     },
//     { 
//       name: 'Order', 
//       icon: <FileText size={20} />, 
//       path: '/dashboard/cs/order', 
//       roles: ['cs', 'customer_service'] 
//     },
//     { 
//       name: 'Keranjang', 
//       icon: <ShoppingCart size={20} />, 
//       path: '/dashboard/cs/keranjang',
//       roles: ['cs', 'customer_service'],
//       hasBadge: true
//     },
//     { 
//       name: 'Master Data', 
//       icon: <Package size={20} />, 
//       path: role === 'owner' ? '/dashboard/owner/produk' : null, 
//       roles: ['kepala_produksi'], 
//       subMenu: role !== 'owner' ? [
//         { name: 'Kategori', path: '/dashboard/kp/md/kategori' },
//         { name: 'Motif', path: '/dashboard/kp/md/motif' },
//         { name: 'Rak', path: '/dashboard/kp/md/rak' },
//         { name: 'Daftar Harga', path: '/dashboard/kp/md/dh' },
//         { name: 'Gulungan', path: '/dashboard/kp/md/gulungan' }
//       ] : undefined
//     },
//     {
//       name: 'Produk', path: '/dashboard/kp/md/produk', 
//       icon: <Package size={20} />, 
//       roles: ['kepala_produksi']
//     },
//     { 
//       name: 'Rekap Stok Gulungan', 
//       icon: <Database size={20} />, 
//       roles: ['kepala_produksi'],
//       subMenu: [
//         { name: 'Lebar 70', path: '/dashboard/kp/rsg/lebar70' },
//         { name: 'Lebar 110', path: '/dashboard/kp/rsg/lebar110' }
//       ] 
//     },
//      {
//       name: 'Produk', path: '/dashboard/owner/md/produk', 
//       icon: <Package size={20} />, 
//       roles: ['owner']
//     },
//     { 
//       name: 'Rekap Stok Gulungan', 
//       icon: <Database size={20} />, 
//       roles: ['owner'],
//       subMenu: [
//         { name: 'Lebar 70', path: '/dashboard/owner/rsg/lebar70' },
//         { name: 'Lebar 110', path: '/dashboard/owner/rsg/lebar110' }
//       ] 
//     },
//     { 
//       id: 'po-cs',
//       name: 'Pre Order', 
//       icon: <ShoppingCart size={20} />, 
//       roles: ['cs', 'customer_service'],
//       subMenu: [
//         { name: 'Pre Order Reguler', path: role === 'customer_service' ? '/dashboard/cs/po/reguler/' : null}, 
//         { name: 'Pre Order Custom', path: role === 'customer_service' ? '/dashboard/cs/po/custom/' :null}      
//       ]
//     },
//      { 
//       id: 'po-kp',
//       name: 'Pre Order', 
//       icon: <ShoppingCart size={20} />, 
//       roles: ['cs', 'kepala_produksi'],
//       subMenu: [
//           { 
//           name: 'Pre Order Reguler', 
//           path: '/dashboard/kp/po?tipe=reguler' 
//         }, 
//         { 
//           name: 'Pre Order Custom', 
//           path: '/dashboard/kp/po?tipe=custom' 
//         }
//       ]
//     },
//     { 
//       id: 'po-owner',
//       name: 'Pre Order', 
//       icon: <ShoppingCart size={20} />, 
//       roles: ['owner'],
//       subMenu: [
//         { name: 'Pre Order Reguler', path: role === 'owner' ? '/dashboard/owner/po/reguler/' : null}, 
//         { name: 'Pre Order Custom', path: role === 'owner' ? '/dashboard/owner/po/custom/' :null}      
//       ]
//     },
//     { 
//       name: 'Riwayat Pemesanan', 
//       icon: <ClipboardList size={20} />, 
//       roles: ['cs', 'customer_service'],
//       subMenu: [
//         {name: 'Order', path: '/dashboard/cs/rp/order'},
//         { name: 'Pre Order Reguler', path: '/dashboard/cs/rp/por' },
//         { name: 'Pre Order Custom', path: '/dashboard/cs/rp/poc' }
//       ] 
//     },
//     { 
//       name: 'Laporan', 
//       icon: <FileText size={20} />, 
//       roles: ['owner'],
//        subMenu: [
//         {name: 'Order', path: '/dashboard/owner/laporan/order'},
//         { name: 'Pre Order Reguler', path: '/dashboard/owner/laporan/por' },
//         { name: 'Pre Order Custom', path: '/dashboard/owner/laporan/poc' }
//       ] 
//     },
//     { 
//       name: 'Profil', 
//       icon: <User size={20} />, 
//       path: role === 'owner' ? '/dashboard/owner/profil' : role === 'kepala_produksi' ? '/dashboard/kp/profil' : '/dashboard/cs/profil',
//       roles: ['kepala_produksi', 'cs', 'customer_service', 'owner'] 
//     },
//   ]

//   const filteredMenuItems = masterMenuItems.filter(item => item.roles.includes(role))


// const handleLogout = async () => {
//     setIsLoggingOut(true);
//     NProgress.start();

//     try {
//       const res = await fetch('/api/auth/logout', { method: 'POST' });
//       if (res.ok) {
//         router.replace('/auth/login');
//         router.refresh();
//       } else {
//         setIsLoggingOut(false);
//         NProgress.done();
//       }
//     } catch (error) {
//       setIsLoggingOut(false);
//       NProgress.done();
//     }
//   };

//   return (
//     <>
//     <aside className="w-64 bg-[#8B5E3C] text-white flex flex-col fixed h-full shadow-xl select-none z-40">
//       {/* Brand Header */}
//       <div className="p-6">
//         <h1 className="pb-4 text-2xl font-bold tracking-wide border-b border-white/20">Dibyo Lurik</h1>
//       </div>

//       <nav className="flex-1 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
//         {filteredMenuItems.map((item, index) => {
//           const hasSubMenu = !!item.subMenu
//           const menuKey = `${item.name}-${index}-${role}`;
//           const isMainActive = hasSubMenu 
//             ? item.subMenu.some(sub => pathname === sub.path)
//             : pathname === item.path

//           // JIKA MENU MEMILIKI SUBMENU
//           if (hasSubMenu) {
//             return (
//               <div key={menuKey} className="space-y-1">
//                 <button
//                   onClick={() => setOpenSubMenu(openSubMenu === item.name ? '' : item.name)}
//                   className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
//                     isMainActive ? 'bg-white/25 font-semibold shadow-inner' : 'hover:bg-white/10 text-white/90'
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     {item.icon}
//                     <span className="text-sm">{item.name}</span>
//                   </div>
//                   <ChevronDown 
//                     size={16} 
//                     className={`transition-transform duration-200 text-white/70 ${
//                       openSubMenu === item.name ? 'rotate-180' : ''
//                     }`} 
//                   />
//                 </button>
                
//                 {/* SubMenu Container */}
//                 {openSubMenu === item.name && (
//                   <div className="mt-1 ml-6 space-y-1 transition-all border-l border-white/20">
//                     {item.subMenu.map((sub) => {
//                       const [pathOnly, queryString] = sub.path.split('?')
//                       const currentParams = new URLSearchParams(searchParams.toString())
//                       const targetParams = new URLSearchParams(queryString)

//                       const isSamePath = pathname.replace(/\/$/, '') === pathOnly.replace(/\/$/, '')
//                       const isSameQuery = [...targetParams.entries()].every(
//                         ([key, value]) => currentParams.get(key) === value
//                       )

//                       const isSubActive = isSamePath && isSameQuery
//                       return (
//                         <Link
//                           key={`${item.name}-${sub.name}`}
//                           href={sub.path || '#'}
//                           className={`flex items-center ml-3 p-2.5 text-sm rounded-lg transition-colors duration-150 ${
//                             isSubActive 
//                               ? 'bg-white/20 text-white font-medium shadow-sm' 
//                               : 'text-white/70 hover:text-white hover:bg-white/5'
//                           }`}
//                         >
//                           {sub.name}
//                         </Link>
//                       )
//                     })}
//                   </div>
//                 )}
//               </div>
//             )
//           }
          
//           // JIKA MENU STANDAR
//           return (
//             <div key={menuKey} className="space-y-1">
//               <Link
//                 href={item.path || '#'}
//                 className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
//                   isMainActive ? 'bg-white/25 font-semibold shadow-inner' : 'hover:bg-white/10 text-white/90'
//                 }`}
//               >
//                 <div className="relative">
//                   {item.icon}
//                   {item.hasBadge && cartCount > 0 && (
//                     <motion.span
//                       animate={animateBadge ? { scale: [1, 1.6, 1.2, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
//                       transition={{ duration: 0.3, ease: "easeInOut" }}
//                       className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center border border-[#8B5E3C]"
//                     >
//                       {cartCount}
//                     </motion.span>
//                   )}
//                 </div>
//                 <span className="text-sm">{item.name}</span>
//               </Link>
//             </div>
//           )
//         })}
//       </nav>

//       {/* Bagian Tombol Logout */}
//       <div className="p-4 border-t border-white/10">
//         <button 
//           onClick={() => setShowLogoutModal(true)}
//           disabled={isLoggingOut}
//           className="flex items-center w-full gap-3 p-3 transition-all hover:bg-red-500/20 rounded-xl text-white/80 hover:text-white group disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {isLoggingOut ? (
//             <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
//           ) : (
//             <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
//           )}
//           <span className="text-sm font-medium">
//             {isLoggingOut ? 'Mengeluarkan...' : 'Logout'}
//           </span>
//         </button>
//       </div>
//     </aside>

//       <LogoutModal 
//       isOpen={showLogoutModal} 
//       onClose={() => setShowLogoutModal(false)}
//       onConfirm={handleLogout}
//       isLoggingOut={isLoggingOut}
//     />
//     </>
//   )
// }



'use client'

export const dynamic = 'force-dynamic'; // Paksa komponen dibaca dinamis di client-side untuk mencegah error build 404

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Database, FileText, User, LogOut, ChevronDown, ClipboardList
} from 'lucide-react'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2';
import NProgress from 'nprogress';
import LogoutModal from '@/app/components/LogoutModal';

// =====================================================================
// FIX: Fungsi Helper untuk mengambil nilai cookie di client side (Ditambahkan Kembali)
// =====================================================================
const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [openSubMenu, setOpenSubMenu] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const searchParams = useSearchParams()
  const [role, setRole] = useState('cs')
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [cartCount, setCartCount] = useState(0)
  const [animateBadge, setAnimateBadge] = useState(false)

  // =====================================================================
  // FIX 1: Kembalikan Event Listener di Sidebar (Taruh di paling atas useEffect)
  // =====================================================================
  useEffect(() => {
    const handleUpdateCartCount = (e) => {
      const ditambahkan = e.detail?.count || 1;
      setCartCount((prev) => prev + ditambahkan);
      setAnimateBadge(true); // Jalankan animasi memantul
    };

    window.addEventListener("updateCartCount", handleUpdateCartCount);
    return () => window.removeEventListener("updateCartCount", handleUpdateCartCount);
  }, []); // Kosong agar terpasang sekali saja di awal dan terus mendengarkan event


  // FIX 2: Efek untuk fetch data awal saat pertama kali masuk sistem atau ganti role
  useEffect(() => {
    const fetchInitialCartCount = async () => {
      try {
        const res = await fetch("/api/keranjang")
        const result = await res.json()
        if (res.ok && result.data) {
          setCartCount(result.data.length)
        }
      } catch (err) {
        console.error("Gagal mengambil data awal keranjang di sidebar:", err)
      }
    }

    if (role === 'cs' || role === 'customer_service') {
      fetchInitialCartCount()
    }
  }, [role]) 

  // Reset trigger animasi setelah selesai memantul
  useEffect(() => {
    if (animateBadge) {
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animateBadge]);

  useEffect(() => {
    const userRole = getCookie('user-role')
    if (userRole) {
      setRole(userRole.toLowerCase())
    }
  }, [])

  useEffect(() => {
    if (pathname.startsWith('/dashboard/kepala-produksi/produk')) {
      setOpenSubMenu('Produk')
    } else if (pathname.includes('/pre-order')) {
      setOpenSubMenu('Pre-Order')
    }
  }, [pathname])

  const masterMenuItems = [
    { 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/dashboard',
      roles: ['kepala_produksi', 'cs', 'customer_service', 'owner'] 
    },
    { 
      name: 'Order', 
      icon: <FileText size={20} />, 
      path: '/dashboard/cs/order', 
      roles: ['cs', 'customer_service'] 
    },
    { 
      name: 'Keranjang', 
      icon: <ShoppingCart size={20} />, 
      path: '/dashboard/cs/keranjang',
      roles: ['cs', 'customer_service'],
      hasBadge: true
    },
    { 
      name: 'Master Data', 
      icon: <Package size={20} />, 
      path: role === 'owner' ? '/dashboard/owner/produk' : null, 
      roles: ['kepala_produksi'], 
      subMenu: role !== 'owner' ? [
        { name: 'Kategori', path: '/dashboard/kp/md/kategori' },
        { name: 'Motif', path: '/dashboard/kp/md/motif' },
        { name: 'Rak', path: '/dashboard/kp/md/rak' },
        { name: 'Daftar Harga', path: '/dashboard/kp/md/dh' },
        { name: 'Gulungan', path: '/dashboard/kp/md/gulungan' }
      ] : undefined
    },
    {
      name: 'Produk', path: '/dashboard/kp/md/produk', 
      icon: <Package size={20} />, 
      roles: ['kepala_produksi']
    },
    { 
      name: 'Rekap Stok Gulungan', 
      icon: <Database size={20} />, 
      roles: ['kepala_produksi'],
      subMenu: [
        { name: 'Lebar 70', path: '/dashboard/kp/rsg/lebar70' },
        { name: 'Lebar 110', path: '/dashboard/kp/rsg/lebar110' }
      ] 
    },
    {
      name: 'Produk', path: '/dashboard/owner/md/produk', 
      icon: <Package size={20} />, 
      roles: ['owner']
    },
    { 
      name: 'Rekap Stok Gulungan', 
      icon: <Database size={20} />, 
      roles: ['owner'],
      subMenu: [
        { name: 'Lebar 70', path: '/dashboard/owner/rsg/lebar70' },
        { name: 'Lebar 110', path: '/dashboard/owner/rsg/lebar110' }
      ] 
    },
    { 
      id: 'po-cs',
      name: 'Pre Order', 
      icon: <ShoppingCart size={20} />, 
      roles: ['cs', 'customer_service'],
      subMenu: [
        { name: 'Pre Order Reguler', path: role === 'customer_service' ? '/dashboard/cs/po/reguler/' : null}, 
        { name: 'Pre Order Custom', path: role === 'customer_service' ? '/dashboard/cs/po/custom/' :null}      
      ]
    },
    { 
      id: 'po-kp',
      name: 'Pre Order', 
      icon: <ShoppingCart size={20} />, 
      roles: ['cs', 'kepala_produksi'],
      subMenu: [
          { 
          name: 'Pre Order Reguler', 
          path: '/dashboard/kp/po?tipe=reguler' 
        }, 
        { 
          name: 'Pre Order Custom', 
          path: '/dashboard/kp/po?tipe=custom' 
        }
      ]
    },
    { 
      id: 'po-owner',
      name: 'Pre Order', 
      icon: <ShoppingCart size={20} />, 
      roles: ['owner'],
      subMenu: [
        { name: 'Pre Order Reguler', path: role === 'owner' ? '/dashboard/owner/po/reguler/' : null}, 
        { name: 'Pre Order Custom', path: role === 'owner' ? '/dashboard/owner/po/custom/' :null}      
      ]
    },
    { 
      name: 'Riwayat Pemesanan', 
      icon: <ClipboardList size={20} />, 
      roles: ['cs', 'customer_service'],
      subMenu: [
        {name: 'Order', path: '/dashboard/cs/rp/order'},
        { name: 'Pre Order Reguler', path: '/dashboard/cs/rp/por' },
        { name: 'Pre Order Custom', path: '/dashboard/cs/rp/poc' }
      ] 
    },
    { 
      name: 'Laporan', 
      icon: <FileText size={20} />, 
      roles: ['owner'],
       subMenu: [
        {name: 'Order', path: '/dashboard/owner/laporan/order'},
        { name: 'Pre Order Reguler', path: '/dashboard/owner/laporan/por' },
        { name: 'Pre Order Custom', path: '/dashboard/owner/laporan/poc' }
      ] 
    },
    { 
      name: 'Profil', 
      icon: <User size={20} />, 
      path: role === 'owner' ? '/dashboard/owner/profil' : role === 'kepala_produksi' ? '/dashboard/kp/profil' : '/dashboard/cs/profil',
      roles: ['kepala_produksi', 'cs', 'customer_service', 'owner'] 
    },
  ]

  const filteredMenuItems = masterMenuItems.filter(item => item.roles.includes(role))


const handleLogout = async () => {
    setIsLoggingOut(true);
    NProgress.start();

    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.replace('/auth/login');
        router.refresh();
      } else {
        setIsLoggingOut(false);
        NProgress.done();
      }
    } catch (error) {
      setIsLoggingOut(false);
      NProgress.done();
    }
  };

  return (
    <>
    <aside className="w-64 bg-[#8B5E3C] text-white flex flex-col fixed h-full shadow-xl select-none z-40">
      {/* Brand Header */}
      <div className="p-6">
        <h1 className="pb-4 text-2xl font-bold tracking-wide border-b border-white/20">Dibyo Lurik</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {filteredMenuItems.map((item, index) => {
          const hasSubMenu = !!item.subMenu
          const menuKey = `${item.name}-${index}-${role}`;
          const isMainActive = hasSubMenu 
            ? item.subMenu.some(sub => pathname === sub.path)
            : pathname === item.path

          // JIKA MENU MEMILIKI SUBMENU
          if (hasSubMenu) {
            return (
              <div key={menuKey} className="space-y-1">
                <button
                  onClick={() => setOpenSubMenu(openSubMenu === item.name ? '' : item.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    isMainActive ? 'bg-white/25 font-semibold shadow-inner' : 'hover:bg-white/10 text-white/90'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 text-white/70 ${
                      openSubMenu === item.name ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* SubMenu Container */}
                {openSubMenu === item.name && (
                  <div className="mt-1 ml-6 space-y-1 transition-all border-l border-white/20">
                    {item.subMenu.map((sub) => {
                      const [pathOnly, queryString] = sub.path.split('?')
                      const currentParams = new URLSearchParams(searchParams.toString())
                      const targetParams = new URLSearchParams(queryString)

                      const isSamePath = pathname.replace(/\/$/, '') === pathOnly.replace(/\/$/, '')
                      const isSameQuery = [...targetParams.entries()].every(
                        ([key, value]) => currentParams.get(key) === value
                      )

                      const isSubActive = isSamePath && isSameQuery
                      return (
                        <Link
                          key={`${item.name}-${sub.name}`}
                          href={sub.path || '#'}
                          className={`flex items-center ml-3 p-2.5 text-sm rounded-lg transition-colors duration-150 ${
                            isSubActive 
                              ? 'bg-white/20 text-white font-medium shadow-sm' 
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
          
          // JIKA MENU STANDAR
          return (
            <div key={menuKey} className="space-y-1">
              <Link
                href={item.path || '#'}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  isMainActive ? 'bg-white/25 font-semibold shadow-inner' : 'hover:bg-white/10 text-white/90'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.hasBadge && cartCount > 0 && (
                    <motion.span
                      animate={animateBadge ? { scale: [1, 1.6, 1.2, 1], rotate: [0, 10, -10, 0] } : { scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center border border-[#8B5E3C]"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </div>
                <span className="text-sm">{item.name}</span>
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Bagian Tombol Logout */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          className="flex items-center w-full gap-3 p-3 transition-all hover:bg-red-500/20 rounded-xl text-white/80 hover:text-white group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
          ) : (
            <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
          )}
          <span className="text-sm font-medium">
            {isLoggingOut ? 'Mengeluarkan...' : 'Logout'}
          </span>
        </button>
      </div>
    </aside>

      <LogoutModal 
      isOpen={showLogoutModal} 
      onClose={() => setShowLogoutModal(false)}
      onConfirm={handleLogout}
      isLoggingOut={isLoggingOut}
    />
    </>
  )
}