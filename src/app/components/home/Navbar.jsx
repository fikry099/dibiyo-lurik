// src/app/components/home/Navbar.jsx
"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation' 
import Swal from 'sweetalert2' 
import { motion } from 'framer-motion' // Ditambahkan untuk efek membal premium

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname() 
  
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  
  const [user, setUser] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // SINKRONISASI STATE KERANJANG
  const [cartCount, setCartCount] = useState(0)
  const [isCartBouncing, setIsCartBouncing] = useState(false)

  // 1. Memuat Data Sesi Profil Pengguna
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/auth/profile', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          setUser(json.data)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Gagal memuat sesi navbar:", err)
        setUser(null)
      } finally {
        // PERBAIKAN: Sintaks 'box-loader' yang merusak runtime telah dihapus bersih
        setLoadingUser(false)
      }
    }
    fetchProfile()
  }, [pathname])

  // 2. Sinkronisasi Data Real-time & Efek Animasi dari ModalBeliKain
  useEffect(() => {
    // Fungsi mengambil jumlah item awal di keranjang database
    const fetchInitialCartCount = async () => {
      try {
        const res = await fetch('/api/keranjang')
        if (res.ok) {
          const json = await res.json()
          if (Array.isArray(json.data)) {
            setCartCount(json.data.length)
          } else if (json.count !== undefined) {
            setCartCount(json.count)
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data awal keranjang:", err)
      }
    }

    fetchInitialCartCount()

    // Event handler penambahan kuantitas angka badge
    const handleUpdateCount = (e) => {
      setCartCount((prev) => prev + (e.detail?.count || 1))
    }

    // Event handler pemicu efek membal (bounce)
    const handleCartBounce = () => {
      setIsCartBouncing(true)
      setTimeout(() => setIsCartBouncing(false), 500)
    }

    window.addEventListener("updateCartCount", handleUpdateCount)
    window.addEventListener("sync-cart-bounce", handleCartBounce)

    return () => {
      window.removeEventListener("updateCartCount", handleUpdateCount)
      window.removeEventListener("sync-cart-bounce", handleCartBounce)
    }
  }, [])

  const handleLogout = async () => {
    setShowUserDropdown(false)
    setIsOpen(false)
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Anda akan keluar dari sesi aktif saat ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1A335A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      background: '#1A1917', 
      color: '#F9F6F0'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoggingOut(true)
        
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST' })
          
          if (res.ok) {
            setUser(null)
            window.location.href = '/auth/login'
          } else {
            throw new Error("Gagal menghapus sesi di server")
          }
        } catch (error) {
          console.error("Gagal melakukan proses keluar:", error)
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Gagal melakukan logout, coba lagi!',
          })
        } finally {
          setIsLoggingOut(false)
        }
      }
    })
  }

  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/admin')
  ) {
    return null
  }

  const isActive = (url) => {
    if (url === '/') return pathname === '/'
    return pathname.startsWith(url)
  }

  const isAboutActive = isActive('/artikel') || isActive('/produksi')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A1715]/80 backdrop-blur-lg border-b border-[#E5BA73]/10">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold tracking-widest text-[#E5BA73] hover:opacity-90 transition-opacity">
              BIYO <span className="text-[#F9F6F0] font-light">LURIK</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="items-center hidden space-x-8 md:flex">
            <Link 
              href="/" 
              className={`font-medium text-sm tracking-wide transition-colors ${
                isActive('/') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
              }`}
            >
              Home
            </Link>

            <Link 
              href="/customizer" 
              className={`font-medium text-sm tracking-wide transition-colors flex items-center gap-1.5 ${
                isActive('/customizer') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
              }`}
            >
              Lurik Customizer
              <span className="text-[9px] bg-[#E5BA73] text-[#12110F] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </Link>

            <Link 
              href="/produk" 
              className={`font-medium text-sm tracking-wide transition-colors ${
                isActive('/produk') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
              }`}
            >
              Produk
            </Link>
            
            {/* Dropdown About */}
            <div 
              className="relative py-2" 
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                className={`font-medium text-sm tracking-wide transition-colors flex items-center gap-1 ${
                  isAboutActive ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#F9F6F0]'
                }`}
              >
                About 
                <svg className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#1A1917] border border-[#E5BA73]/20 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                  <Link 
                    href="/artikel" 
                    onClick={() => setShowDropdown(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive('/artikel') 
                        ? 'bg-[#E5BA73]/20 text-[#E5BA73]' 
                        : 'text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73]'
                    }`}
                  >
                    Artikel & Edukasi
                  </Link>
                  <Link 
                    href="/produksi" 
                    onClick={() => setShowDropdown(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors ${
                      isActive('/produksi') 
                        ? 'bg-[#E5BA73]/20 text-[#E5BA73]' 
                        : 'text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73]'
                    }`}
                  >
                    Proses Produksi
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Menu */}
          <div className="items-center hidden space-x-6 md:flex">
            {/* Animasi Pembungkus Icon Keranjang Belanja */}
            <motion.div
              animate={isCartBouncing ? { scale: [1, 1.4, 0.85, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Link 
                href="/cart" 
                className={`relative p-2 block transition-colors ${
                  isActive('/cart') ? 'text-[#E5BA73]' : 'text-[#A3A19E] hover:text-[#E5BA73]'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <span className="absolute top-1 right-1 bg-[#E5BA73] text-[#12110F] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            </motion.div>
            
            {loadingUser ? (
              <div className="w-20 h-8 rounded-lg bg-gray-700/50 animate-pulse"></div>
            ) : user ? (
              /* DESKTOP DROPDOWN PROFILE USER */
              <div 
                className="relative py-2"
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5BA73]/30 hover:border-[#E5BA73] transition-all bg-transparent text-[#F9F6F0]">
                  <div className="w-6 h-6 rounded-full bg-[#E5BA73] text-[#12110F] flex items-center justify-center font-bold text-xs">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold tracking-wide truncate max-w-[100px]">
                    {user.username}
                  </span>
                  <svg className={`w-3 h-3 text-[#A3A19E] transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#1A1917] border border-[#E5BA73]/20 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    <div className="px-4 py-2 border-b border-[#E5BA73]/10">
                      <p className="text-sm font-semibold text-[#E5BA73] truncate">{user.nama}</p>
                    </div>
                    {user.role !== 'customer' && (
                      <Link href="/dashboard" className="block px-4 py-2.5 text-xs text-[#A3A19E] hover:bg-[#E5BA73]/10 hover:text-[#E5BA73] transition-colors">
                        Dashboard Sistem
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left block px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? 'Mengeluarkan...' : 'Keluar / Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="px-5 py-2.5 bg-transparent border border-[#E5BA73] text-[#E5BA73] hover:bg-[#E5BA73] hover:text-[#12110F] rounded-lg text-xs font-semibold tracking-wider transition-all duration-300">
                MASUK
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#E5BA73] p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1A1917] border-b border-[#E5BA73]/10 px-4 pt-2 pb-4 space-y-2">
          <Link href="/" className={`block py-2 font-medium ${isActive('/') ? 'text-[#E5BA73]' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
            Home
          </Link>
          <Link href="/customizer" className={`block py-2 font-medium ${isActive('/customizer') ? 'text-[#E5BA73]' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
            Lurik Customizer
          </Link>
          <Link href="/produk" className={`block py-2 font-medium ${isActive('/produk') ? 'text-[#E5BA73]' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
            Produk
          </Link>
          <div className="border-t border-[#E5BA73]/10 my-2 pt-2">
            <Link href="/artikel" className={`block py-1.5 text-sm pl-4 ${isActive('/artikel') ? 'text-[#E5BA73] font-medium' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
              Artikel & Edukasi
            </Link>
            <Link href="/produksi" className={`block py-1.5 text-sm pl-4 ${isActive('/produksi') ? 'text-[#E5BA73] font-medium' : 'text-[#A3A19E]'}`} onClick={() => setIsOpen(false)}>
              Proses Produksi
            </Link>
          </div>
          
          <div className="pt-2 border-t border-[#E5BA73]/10">
            {loadingUser ? (
              <div className="w-full h-10 bg-gray-800 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="space-y-2">
                <div className="px-4 py-2 bg-[#12110F] rounded-lg border border-[#E5BA73]/10 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#E5BA73] text-[#12110F] flex items-center justify-center font-bold text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Hai, @{user.username}</p>
                    <p className="text-sm font-bold text-[#E5BA73]">{user.nama}</p>
                  </div>
                </div>
                {user.role !== 'customer' && (
                  <Link href="/dashboard" className="block w-full text-center py-2 bg-transparent border border-[#E5BA73]/30 text-[#E5BA73] font-medium rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                    Dashboard Sistem
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="block w-full text-center py-2.5 bg-red-600/20 text-red-400 font-bold rounded-lg text-sm transition-colors border border-red-500/20 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Mengeluarkan...' : 'Keluar / Logout'}
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="block w-full text-center py-2.5 bg-[#E5BA73] text-[#12110F] font-bold rounded-lg text-sm" onClick={() => setIsOpen(false)}>
                Masuk Sistem
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}