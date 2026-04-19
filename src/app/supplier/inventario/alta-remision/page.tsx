'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Upload, ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, FileImage, Trash2 } from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';

interface ExtractedProduct {
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  description: string;
  category: string;
  sellPriceMarias: number;
  sellPriceCustomer: number;
  selected: boolean;
}

const steps = ['Subir imagen', 'Revisar productos', 'Confirmar alta'];

export default function AltaRemisionPage() {
  const router = useRouter();
  const { addProduct, profile } = useSupplier();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<ExtractedProduct[]>([]);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Solo se aceptan imágenes.'); return; }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const analyzeImage = async () => {
    if (!imageBase64) { setError('Selecciona una imagen primero.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/supplier/ocr-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Error al analizar la imagen.'); setLoading(false); return; }
      const extracted: ExtractedProduct[] = (data.products || []).map((p: ExtractedProduct) => ({
        ...p,
        sellPriceMarias: Math.round(p.unitPrice * 1.25 * 100) / 100,
        sellPriceCustomer: Math.round(p.unitPrice * 1.5 * 100) / 100,
        selected: true,
      }));
      setProducts(extracted);
      setStep(2);
    } catch {
      setError('Error de conexión. Verifica tu conexión a internet.');
    } finally { setLoading(false); }
  };

  const updateProduct = (i: number, field: keyof ExtractedProduct, value: string | number | boolean) => {
    setProducts((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const confirmAlta = () => {
    const selected = products.filter((p) => p.selected);
    selected.forEach((p) => {
      addProduct({
        sku: p.sku || `SKU-${Date.now()}`,
        name: p.name,
        category: p.category || 'Otro',
        price: p.sellPriceCustomer,
        stock: p.quantity,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70',
        description: p.description,
        active: true,
        lowStockThreshold: 5,
      });
    });
    setDone(true);
    setStep(3);
  };

  const inputCls = 'border border-[#EDEBE8] rounded-lg px-2.5 py-1.5 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white w-full';

  if (done) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">¡Alta completada!</h2>
        <p className="text-[#8F8780] font-body mb-6">
          {products.filter((p) => p.selected).length} producto(s) dados de alta en tu inventario.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push('/supplier/inventario')} className="px-6 py-2.5 rounded-xl text-white font-semibold hover:opacity-90" style={{ backgroundColor: profile.brandColor }}>
            Ver inventario
          </button>
          <button onClick={() => { setStep(1); setImagePreview(null); setProducts([]); setDone(false); }} className="px-6 py-2.5 rounded-xl border border-[#EDEBE8] font-semibold text-[#6B6359] hover:bg-[#F7F6F5]">
            Nueva remisión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/supplier/inventario')} className="text-[#8F8780] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A]">Alta por Nota de Remisión</h1>
          <p className="text-xs text-[#8F8780] font-body">La IA extrae automáticamente los productos de tu documento</p>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'text-white' : 'bg-[#F7F6F5] text-[#8F8780]'}`} style={step === i + 1 ? { backgroundColor: profile.brandColor } : {}}>
              {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={`text-sm font-body hidden sm:block ${step === i + 1 ? 'font-semibold text-[#0A0A0A]' : 'text-[#8F8780]'}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-[#EDEBE8] mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="max-w-xl mx-auto">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-[#EDEBE8] hover:border-[#3B82F6] hover:bg-[#F7F6F5]'}`}
          >
            {imagePreview ? (
              <div>
                <div className="relative w-full max-h-64 overflow-hidden rounded-xl mb-4">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain max-h-64" />
                </div>
                <p className="text-sm text-[#6B6359] font-body">Haz clic para cambiar la imagen</p>
              </div>
            ) : (
              <div>
                <FileImage className="h-14 w-14 mx-auto mb-4 text-[#D9D5CF]" />
                <p className="text-[#0A0A0A] font-semibold mb-1">Arrastra tu nota de remisión aquí</p>
                <p className="text-sm text-[#8F8780] font-body">o haz clic para seleccionar · JPG, PNG, WebP</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-6 p-4 bg-[#F7F6F5] rounded-xl text-sm text-[#6B6359] font-body">
            <p className="font-semibold text-[#0A0A0A] mb-1">¿Qué documentos funcionan?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Notas de remisión con listado de productos</li>
              <li>Facturas con descripción, cantidad y precio</li>
              <li>Listas de precios del proveedor</li>
              <li>Comprobantes de compra (físicos fotografiados o digitales)</li>
            </ul>
          </div>

          <button
            onClick={analyzeImage}
            disabled={!imagePreview || loading}
            className="mt-6 w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: profile.brandColor }}
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizando con IA…</> : <><ArrowRight className="h-4 w-4" /> Extraer productos con IA</>}
          </button>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#6B6359] font-body">
              Se encontraron <strong>{products.length}</strong> productos. Revisa y ajusta precios antes de dar de alta.
            </p>
            <button onClick={() => setStep(1)} className="text-sm text-[#3B82F6] hover:underline font-body flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Nueva imagen
            </button>
          </div>

          <div className="bg-white border border-[#EDEBE8] rounded-xl overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-[#EDEBE8] bg-[#F7F6F5]">
                    <th className="w-8 px-3 py-3"><input type="checkbox" checked={products.every((p) => p.selected)} onChange={(e) => setProducts((prev) => prev.map((p) => ({ ...p, selected: e.target.checked })))} className="rounded" /></th>
                    {['Nombre', 'SKU', 'Categoría', 'Cant.', 'P. Compra', 'P. Venta MARIASCLUB', 'P. Venta Cliente', ''].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-xs font-bold uppercase tracking-wider text-[#8F8780] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={i} className={`border-b border-[#F7F6F5] transition-colors ${!p.selected ? 'opacity-40' : ''}`}>
                      <td className="px-3 py-3">
                        <input type="checkbox" checked={p.selected} onChange={(e) => updateProduct(i, 'selected', e.target.checked)} className="rounded" />
                      </td>
                      <td className="px-3 py-3">
                        <input value={p.name} onChange={(e) => updateProduct(i, 'name', e.target.value)} className={inputCls} />
                      </td>
                      <td className="px-3 py-3">
                        <input value={p.sku} onChange={(e) => updateProduct(i, 'sku', e.target.value)} className={`${inputCls} w-24 font-mono text-xs`} placeholder="SKU" />
                      </td>
                      <td className="px-3 py-3">
                        <input value={p.category} onChange={(e) => updateProduct(i, 'category', e.target.value)} className={`${inputCls} w-24`} />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" value={p.quantity} onChange={(e) => updateProduct(i, 'quantity', parseInt(e.target.value) || 0)} className={`${inputCls} w-16 text-center`} min="0" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[#8F8780]">$</span>
                          <input type="number" value={p.unitPrice} onChange={(e) => updateProduct(i, 'unitPrice', parseFloat(e.target.value) || 0)} className={`${inputCls} w-20`} min="0" step="0.01" />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[#8F8780]">$</span>
                          <input type="number" value={p.sellPriceMarias} onChange={(e) => updateProduct(i, 'sellPriceMarias', parseFloat(e.target.value) || 0)} className={`${inputCls} w-20 border-blue-200 focus:border-blue-400`} min="0" step="0.01" />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[#8F8780]">$</span>
                          <input type="number" value={p.sellPriceCustomer} onChange={(e) => updateProduct(i, 'sellPriceCustomer', parseFloat(e.target.value) || 0)} className={`${inputCls} w-20 border-green-200 focus:border-green-400`} min="0" step="0.01" />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => setProducts((prev) => prev.filter((_, idx) => idx !== i))} className="text-[#8F8780] hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-body mb-5">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span><strong>P. Compra:</strong> lo que pagaste al proveedor · <strong>P. Venta MARIASCLUB:</strong> precio al que vendes a MARIASCLUB · <strong>P. Venta Cliente:</strong> precio en tu tienda online</span>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
            <button
              onClick={confirmAlta}
              disabled={products.filter((p) => p.selected).length === 0}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ backgroundColor: profile.brandColor }}
            >
              <Check className="h-4 w-4" />
              Dar de alta {products.filter((p) => p.selected).length} productos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
