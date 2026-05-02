'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Package, DollarSign, ChevronRight,
  CheckCircle2, XCircle, Eye, EyeOff, Store,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  getSuppliers, createSupplier, setSupplierActive,
  type SupplierRecord,
} from '@/lib/suppliers-store';

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    displayName: '',
    storeName: '',
    email: '',
    password: '',
    brandColor: '#1E3A5F',
  });

  useEffect(() => {
    setSuppliers(getSuppliers());
  }, []);

  function refresh() {
    setSuppliers(getSuppliers());
  }

  function handleToggleActive(id: string, current: boolean) {
    setSupplierActive(id, !current);
    refresh();
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!form.displayName || !form.storeName || !form.email || !form.password) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (form.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    const existing = getSuppliers().find(
      (s) => s.email.toLowerCase() === form.email.toLowerCase(),
    );
    if (existing) {
      setFormError('Ya existe un proveedor con ese correo.');
      return;
    }

    setSaving(true);
    createSupplier({
      displayName: form.displayName,
      storeName: form.storeName,
      email: form.email,
      password: form.password,
      brandColor: form.brandColor,
    });
    setForm({ displayName: '', storeName: '', email: '', password: '', brandColor: '#1E3A5F' });
    setShowForm(false);
    setSaving(false);
    refresh();
  }

  /* ── Métricas globales ──────────────────────────────── */
  const totalProducts = suppliers.reduce((s, r) => s + r.inventory.length, 0);
  const totalValue = suppliers.reduce(
    (s, r) => s + r.inventory.reduce((sv, p) => sv + p.price * p.stock, 0),
    0,
  );
  const activeCount = suppliers.filter((s) => s.active).length;

  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      <main className="flex-1 lg:ml-56 px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-[#8F8780] mb-1">
              MARIASCLUB™
            </p>
            <h1 className="font-display text-3xl font-black text-[#0A0A0A]">Proveedores</h1>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(''); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Proveedor
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total proveedores', value: suppliers.length, icon: Users, color: '#3B82F6' },
            { label: 'Proveedores activos', value: activeCount, icon: CheckCircle2, color: '#10B981' },
            { label: 'Total productos', value: totalProducts, icon: Package, color: '#8B5CF6' },
            { label: 'Valor total inventario', value: `$${fmt(totalValue)}`, icon: DollarSign, color: '#F59E0B' },
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

        {/* Formulario de alta */}
        {showForm && (
          <div className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
            <h2 className="text-base font-bold text-[#0A0A0A] mb-5 flex items-center gap-2">
              <Store className="h-4 w-4 text-[#00C9B1]" />
              Dar de alta nuevo proveedor
            </h2>
            <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                  Nombre del contacto / representante
                </label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Ej. Juan López"
                  className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                  Nombre de la tienda / empresa
                </label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  placeholder="Ej. Distribuidora López S.A."
                  className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                  Correo electrónico (para iniciar sesión)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="proveedor@ejemplo.com"
                  className="w-full h-10 border border-[#E0E0E0] px-3 text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                  Contraseña temporal
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mín. 6 caracteres"
                    className="w-full h-10 border border-[#E0E0E0] px-3 pr-10 text-sm text-[#0A0A0A] bg-white focus:outline-none focus:border-[#0A0A0A] transition-colors rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F8780] hover:text-[#0A0A0A]"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555] mb-1.5">
                  Color de marca
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                    className="w-10 h-10 border border-[#E0E0E0] rounded-lg cursor-pointer"
                  />
                  <span className="text-sm font-mono text-[#6B6359]">{form.brandColor}</span>
                </div>
              </div>

              {formError && (
                <p className="sm:col-span-2 text-xs text-red-600 font-medium">{formError}</p>
              )}

              <div className="sm:col-span-2 flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(''); }}
                  className="px-4 py-2 text-sm font-semibold text-[#6B6359] hover:text-[#0A0A0A] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0A0A0A] text-white text-sm font-semibold rounded-xl hover:bg-[#222] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Dar de alta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla de proveedores */}
        <div className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F7F6F5] flex items-center gap-2">
            <Users className="h-4 w-4 text-[#3B82F6]" />
            <h2 className="text-sm font-bold text-[#0A0A0A]">Todos los proveedores</h2>
            <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] font-bold px-2 py-0.5 rounded-full border border-[#3B82F6]/20">
              {suppliers.length}
            </span>
          </div>

          {suppliers.length === 0 ? (
            <div className="text-center py-14 text-[#8F8780] font-body text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              Sin proveedores registrados aún
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#F7F6F5]">
                    {['Proveedor', 'Correo', 'Productos', 'Valor inventario', 'Estado', ''].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-[#8F8780]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F7F6F5]">
                  {suppliers.map((s) => {
                    const totalStock = s.inventory.reduce((acc, p) => acc + p.price * p.stock, 0);
                    const lowStock = s.inventory.filter((p) => p.active && p.stock <= p.lowStockThreshold).length;
                    return (
                      <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: s.profile.brandColor }}
                            >
                              <span className="text-white text-xs font-bold">
                                {s.profile.storeName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-[#0A0A0A]">{s.profile.storeName}</p>
                              <p className="text-[10px] text-[#8F8780] font-body">
                                {s.displayName} · Alta {new Date(s.createdAt).toLocaleDateString('es-MX')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[#6B6359] font-body">{s.email}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#0A0A0A]">{s.inventory.length}</span>
                            {lowStock > 0 && (
                              <span className="text-[9px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                                {lowStock} bajo stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#0A0A0A]">
                          ${fmt(totalStock)}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleActive(s.id, s.active)}
                            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                              s.active
                                ? 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                                : 'text-[#8F8780] bg-[#F7F6F5] border-[#EDEBE8] hover:bg-[#EDEBE8]'
                            }`}
                          >
                            {s.active
                              ? <><CheckCircle2 className="h-3 w-3" /> Activo</>
                              : <><XCircle className="h-3 w-3" /> Inactivo</>}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/suppliers/${s.id}`}
                            className="flex items-center gap-1 text-xs font-semibold text-[#3B82F6] hover:text-[#1D4ED8] transition-colors"
                          >
                            Ver inventario
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
