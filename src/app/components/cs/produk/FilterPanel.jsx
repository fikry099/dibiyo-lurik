export default function FilterPanel({ options, filters, setFilters, onClose }) {

  const keyMapping = { 'Kategori': 'kategori', 'Pewarna': 'pewarna', 'Status': 'status' };

  const handleResetFilters = () => {
    setFilters({
      kategori: 'All',
      pewarna: 'All',
      status: 'All'
    });
    if (onClose) onClose(); 
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-lg font-bold text-stone-700">Pilih Filter</h2>
      
      {Object.entries(options).map(([title, items]) => (
        <div key={title} className="mb-4">
          <p className="mb-2 text-sm font-semibold text-stone-600">{title}</p>
          <div className="grid grid-cols-2 gap-2">
            {/* Opsi 'All' untuk mereset filter individu */}
            <button 
              onClick={() => setFilters({...filters, [keyMapping[title]]: 'All'})}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                filters[keyMapping[title]] === 'All' 
                  ? 'bg-[#1A335A] text-white' 
                  : 'bg-[#5AE3ED1C] text-stone-700 hover:bg-[#5AE3ED33]' 
              }`}
            >
              Semua
            </button>
            
            {items.map(opt => (
              <button 
                key={opt}
                onClick={() => setFilters({...filters, [keyMapping[title]]: opt})}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  filters[keyMapping[title]] === opt 
                    ? 'bg-[#1A335A] text-white' 
                    : 'bg-[#5AE3ED1C] text-stone-700 hover:bg-[#5AE3ED33]' 
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {/* Tombol Aksi Utama diubah menjadi Reset Filter */}
      <button 
        onClick={handleResetFilters}
        className="w-full mt-6 bg-[#A63636] text-white py-2.5 rounded-xl font-bold text-base hover:bg-[#bc4343] shadow-md transition-all text-center"
      >
        Reset Filter
      </button>
    </div>
  )
}