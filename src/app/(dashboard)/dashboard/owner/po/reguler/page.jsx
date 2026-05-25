'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Import komponen tabel dengan ssr: false
const PORegulerTable = dynamic(() => import('../../../../../components/owner/po/PORegulerTable'), {
  ssr: false,
})

export default function PreOrderRegulerPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pre-order-reguler')
      
      if (!res.ok) {
        throw new Error('Gagal mengambil data');
      }

      const json = await res.json()
      
      if (json && Array.isArray(json.data)) {
        setData(json.data)
      } else {
        setData([])
      }
      
    } catch (err) {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-[#8B5E3C] mb-4">Pre-order Reguler</h1>
      <div className="border border-[#D4A373]/40 rounded-xl p-6 bg-white shadow-sm">
        {loading ? (
          <p className="py-10 text-center">Memuat data...</p>
        ) : (
          <PORegulerTable data={data} />
        )}
      </div>
    </div>
  )
}