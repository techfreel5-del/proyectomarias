'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { use } from 'react';
import {
  ArrowLeft, Package, TrendingUp, AlertTriangle, DollarSign,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight, Clock,
  Pencil, Video, X, Save, Upload, Link as LinkIcon,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getSupplier, updateSupplierInventory, type SupplierRecord, type InventoryProduct } from '@/lib/suppliers-store';

const PAGE_SIZE = 15;

export default function AdminSupplierDetailPage({
  params,
}: {
  params: Promise<{ supplierId: string }>;
}) {
  const { supplierId } = use(params);
  const [record, setRecord] = useState<SupplierRecord | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // ── Edición de producto ───────────────────────────────────────
  const [editing, setEditing] = useState<InventoryProduct | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryProduct>>({});
  const [videoTab, setVideoTab] = useState<'url' | 'file'>('url');
  const [videoFileError, setVideoFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = getSupplier(supplierId);
    setRecord(r ?? null);
  }, [supplierId]);

  // ── Aprobación de productos pendientes ──────────────────────────
  function handleApprove(productId: string) {
    if (!record) return;
    const updated = record.inventory.map((p) =>
      p.id === productId ? { ...p, pendingApproval: false, active: true } : p,
    );
    updateSupplierInventory(supplierId, updated);
    setRecord({ ...record, inventory: updated });
  }

  function handleReject(productId: string) {
    if (!record) return;
    const updated = record.inventory.map((p) =>
      p.id === productId ? { ...p, pendingApproval: false, active: false } : p,
    );
    updateSupplierInventory(supplierId, updated);
    setRecord({ ...record, inventory: updated });
  }

  function handleApproveAll() {
    if (!record) return;
    const updated = record.inventory.map((p) =>
      p.pendingApproval ? { ...p, pendingApproval: false, active: true } : p,
    );
    updateSupplierInventory(supplierId, updated);
    setRecord({ ...record, inventory: updated });
  }

  function openEdit(p: InventoryProduct) {
    setEditing(p);
    setEditForm({ ...p });
    setVideoTab(p.videoUrl ? 'url' : 'file');
    setVideoFileError('');
  }

  function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setVideoFileError('El archivo supera 50 MB. Usa una URL de video en su lugar.');
      return;
    }
    setVideoFileError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditForm((f) => ({ ...f, videoFile: ev.target?.result as string, videoUrl: '' }));
    };
    reader.readAsDataURL(file);
  }

  function handleSaveEdit() {
    if (!record || !editing) return;
    const updated = record.inventory.map((p) =>
      p.id === editing.id ? { ...p, ...editForm } : p,
    );
    updateSupplierInventory(supplierId, updated);
    setRecord({ ...record, inventory: updated });
    setEditing(null);
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <AdminSidebar />
        <main className="flex-1 lg:ml-56 px-8 py-16 text-center text-[#8F8780] font-body">
          <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
          Proveedor no encontrado.{' '}
          <Link href="/admin/suppliers" className="text-[#3B82F6] hover:underline">Volver</Link>
        </main>
      </div>
    );
  }

  const { profile, inventory } = record;

  /* ── Pendientes ──────────────────────────────────── */
  const pendingProducts = inventory.filter((p) => p.pendingApproval);

  /* ── Stats ───────────────────────────────────────── */
  const inStockCount = inventory.filter((p) => !p.pendingApproval && p.active && p.stock > 0).length;
  const lowStockItems = inventory.filter((p) => p.active && p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = inventory.filter((p) => p.stock === 0).length;
  const totalValue = inventory.reduce((s, p) => s + p.price * p.stock, 0);

  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtPrice = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ── Filtered + paginated inventory ──────────────── */
  const filtered = inventory.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function stockBadge(p: InventoryProduct) {
    if (p.stock === 0)
      return <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Agotado</span>;
    if (p.stock <= p.lowStockThreshold)
      return <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{p.stock} uds · Bajo</span>;
    return <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{p.stock} uds</span>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Breadcrumb + header */}
        <div>
          <Link
            href="/admin/suppliers"
            className="inline-flex items-center gap-1 text-xs text-[#8F8780] hover:text-[#0A0A0A] transition-colors mb-3 font-body"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Proveedores
          </Link>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: profile.brandColor }}
            >
              <span className="text-white text-lg font-bold">
                {profile.storeName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-[#0A0A0A]">{profile.storeName}</h1>
              <p className="text-xs text-[#8F8780] font-body">
                {record.email} · Alta {new Date(record.createdAt).toLocaleDateString('es-MX')}
                {!record.active && (
                  <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Inactivo
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total productos', value: inventory.length, icon: Package, color: '#3B82F6' },
            { label: 'En stock', value: inStockCount, icon: TrendingUp, color: '#10B981' },
            { label: 'Stock bajo / agotado', value: `${lowStockItems.length} / ${outOfStock}`, icon: AlertTriangle, color: '#EF4444' },
            { label: 'Valor inventario', value: `$${fmt(totalValue)}`, icon: DollarSign, color: '#8B5CF6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-[#EDEBE8] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-body text-[#8F8780] uppercase tracking-wider">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#0A0A0A]">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Pendientes de aprobación ─────────────────────────────────── */}
        {pendingProducts.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 flex items-center justify-between gap-3 flex-wrap bg-amber-50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <h2 className="text-sm font-bold text-amber-800">Pendientes de aprobación</h2>
                <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                  {pendingProducts.length}
                </span>
              </div>
              <button
                onClick={handleApproveAll}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aprobar todos ({pendingProducts.length})
              </button>
            </div>
            <div className="divide-y divide-[#F7F6F5]">
              {pendingProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA]">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[#F7F6F5]" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#F7F6F5] flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-[#C0BAB2]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0A0A0A] text-sm truncate">{p.name}</p>
                    <p className="text-xs text-[#8F8780] font-body">{p.sku} · {p.category} · costo ${fmtPrice(p.price)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(p.id)}
                      className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReject(p.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
              <p className="text-[11px] text-amber-700 font-body">
                Recuerda configurar el precio de menudeo en <a href="/admin/pricing" className="underline font-semibold">Panel de Precios</a> después de aprobar.
              </p>
            </div>
          </div>
        )}

        {/* Alertas de stock bajo */}
        {lowStockItems.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
            <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {lowStockItems.length} producto{lowStockItems.length !== 1 ? 's' : ''} con stock bajo
            </p>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map((p) => (
                <span key={p.id} className="text-[11px] font-body bg-white border border-orange-200 text-orange-700 px-2.5 py-1 rounded-lg">
                  {p.name} — {p.stock} uds
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inventario */}
        <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F7F6F5] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#3B82F6]" />
              <h2 className="text-sm font-bold text-[#0A0A0A]">Inventario disponible</h2>
              <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] font-bold px-2 py-0.5 rounded-full border border-[#3B82F6]/20">
                {inventory.length}
              </span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre, SKU o categoría..."
              className="h-9 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] bg-[#FAFAFA] rounded-lg focus:outline-none focus:border-[#0A0A0A] w-64 max-w-full"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#8F8780] font-body text-sm">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {inventory.length === 0
                ? 'Este proveedor aún no tiene productos en su inventario.'
                : 'Sin resultados para la búsqueda.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F7F6F5]">
                      {['Producto', 'SKU', 'Categoría', 'Precio', 'Stock', 'Activo', ''].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8F8780]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F7F6F5]">
                    {paginated.map((p) => (
                      <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-[#F7F6F5]"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#F7F6F5] flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 text-[#C0BAB2]" />
                              </div>
                            )}
                            <span className="font-medium text-[#0A0A0A] leading-tight">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-[#6B6359]">{p.sku}</td>
                        <td className="px-5 py-3 text-[#6B6359] font-body">{p.category}</td>
                        <td className="px-5 py-3 font-semibold text-[#0A0A0A]">${fmtPrice(p.price)}</td>
                        <td className="px-5 py-3">{stockBadge(p)}</td>
                        <td className="px-5 py-3">
                          {p.active
                            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                            : <XCircle className="h-4 w-4 text-[#C0BAB2]" />}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#6B6359] hover:text-[#0A0A0A] border border-[#EDEBE8] hover:border-[#0A0A0A] px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <Pencil className="h-3 w-3" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-[#F7F6F5] flex items-center justify-between">
                  <p className="text-xs text-[#8F8780] font-body">
                    {filtered.length} productos · página {page} de {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-[#EDEBE8] text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg border border-[#EDEBE8] text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>

      {/* ── Modal de edición de producto ─────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F7F6F5]">
              <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#8F8780]" />
                Editar producto
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F6F5] text-[#8F8780] hover:text-[#0A0A0A] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={editForm.name ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] rounded-lg focus:outline-none focus:border-[#0A0A0A] transition-colors"
                />
              </div>

              {/* Precio + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">Precio costo ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] rounded-lg focus:outline-none focus:border-[#0A0A0A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.stock ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, stock: parseInt(e.target.value) || 0 }))}
                    className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] rounded-lg focus:outline-none focus:border-[#0A0A0A] transition-colors"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">Descripción</label>
                <textarea
                  rows={3}
                  value={editForm.description ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-[#E0E0E0] px-3 py-2 text-sm text-[#0A0A0A] rounded-lg focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
                />
              </div>

              {/* Video */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-2 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-[#8F8780]" />
                  Video del producto
                </label>

                {/* Tabs URL / Archivo */}
                <div className="flex gap-1 p-1 bg-[#F7F6F5] rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => { setVideoTab('url'); setEditForm((f) => ({ ...f, videoFile: '' })); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                      videoTab === 'url' ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#8F8780] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <LinkIcon className="h-3 w-3" />
                    URL de video
                  </button>
                  <button
                    type="button"
                    onClick={() => { setVideoTab('file'); setEditForm((f) => ({ ...f, videoUrl: '' })); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-md transition-all ${
                      videoTab === 'file' ? 'bg-white shadow text-[#0A0A0A]' : 'text-[#8F8780] hover:text-[#0A0A0A]'
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Subir archivo
                  </button>
                </div>

                {videoTab === 'url' ? (
                  <div>
                    <input
                      type="url"
                      value={editForm.videoUrl ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=... o enlace .mp4"
                      className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] rounded-lg focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                    <p className="text-[11px] text-[#8F8780] mt-1.5 font-body">
                      Compatible: YouTube, Vimeo, o enlace directo a archivo .mp4
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-[#E0E0E0] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#0A0A0A] hover:bg-[#FAFAFA] transition-all"
                    >
                      <Upload className="h-5 w-5 text-[#8F8780]" />
                      <span className="text-xs text-[#8F8780] font-body">
                        {editForm.videoFile ? 'Video cargado ✓ — clic para cambiar' : 'Clic para seleccionar archivo de video'}
                      </span>
                    </button>
                    {videoFileError && (
                      <p className="text-xs text-red-600 mt-1.5 font-body">{videoFileError}</p>
                    )}
                    <p className="text-[11px] text-[#8F8780] mt-1.5 font-body">
                      Máx. 50 MB · MP4, MOV, WebM. Para videos grandes usa URL.
                    </p>
                  </div>
                )}

                {/* Preview/limpiar video existente */}
                {(editForm.videoUrl || editForm.videoFile) && (
                  <button
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, videoUrl: '', videoFile: '' }))}
                    className="mt-2 text-[11px] text-red-500 hover:text-red-700 font-semibold"
                  >
                    × Quitar video
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F7F6F5]">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm font-semibold text-[#6B6359] hover:text-[#0A0A0A] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors"
              >
                <Save className="h-4 w-4" />
                Guardar cambios
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
