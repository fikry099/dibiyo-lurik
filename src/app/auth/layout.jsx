export default function AuthLayout({ children }) {
  return (
    /* Kita tambahkan py-12 (padding vertikal) agar ada space kosong di atas & bawah card */
    <div className="min-h-screen bg-[#fcf9f5] flex items-center justify-center py-12 px-4 overflow-y-auto">
      {children}
    </div>
  )
}