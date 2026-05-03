'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Check, X, Loader2,
  ImageIcon, AlertCircle, Sparkles, Package, Plus, Tag, Grid3X3, PenLine,
} from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';

// ── Types ────────────────────────────────────────────────────────────────────

interface Pt { x: number; y: number; }

interface DetectedItem {
  id: string;
  croppedImage: string;
  name: string;
  price: string;
  stock: string;
  sizes: string[];
  colors: string[];
  category: string;
  selected: boolean;
  tipo?: string;
  confianza_recorte?: 'high' | 'low';
}

// ── Constants ────────────────────────────────────────────────────────────────

const ALL_SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'Unitalla'];
const CATEGORIES = ['Fashion', 'Appliances', 'Electronics', 'Sports', 'Coffee', 'Hogar', 'Otro'];
const POLY_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ── Canvas helpers (client-side, no server required) ─────────────────────────

function extractGridCell(
  img: HTMLImageElement,
  srcX: number, srcY: number, srcW: number, srcH: number,
): string {
  const side = 600;
  const pad  = side * 0.10;
  const avail = side - pad * 2;
  const scale = Math.min(avail / srcW, avail / srcH);
  const dw = Math.round(srcW * scale);
  const dh = Math.round(srcH * scale);
  const canvas = document.createElement('canvas');
  canvas.width = side; canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, side, side);
  ctx.drawImage(img, srcX, srcY, srcW, srcH,
    Math.round((side - dw) / 2), Math.round((side - dh) / 2), dw, dh);
  return canvas.toDataURL('image/png');
}

