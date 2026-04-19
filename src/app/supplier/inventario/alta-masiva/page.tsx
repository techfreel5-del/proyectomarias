'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Upload, ChevronLeft, ChevronRight, Check, X, Loader2,
  ImageIcon, AlertCircle, Sparkles, Package,
} from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';

interface BulkVariant {
  name: string;
  color: string;
  variant: string;
  description: string;
  imageSearchQuery: string;
}

interface VariantRow {
  id: string;
  name: string;
  color: string;
  variant: string;
  description: string;
  imageUrl: string;
  price: string;
  stock: string;
  selected: boolean;
}

const CATEGORIES = ['Fashion', 'Appliances', 'Electronics', 'Sports', 'Coffee', 'Hogar', 'Otro'];

export default function AltaMasivaPage() {
  const router = useRouter();
  const { addProduct, profile } = useSupplier();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageMime, setImageMime] = useState('image/jpeg');
  const [baseModelName, setBaseModelName] = useState('');
  const [productType, setProductType] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // ── Step 1: image handling ──────────────────────────────────────────────────

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor sube un archivo de imagen (JPG, PNG, WEBP).');
      return;
    }
    setError('');
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // ── Step 2: AI analysis ─────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!imageBase64 || !baseModelName.trim()) {
      setError('Por favor sube una imagen y escribe el nombre del modelo base.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/supplier/bulk-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          mimeType: imageMime,
          productType: productType || 'producto',
          baseModelName: baseModelName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al analizar la imagen.');
        setLoading(false);
        return;
      }

      const rows: VariantRow[] = (data.variants as BulkVariant[]).map((v, i) => ({
        id: `v-${Date.now()}-${i}`,
        name: v.name,
        color: v.color,
        variant: v.variant,
        description: v.description,
        imageUrl: `https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&q=70&fit=crop`,
        price: '',
        stock: '1',
        selected: true,
      }));

      setVariants(rows);
      setStep(2);
    } catch {
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: confirm ─────────────────────────────────────────────────────────

  const handleConfirm = () => {
    const selected = variants.filter((v) => v.selected);
    if (selected.length === 0) return;

    selected.forEach((v) => {
      addProduct({
        sku: `${baseModelName.substring(0, 3).toUpperCase()}-${v.color.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
        name: v.name,
        category,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 1,
        image: v.imageUrl,
        description: v.description,
        lowStockThreshold: 5,
        active: true,
      });
    });

    router.push('/supplier/inventario');
  };

  const updateVariant = (id: string, field: keyof VariantRow, value: string | boolean) => {
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const selectedCount = variants.filter((v) => v.selected).length;

  const inputCls = 'w-full border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => step === 1 ? router.push('/supplier/inventario') : setStep((s) => (s - 1) as 1 | 2 | 3)}
        className="flex items-center gap-1.5 text-sm text-[#6B6359] hover:text-[#0A0A0A] mb-6 transition-colors font-body"
      >
        <ChevronLeft className="h-4 w-4" />
        {step === 1 ? 'Volver a inventario' : 'Paso anterior'}
      </button>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#0A0A0A] flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: profile.brandColor }} />
          Alta Masiva por Foto
        </h1>
        <p className="text-sm text-[#8F8780] font-body mt-0.5">
          Sube una foto con varios modelos y la IA identificará cada variante automáticamente.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Subir foto' },
          { n: 2, label: 'Revisar variantes' },
          { n: 3, label: 'Confirmar alta' },
        ].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${step >= n ? 'opacity-100' : 'opacity-40'}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > n ? 'text-white' : step === n ? 'text-white' : 'border border-[#EDEBE8] text-[#8F8780]'}`}
                style={{ backgroundColor: step >= n ? profile.brandColor : 'transparent' }}
              >
                {step > n ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span className="text-sm font-medium text-[#0A0A0A] hidden sm:block">{label}</span>
            </div>
            {idx < 2 && <div className={`h-px w-8 flex-shrink-0 ${step > n ? 'bg-[#0A0A0A]' : 'bg-[#EDEBE8]'}`} />}
          </div>
        ))}
      </div>

      {/* ── STEP 1 ──────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => !imagePreview && fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-[#EDEBE8] hover:border-[#D9D5CF]'}`}
          >
            {imagePreview ? (
              <div className="relative">
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                </div>
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
                <p className="font-semibold text-[#0A0A0A] mb-1">Arrastra tu foto aquí</p>
                <p className="text-sm text-[#8F8780] font-body mb-4">o haz clic para seleccionar</p>
                <span className="px-4 py-2 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] bg-white hover:bg-[#F7F6F5] transition-colors">
                  Elegir archivo
                </span>
                <p className="text-xs text-[#8F8780] font-body mt-3">JPG, PNG, WEBP · Máx 10 MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

          {/* Context fields */}
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-[#0A0A0A] text-sm">Contexto del producto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Nombre del modelo base *
                </label>
                <input
                  value={baseModelName}
                  onChange={(e) => setBaseModelName(e.target.value)}
                  className={inputCls}
                  placeholder="ej: Gorra Básica Unitalla"
                />
                <p className="text-[10px] text-[#8F8780] font-body mt-1">Nombre base que se añadirá a cada variante</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                  Tipo de producto
                </label>
                <input
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className={inputCls}
                  placeholder="ej: gorras, camisas, tenis…"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                Categoría para todos los productos
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputCls} max-w-xs`}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Tip */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm">
            <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="font-body">
              <span className="font-semibold text-blue-700">Tip: </span>
              <span className="text-blue-600">
                Cuantos más modelos/colores aparezcan en la foto, más productos se darán de alta de golpe.
                Funciona mejor con fotos bien iluminadas donde cada artículo sea visible.
              </span>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-body">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!imageBase64 || !baseModelName.trim() || loading}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: profile.brandColor }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analizando imagen con IA…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Identificar variantes con IA
              </>
            )}
          </button>
        </div>
      )}

      {/* ── STEP 2 ──────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-body text-[#6B6359]">
              <span className="font-semibold text-[#0A0A0A]">{variants.length}</span> variantes identificadas ·{' '}
              <span className="font-semibold text-[#0A0A0A]">{selectedCount}</span> seleccionadas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setVariants((v) => v.map((r) => ({ ...r, selected: true })))}
                className="text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] px-2 py-1 rounded hover:bg-[#F7F6F5] transition-colors"
              >
                Seleccionar todas
              </button>
              <button
                onClick={() => setVariants((v) => v.map((r) => ({ ...r, selected: false })))}
                className="text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] px-2 py-1 rounded hover:bg-[#F7F6F5] transition-colors"
              >
                Deseleccionar todas
              </button>
            </div>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-16 text-[#8F8780] font-body border border-[#EDEBE8] rounded-2xl">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-40" />
              No se identificaron variantes. Intenta con una imagen más clara.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {variants.map((v) => (
                <div
                  key={v.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-all ${v.selected ? 'border-[#0A0A0A] shadow-sm' : 'border-[#EDEBE8] opacity-60'}`}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-[#F7F6F5]">
                    <Image
                      src={v.imageUrl}
                      alt={v.name}
                      fill
                      className="object-cover"
                      onError={() => updateVariant(v.id, 'imageUrl', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70')}
                    />
                    {/* Checkbox */}
                    <button
                      onClick={() => updateVariant(v.id, 'selected', !v.selected)}
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${v.selected ? 'border-white bg-white' : 'border-white bg-white/70'}`}
                    >
                      {v.selected && <Check className="h-3.5 w-3.5" style={{ color: profile.brandColor }} />}
                    </button>
                    {/* Color chip */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 rounded-full text-[10px] font-semibold text-[#0A0A0A]">
                      {v.color}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Nombre</label>
                      <input
                        value={v.name}
                        onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                        className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Variante</label>
                      <input
                        value={v.variant}
                        onChange={(e) => updateVariant(v.id, 'variant', e.target.value)}
                        className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Precio ($)</label>
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                          className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] mb-1">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariant(v.id, 'stock', e.target.value)}
                          className="w-full border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-xs font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-body">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-5 py-3 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Subir otra foto
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={selectedCount === 0}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: profile.brandColor }}
            >
              Continuar con {selectedCount} variante{selectedCount !== 1 ? 's' : ''}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 ──────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EDEBE8] bg-[#F7F6F5] flex items-center justify-between">
              <h2 className="font-semibold text-[#0A0A0A]">Resumen de alta masiva</h2>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: profile.brandColor }}
              >
                {selectedCount} producto{selectedCount !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-[#F7F6F5]">
              {variants.filter((v) => v.selected).map((v) => (
                <div key={v.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden bg-[#F7F6F5]">
                    <Image src={v.imageUrl} alt={v.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#0A0A0A] truncate">{v.name}</p>
                    <p className="text-xs text-[#8F8780] font-body">{v.color} · {v.variant}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm text-[#0A0A0A]">
                      {v.price ? `$${parseFloat(v.price).toFixed(2)}` : 'Sin precio'}
                    </p>
                    <p className="text-xs text-[#8F8780] font-body">{v.stock} uds</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category reminder */}
          <div className="flex gap-3 p-4 bg-[#F7F6F5] border border-[#EDEBE8] rounded-xl text-sm font-body text-[#6B6359]">
            <Package className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#8F8780]" />
            Todos se darán de alta en la categoría <strong className="text-[#0A0A0A] mx-1">{category}</strong> con stock inicial según lo configurado.
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-5 py-3 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Editar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: profile.brandColor }}
            >
              <Check className="h-4 w-4" />
              Dar de alta {selectedCount} producto{selectedCount !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
