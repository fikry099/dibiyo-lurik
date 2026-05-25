'use client'

import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { User, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({ username: '', email: '' })
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  // Fungsi untuk memuat data profil
  const fetchProfile = async () => {
    const res = await fetch('/api/auth/profile', { credentials: 'include' })
    const data = await res.json()
    if (data.data) {
      setProfile(data.data)
      setFormData({ username: data.data.username, password: '' })
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })
      
      const result = await res.json()

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Profil Anda telah diperbarui.',
          confirmButtonColor: '#8B5E3C'
        })
        
        // --- LANGKAH PENTING: Update state lokal agar UI berubah seketika ---
        setProfile(prev => ({ ...prev, username: formData.username }))
        setFormData(prev => ({ ...prev, password: '' }))
      } else {
        throw new Error(result.error || 'Gagal update profil')
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error')
    } finally {
      setLoading(false)
    }
  }
return (
    <div className="w-full duration-500 animate-in fade-in">
      
      {/* Judul dengan Garis Bawah Panjang */}
      <div className="mb-12 border-b-2 border-[#A47352] pb-3">
        <h1 className="text-3xl font-bold text-[#8B5E3C]">Profil</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-[#F8F1ED] p-8 border border-[#DCCBBF] shadow-sm rounded-3xl">
          
          {/* Bagian Avatar dengan Lucide Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-28 h-28 bg-[#B99580] rounded-full flex items-center justify-center text-white shadow-inner">
              <User size={48} strokeWidth={1.5} /> 
            </div>
          </div>

          {/* Form Read-Only */}
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#8B5E3C] mb-1">Username</label>
              <div className="w-full p-3 bg-[#E3C2AC59] border border-[#DCCBBF] rounded-lg text-gray-700">
                {profile.username}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8B5E3C] mb-1">Email</label>
              <div className="w-full p-3 bg-[#E3C2AC59] border border-[#DCCBBF] rounded-lg text-gray-700">
                {profile.email || '-'}
              </div>
            </div>
          </div>

          {/* Kartu Ubah Profil */}
          <div className="bg-[#E3C2AC59] border border-[#DCCBBF] p-6 rounded-2xl">
            <h3 className="flex items-center gap-2 font-bold text-[#8B5E3C] mb-4">
              {/* Ikon ShieldCheck dari lucide-react */}
              <ShieldCheck size={20} /> Ubah Profil
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* ... form inputs ... */}
              <div>
                <label className="block text-sm font-medium text-[#8B5E3C] mb-1">Username</label>
                <input 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full text-gray-700 p-3 bg-[#E3C2AC59] border border-[#DCCBBF] rounded-lg focus:ring-2 focus:ring-[#8B5E3C] outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#8B5E3C] mb-1">Password Baru</label>
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-3 text-gray-700 bg-[#E3C2AC59] border border-[#DCCBBF] rounded-lg focus:ring-2 focus:ring-[#8B5E3C] outline-none transition"
                />
              </div>

              <div className="flex justify-end mt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#8B5E3C] text-white font-semibold rounded-lg hover:bg-[#734d32] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}