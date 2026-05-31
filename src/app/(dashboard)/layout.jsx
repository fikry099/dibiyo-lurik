'use client'

import React, { Suspense, useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar' 
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleSidebarToggle = (e) => {
      setIsSidebarCollapsed(e.detail.isCollapsed)
    }

    window.addEventListener("sidebarToggle", handleSidebarToggle)
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle)
  }, [])

  // --- DETEKSI IDLE ---
  useEffect(() => {
    let idleTimer;
    const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 Menit
    let lastActivity = Date.now();

    const triggerLogout = async () => {
      NProgress.start()
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' })
        if (res.ok) {
          router.replace('/auth/login')
          router.refresh()
        }
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        NProgress.done()
      }
    }

    const resetIdleTimer = () => {
      // Jeda 1 detik untuk optimasi performa DOM event listener
      if (Date.now() - lastActivity < 1000) return;
      lastActivity = Date.now();

      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(triggerLogout, IDLE_TIMEOUT);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true })
    })

    // Inisialisasi timer pertama saat halaman dimuat
    idleTimer = setTimeout(triggerLogout, IDLE_TIMEOUT);

    return () => {
      if (idleTimer) clearTimeout(idleTimer)
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer)
      })
    }
  }, [router])

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Ubah warna fallback pulse ke Navy #1A335A sesuai tema baru */}
      <Suspense fallback={<div className="w-64 bg-[#1A335A] min-h-screen animate-pulse" />}>
        <Sidebar />
      </Suspense>

      <main className={`flex-1 min-h-screen p-6 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {children}
      </main>
    </div>
  )
}