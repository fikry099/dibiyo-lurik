import { Search, SlidersHorizontal } from 'lucide-react'

export default function ProdukSearchBar({ searchQuery, setSearchQuery, onOpenFilter }) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3 text-stone-400" size={18} />
        <input
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:border-[#8B5E3C] focus:ring-1 focus:ring-[#8B5E3C] outline-none"
          placeholder="Cari motif atau kode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  )
}