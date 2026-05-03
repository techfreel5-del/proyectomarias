'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Check, X, Loader2,
  ImageIcon, AlertCircle, Sparkles, Package, Plus, Tag,
} from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';

// ── Types ────────────────────────────────────────────────────────────────────

interface PolygonPoint { x: number; y: number; }

interface ProductDetection {
  bbox: { x: number; y: number; w: number; h: number };
  polygon: PolygonPoint[];
  croppedImage: string;
}

interface DetectedItem {
  id: string;
  croppedImage: string;   // data URL from canvas crop
  name: string;
  price: string;
  stock: string;
  sizes: string[];
  colors: string[];
  category: string;
  selected: boolean;
}

// ── Constants ────────────────────────────────────────────────────────────────

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Unitalla'];
const CATEGORIES = ['Fashion', 'Appliances', 'Electronics', 'Sports', 'Coffee', 'Hogar', 'Otro'];

// ── Canvas helpers (runs in browser) ─────────────────────────────────────────
//
// bboxToPolygon — fallback cuando el servidor no devuelve polígono válido.
// Cubre el crop completo (equivalente al comportamiento rectangular anterior).
function bboxToPolygon(): PolygonPoint[] {
  return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
}

// compositeOnWhiteCanvas — coloca el crop del servidor en un canvas cuadrado
// blanco puro con 10 % de padding. Aplica máscara de polígono para eliminar
// el fondo y bordes de artículos vecinos.
function compositeOnWhiteCanvas(
  croppedDataUrl: string,
  polygon: PolygonPoint[],
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.round(Math.min(800, Math.max(400, Math.max(img.naturalWidth, img.naturalHeight) * 1.2)));

      const canvas = document.createElement('canvas');
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(croppedDataUrl); return; }

      // Fondo blanco puro
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, side, side);

      // Área de dibujo con 10 % de padding interior
      const innerPad = side * 0.10;
      const availW = side - innerPad * 2;
      const availH = side - innerPad * 2;
      const scale = Math.min(availW / img.naturalWidth, availH / img.naturalHeight);
      const dw = Math.round(img.naturalWidth * scale);
      const dh = Math.round(img.naturalHeight * scale);
      const dx = Math.round((side - dw) / 2);
      const dy = Math.round((side - dh) / 2);

      // Aplicar contraste leve antes de dibujar (feature-check para Safari < 18)
      if ('filter' in ctx) (ctx as CanvasRenderingContext2D).filter = 'contrast(1.08)';

      // Clip por polígono de silueta
      ctx.save();
      ctx.beginPath();
      polygon.forEach((pt, i) => {
        const px = dx + pt.x * dw;
        const py = dy + pt.y * dh;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);
      ctx.restore();

      if ('filter' in ctx) (ctx as CanvasRenderingContext2D).filter = 'none';

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(croppedDataUrl);
    img.src = croppedDataUrl;
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AltaMasivaPage() {
  const router = useRouter();
  const { addProduct, profile } = useSupplier();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 — form
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

  // Step 3 — detected items
  const [items, setItems] = useState<DetectedItem[]>([]);

  // ── Form helpers ─────────────────────────────────────────────────────────

  const toggleSize = (s: string) =>
    setSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const addColor = () => {
    const c = colorInput.trim();
    if (c && !colors.includes(c)) setColors((prev) => [...prev, c]);
    setColorInput('');
  };

  const removeColor = (c: string) => setColors((prev) => prev.filter((x) => x !== c));

  const step1Valid = baseModelName.trim().length > 0 && price.trim().length > 0;

  // ── Photo helpers ─────────────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Solo se aceptan imágenes JPG, PNG o WEBP.');
      return;
    }
    setError('');
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
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

  // ── Analyze ───────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!imageBase64) { setError('Sube una foto primero.'); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/supplier/bulk-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          mimeType: imageMime,
          productType: productType || baseModelName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al analizar la imagen.');
        setLoading(false);
        return;
      }

      const products: ProductDetection[] = data.products;

      const detected: DetectedItem[] = await Promise.all(
        products.map(async (p, i) => ({
          id: `item-${Date.now()}-${i}`,
          croppedImage: await compositeOnWhiteCanvas(
            p.croppedImage,
            p.polygon.length >= 4 ? p.polygon : bboxToPolygon(),
          ),
          name: `${baseModelName.trim()} ${i + 1}`,
          price,
          stock,
          sizes: [...sizes],
          colors: [...colors],
          category,
          selected: true,
        })),
      );
      setItems(detected);
      setStep(3);
      setLoading(false);
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
      setLoading(false);
    }
  };

  // ── Item editing ─────────────────────────────────────────────────────────

  const updateItem = <K extends keyof DetectedItem>(id: string, field: K, value: DetectedItem[K]) =>
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, [field]: value } : it));

  const toggleItemSize = (id: string, s: string) =>
    setItems((prev) => prev.map((it) =>
      it.id === id
        ? { ...it, sizes: it.sizes.includes(s) ? it.sizes.filter((x) => x !== s) : [...it.sizes, s] }
        : it,
    ));

  // ── Confirm alta ─────────────────────────────────────────────────────────

  const handleConfirm = () => {
    const selected = items.filter((it) => it.selected);
    selected.forEach((it) => {
      const sizeStr = it.sizes.join(' / ') || 'Talla única';
      const colorStr = it.colors.join(', ') || '';
      addProduct({
        sku: `${baseModelName.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
        name: it.name,
        category: it.category,
        price: parseFloat(it.price) || 0,
        stock: parseInt(it.stock) || 1,
        image: it.croppedImage,
        description: [sizeStr, colorStr].filter(Boolean).join(' · '),
        lowStockThreshold: 5,
        active: true,
      });
    });
    router.push('/supplier/inventario');
  };

  const handleDownloadAll = () => {
    items.filter((it) => it.selected).forEach((it, i) => {
      const a = document.createElement('a');
      a.href = it.croppedImage;
      const safeName = it.name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\s]/g, '').replace(/\s+/g, '_');
      a.download = `${safeName}_${i + 1}.png`;
      a.click();
    });
  };

  const selectedCount = items.filter((it) => it.selected).length;
  const inputCls = 'w-full border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white';

  // ── Step indicator ────────────────────────────────────────────────────────

  const stepLabels = ['Datos del lote', 'Foto grupal', 'Confirmar alta'];

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Back */}
      <button
        onClick={() => {
          if (step === 1) router.push('/supplier/inventario');
          else setStep((s) => (s - 1) as 1 | 2 | 3);
        }}
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
          Llena los datos, toma una foto grupal y la IA recorta cada artículo individualmente.
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
              {/* Nombre base */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Nombre del producto base *
                </label>
                <input
                  value={baseModelName}
                  onChange={(e) => setBaseModelName(e.target.value)}
                  placeholder="ej: Gorra Básica"
                  className={inputCls}
                />
                <p className="text-[10px] text-[#8F8780] font-body mt-1">
                  Se numerará automáticamente: "Gorra Básica 1", "Gorra Básica 2"…
                </p>
              </div>

              {/* Tipo de producto */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Tipo de producto (ayuda a la IA)
                </label>
                <input
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="ej: gorras, camisas, tenis…"
                  className={inputCls}
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Precio de venta ($) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={inputCls}
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Stock inicial por artículo
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="1"
                  min="0"
                  className={inputCls}
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Categoría
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Tallas */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">
                Tallas disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      sizes.includes(s)
                        ? 'text-white border-transparent'
                        : 'text-[#6B6359] border-[#EDEBE8] hover:border-[#D9D5CF]'
                    }`}
                    style={sizes.includes(s) ? { backgroundColor: profile.brandColor, borderColor: profile.brandColor } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizes.length === 0 && (
                <p className="text-[10px] text-[#8F8780] font-body mt-1">
                  Opcional — si no seleccionas ninguna se guardará como "Talla única"
                </p>
              )}
            </div>

            {/* Colores */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">
                Colores disponibles
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }}
                  placeholder="ej: Rojo, Azul marino…"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={addColor}
                  disabled={!colorInput.trim()}
                  className="px-3 py-2 rounded-lg border border-[#EDEBE8] text-sm text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-40 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Añadir
                </button>
              </div>
              {colors.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <span
                      key={c}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-[#EDEBE8] bg-[#F7F6F5] text-[#0A0A0A]"
                    >
                      <Tag className="h-3 w-3 text-[#8F8780]" />
                      {c}
                      <button
                        type="button"
                        onClick={() => removeColor(c)}
                        className="text-[#8F8780] hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {colors.length === 0 && (
                <p className="text-[10px] text-[#8F8780] font-body">Opcional</p>
              )}
            </div>
          </div>

          <button
            onClick={() => { if (step1Valid) setStep(2); }}
            disabled={!step1Valid}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: profile.brandColor }}
          >
            Siguiente: subir foto grupal
            <ChevronRight className="h-4 w-4" />
          </button>

          {!step1Valid && (
            <p className="text-center text-xs text-[#8F8780] font-body -mt-2">
              Nombre del producto y precio son obligatorios
            </p>
          )}
        </div>
      )}

      {/* ── STEP 2: FOTO + DETECCIÓN ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">

          {/* Resumen del lote */}
          <div className="bg-[#F7F6F5] border border-[#EDEBE8] rounded-xl px-5 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-body text-[#6B6359]">
            <span><strong className="text-[#0A0A0A]">Producto:</strong> {baseModelName}</span>
            <span><strong className="text-[#0A0A0A]">Precio:</strong> ${parseFloat(price || '0').toFixed(2)}</span>
            {sizes.length > 0 && <span><strong className="text-[#0A0A0A]">Tallas:</strong> {sizes.join(', ')}</span>}
            {colors.length > 0 && <span><strong className="text-[#0A0A0A]">Colores:</strong> {colors.join(', ')}</span>}
            <button onClick={() => setStep(1)} className="text-[#3B82F6] hover:underline ml-auto">Editar datos</button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !imagePreview && fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-[#EDEBE8] hover:border-[#D9D5CF]'
            }`}
          >
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain rounded-2xl"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setImagePreview(''); setImageBase64(''); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-[#6B6359] hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-white rounded-lg shadow text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] transition-colors"
                >
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
                <span className="px-4 py-2 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] bg-white">
                  Elegir archivo
                </span>
                <p className="text-xs text-[#8F8780] font-body mt-3">JPG, PNG, WEBP · Máx 10 MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />

          {/* Tip */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
            <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-blue-700 font-body">
              <strong>Tip:</strong> Usa una foto bien iluminada donde cada artículo sea claramente visible.
              La IA detectará cada uno individualmente y recortará su foto automáticamente.
            </span>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-body">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!imageBase64 || loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: profile.brandColor }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Detectando artículos con IA…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Detectar y recortar artículos
              </>
            )}
          </button>
        </div>
      )}

      {/* ── STEP 3: REVISAR + CONFIRMAR ───────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-body text-[#6B6359]">
              <span className="font-bold text-[#0A0A0A]">{items.length}</span> artículos detectados ·{' '}
              <span className="font-bold text-[#0A0A0A]">{selectedCount}</span> seleccionados para alta
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setItems((prev) => prev.map((it) => ({ ...it, selected: true })))}
                className="text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] px-2 py-1 rounded hover:bg-[#F7F6F5] transition-colors"
              >
                Todos
              </button>
              <button
                onClick={() => setItems((prev) => prev.map((it) => ({ ...it, selected: false })))}
                className="text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] px-2 py-1 rounded hover:bg-[#F7F6F5] transition-colors"
              >
                Ninguno
              </button>
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
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${
                    item.selected ? 'border-[#0A0A0A] shadow-sm' : 'border-[#EDEBE8] opacity-55'
                  }`}
                >
                  {/* Foto recortada */}
                  <div className="relative h-44 bg-[#F7F6F5]">
                    {item.croppedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.croppedImage}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-10 w-10 text-[#D9D5CF]" />
                      </div>
                    )}
                    {/* Select toggle */}
                    <button
                      onClick={() => updateItem(item.id, 'selected', !item.selected)}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.selected ? 'bg-white border-white' : 'bg-white/70 border-white'
                      }`}
                    >
                      {item.selected && <Check className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />}
                    </button>
                  </div>

                  {/* Campos editables */}
                  <div className="p-4 space-y-3">
                    {/* Nombre */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Nombre</label>
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                      />
                    </div>

                    {/* Precio + Stock */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Precio ($)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                          min="0" step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Stock</label>
                        <input
                          type="number"
                          value={item.stock}
                          onChange={(e) => updateItem(item.id, 'stock', e.target.value)}
                          className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Tallas */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Tallas</label>
                      <div className="flex flex-wrap gap-1">
                        {ALL_SIZES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleItemSize(item.id, s)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                              item.sizes.includes(s)
                                ? 'text-white border-transparent'
                                : 'text-[#8F8780] border-[#EDEBE8]'
                            }`}
                            style={item.sizes.includes(s) ? { backgroundColor: profile.brandColor } : {}}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 flex-wrap">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-3 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Cambiar foto
            </button>
            <button
              onClick={handleDownloadAll}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-5 py-3 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-40 transition-colors"
            >
              Descargar fotos
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: profile.brandColor }}
            >
              <Check className="h-4 w-4" />
              Dar de alta {selectedCount} artículo{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