function extractPolygonCrop(img: HTMLImageElement, polygon: Pt[]): string {
  const minX = Math.max(0, Math.min(...polygon.map(p => p.x)));
  const minY = Math.max(0, Math.min(...polygon.map(p => p.y)));
  const maxX = Math.min(img.naturalWidth,  Math.max(...polygon.map(p => p.x)));
  const maxY = Math.min(img.naturalHeight, Math.max(...polygon.map(p => p.y)));
  const bw = maxX - minX;
  const bh = maxY - minY;
  if (bw < 4 || bh < 4) return '';

  const side = 600;
  const pad  = side * 0.10;
  const avail = side - pad * 2;
  const scale = Math.min(avail / bw, avail / bh);
  const dw = Math.round(bw * scale);
  const dh = Math.round(bh * scale);
  const ox = Math.round((side - dw) / 2);
  const oy = Math.round((side - dh) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = side; canvas.height = side;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, side, side);

  ctx.save();
  ctx.beginPath();
  polygon.forEach((pt, i) => {
    const px = ox + (pt.x - minX) * scale;
    const py = oy + (pt.y - minY) * scale;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, minX, minY, bw, bh, ox, oy, dw, dh);
  ctx.restore();
  return canvas.toDataURL('image/png');
}

function canvasToImgCoords(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
): Pt {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) / rect.width;
  const cy = (e.clientY - rect.top)  / rect.height;
  return { x: cx * img.naturalWidth, y: cy * img.naturalHeight };
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AltaMasivaPage() {
  const router = useRouter();
  const { addProduct, profile } = useSupplier();
  const fileRef    = useRef<HTMLInputElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgElRef   = useRef<HTMLImageElement | null>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [baseModelName, setBaseModelName] = useState('');
  const [productType, setProductType]     = useState('');
  const [category, setCategory]           = useState('Fashion');
  const [price, setPrice]                 = useState('');
  const [stock, setStock]                 = useState('1');
  const [sizes, setSizes]                 = useState<string[]>([]);
  const [colors, setColors]               = useState<string[]>([]);
  const [colorInput, setColorInput]       = useState('');

  // Step 2 — photo
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64]   = useState('');
  const [imageMime, setImageMime]       = useState('image/jpeg');
  const [isDragging, setIsDragging]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // Step 2 — modo de captura
  const [cropMode, setCropMode] = useState<'ia' | 'grid' | 'freehand'>('ia');

  // Grid
  const [gridCols, setGridCols]         = useState(3);
  const [gridRows, setGridRows]         = useState(2);
  const [disabledCells, setDisabledCells] = useState<Set<string>>(new Set());

  // Trazo libre
  const [polygons, setPolygons]       = useState<Pt[][]>([]);
  const [currentPoly, setCurrentPoly] = useState<Pt[]>([]);
  const [hoverPt, setHoverPt]         = useState<Pt | null>(null);

  // Step 3
  const [items, setItems] = useState<DetectedItem[]>([]);

  // ── Reset al cambiar de modo ──────────────────────────────────────────────

  const handleSetMode = (m: 'ia' | 'grid' | 'freehand') => {
    setCropMode(m);
    setDisabledCells(new Set());
    setPolygons([]);
    setCurrentPoly([]);
    setHoverPt(null);
    setError('');
  };

  // ── Canvas redraw (trazo libre) ───────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    const img    = imgElRef.current;
    if (!canvas || !img || cropMode !== 'freehand') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sx = canvas.width  / img.naturalWidth;
    const sy = canvas.height / img.naturalHeight;

    // Polígonos cerrados
    polygons.forEach((poly, pi) => {
      const color = POLY_COLORS[pi % POLY_COLORS.length];
      ctx.beginPath();
      poly.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x * sx, pt.y * sy);
        else         ctx.lineTo(pt.x * sx, pt.y * sy);
      });
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.fillStyle = color + '30';
      ctx.fill();
      // Número
      const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length * sx;
      const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length * sy;
      ctx.fillStyle  = color;
      ctx.font       = 'bold 16px sans-serif';
      ctx.fillText(String(pi + 1), cx - 5, cy + 6);
    });

    // Polígono en construcción
    if (currentPoly.length > 0) {
      ctx.beginPath();
      currentPoly.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x * sx, pt.y * sy);
        else         ctx.lineTo(pt.x * sx, pt.y * sy);
      });
      if (hoverPt) ctx.lineTo(hoverPt.x * sx, hoverPt.y * sy);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#0A0A0A';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      currentPoly.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x * sx, pt.y * sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0A0A0A';
        ctx.fill();
      });
      // Indicador de cierre
      if (currentPoly.length >= 3) {
        ctx.beginPath();
        ctx.arc(currentPoly[0].x * sx, currentPoly[0].y * sy, 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth   = 2;
        ctx.stroke();
      }
    }
  }, [polygons, currentPoly, hoverPt, cropMode]);

  // ── Form helpers ─────────────────────────────────────────────────────────

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !colors.includes(c)) setColors(prev => [...prev, c]);
    setColorInput('');
  };

  const removeColor = (c: string) => setColors(prev => prev.filter(x => x !== c));

  const step1Valid = baseModelName.trim().length > 0 && price.trim().length > 0;

  // ── Photo helpers ─────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se aceptan imágenes JPG, PNG o WEBP.');
      return;
    }
    setError('');
    setImageMime(file.type);
    setDisabledCells(new Set());
    setPolygons([]);
    setCurrentPoly([]);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      const imgEl = new Image();
      imgEl.onload = () => { imgElRef.current = imgEl; };
      imgEl.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modo IA — análisis con API ────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!imageBase64) { setError('Sube una foto primero.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/supplier/bulk-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, mimeType: imageMime, productType: productType || baseModelName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al analizar la imagen.'); setLoading(false); return; }

      const products: Array<{ tipo: string; confianza_recorte: 'high' | 'low'; croppedImage: string; bbox: { x: number; y: number; w: number; h: number } }> = data.products;
      const detected: DetectedItem[] = products.map((p, i) => ({
        id: `item-${Date.now()}-${i}`,
        croppedImage: p.croppedImage,
        name: `${baseModelName.trim()} ${i + 1}`,
        tipo: p.tipo,
        confianza_recorte: p.confianza_recorte,
        price, stock, sizes: [...sizes], colors: [...colors], category, selected: true,
      }));
      setItems(detected);
      setStep(3);
      setLoading(false);
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
      setLoading(false);
    }
  };

  // ── Modo Cuadrícula ───────────────────────────────────────────────────────

  const toggleCell = (key: string) =>
    setDisabledCells(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const handleGenerateGrid = () => {
    const img = imgElRef.current;
    if (!img) return;
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const cellW = iw / gridCols;
    const cellH = ih / gridRows;
    const detected: DetectedItem[] = [];
    let idx = 0;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const key = `${row}-${col}`;
        if (disabledCells.has(key)) continue;
        idx++;
        const dataUrl = extractGridCell(img, col * cellW, row * cellH, cellW, cellH);
        detected.push({
          id: `item-${Date.now()}-${idx}`,
          croppedImage: dataUrl,
          name: `${baseModelName.trim()} ${idx}`,
          price, stock, sizes: [...sizes], colors: [...colors], category, selected: true,
        });
      }
    }
    if (detected.length === 0) { setError('Selecciona al menos una celda.'); return; }
    setItems(detected);
    setStep(3);
  };

  // ── Modo Trazo libre ──────────────────────────────────────────────────────

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img    = imgElRef.current;
    if (!canvas || !img) return;
    const pt = canvasToImgCoords(e, canvas, img);

    if (currentPoly.length >= 3) {
      const first = currentPoly[0];
      const dx = (pt.x - first.x) / img.naturalWidth;
      const dy = (pt.y - first.y) / img.naturalHeight;
      if (Math.sqrt(dx * dx + dy * dy) < 0.03) {
        setPolygons(prev => [...prev, currentPoly]);
        setCurrentPoly([]);
        setHoverPt(null);
        return;
      }
    }
    setCurrentPoly(prev => [...prev, pt]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const img    = imgElRef.current;
    if (!canvas || !img || currentPoly.length === 0) return;
    setHoverPt(canvasToImgCoords(e, canvas, img));
  };

  const handleGenerateFreehand = () => {
    const img = imgElRef.current;
    if (!img || polygons.length === 0) return;
    const detected: DetectedItem[] = polygons
      .map((poly, i) => ({
        id: `item-${Date.now()}-${i}`,
        croppedImage: extractPolygonCrop(img, poly),
        name: `${baseModelName.trim()} ${i + 1}`,
        price, stock, sizes: [...sizes], colors: [...colors], category, selected: true,
      }))
      .filter(it => it.croppedImage !== '');
    if (detected.length === 0) { setError('No se pudieron generar recortes.'); return; }
    setItems(detected);
    setStep(3);
  };

  // ── Item editing ─────────────────────────────────────────────────────────

  const updateItem = <K extends keyof DetectedItem>(id: string, field: K, value: DetectedItem[K]) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));

  const toggleItemSize = (id: string, s: string) =>
    setItems(prev => prev.map(it =>
      it.id === id
        ? { ...it, sizes: it.sizes.includes(s) ? it.sizes.filter(x => x !== s) : [...it.sizes, s] }
        : it,
    ));

  // ── Confirm alta ─────────────────────────────────────────────────────────

  const handleConfirm = () => {
    items.filter(it => it.selected).forEach((it) => {
      addProduct({
        sku: `${baseModelName.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
        name: it.name,
        category: it.category,
        price: parseFloat(it.price) || 0,
        stock: parseInt(it.stock) || 1,
        image: it.croppedImage,
        description: [[it.sizes.join(' / ') || 'Talla única', it.colors.join(', ')].filter(Boolean).join(' · ')].join(''),
        lowStockThreshold: 5,
        active: true,
      });
    });
    router.push('/supplier/inventario');
  };

  const selectedCount = items.filter(it => it.selected).length;
  const activeGridCells = gridCols * gridRows - disabledCells.size;
  const inputCls = 'w-full border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white';
  const stepLabels = ['Datos del lote', 'Foto grupal', 'Confirmar alta'];

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Back */}
      <button
        onClick={() => { if (step === 1) router.push('/supplier/inventario'); else setStep(s => (s - 1) as 1 | 2 | 3); }}
        className="flex items-center gap-1.5 text-sm text-[#6B6359] hover:text-[#0A0A0A] mb-6 transition-colors font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        {step === 1 ? 'Volver a inventario' : 'Paso anterior'}
      </button>

      {/* Title */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-[#0A0A0A] flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: profile.brandColor }} />
          Alta Masiva por Foto
        </h1>
        <p className="text-sm text-[#8F8780] font-body mt-0.5">
          Llena los datos, sube una foto grupal y recorta cada artículo — con IA, cuadrícula o trazo libre.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepLabels.map((label, idx) => {
          const n = idx + 1;
          return (
            <div key={n} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step >= n ? 'opacity-100' : 'opacity-40'}`}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors text-white"
                  style={{ backgroundColor: step >= n ? profile.brandColor : '#D9D5CF' }}
                >
                  {step > n ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span className="text-sm font-medium text-[#0A0A0A] hidden sm:block">{label}</span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`h-px w-8 flex-shrink-0 ${step > n ? 'bg-[#0A0A0A]' : 'bg-[#EDEBE8]'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: FORMULARIO ────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold text-[#0A0A0A] text-sm">Información del lote</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Nombre del producto base *</label>
                <input value={baseModelName} onChange={e => setBaseModelName(e.target.value)} placeholder="ej: Gorra Básica" className={inputCls} />
                <p className="text-[10px] text-[#8F8780] font-body mt-1">Se numerará automáticamente: "Gorra Básica 1", "Gorra Básica 2"…</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Tipo de producto (ayuda a la IA)</label>
                <input value={productType} onChange={e => setProductType(e.target.value)} placeholder="ej: gorras, camisas, tenis…" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Precio de venta ($) *</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Stock inicial por artículo</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="1" min="0" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Categoría</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Tallas */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">Tallas disponibles</label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map(s => (
                  <button key={s} type="button" onClick={() => toggleSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${sizes.includes(s) ? 'text-white border-transparent' : 'text-[#6B6359] border-[#EDEBE8] hover:border-[#D9D5CF]'}`}
                    style={sizes.includes(s) ? { backgroundColor: profile.brandColor, borderColor: profile.brandColor } : {}}
                  >{s}</button>
                ))}
              </div>
              {sizes.length === 0 && <p className="text-[10px] text-[#8F8780] font-body mt-1">Opcional — si no seleccionas ninguna se guardará como "Talla única"</p>}
            </div>

            {/* Colores */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">Colores disponibles</label>
              <div className="flex gap-2 mb-2">
                <input value={colorInput} onChange={e => setColorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                  placeholder="ej: Rojo, Azul marino…" className={`${inputCls} flex-1`} />
                <button type="button" onClick={addColor} disabled={!colorInput.trim()}
                  className="px-3 py-2 rounded-lg border border-[#EDEBE8] text-sm text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-40 transition-colors flex items-center gap-1">
                  <Plus className="h-4 w-4" />Añadir
                </button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <span key={c} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[#EDEBE8] bg-[#F7F6F5] text-[#0A0A0A]">
                      <Tag className="h-3 w-3 text-[#8F8780]" />{c}
                      <button type="button" onClick={() => removeColor(c)} className="text-[#8F8780] hover:text-red-500 transition-colors ml-0.5"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              {colors.length === 0 && <p className="text-[10px] text-[#8F8780] font-body">Opcional</p>}
            </div>
          </div>

          <button onClick={() => { if (step1Valid) setStep(2); }} disabled={!step1Valid}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: profile.brandColor }}>
            Siguiente: subir foto grupal <ChevronRight className="h-4 w-4" />
          </button>
          {!step1Valid && <p className="text-center text-xs text-[#8F8780] font-body -mt-2">Nombre del producto y precio son obligatorios</p>}
        </div>
      )}

      {/* ── STEP 2: FOTO + DETECCIÓN / RECORTE ───────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">

          {/* Resumen del lote */}
          <div className="bg-[#F7F6F5] border border-[#EDEBE8] rounded-xl px-5 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-body text-[#6B6359]">
            <span><strong className="text-[#0A0A0A]">Producto:</strong> {baseModelName}</span>
            <span><strong className="text-[#0A0A0A]">Precio:</strong> ${parseFloat(price || '0').toFixed(2)}</span>
            {sizes.length > 0 && <span><strong className="text-[#0A0A0A]">Tallas:</strong> {sizes.join(', ')}</span>}
            {colors.length > 0 && <span><strong className="text-[#0A0A0A]">Colores:</strong> {colors.join(', ')}</span>}
            <button onClick={() => setStep(1)} className="text-[#3B82F6] hover:underline ml-auto">Editar datos</button>
          </div>

          {/* Drop zone (siempre visible) */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !imagePreview && fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-colors ${!imagePreview ? 'cursor-pointer' : ''} ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-[#EDEBE8] hover:border-[#D9D5CF]'}`}
          >
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full max-h-72 object-contain rounded-2xl" />
                <button onClick={e => { e.stopPropagation(); setImagePreview(''); setImageBase64(''); imgElRef.current = null; }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-[#6B6359] hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
                <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-white rounded-lg shadow text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] transition-colors">
                  Cambiar foto
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F6F5] flex items-center justify-center mb-4">
                  <ImageIcon className="h-7 w-7 text-[#8F8780]" />
                </div>
                <p className="font-semibold text-[#0A0A0A] mb-1">Arrastra la foto grupal aquí</p>
                <p className="text-sm text-[#8F8780] font-body mb-4">o haz clic para seleccionar</p>
                <span className="px-4 py-2 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] bg-white">Elegir archivo</span>
                <p className="text-xs text-[#8F8780] font-body mt-3">JPG, PNG, WEBP · Máx 10 MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} />

          {/* Selector de modo (solo cuando hay imagen) */}
          {imagePreview && (
            <div className="flex gap-1 p-1 bg-[#F7F6F5] rounded-xl border border-[#EDEBE8]">
              {[
                { key: 'ia'      as const, label: 'IA Automática', Icon: Sparkles   },
                { key: 'grid'    as const, label: 'Cuadrícula',    Icon: Grid3X3    },
                { key: 'freehand'as const, label: 'Trazo libre',   Icon: PenLine    },
              ].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => handleSetMode(key)}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    cropMode === key ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#6B6359] hover:text-[#0A0A0A]'
                  }`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          )}

          {/* ── Modo Cuadrícula ─────────────────────────────────────────── */}
          {cropMode === 'grid' && imagePreview && (
            <div className="space-y-3">
              {/* Controles cols/rows */}
              <div className="flex gap-4 items-center justify-center p-3 bg-[#F7F6F5] rounded-xl border border-[#EDEBE8]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#6B6359]">Columnas</span>
                  <button onClick={() => setGridCols(c => Math.max(1, c - 1))} className="w-7 h-7 rounded-lg border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-white text-sm font-bold">−</button>
                  <span className="text-sm font-bold text-[#0A0A0A] w-5 text-center">{gridCols}</span>
                  <button onClick={() => setGridCols(c => Math.min(8, c + 1))} className="w-7 h-7 rounded-lg border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-white text-sm font-bold">+</button>
                </div>
                <div className="w-px h-6 bg-[#EDEBE8]" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#6B6359]">Filas</span>
                  <button onClick={() => setGridRows(r => Math.max(1, r - 1))} className="w-7 h-7 rounded-lg border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-white text-sm font-bold">−</button>
                  <span className="text-sm font-bold text-[#0A0A0A] w-5 text-center">{gridRows}</span>
                  <button onClick={() => setGridRows(r => Math.min(8, r + 1))} className="w-7 h-7 rounded-lg border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-white text-sm font-bold">+</button>
                </div>
                <div className="w-px h-6 bg-[#EDEBE8]" />
                <span className="text-xs text-[#6B6359] font-body">
                  <strong className="text-[#0A0A0A]">{activeGridCells}</strong> artículos
                </span>
              </div>

              {/* Imagen con grid overlay */}
              <div className="relative rounded-xl overflow-hidden border border-[#EDEBE8] select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Grid" className="w-full object-contain" draggable={false} />
                <div
                  className="absolute inset-0"
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gridTemplateRows: `repeat(${gridRows}, 1fr)` }}
                >
                  {Array.from({ length: gridRows * gridCols }, (_, i) => {
                    const row = Math.floor(i / gridCols);
                    const col = i % gridCols;
                    const key = `${row}-${col}`;
                    const disabled = disabledCells.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleCell(key)}
                        className={`border border-white/60 transition-all ${disabled ? 'bg-black/50' : 'hover:bg-white/10'}`}
                        title={disabled ? 'Excluida — clic para activar' : 'Activa — clic para excluir'}
                      >
                        {disabled && <X className="h-5 w-5 text-white/80 mx-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-[#8F8780] font-body text-center">
                Haz clic en una celda para excluirla del recorte
              </p>
              {error && <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-body"><AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />{error}</div>}
              <button onClick={handleGenerateGrid} disabled={activeGridCells === 0}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: profile.brandColor }}>
                <Grid3X3 className="h-4 w-4" />
                Generar {activeGridCells} recorte{activeGridCells !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* ── Modo Trazo libre ─────────────────────────────────────────── */}
          {cropMode === 'freehand' && imagePreview && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-body">
                <strong>Cómo usar:</strong> Haz clic sobre la imagen para ir colocando puntos alrededor del artículo.
                Al hacer clic cerca del primer punto (círculo verde) el contorno se cierra automáticamente.
                Puedes trazar tantas zonas como artículos haya.
              </div>

              {/* Canvas sobre imagen */}
              <div className="relative rounded-xl overflow-hidden border border-[#EDEBE8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Trazo" className="w-full object-contain block" draggable={false} />
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full cursor-crosshair"
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoverPt(null)}
                />
              </div>

              {/* Lista de zonas + controles */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-body text-[#6B6359]">
                  <strong className="text-[#0A0A0A]">{polygons.length}</strong> zona{polygons.length !== 1 ? 's' : ''} dibujada{polygons.length !== 1 ? 's' : ''}
                  {currentPoly.length > 0 && <span className="ml-2 text-amber-600">· en progreso ({currentPoly.length} pts)</span>}
                </span>
                <div className="flex gap-2">
                  {currentPoly.length > 0 && (
                    <button onClick={() => { setCurrentPoly([]); setHoverPt(null); }}
                      className="text-xs font-semibold text-[#6B6359] hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                      Cancelar zona
                    </button>
                  )}
                  {polygons.length > 0 && (
                    <button onClick={() => setPolygons(prev => prev.slice(0, -1))}
                      className="text-xs font-semibold text-[#6B6359] hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                      Deshacer última
                    </button>
                  )}
                </div>
              </div>

              {/* Chips de zonas con color */}
              {polygons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {polygons.map((_, pi) => (
                    <span key={pi}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border text-white"
                      style={{ backgroundColor: POLY_COLORS[pi % POLY_COLORS.length], borderColor: POLY_COLORS[pi % POLY_COLORS.length] }}>
                      Zona {pi + 1}
                      <button type="button" onClick={() => setPolygons(prev => prev.filter((_, i) => i !== pi))}
                        className="opacity-80 hover:opacity-100 ml-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {error && <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-body"><AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />{error}</div>}

              <button onClick={handleGenerateFreehand} disabled={polygons.length === 0}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: profile.brandColor }}>
                <PenLine className="h-4 w-4" />
                Confirmar {polygons.length} recorte{polygons.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}

          {/* ── Modo IA ──────────────────────────────────────────────────── */}
          {cropMode === 'ia' && (
            <>
              <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
                <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-blue-700 font-body">
                  <strong>Tip:</strong> La IA detecta y recorta cada artículo automáticamente.
                  Si el resultado no es preciso, cambia a <strong>Cuadrícula</strong> o <strong>Trazo libre</strong>.
                </span>
              </div>
              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-body">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />{error}
                </div>
              )}
              <button onClick={handleAnalyze} disabled={!imageBase64 || loading}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: profile.brandColor }}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Detectando artículos con IA…</>
                ) : (
                  <><Sparkles className="h-4 w-4" />Detectar y recortar artículos</>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── STEP 3: REVISAR + CONFIRMAR ───────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-body text-[#6B6359]">
              <span className="font-bold text-[#0A0A0A]">{items.length}</span> artículos ·{' '}
              <span className="font-bold text-[#0A0A0A]">{selectedCount}</span> seleccionados para alta
            </p>
            <div className="flex gap-2">
              <button onClick={() => setItems(prev => prev.map(it => ({ ...it, selected: true })))}
                className="text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] px-2 py-1 rounded hover:bg-[#F7F6F5] transition-colors">Todos</button>
              <button onClick={() => setItems(prev => prev.map(it => ({ ...it, selected: false })))}
                className="text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] px-2 py-1 rounded hover:bg-[#F7F6F5] transition-colors">Ninguno</button>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 text-[#8F8780] font-body border border-[#EDEBE8] rounded-2xl">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              No se detectaron artículos. Intenta con una imagen más clara.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${item.selected ? 'border-[#0A0A0A] shadow-sm' : 'border-[#EDEBE8] opacity-55'}`}>
                  <div className="relative h-44 bg-[#F7F6F5]">
                    {item.croppedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.croppedImage} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="h-10 w-10 text-[#D9D5CF]" /></div>
                    )}
                    {item.tipo && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#0A0A0A] border border-[#EDEBE8]">
                        {item.tipo === 'gorra' ? 'Gorra' : 'Artículo'}
                      </span>
                    )}
                    {item.confianza_recorte === 'low' && (
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        Verificar recorte
                      </span>
                    )}
                    <button onClick={() => updateItem(item.id, 'selected', !item.selected)}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.selected ? 'bg-white border-white' : 'bg-white/70 border-white'}`}>
                      {item.selected && <Check className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />}
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Nombre</label>
                      <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)}
                        className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Precio ($)</label>
                        <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)}
                          className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white" min="0" step="0.01" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Stock</label>
                        <input type="number" value={item.stock} onChange={e => updateItem(item.id, 'stock', e.target.value)}
                          className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white" min="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Tallas</label>
                      <div className="flex flex-wrap gap-1">
                        {ALL_SIZES.map(s => (
                          <button key={s} type="button" onClick={() => toggleItemSize(item.id, s)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${item.sizes.includes(s) ? 'text-white border-transparent' : 'text-[#8F8780] border-[#EDEBE8]'}`}
                            style={item.sizes.includes(s) ? { backgroundColor: profile.brandColor } : {}}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-3 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors">
              <ChevronLeft className="h-4 w-4" />Cambiar foto
            </button>
            <button onClick={handleConfirm} disabled={selectedCount === 0}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: profile.brandColor }}>
              <Check className="h-4 w-4" />
              Dar de alta {selectedCount} artículo{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
