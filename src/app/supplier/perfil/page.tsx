'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, X, Check, Store, Palette, Phone, Eye, Truck, Landmark, MessageCircle } from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';
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

        {/* Métodos de envío */}
        <section className="bg-white border border-[#EDEBE8] rounded-2xl p-6">
          <h2 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2 mb-5">
            <Truck className="h-4 w-4" style={{ color: form.brandColor }} />
            Métodos de entrega
          </h2>
          <p className="text-xs text-[#8F8780] font-body mb-5">Activa los métodos disponibles y configura el costo de cada uno. El costo 0 se mostrará como &quot;Gratis&quot;.</p>
          <div className="space-y-4">
            {(form.storeConfig?.shippingMethods ?? []).map((method, idx) => (
              <div key={method.type} className="border border-[#EDEBE8] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A]">{method.label}</p>
                    <p className="text-xs text-[#8F8780] font-body">{method.description}</p>
                  </div>
                  <div
                    onClick={() => {
                      const methods = [...(form.storeConfig?.shippingMethods ?? [])];
                      methods[idx] = { ...methods[idx], enabled: !methods[idx].enabled };
                      setForm({ ...form, storeConfig: { ...form.storeConfig, shippingMethods: methods } });
                    }}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${method.enabled ? 'bg-[#10B981]' : 'bg-[#D9D5CF]'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${method.enabled ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
                {method.enabled && (
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-[#6B6359] whitespace-nowrap">Costo ($MXN)</label>
                    <input
                      type="number"
                      min="0"
                      value={method.cost}
                      onChange={(e) => {
                        const methods = [...(form.storeConfig?.shippingMethods ?? [])];
                        methods[idx] = { ...methods[idx], cost: Math.max(0, Number(e.target.value)) };
                        setForm({ ...form, storeConfig: { ...form.storeConfig, shippingMethods: methods } });
                      }}
                      className="w-28 border border-[#EDEBE8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3B82F6] bg-white"
                    />
                    {method.cost === 0 && <span className="text-xs text-green-600 font-semibold">Gratis</span>}
                  </div>
                )}
              </div>
            ))}
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

      </div>
    </div>
  );
}
