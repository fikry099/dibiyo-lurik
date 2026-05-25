'use client';

import React, { useState, useEffect } from 'react';
import LaporanPoCustomFilterBar from '@/app/components/owner/laporan/poc/LaporanPoCustomFilterBar';
// Silakan sesuaikan atau buat tabel list datanya jika ada komponen LaporanPoTable
import LaporanPoTable from '@/app/components/owner/laporan/poc/LaporanPoTable'; 

export default function LaporanPoCustomPage() {
  const [poData, setPoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [pembayaran, setPembayaran] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch data dari API internal
  const fetchLaporanPo = async () => {
    setLoading(true);
    try {
      let url = `/api/laporan/pre-order-custom?status=${status}&status_pembayaran=${pembayaran}`;
      if (startDate) url += `&start=${startDate}`;
      if (endDate) url += `&end=${endDate}`;

      const res = await fetch(url);
      const result = await res.json();
      if (res.ok) {
        setPoData(result.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat data PO custom:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanPo();
  }, [startDate, endDate, status, pembayaran]);

  // Handler Export PDF ala Client-side (Anti-SSR Crash)
  const handleExportPDF = () => {
    setExportLoading(true);
    try {
      const { jsPDF } = require('jspdf');
      const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // ===== HEADER BISNIS =====
      doc.setTextColor(164, 115, 82);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('DIBYO LURIK', 105, 15, { align: 'center' });

      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Sistem Manajemen Toko Kain Lurik', 105, 21, { align: 'center' });

      doc.setDrawColor(164, 115, 82);
      doc.setLineWidth(0.4);
      doc.line(15, 26, 195, 26);

      doc.setTextColor(164, 115, 82);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('LAPORAN PRE-ORDER CUSTOM', 105, 35, { align: 'center' });

      let dateRange = 'Semua Periode';
      if (startDate && endDate) dateRange = `${startDate} s/d ${endDate}`;
      else if (startDate) dateRange = `Mulai ${startDate}`;
      else if (endDate) dateRange = `Sampai ${endDate}`;

      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Periode: ${dateRange}`, 105, 41, { align: 'center' });

      // ===== FORMAT DATA TABEL =====
      const tableHeaders = [
        ['No.', 'Tanggal Buat', 'No. PO', 'Nama Customer', 'Status Produksi', 'Status Bayar', 'Total Harga']
      ];

      let grandTotalSum = 0;
      const tableRows = poData.map((row, index) => {
        grandTotalSum += Number(row.total_harga || 0);

        const formattedDate = new Date(row.created_at).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });

        return [
          `${index + 1}.`,
          formattedDate,
          row.nomor_po,
          row.nama_customer,
          row.status,
          row.status_pembayaran,
          `Rp ${Number(row.total_harga || 0).toLocaleString('id-ID')}`,
        ];
      });

      // Render tabel via jsPDF AutoTable
      autoTable(doc, {
        startY: 48,
        head: tableHeaders,
        body: tableRows,
        margin: { left: 15, right: 15 },
        theme: 'striped',
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: 2.5,
          verticalAlignment: 'middle',
        },
        headStyles: {
          fillColor: [179, 124, 87],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left',
        },
        columnStyles: {
          0: { halign: 'center', width: 10 },
          1: { halign: 'center', width: 25 },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'right' },
        },
        alternateRowStyles: {
          fillColor: [253, 250, 246],
        },
      });

      // Cari koordinat Y akhir setelah tabel selesai dirender
      let finalY = doc.previousAutoTable?.finalY ? doc.previousAutoTable.finalY + 8 : 150;
      
      if (finalY > 270) {
        doc.addPage();
        finalY = 20;
      }

      // ===== FOOTER TOTAL OMSET =====
      doc.setTextColor(164, 115, 82);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(`TOTAL OMSET PO CUSTOM: Rp ${grandTotalSum.toLocaleString('id-ID')},00`, 195, finalY, {
        align: 'right',
      });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(153, 153, 153);
      doc.text('— Akhir Laporan Pre-Order Custom Dibyo Lurik —', 105, finalY + 12, { align: 'center' });

      // Buka di tab baru
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Gagal generate PDF PO Custom:', err);
      alert('Terjadi kesalahan saat memproses preview PDF');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="w-full max-w-auto">
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Laporan Pre-Order Custom</h1>

      <LaporanPoCustomFilterBar
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        status={status}
        setStatus={setStatus}
        pembayaran={pembayaran}
        setPembayaran={setPembayaran}
        onExport={handleExportPDF}
        exportLoading={exportLoading}
      />

      {/* Render komponen tabel list data punyamu */}
      <LaporanPoTable data={poData} loading={loading} />
    </div>
  );
}