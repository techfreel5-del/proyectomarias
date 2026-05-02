'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Check, Store, Palette, Phone, Eye, Truck, Landmark, MessageCircle, Package, Sparkles, Megaphone, AtSign } from 'lucide-react';
import { useSupplier, ZonedPricing, type StoreTheme, type CardStyle } from '@/lib/supplier-context';
import { THEMES } from '@/lib/store-themes';
import Link from 'next/link';

export default function PerfilPage() {
  const { profile, updateProfile } = useSupplier();

  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm({ ...profile }); }, [profile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, logo: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = "w-full border border-[#EDEBE8] rounded-lg px-3 py-2.5 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#3B82F6] bg-white";
  const labelCls = "block text-xs font-semibold uppercase tracking-wider text-[#6B6359] mb-1.5";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A]">Perfil & Marca</h1>
          <p className="text-xs text-[#8F8780] font-body mt-0.5">Configura la identidad de tu tienda online</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/supplier/tienda"
            className="flex items-center gap-1.5 px-4 py-2 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors"
          >
            <Eye className="h-4 w-4" />
            Vista previa
          </Link>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ backgroundColor: saved ? '#10B981' : form.brandColor }}
          >
            <Check className="h-4 w-4" />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="space-y-6">

        {/* Identidad */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-5">
            <Store className="h-4 w-4" style={{ color: form.brandColor }} />
            Identidad de la tienda
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nombre de la tienda *</label>
              <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className={inputCls} placeholder="Mi Tienda" />
            </div>
            <div>
              <label className={labelCls}>URL (slug)</label>
              <div className="flex items-center border border-[#EDEBE8] rounded-lg overflow-hidden bg-white focus-within:border-[#3B82F6]">
                <span className="px-3 py-2.5 text-sm text-[#8F8780] bg-[#F7F6F5] border-r border-[#EDEBE8] font-body whitespace-nowrap">/tienda/</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  className="flex-1 px-3 py-2.5 text-sm font-body text-[#0A0A0A] focus:outline-none bg-white"
                  placeholder="mi-tienda"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descripción de la tienda</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputCls} h-20 resize-none`}
                placeholder="Describe tu tienda en pocas palabras…"
              />
            </div>
          </div>
        </section>

        {/* Logo */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-5">
            <Upload className="h-4 w-4" style={{ color: form.brandColor }} />
            Logo de la tienda
          </h2>
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div
              className="w-28 h-28 rounded-xl border-2 border-dashed border-[#EDEBE8] flex items-center justify-center overflow-hidden flex-shrink-0 bg-[#F7F6F5]"
              style={form.logo ? {} : { borderColor: form.brandColor + '40' }}
            >
              {form.logo ? (
                <div className="relative w-full h-full">
                  <Image src={form.logo} alt="Logo" fill className="object-contain p-2" />
                </div>
              ) : (
                <div className="text-center px-3">
                  <Store className="h-8 w-8 mx-auto mb-1 opacity-30" style={{ color: form.brandColor }} />
                  <p className="text-[10px] text-[#8F8780] font-body">Sin logo</p>
                </div>
              )}
            </div>
            {/* Controls */}
            <div className="space-y-3">
              <p className="text-sm text-[#6B6359] font-body">Sube tu logo en PNG o JPG (recomendado: fondo transparente).</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EDEBE8] text-sm font-semibold text-[#0A0A0A] hover:bg-[#F7F6F5] transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Subir logo
                </button>
                {form.logo && (
                  <button
                    onClick={() => setForm({ ...form, logo: null })}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Quitar
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>
        </section>

        {/* Colores */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-5">
            <Palette className="h-4 w-4" style={{ color: form.brandColor }} />
            Colores de marca
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { key: 'brandColor' as const, label: 'Color principal', desc: 'Botones, nav, encabezados' },
              { key: 'accentColor' as const, label: 'Color de acento', desc: 'Badges, destacados, precios' },
            ].map(({ key, label, desc }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <p className="text-xs text-[#8F8780] font-body mb-3">{desc}</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-12 h-12 rounded-xl border border-[#EDEBE8] cursor-pointer p-0.5 bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className={inputCls}
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </div>
                </div>
                {/* Preview */}
                <div className="mt-3 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: form[key] }}>Botón</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border-2" style={{ borderColor: form[key], color: form[key] }}>Outline</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Banner */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] mb-4">Banner de la tienda</h2>
          <div>
            <label className={labelCls}>URL de imagen de banner</label>
            <input value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} className={inputCls} placeholder="https://images.unsplash.com/…" />
          </div>
          {form.bannerUrl && (
            <div className="relative mt-3 h-32 rounded-xl overflow-hidden">
              <Image src={form.bannerUrl} alt="Banner preview" fill className="object-cover" sizes="600px" />
            </div>
          )}
        </section>

        {/* Contacto */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-5">
            <Phone className="h-4 w-4" style={{ color: form.brandColor }} />
            Información de contacto
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Correo electrónico</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="ventas@mitienda.mx" />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+52 351 000 0000" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Dirección</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} placeholder="Calle, ciudad, estado" />
            </div>
          </div>
        </section>

        {/* Opciones */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] mb-4">Opciones de la tienda</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm({ ...form, showPoweredBy: !form.showPoweredBy })}
              className={`relative w-10 h-5 rounded-full transition-colors ${form.showPoweredBy ? 'bg-[#10B981]' : 'bg-[#D9D5CF]'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.showPoweredBy ? 'left-5' : 'left-0.5'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">Mostrar "Powered by MARIASCLUB™"</p>
              <p className="text-xs text-[#8F8780] font-body">Aparece en el pie de página de tu tienda</p>
            </div>
          </label>
        </section>

        {/* Métodos de entrega */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4" style={{ color: form.brandColor }} />
            Métodos de entrega
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-5">
            Activa los métodos disponibles para tus clientes. Cada método se configura de forma independiente.
          </p>
          <div className="space-y-4">
            {(form.storeConfig?.shippingMethods ?? []).map((method, idx) => {
              const updateMethod = (patch: Record<string, unknown>) => {
                const methods = [...(form.storeConfig?.shippingMethods ?? [])];
                methods[idx] = { ...methods[idx], ...patch };
                setForm({ ...form, storeConfig: { ...form.storeConfig, shippingMethods: methods } });
              };
              const updateZone = (zone: keyof ZonedPricing, val: number) => {
                const methods = [...(form.storeConfig?.shippingMethods ?? [])];
                const base = methods[idx].zonedPricing ?? { local: 80, regional: 120, centro: 160, lejano: 200 };
                methods[idx] = { ...methods[idx], zonedPricing: { ...base, [zone]: Math.max(0, val) } };
                setForm({ ...form, storeConfig: { ...form.storeConfig, shippingMethods: methods } });
              };

              return (
                <div key={method.type} className="border border-[#EDEBE8] rounded-xl p-4">
                  {/* Cabecera con toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F7F6F5] flex items-center justify-center text-[#6B6359]">
                        {method.type === 'pickup'     && <Store   className="h-4 w-4" />}
                        {method.type === 'paqueteria' && <Truck   className="h-4 w-4" />}
                        {method.type === 'rappi'      && <Package className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A0A0A]">{method.label}</p>
                        <p className="text-xs text-[#8F8780] font-body">{method.description}</p>
                      </div>
                    </div>
                    <div
                      onClick={() => updateMethod({ enabled: !method.enabled })}
                      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${method.enabled ? 'bg-[#10B981]' : 'bg-[#D9D5CF]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${method.enabled ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </div>

                  {/* Config por tipo cuando está activo */}
                  {method.enabled && method.type === 'pickup' && (
                    <div className="mt-3 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold">Sin costo adicional — siempre gratis para el cliente</p>
                    </div>
                  )}

                  {method.enabled && method.type === 'rappi' && (
                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-xs font-semibold text-[#6B6359] whitespace-nowrap">Costo del servicio ($MXN)</label>
                      <input
                        type="number"
                        min="0"
                        value={method.cost}
                        onChange={(e) => updateMethod({ cost: Math.max(0, Number(e.target.value)) })}
                        className="w-28 border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3B82F6] bg-white"
                      />
                      {method.cost === 0 && <span className="text-xs text-green-600 font-semibold">Gratis</span>}
                    </div>
                  )}

                  {method.enabled && method.type === 'paqueteria' && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-[#6B6359] uppercase tracking-wider mb-3">
                        Costo por zona (según CP del cliente, distancia desde Guadalajara)
                      </p>
                      <div className="space-y-2">
                        {([
                          { zone: 'local'    as const, label: 'Zona local',    desc: 'Jalisco, Michoacán, Colima, Nayarit' },
                          { zone: 'regional' as const, label: 'Zona regional', desc: 'Bajío, Sinaloa, SLP, Zacatecas…' },
                          { zone: 'centro'   as const, label: 'Zona centro',   desc: 'CDMX, Puebla, EdoMex, Morelos…' },
                          { zone: 'lejano'   as const, label: 'Zona lejana',   desc: 'Norte, Sur, Sureste del país' },
                        ]).map(({ zone, label, desc }) => (
                          <div key={zone} className="flex items-center gap-3 bg-[#F7F6F5] rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#0A0A0A]">{label}</p>
                              <p className="text-[10px] text-[#8F8780] font-body">{desc}</p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-xs text-[#8F8780]">$</span>
                              <input
                                type="number"
                                min="0"
                                value={method.zonedPricing?.[zone] ?? 0}
                                onChange={(e) => updateZone(zone, Number(e.target.value))}
                                className="w-20 border border-[#EDEBE8] rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-[#3B82F6] bg-white"
                              />
                              <span className="text-[10px] text-[#8F8780]">MXN</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Datos bancarios */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-2">
            <Landmark className="h-4 w-4" style={{ color: form.brandColor }} />
            Datos bancarios para transferencias
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-5">Esta información aparecerá en el PDF del pedido y en el mensaje de WhatsApp.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Beneficiario</label>
              <input
                value={form.storeConfig?.bankInfo?.beneficiary ?? ''}
                onChange={(e) => setForm({ ...form, storeConfig: { ...form.storeConfig, bankInfo: { ...form.storeConfig?.bankInfo, beneficiary: e.target.value } } })}
                className={inputCls}
                placeholder="Nombre del titular de la cuenta"
              />
            </div>
            <div>
              <label className={labelCls}>Banco</label>
              <input
                value={form.storeConfig?.bankInfo?.bank ?? ''}
                onChange={(e) => setForm({ ...form, storeConfig: { ...form.storeConfig, bankInfo: { ...form.storeConfig?.bankInfo, bank: e.target.value } } })}
                className={inputCls}
                placeholder="BBVA, Banorte, HSBC…"
              />
            </div>
            <div>
              <label className={labelCls}>Número de cuenta</label>
              <input
                value={form.storeConfig?.bankInfo?.accountNumber ?? ''}
                onChange={(e) => setForm({ ...form, storeConfig: { ...form.storeConfig, bankInfo: { ...form.storeConfig?.bankInfo, accountNumber: e.target.value } } })}
                className={inputCls}
                placeholder="0000 0000 0000"
              />
            </div>
            <div>
              <label className={labelCls}>CLABE interbancaria</label>
              <input
                value={form.storeConfig?.bankInfo?.clabe ?? ''}
                onChange={(e) => setForm({ ...form, storeConfig: { ...form.storeConfig, bankInfo: { ...form.storeConfig?.bankInfo, clabe: e.target.value } } })}
                className={inputCls}
                placeholder="18 dígitos"
                maxLength={18}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Concepto de transferencia</label>
              <input
                value={form.storeConfig?.bankInfo?.concept ?? ''}
                onChange={(e) => setForm({ ...form, storeConfig: { ...form.storeConfig, bankInfo: { ...form.storeConfig?.bankInfo, concept: e.target.value } } })}
                className={inputCls}
                placeholder="Pedido tienda online"
              />
            </div>
          </div>
        </section>

        {/* WhatsApp */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4" style={{ color: '#25D366' }} />
            Número de WhatsApp
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-4">
            Los clientes enviarán su pedido a este número. Formato: código país + área + número, sin espacios ni guiones.<br />
            Ejemplo: <span className="font-mono font-bold text-[#0A0A0A]">5213511234567</span> (México, Zamora)
          </p>
          <input
            value={form.storeConfig?.whatsappNumber ?? ''}
            onChange={(e) => setForm({ ...form, storeConfig: { ...form.storeConfig, whatsappNumber: e.target.value.replace(/\D/g, '') } })}
            className={inputCls}
            placeholder="5213511234567"
            maxLength={15}
          />
        </section>

        {/* ─── Apariencia ─────────────────────────────────────────── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4" style={{ color: form.brandColor }} />
            Apariencia de la tienda
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-6">Define el estilo visual que verán tus clientes al entrar a tu tienda.</p>

          {/* Selector de tema */}
          <div className="mb-6">
            <label className={labelCls}>Tema visual</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {(Object.entries(THEMES) as [StoreTheme, typeof THEMES[StoreTheme]][]).map(([key, t]) => {
                const active = (form.storeTheme ?? 'moderno') === key;
                const labels: Record<StoreTheme, string> = { moderno: 'Moderno', lujo: 'Lujo', minimal: 'Minimal', oscuro: 'Oscuro' };
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, storeTheme: key })}
                    className="relative rounded-xl overflow-hidden border-2 transition-all text-left"
                    style={{ borderColor: active ? form.brandColor : '#EDEBE8' }}
                  >
                    {/* Miniatura del tema */}
                    <div className="h-20 flex flex-col px-3 pt-3 pb-2 gap-1.5" style={{ backgroundColor: t.bgPage }}>
                      <div className="h-2 rounded-full w-3/4" style={{ backgroundColor: t.textPrimary, opacity: 0.8 }} />
                      <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: t.textSecondary, opacity: 0.5 }} />
                      <div className="flex gap-1.5 mt-auto">
                        <div className="h-7 rounded flex-1" style={{ backgroundColor: t.bgCard, border: `${t.cardBorderWidth} solid ${t.cardBorderColor}` }}>
                          <div className="h-3 rounded-t" style={{ backgroundColor: t.textSecondary, opacity: 0.2 }} />
                        </div>
                        <div className="h-7 rounded flex-1" style={{ backgroundColor: t.bgCard, border: `${t.cardBorderWidth} solid ${t.cardBorderColor}` }}>
                          <div className="h-3 rounded-t" style={{ backgroundColor: t.textSecondary, opacity: 0.2 }} />
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1.5 flex items-center justify-between" style={{ backgroundColor: t.bgSection }}>
                      <span className="text-[11px] font-semibold" style={{ color: t.textPrimary }}>{labels[key]}</span>
                      {active && <Check className="h-3 w-3" style={{ color: form.brandColor }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA del hero */}
          <div className="mb-4">
            <label className={labelCls}>Texto del botón principal (hero)</label>
            <input
              value={form.heroCtaText ?? 'Ver colección'}
              onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
              className={inputCls}
              placeholder="Ver colección"
              maxLength={40}
            />
            <p className="text-xs text-[#8F8780] font-body mt-1">Aparece en el banner principal de tu tienda</p>
          </div>

          {/* Estilo de cards */}
          <div>
            <label className={labelCls}>Estilo de tarjetas de producto</label>
            <div className="flex gap-3 mt-2">
              {([['rounded', 'Redondeadas'], ['square', 'Cuadradas']] as [CardStyle, string][]).map(([val, label]) => {
                const active = (form.cardStyle ?? 'rounded') === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm({ ...form, cardStyle: val })}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold"
                    style={{
                      borderColor: active ? form.brandColor : '#EDEBE8',
                      color: active ? form.brandColor : '#6B6359',
                      backgroundColor: active ? form.brandColor + '0D' : '#FFFFFF',
                    }}
                  >
                    <div
                      className="w-8 h-8 bg-[#F7F6F5] border border-[#EDEBE8]"
                      style={{ borderRadius: val === 'rounded' ? '10px' : '2px' }}
                    />
                    {label}
                    {active && <Check className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Barra de anuncio ───────────────────────────────────── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-2">
            <Megaphone className="h-4 w-4" style={{ color: form.brandColor }} />
            Barra de anuncio
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-5">
            Aparece arriba del encabezado de tu tienda. Deja vacío para ocultarla.
          </p>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Texto del anuncio</label>
              <input
                value={form.announcementText ?? ''}
                onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
                className={inputCls}
                placeholder="Ej: Envío gratis en pedidos mayores a $500 · Llámanos al 351-123-4567"
                maxLength={120}
              />
            </div>
            {(form.announcementText ?? '') && (
              <div>
                <label className={labelCls}>Color de fondo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.announcementBg || form.brandColor}
                    onChange={(e) => setForm({ ...form, announcementBg: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-[#EDEBE8] cursor-pointer p-0.5 bg-white"
                  />
                  <div
                    className="flex-1 px-4 py-2 rounded-lg text-center text-xs font-bold text-white truncate"
                    style={{ backgroundColor: form.announcementBg || form.brandColor }}
                  >
                    {form.announcementText}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Redes sociales ─────────────────────────────────────── */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-2">
            <AtSign className="h-4 w-4" style={{ color: form.brandColor }} />
            Redes sociales
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-5">
            Aparecen en el pie de página de tu tienda. Solo escribe el usuario o handle.
          </p>
          <div className="space-y-4">
            {([
              { key: 'instagramUrl' as const, label: 'Instagram', prefix: 'instagram.com/', placeholder: 'mitienda.zamora' },
              { key: 'facebookUrl' as const,  label: 'Facebook',  prefix: 'facebook.com/',  placeholder: 'MiTiendaZamora' },
              { key: 'tiktokUrl'   as const,  label: 'TikTok',    prefix: 'tiktok.com/@',   placeholder: 'mitiendazamora' },
            ]).map(({ key, label, prefix, placeholder }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <div className="flex items-center border border-[#EDEBE8] rounded-lg overflow-hidden bg-white focus-within:border-[#3B82F6]">
                  <span className="px-3 py-2.5 text-xs text-[#8F8780] bg-[#F7F6F5] border-r border-[#EDEBE8] font-body whitespace-nowrap">{prefix}</span>
                  <input
                    value={form[key] ?? ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="flex-1 px-3 py-2.5 text-sm font-body text-[#0A0A0A] focus:outline-none bg-white"
                    placeholder={placeholder}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
