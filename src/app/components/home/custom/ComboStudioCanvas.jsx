"use client"

import { useRef, useState, useEffect } from 'react'
import { Layers, Loader2, Scissors, Shirt, Sparkles } from 'lucide-react'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import { motion, AnimatePresence } from 'framer-motion'

// PERBAIKAN UTAMA: Mengambil 4 kombinasi warna berbeda dalam satu gambar referensi lurik
const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 10, 10);
      
      try {
        // Mengambil sampel di beberapa titik koordinat koordinat jalinan benang kain yang bervariasi
        const points = [
          ctx.getImageData(5, 5, 1, 1).data, // Tengah gambar
          ctx.getImageData(2, 3, 1, 1).data, // Kiri atas
          ctx.getImageData(8, 7, 1, 1).data, // Kanan bawah
          ctx.getImageData(4, 8, 1, 1).data  // Bawah tengah
        ];
        
        const extractedColors = points.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);
        // Hapus duplikasi jika ada warna piksel yang terlalu identik
        const uniqueColors = [...new Set(extractedColors)];
        resolve(uniqueColors);
      } catch (e) {
        resolve(['#E5BA73']);
      }
    };
    img.onerror = () => resolve(['transparent']);
  });
};

export default function ComboStudioCanvas({ 
  combination,
  bgColor,          
  setBgColor,       
  patternDensity,   
  stripes,          
  setStripes,
  onReset 
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null) 
  const isExtractedRef = useRef('') 
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false) 
  const [previewView, setPreviewView] = useState('kain')
  const [subBawahan, setSubBawahan] = useState('kain') 
  const [canvasUrl, setCanvasUrl] = useState('none')

  const activeImageUrls = Object.values(combination)
    .filter(item => item !== null)
    .map(item => item.gambar_url)

  const combinationKey = Object.entries(combination)
    .map(([slot, item]) => `${slot}:${item ? item.id || item.nomor_gulungan : 'null'}`)
    .join('|');

  useEffect(() => {
    if (isExtractedRef.current === combinationKey) return;

    if (activeImageUrls.length > 0) {
      setIsLoading(true);
      
      const promises = activeImageUrls.map(url => extractDominantColor(url));
      Promise.all(promises).then(colorsArrays => {
        // Karena extractDominantColor mengembalikan array, ratakan dengan .flat()
        const validColors = colorsArrays.flat().filter(c => c !== 'transparent');
        
        if (validColors.length > 0 && setBgColor) {
          setBgColor(validColors[0]);
        }

        if (setStripes) {
          // Bentuk struktur benang awal berdasarkan variasi warna yang terekstraksi
          const initialStripes = validColors.slice(0, 8).map((color, idx) => ({
            id: idx + 1,
            thickness: 16, 
            color: color
          }));
          setStripes(initialStripes);
        }
        
        isExtractedRef.current = combinationKey;
        setIsLoading(false);
      });
    } else {
      if (setStripes) setStripes([]);
      isExtractedRef.current = '';
    }
  }, [combinationKey]); 

  useEffect(() => {
    if (canvasRef.current && stripes.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const actualWidth = canvas.parentElement?.getBoundingClientRect().width || 500;
      const actualHeight = canvas.parentElement?.getBoundingClientRect().height || 500;

      canvas.width = actualWidth * window.devicePixelRatio;
      canvas.height = actualHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      const w = actualWidth;
      const h = actualHeight;

      ctx.clearRect(0, 0, w, h);
      
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = bgColor || '#12110F';
      ctx.fillRect(0, 0, w, h);

      const scaleMultiplier = (patternDensity / 100) || 1.0;
      const basePatternWidth = stripes.reduce((acc, s) => acc + (parseInt(s.thickness, 10) || 1) + 2, 0);
      const scaledPatternWidth = basePatternWidth * scaleMultiplier;

      let currentX = 0;
      
      if (scaledPatternWidth > 0) {
        while (currentX < w) {
          for (let i = 0; i < stripes.length; i++) {
            const stripe = stripes[i];
            const currentStripeWidth = (parseInt(stripe.thickness, 10) || 1) * scaleMultiplier;
            
            ctx.fillStyle = stripe.color;
            ctx.fillRect(currentX, 0, currentStripeWidth, h);
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(currentX + currentStripeWidth, 0, 2 * scaleMultiplier, h);

            currentX += currentStripeWidth + (2 * scaleMultiplier);
            if (currentX >= w) break;
          }
        }
      }

      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.07; 
      for (let x = 0; x < w; x += 3) {
        ctx.fillStyle = x % 6 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(x, 0, 1.5, h);
      }
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = y % 6 === 0 ? '#000000' : '#ffffff';
        ctx.fillRect(0, y, w, 1.5);
      }

      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.42;
      const foldGrad = ctx.createLinearGradient(0, 0, w, 0);
      foldGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.65)');
      foldGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.15)');
      foldGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.52)');
      foldGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.22)');
      foldGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.55)');
      foldGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.68)');
      ctx.fillStyle = foldGrad;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      const vignette = ctx.createRadialGradient(w/2, h/2, Math.min(w,h) * 0.38, w/2, h/2, Math.max(w,h) * 0.85);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      setCanvasUrl(`url(${canvas.toDataURL()})`);
    }
  }, [bgColor, patternDensity, stripes]); 

  const baseCanvasPatternStyle = {
    backgroundColor: bgColor || '#132237',
    backgroundImage: canvasUrl,
    backgroundSize: 'cover', 
  };

  const captureElement = async (viewMode, subMode) => {
    const originalView = previewView;
    const originalSub = subBawahan;

    setPreviewView(viewMode);
    if (subMode) setSubBawahan(subMode);

    await new Promise((resolve) => setTimeout(resolve, 350));

    let base64Data = "";

    if (viewMode === 'kain') {
      if (canvasRef.current) {
        base64Data = canvasRef.current.toDataURL('image/png').split(',')[1];
      }
    } else {
      if (containerRef.current) {
        const screenshot = await html2canvas(containerRef.current, {
          useCORS: true,
          backgroundColor: '#071110',
          scale: 2,
          logging: false
        });
        base64Data = screenshot.toDataURL('image/png').split(',')[1];
      }
    }

    setPreviewView(originalView);
    if (subMode) setSubBawahan(originalSub);

    return base64Data;
  };

  const handleUnduhSemuaBerkasZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folderCombo = zip.folder("Hasil_Kombinasi_Studio_Lurik");

      const fabricBase64 = await captureElement('kain');
      if (fabricBase64) folderCombo.file("01_Pratinjau_Serat_Kain.png", fabricBase64, { base64: true });

      const shirtBase64 = await captureElement('baju');
      if (shirtBase64) folderCombo.file("02_Mockup_Kemeja_Lurik.png", shirtBase64, { base64: true });

      const outfitKainBase64 = await captureElement('setelan', 'kain');
      if (outfitKainBase64) folderCombo.file("03_Setelan_Paduan_Kain.png", outfitKainBase64, { base64: true });

      const outfitCelanaBase64 = await captureElement('setelan', 'celana');
      if (outfitCelanaBase64) folderCombo.file("04_Setelan_Paduan_Celana.png", outfitCelanaBase64, { base64: true });

      const content = await zip.generateAsync({ type: "blob" });

      const linkDownload = document.createElement('a');
      linkDownload.href = URL.createObjectURL(content);
      linkDownload.download = `Combo_Studio_${Date.now()}.zip`;
      document.body.appendChild(linkDownload);
      linkDownload.click();
      document.body.removeChild(linkDownload);

    } catch (error) {
      console.error("Gagal memproses paket unduhan zip:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const mockupAnimationVariants = {
    initial: { opacity: 0, scale: 0.94, filter: 'blur(4px)' },
    animate: { 
      opacity: 1, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 260, damping: 25 } 
    },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
  };

  return (
    <div className="w-full lg:w-[55%] flex flex-col bg-[#F5F2EB] border border-[#E5BA73]/10 rounded-3xl p-6 relative h-[600px] lg:h-auto overflow-hidden">
        
      <canvas 
        ref={canvasRef} 
        className="hidden" 
      />

      {/* Top Header & Tab Controls */}
      <div className="absolute z-20 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center top-6 left-6 right-6">
        <div className="flex items-center gap-2 bg-[#12110F]/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
            {previewView === 'kain' ? 'Pratinjau Tenun Langsung' : 'Mockup Fitting Aktif'}
          </span>
        </div>

        <div className="flex gap-1 p-1 border bg-[#aa9e84]/90 backdrop-blur-md border-white/10 rounded-xl relative">
          {[
            { id: 'kain', label: 'Kain', icon: <Scissors size={11} /> },
            { id: 'baju', label: 'Baju', icon: <Shirt size={11} /> },
            { id: 'setelan', label: 'Setelan', icon: <Sparkles size={11} /> }
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setPreviewView(view.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider relative transition-all duration-300 z-10 ${
                previewView === view.id ? 'text-[#0A1715]' : 'text-[#ffffff] hover:text-[#0a1715]'
              }`}
            >
              {previewView === view.id && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#F5F2EB] rounded-lg shadow-md -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm rounded-2xl"
          >
            <Loader2 className="animate-spin text-[#E5BA73]" size={32} />
            <p className="text-sm text-[#F9F6F0]">Menganalisis jalinan warna serat...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Studio Mockup Area */}
      <div ref={containerRef} className="w-full h-full mt-10 rounded-2xl shadow-2xl relative overflow-hidden border border-white/5 bg-[#12110F]/40 backdrop-blur-sm flex items-center justify-center">
        {activeImageUrls.length === 0 && stripes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Layers className="text-zinc-600" size={32} />
            <p className="text-sm text-[#A3A19E]">Belum ada kain yang dipilih.</p>
          </div>
        ) : (
          <div className="relative flex items-center justify-center w-full h-full p-4">
            
            <AnimatePresence mode="wait">
              {/* 1. VIEW: KAIN */}
              {previewView === 'kain' && (
                <motion.div 
                  key="canvas-view"
                  variants={mockupAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={baseCanvasPatternStyle}
                  className="w-full h-full shadow-inner rounded-2xl"
                />
              )}

              {/* 2. VIEW: BAJU */}
              {previewView === 'baju' && (
                <motion.div 
                  key="baju-view"
                  variants={mockupAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative w-full h-full max-w-2xl max-h-[500px] flex items-center justify-center"
                >
                  <div 
                    style={{
                      ...baseCanvasPatternStyle,
                      maskImage: "url('/mockups/shirt-long-front-mask.png')",
                      WebkitMaskImage: "url('/mockups/shirt-long-front-mask.png')",
                      maskSize: 'contain',
                      WebkitMaskSize: 'contain',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                    }} 
                    className="absolute inset-0 w-full h-full"
                  />
                  <img src="/mockups/shirt-long-front-mask.png" alt="Tekstur Baju" className="absolute inset-0 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-70" />
                </motion.div>
              )}

              {/* 3. VIEW: SETELAN */}
              {previewView === 'setelan' && (
                <motion.div 
                  key="setelan-view"
                  variants={mockupAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center w-full h-full p-6"
                >
                  <div className="relative w-full h-full max-w-3xl max-h-[600px] flex justify-between items-center">
                    
                    {/* Sisi Kiri: Manekin Fitting */}
                    <div className="relative w-[65%] h-full">
                      {(() => {
                        const posisiSetelan = {
                          baju: { X: "0%", Y: "-15%" },
                          bawahan: { X: "-29%", Y: "9%" },
                        };

                        return (
                          <>
                            {/* Celana */}
                            <div 
                              className="absolute inset-0 z-0 transform transition-all duration-300 scale-[1.05]"
                              style={{
                                transform: `translate(${posisiSetelan.bawahan.X}, ${posisiSetelan.bawahan.Y})`,
                              }}
                            >
                              <img src="/mockups/pants-black-fixture.png" alt="Celana Hitam Pasangan Kemeja" className="object-contain w-full h-full pointer-events-none" />
                            </div>

                            {/* Atasan Baju */}
                            <div 
                              className="absolute inset-0 z-10 transition-all duration-300 transform"
                              style={{
                                transform: `translate(${posisiSetelan.baju.X}, ${posisiSetelan.baju.Y})`,
                              }}
                            >
                              <div 
                                style={{
                                  ...baseCanvasPatternStyle,
                                  maskImage: "url('/mockups/shirt-long-front-mask.png')",
                                  WebkitMaskImage: "url('/mockups/shirt-long-front-mask.png')",
                                  maskSize: 'contain',
                                  WebkitMaskSize: 'contain',
                                  maskRepeat: 'no-repeat',
                                  maskPosition: 'center'
                                }} 
                                className="absolute inset-0 w-full h-full transition-all duration-300"
                              />
                              <img src="/mockups/shirt-long-front-mask.png" alt="Tekstur Atasan" className="object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-60" />
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Sisi Kanan: Detail Gantung */}
                    <div className="relative w-[32%] h-[55%] flex flex-col items-center justify-between bg-[#12110F]/40 backdrop-blur-sm border border-white/5 rounded-2xl p-3 shadow-xl">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5BA73]/80 mb-2 block text-center w-full border-b border-white/5 pb-1.5">
                        Detail Tekstur
                      </span>
                      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                        <div 
                          style={{
                            ...baseCanvasPatternStyle,
                            maskImage: "url('/mockups/kain-gantung-mask.png')",
                            WebkitMaskImage: "url('/mockups/kain-gantung-mask.png')",
                            maskSize: 'contain',
                            WebkitMaskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center'
                          }}
                          className="absolute inset-0 z-0 w-full h-full transition-all duration-300 ease-in-out"
                        />
                        <img src="/mockups/kain-gantung-mask.png" alt="Tekstur Sampel Kain Kustom" className="absolute inset-0 z-10 object-contain w-full h-full pointer-events-none mix-blend-multiply opacity-90" />
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-white/5 px-2.5 py-1 rounded-md text-[9px] uppercase tracking-widest text-[#E5BA73] font-medium pointer-events-none z-10">
              Mode: {previewView}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Menu Unduh */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#12110F]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl z-109">
        <button 
          type="button"
          onClick={handleUnduhSemuaBerkasZip}
          disabled={isDownloading}
          className={`flex items-center gap-2 text-xs font-bold transition-colors tracking-wide ${isDownloading ? 'text-[#E5BA73]/50 cursor-not-allowed' : 'text-[#F9F6F0] hover:text-[#E5BA73]'}`}
        >
          <svg className={`w-5 h-5 ${isDownloading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isDownloading ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            )}
          </svg>
          {isDownloading ? 'Memproses ZIP Berkas...' : 'Unduh Berkas'}
        </button>
      </div>

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,rgba(229,186,115,0.2)_0%,transparent_50%)] pointer-events-none" />
    </div>
  )
}