'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, X, Check, AlertTriangle, Package } from 'lucide-react';
import { useSupplier, InventoryProduct } from '@/lib/supplier-context';

const CATEGORIES = ['Fashion', 'Appliances', 'Electronics', 'Sports', 'Coffee', 'Hogar', 'Otro'];

const EMPTY_FORM = {
  sku: '', name: '', category: 'Fashion', price: '', stock: '',
  image: '', description: '', lowStockThreshold: '10',
};

export default function InventarioPage() {
  const { inventory, addProduct, updateProduct, removeProduct, adjustStock, profile } = useSupplier();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = inventory.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: InventoryProduct) => {
    setForm({
      sku: p.sku, name: p.name, category: p.category,
      price: String(p.price), stock: String(p.stock),
      image: p.image, description: p.description,
      lowStockThreshold: String(p.lowStockThreshold),
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleSave = () => {
    const data = {
      sku: form.sku,
      name: form.name,
      category: form.category,
      price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      image: form.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70',
      description: form.description,
      lowStockThreshold: parseInt(form.lowStockThreshold) || 10,
      active: true,
    };
    if (editingId) {
      updateProduct(editingId, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
  };

  const inputCls = "w-full border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
                  return (
                    <tr key={p.id} className="border-b border-[#F7F6F5] hover:bg-[#FAFAFA] transition-colors">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden bg-[#F7F6F5]">
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0A0A0A] line-clamp-1">{p.name}</p>
                            {isLow && (
                              <span className="flex items-center gap-1 text-[10px] text-orange-500 font-body">
                                <AlertTriangle className="h-3 w-3" />
                                {isOut ? 'Agotado' : 'Stock bajo'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* SKU */}
                      <td className="px-4 py-3 text-xs text-[#8F8780] font-body font-mono">{p.sku}</td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-xs bg-[#F7F6F5] px-2 py-0.5 rounded-full text-[#6B6359] font-body">
                          {p.category}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-[#0A0A0A]">
                        ${p.price.toFixed(2)}
                      </td>
                      {/* Stock */}
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-[#10B981]'}`}>
                          {p.stock}
                        </span>
                      </td>
                      {/* Active toggle */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateProduct(p.id, { active: !p.active })}
                          className={`relative w-10 h-5 rounded-full transition-colors ${p.active ? 'bg-[#10B981]' : 'bg-[#D9D5CF]'}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.active ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      {/* Adjust stock */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            disabled={p.stock === 0}
                            className="w-6 h-6 rounded border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-[#F7F6F5] disabled:opacity-30 transition-colors text-xs font-bold"
                          >−</button>
                          <span className="w-8 text-center text-sm font-semibold">{p.stock}</span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="w-6 h-6 rounded border border-[#EDEBE8] flex items-center justify-center text-[#6B6359] hover:bg-[#F7F6F5] transition-colors text-xs font-bold"
                          >+</button>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B6359] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6B6359] hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDEBE8]">
              <h2 className="font-bold text-[#0A0A0A]">{editingId ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-[#8F8780] hover:text-[#0A0A0A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Stock inicial</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} placeholder="0" min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Alerta de stock</label>
                  <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className={inputCls} placeholder="10" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">URL de imagen</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputCls} placeholder="https://…" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20 resize-none`} placeholder="Descripción del producto…" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors">
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
