'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus, Search, Pencil, Trash2, X, Check, AlertTriangle, Package,
  ScanLine, LayoutGrid, ImagePlus, Film, Layers, Play, Upload,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useSupplier, type InventoryProduct, type VariantType, type ProductVariant } from '@/lib/supplier-context';

const CATEGORIES = ['Fashion', 'Appliances', 'Electronics', 'Sports', 'Coffee', 'Hogar', 'Otro'];

type ModalTab = 'basico' | 'imagenes' | 'video' | 'variantes';

interface FormVariant {
  id: string;
  color: string;
  size: string;
  stock: string;
}

interface FormState {
  sku: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  lowStockThreshold: string;
  images: string[];
  videoUrl: string;
  videoFile: string | undefined;
  hasVariants: boolean;
  variantType: VariantType;
  variants: FormVariant[];
}

const EMPTY_FORM: FormState = {
  sku: '', name: '', category: 'Fashion', price: '', stock: '',
  description: '', lowStockThreshold: '10',
  images: [],
  videoUrl: '',
  videoFile: undefined,
  hasVariants: false,
  variantType: 'color-talla',
  variants: [],
};

function parseVideoEmbed(url: string): { type: 'iframe' | 'video' | null; src: string } {
  if (!url) return { type: null, src: '' };
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return { type: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { type: 'iframe', src: `https://player.vimeo.com/video/${vm[1]}` };
  return { type: 'video', src: url };
}


export default function InventarioPage() {
  const { inventory, addProduct, updateProduct, removeProduct, adjustStock, profile } = useSupplier();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<ModalTab>('basico');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [videoMode, setVideoMode] = useState<'url' | 'file'>('url');
  const [imageError, setImageError] = useState('');
  const [videoError, setVideoError] = useState('');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const filtered = inventory.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setActiveTab('basico');
    setVideoMode('url');
    setImageError('');
    setVideoError('');
    setShowModal(true);
  };

  const openEdit = (p: InventoryProduct) => {
    const imgs = p.images?.length ? p.images : (p.image ? [p.image] : []);
    const hasVid = !!(p.videoFile);
    setForm({
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      description: p.description,
      lowStockThreshold: String(p.lowStockThreshold),
      images: imgs,
      videoUrl: p.videoUrl ?? '',
      videoFile: p.videoFile,
      hasVariants: p.hasVariants ?? false,
      variantType: p.variantType ?? 'color-talla',
      variants: (p.variants ?? []).map(v => ({
        id: v.id,
        color: v.color ?? '',
        size: v.size ?? '',
        stock: String(v.stock),
      })),
    });
    setVideoMode(hasVid ? 'file' : 'url');
    setEditingId(p.id);
    setActiveTab('basico');
    setImageError('');
    setVideoError('');
    setShowModal(true);
  };

  // ─── Image upload ─────────────────────────────────────────────
  const handleImageFiles = useCallback((files: FileList | File[]) => {
    setImageError('');
    const arr = Array.from(files);
    const remaining = 8 - form.images.length;
    if (remaining <= 0) { setImageError('Máximo 8 imágenes'); return; }
    const toProcess = arr.slice(0, remaining);
    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 3 * 1024 * 1024) {
        setImageError('Alguna imagen supera 3 MB. Reduce el tamaño.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const b64 = e.target?.result as string;
        setForm(prev => ({ ...prev, images: [...prev.images, b64].slice(0, 8) }));
      };
      reader.readAsDataURL(file);
    });
  }, [form.images.length]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleImageFiles(e.dataTransfer.files);
  }, [handleImageFiles]);

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const moveImage = (from: number, to: number) => {
    setForm(prev => {
      const imgs = [...prev.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...prev, images: imgs };
    });
  };

  // ─── Video upload ─────────────────────────────────────────────
  const handleVideoFile = (file: File) => {
    setVideoError('');
    if (!file.type.startsWith('video/')) { setVideoError('Solo archivos de video'); return; }
    if (file.size > 60 * 1024 * 1024) { setVideoError('Video demasiado grande (máx 60 MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setForm(prev => ({ ...prev, videoFile: b64, videoUrl: '' }));
    };
    reader.readAsDataURL(file);
  };

  // ─── Variants ────────────────────────────────────────────────
  const addVariant = () => {
    const id = `var-${Date.now()}`;
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { id, color: '', size: '', stock: '0' }],
    }));
  };

  const updateVariant = (id: string, patch: Partial<FormVariant>) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, ...patch } : v),
    }));
  };

  const removeVariant = (id: string) => {
    setForm(prev => ({ ...prev, variants: prev.variants.filter(v => v.id !== id) }));
  };

  const totalVariantStock = form.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);

  // ─── Save ─────────────────────────────────────────────────────
  const handleSave = () => {
    const fallbackImg = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70';
    const primaryImage = form.images[0] || fallbackImg;
    const stock = form.hasVariants
      ? totalVariantStock
      : (parseInt(form.stock) || 0);
    const variants: ProductVariant[] = form.hasVariants
      ? form.variants.map(v => ({
          id: v.id,
          color: v.color || undefined,
          size: v.size || undefined,
          stock: parseInt(v.stock) || 0,
        }))
      : [];

    const data: Omit<InventoryProduct, 'id'> = {
      sku: form.sku,
      name: form.name,
      category: form.category,
      price: parseFloat(form.price) || 0,
      stock,
      image: primaryImage,
      images: form.images.length > 0 ? form.images : [fallbackImg],
      description: form.description,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
      active: true,
      videoUrl: form.videoUrl || undefined,
      videoFile: form.videoFile || undefined,
      hasVariants: form.hasVariants,
      variantType: form.hasVariants ? form.variantType : 'none',
      variants,
    };
    if (editingId) {
      updateProduct(editingId, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  };

  const inputCls = "w-full border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white";
  const tabBtnCls = (t: ModalTab) =>
    `px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      activeTab === t
        ? 'border-[#3B82F6] text-[#3B82F6]'
        : 'border-transparent text-[#8F8780] hover:text-[#0A0A0A]'
    }`;

  // ─── Video preview ──────────────────────────────────────────
  const videoSrc = form.videoFile || form.videoUrl;
  const embed = !form.videoFile ? parseVideoEmbed(form.videoUrl) : { type: 'video' as const, src: form.videoFile };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A]">Gestión de Inventario</h1>
          <p className="text-xs text-[#8F8780] font-body mt-0.5">{inventory.length} productos registrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: profile.brandColor }}
        >
          <Plus className="h-4 w-4" />
          Agregar Producto
        </button>
      </div>

      {/* AI upload shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link
          href="/supplier/inventario/alta-remision"
          className="flex items-center gap-4 p-4 bg-white border border-[#EDEBE8] rounded-2xl hover:border-[#D9D5CF] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <ScanLine className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#0A0A0A]">Alta por Remisión</p>
            <p className="text-xs text-[#8F8780] font-body">Sube una foto de factura · IA extrae los productos</p>
          </div>
        </Link>
        <Link
          href="/supplier/inventario/alta-masiva"
          className="flex items-center gap-4 p-4 bg-white border border-[#EDEBE8] rounded-2xl hover:border-[#D9D5CF] hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
            <LayoutGrid className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[#0A0A0A]">Alta Masiva por Foto</p>
            <p className="text-xs text-[#8F8780] font-body">Foto del stock del día · IA identifica cada variante</p>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8F8780]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU…"
            className="w-full border border-[#EDEBE8] rounded-lg pl-9 pr-4 py-2 text-sm font-body focus:outline-none focus:border-[#3B82F6] bg-white"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm font-body text-[#0A0A0A] bg-white focus:outline-none focus:border-[#3B82F6]"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#EDEBE8] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#EDEBE8] bg-[#F7F6F5]">
                {['Producto', 'SKU', 'Categoría', 'Precio', 'Stock', 'Estado', 'Ajustar', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#8F8780] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#8F8780] font-body">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Sin productos
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.active && p.stock <= p.lowStockThreshold;
                  const isOut = p.stock === 0;
                  const primaryImg = p.images?.[0] ?? p.image;
                  return (
                    <tr key={p.id} className="border-b border-[#F7F6F5] hover:bg-[#FAFAFA] transition-colors">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-[#F7F6F5]">
                            <Image src={primaryImg} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0A0A0A] line-clamp-1">{p.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isLow && (
                                <span className="flex items-center gap-1 text-[10px] text-orange-500 font-body">
                                  <AlertTriangle className="h-3 w-3" />
                                  {isOut ? 'Agotado' : 'Stock bajo'}
                                </span>
                              )}
                              {p.hasVariants && (
                                <span className="flex items-center gap-1 text-[10px] text-purple-500 font-body">
                                  <Layers className="h-3 w-3" />
                                  {p.variants?.length ?? 0} var.
                                </span>
                              )}
                              {(p.videoUrl || p.videoFile) && (
                                <span className="flex items-center gap-1 text-[10px] text-blue-400 font-body">
                                  <Film className="h-3 w-3" />
                                  video
                                </span>
                              )}
                              {(p.images?.length ?? 0) > 1 && (
                                <span className="text-[10px] text-[#8F8780] font-body">
                                  {p.images!.length} fotos
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#8F8780] font-body font-mono">{p.sku}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-[#F7F6F5] px-2 py-0.5 rounded-full text-[#6B6359] font-body">{p.category}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0A0A0A]">${p.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-[#10B981]'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateProduct(p.id, { active: !p.active })}
                          className={`relative w-10 h-5 rounded-full transition-colors ${p.active ? 'bg-[#10B981]' : 'bg-[#D9D5CF]'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.active ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {p.hasVariants ? (
                          <span className="text-[11px] text-[#8F8780] font-body italic">Editar var.</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => adjustStock(p.id, -1)} disabled={p.stock === 0}
                              className="w-6 h-6 rounded border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-30 transition-colors text-xs font-bold">−</button>
                            <span className="w-8 text-center text-sm font-semibold">{p.stock}</span>
                            <button onClick={() => adjustStock(p.id, 1)}
                              className="w-6 h-6 rounded border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-[#F7F6F5] transition-colors text-xs font-bold">+</button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B6359] hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(p.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B6359] hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add/Edit Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEBE8] flex-shrink-0">
              <h2 className="font-bold text-[#0A0A0A]">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8F8780] hover:text-[#0A0A0A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab nav */}
            <div className="flex border-b border-[#EDEBE8] px-6 overflow-x-auto flex-shrink-0">
              <button className={tabBtnCls('basico')} onClick={() => setActiveTab('basico')}>Básico</button>
              <button className={tabBtnCls('imagenes')} onClick={() => setActiveTab('imagenes')}>
                Imágenes {form.images.length > 0 && <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 rounded-full px-1.5">{form.images.length}</span>}
              </button>
              <button className={tabBtnCls('video')} onClick={() => setActiveTab('video')}>
                Video {(form.videoUrl || form.videoFile) && <span className="ml-1 text-[10px] bg-green-100 text-green-600 rounded-full px-1.5">✓</span>}
              </button>
              <button className={tabBtnCls('variantes')} onClick={() => setActiveTab('variantes')}>
                Variantes {form.hasVariants && <span className="ml-1 text-[10px] bg-purple-100 text-purple-600 rounded-full px-1.5">{form.variants.length}</span>}
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* ─── TAB: BÁSICO ─────────────────────────────── */}
              {activeTab === 'basico' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Nombre *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Nombre del producto" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">SKU *</label>
                      <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} placeholder="SKU-001" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Categoría</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Precio ($)</label>
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="0.00" min="0" step="0.01" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">
                        Stock inicial
                        {form.hasVariants && <span className="ml-1 text-[#8F8780] normal-case font-normal">(calculado)</span>}
                      </label>
                      <input
                        type="number"
                        value={form.hasVariants ? String(totalVariantStock) : form.stock}
                        onChange={(e) => !form.hasVariants && setForm({ ...form, stock: e.target.value })}
                        readOnly={form.hasVariants}
                        className={`${inputCls} ${form.hasVariants ? 'bg-[#F7F6F5] text-[#8F8780]' : ''}`}
                        placeholder="0" min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Alerta de stock</label>
                      <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className={inputCls} placeholder="10" min="0" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Descripción</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-24 resize-none`} placeholder="Descripción del producto…" />
                  </div>
                </div>
              )}

              {/* ─── TAB: IMÁGENES ───────────────────────────── */}
              {activeTab === 'imagenes' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#8F8780] font-body">
                    Sube hasta 8 imágenes. La primera es la imagen principal. Arrastra para reordenar.
                  </p>

                  {/* Drop zone */}
                  <div
                    ref={dropZoneRef}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-[#EDEBE8] rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#3B82F6] hover:bg-blue-50/30 transition-all"
                  >
                    <ImagePlus className="h-8 w-8 text-[#D9D5CF]" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-[#6B6359]">Arrastra imágenes aquí o haz clic</p>
                      <p className="text-xs text-[#8F8780] font-body mt-1">JPG, PNG, WebP · Máx 3 MB c/u · Hasta 8 imágenes</p>
                    </div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
                    />
                  </div>

                  {imageError && (
                    <p className="text-xs text-red-500 font-body flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />{imageError}
                    </p>
                  )}

                  {/* Image grid */}
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {form.images.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F7F6F5] border-2 border-transparent group-hover:border-[#3B82F6] transition-colors">
                            <Image src={src} alt={`Imagen ${idx + 1}`} fill className="object-cover" sizes="120px" />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 text-[9px] bg-[#0A0A0A]/70 text-white px-1.5 py-0.5 rounded font-bold">Principal</span>
                            )}
                          </div>
                          {/* Actions */}
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button onClick={() => moveImage(idx, idx - 1)}
                                className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center hover:bg-[#F7F6F5]">
                                <ChevronLeft className="h-3 w-3 text-[#6B6359]" />
                              </button>
                            )}
                            {idx < form.images.length - 1 && (
                              <button onClick={() => moveImage(idx, idx + 1)}
                                className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center hover:bg-[#F7F6F5]">
                                <ChevronRight className="h-3 w-3 text-[#6B6359]" />
                              </button>
                            )}
                            <button onClick={() => removeImage(idx)}
                              className="w-5 h-5 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50">
                              <X className="h-3 w-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {form.images.length < 8 && (
                        <button onClick={() => imageInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-[#EDEBE8] flex items-center justify-center hover:border-[#3B82F6] hover:bg-blue-50/30 transition-all">
                          <Plus className="h-5 w-5 text-[#D9D5CF]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: VIDEO ──────────────────────────────── */}
              {activeTab === 'video' && (
                <div className="space-y-4">
                  {/* Mode toggle */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setVideoMode('url'); setForm(prev => ({ ...prev, videoFile: undefined })); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${videoMode === 'url' ? 'bg-[#0A0A0A] text-white' : 'bg-[#F7F6F5] text-[#6B6359] hover:bg-[#EDEBE8]'}`}
                    >
                      Enlace URL
                    </button>
                    <button
                      onClick={() => { setVideoMode('file'); setForm(prev => ({ ...prev, videoUrl: '' })); }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${videoMode === 'file' ? 'bg-[#0A0A0A] text-white' : 'bg-[#F7F6F5] text-[#6B6359] hover:bg-[#EDEBE8]'}`}
                    >
                      Subir archivo
                    </button>
                  </div>

                  {videoMode === 'url' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">URL del video</label>
                      <input
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        className={inputCls}
                        placeholder="https://youtube.com/watch?v=… o enlace directo .mp4"
                      />
                      <p className="text-xs text-[#8F8780] font-body mt-1.5">Compatible con YouTube, Vimeo o enlaces directos a MP4</p>
                    </div>
                  )}

                  {videoMode === 'file' && (
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Archivo de video</label>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#EDEBE8] rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#3B82F6] hover:bg-blue-50/30 transition-all"
                      >
                        <Film className="h-8 w-8 text-[#D9D5CF]" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#6B6359]">
                            {form.videoFile ? 'Video cargado · Haz clic para cambiar' : 'Haz clic para seleccionar'}
                          </p>
                          <p className="text-xs text-[#8F8780] font-body mt-1">MP4, MOV, WebM · Máx 60 MB</p>
                        </div>
                        {form.videoFile && (
                          <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                            <Check className="h-3.5 w-3.5" /> Video listo
                          </span>
                        )}
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
                        />
                      </div>
                    </div>
                  )}

                  {videoError && (
                    <p className="text-xs text-red-500 font-body flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />{videoError}
                    </p>
                  )}

                  {/* Video preview */}
                  {videoSrc && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">Vista previa</p>
                      <div className="rounded-xl overflow-hidden bg-black aspect-video">
                        {embed.type === 'iframe' ? (
                          <iframe src={embed.src} className="w-full h-full" allowFullScreen title="Video preview" />
                        ) : embed.type === 'video' ? (
                          <video src={embed.src} controls className="w-full h-full" />
                        ) : null}
                      </div>
                    </div>
                  )}

                  {!videoSrc && (
                    <div className="rounded-xl bg-[#F7F6F5] aspect-video flex flex-col items-center justify-center gap-2 text-[#D9D5CF]">
                      <Play className="h-10 w-10" />
                      <p className="text-xs font-body text-[#8F8780]">Sin video asignado</p>
                    </div>
                  )}

                  {(form.videoUrl || form.videoFile) && (
                    <button
                      onClick={() => setForm(prev => ({ ...prev, videoUrl: '', videoFile: undefined }))}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-body"
                    >
                      <X className="h-3.5 w-3.5" /> Quitar video
                    </button>
                  )}
                </div>
              )}

              {/* ─── TAB: VARIANTES ──────────────────────────── */}
              {activeTab === 'variantes' && (
                <div className="space-y-5">
                  {/* Toggle */}
                  <div className="flex items-center justify-between p-4 bg-[#F7F6F5] rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-[#0A0A0A]">Este producto tiene variantes</p>
                      <p className="text-xs text-[#8F8780] font-body mt-0.5">Colores, tallas, tamaños, etc.</p>
                    </div>
                    <button
                      onClick={() => setForm(prev => ({ ...prev, hasVariants: !prev.hasVariants }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.hasVariants ? 'bg-[#10B981]' : 'bg-[#D9D5CF]'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.hasVariants ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {form.hasVariants && (
                    <>
                      {/* Variant type */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-2">Tipo de variante</label>
                        <div className="flex flex-wrap gap-2">
                          {([
                            ['color-talla', 'Color + Talla'],
                            ['color', 'Solo Color'],
                            ['talla', 'Solo Talla'],
                            ['tamaño', 'Tamaño'],
                          ] as [VariantType, string][]).map(([val, label]) => (
                            <button
                              key={val}
                              onClick={() => setForm(prev => ({ ...prev, variantType: val }))}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                form.variantType === val
                                  ? 'bg-[#0A0A0A] text-white'
                                  : 'bg-[#F7F6F5] text-[#6B6359] hover:bg-[#EDEBE8]'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Variants list */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-semibold uppercase tracking-wider text-[#6B6359]">
                            Variantes ({form.variants.length}) · Stock total: {totalVariantStock}
                          </label>
                          <button
                            onClick={addVariant}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0A0A0A] text-white text-xs font-semibold hover:bg-[#333] transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Agregar
                          </button>
                        </div>

                        {form.variants.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-[#EDEBE8] rounded-xl text-[#8F8780] font-body text-sm">
                            Sin variantes. Haz clic en "Agregar" para comenzar.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {form.variants.map((v) => (
                              <div key={v.id} className="flex items-center gap-2 p-3 bg-[#F7F6F5] rounded-xl">
                                {(form.variantType === 'color-talla' || form.variantType === 'color') && (
                                  <input
                                    value={v.color}
                                    onChange={(e) => updateVariant(v.id, { color: e.target.value })}
                                    className="flex-1 border border-[#EDEBE8] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#3B82F6]"
                                    placeholder="Color (ej: Rojo)"
                                  />
                                )}
                                {(form.variantType === 'color-talla' || form.variantType === 'talla' || form.variantType === 'tamaño') && (
                                  <input
                                    value={v.size}
                                    onChange={(e) => updateVariant(v.id, { size: e.target.value })}
                                    className="flex-1 border border-[#EDEBE8] rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[#3B82F6]"
                                    placeholder={form.variantType === 'tamaño' ? 'Tamaño (ej: Grande)' : 'Talla (ej: M)'}
                                  />
                                )}
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-[#8F8780] font-body">Stock:</span>
                                  <input
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => updateVariant(v.id, { stock: e.target.value })}
                                    className="w-16 border border-[#EDEBE8] rounded-lg px-2 py-1.5 text-sm text-center bg-white focus:outline-none focus:border-[#3B82F6]"
                                    min="0"
                                  />
                                </div>
                                <button onClick={() => removeVariant(v.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B6359] hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {!form.hasVariants && (
                    <div className="text-center py-10 text-[#8F8780] font-body text-sm">
                      Activa las variantes para gestionar colores, tallas o tamaños individuales.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-[#EDEBE8] flex-shrink-0">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.sku}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: profile.brandColor }}
              >
                <Check className="h-4 w-4" />
                {editingId ? 'Guardar cambios' : 'Agregar producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-bold text-[#0A0A0A] mb-1">¿Eliminar producto?</h3>
            <p className="text-sm text-[#8F8780] font-body mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5]">
                Cancelar
              </button>
              <button onClick={() => { removeProduct(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white text-sm font-semibold hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
