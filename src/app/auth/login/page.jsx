'use client'

import { useEffect, Suspense } from 'react'
import NProgress from 'nprogress'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  useEffect(() => {
    NProgress.done()
  }, [])

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1A1917] flex items-center justify-center text-[#E5BA73] font-serif">
        Membuka Gerbang Masuk Biyo Lurik...
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}