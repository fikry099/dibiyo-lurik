'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress' 

export default function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    NProgress.start()

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Username atau password salah')
      }
      
      setSuccess('Login berhasil! Mengalihkan...')
      
      // PAKSA SELESAI DI SINI:
      NProgress.done(); 
      
      router.replace('/dashboard')
      
    } catch (err) {
      setError(err.message)
      NProgress.done() 
      setLoading(false)
    }
  }


  return (
    /* Menggunakan utilitas ukuran murni dari Tailwind CSS v4 */
    <div className="w-[450px] max-w-full">
      {/* Alert Sukses */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 text-sm font-medium border shadow-sm rounded-xl bg-emerald-50 text-emerald-700 border-emerald-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {success}
        </div>
      )}

      {/* Card Utama dengan Gradasi Lurik Murni Tailwind */}
      <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#b8835e] via-[#a47352] to-[#8b5e3c]">
        
        {/* Header Brand */}
        <div className="flex flex-col items-center pt-10 pb-6">
          <div className="flex items-center justify-center mb-4 rounded-full w-28 h-28 bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-white">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M5.338 18.32C5.994 15.528 8.776 13.5 12 13.5c3.224 0 6.006 2.028 6.662 4.82.132.56-.32 1.18-.898 1.18H6.236c-.578 0-1.03-.62-.898-1.18Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-wide text-white">Dibyo Lurik</h1>
          <p className="mt-1 text-sm text-white/70">Sistem Manajemen Internal</p>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="px-8 pb-8">
          {/* Alert Error */}
          {error && (
            <div className="px-4 py-3 mb-4 text-sm font-medium text-red-100 border rounded-xl bg-red-500/20 border-red-500/30 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Input Username */}
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-white/90">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full h-12 px-4 text-white transition-all duration-200 border-2 outline-none pr-11 rounded-xl border-white/30 bg-white/10 backdrop-blur-sm placeholder-white/40 focus:border-white/60 focus:bg-white/15"
                autoComplete="username"
                autoFocus
                required
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="absolute -translate-y-1/2 right-4 top-1/2 text-white/40">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path d="M6 21v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Input Password */}
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-white/90">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full h-12 px-4 pr-12 text-white transition-all duration-200 border-2 outline-none rounded-xl border-white/30 bg-white/10 backdrop-blur-sm placeholder-white/40 focus:border-white/60 focus:bg-white/15"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute transition-colors -translate-y-1/2 right-4 top-1/2 text-white/40 hover:text-white/80"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Lupa Password Link */}
          <div className="flex justify-end mb-6">
            <Link href="/auth/forgot-password" className="text-xs font-medium transition-colors text-white/60 hover:text-white/90">
              Lupa Password?
            </Link>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98] bg-white text-[#8b5e3c]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memproses...
              </span>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>
      </div>

      {/* Hak Cipta */}
      <p className="text-center text-xs mt-6 text-[#a47352]">
        &copy; 2026 Dibyo Lurik. All rights reserved.
      </p>
    </div>
  )
}