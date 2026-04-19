'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Pencil, Eye } from 'lucide-react';
import { useSupplier } from '@/lib/supplier-context';

export default function TiendaPreviewPage() {
  const { profile, inventory } = useSupplier();
  const activeProducts = inventory.filter((p) => p.active && p.stock > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#0A0A0A]">Vista Previa de Mi Tienda</h1>
          <p className="text-xs text-[#8F8780] font-body mt-0.5">Así verán tu tienda tus clientes</p>
        </div>
        <div className="flex gap-3">
          <Link href="/supplier/perfil" className="flex items-center gap-2 px-4 py-2 border border-[#EDEBE8] rounded-xl text-sm font-semibold text-[#6B6359] hover:bg-[#F7F6F5] transition-colors">
            <Pencil className="h-4 w-4" />
            Editar marca
          </Link>
          <a
            href={`/tienda/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: profile.brandColor }}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir tienda
          </a>
        </div>
      </div>

      {/* Simulated storefront */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#EDEBE8] shadow-lg">

        {/* Simulated browser bar */}
        <div className="bg-[#F7F6F5] border-b border-[#EDEBE8] px-4 py-2 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex-1 bg-white border border-[#EDEBE8] rounded px-3 py-1 text-xs text-[#8F8780] font-mono">
            proyectomarias.vercel.app/tienda/{profile.slug}
          </div>
        </div>

        {/* Store header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: profile.brandColor }}>
          <div className="flex items-center gap-3">
            {profile.logo ? (
              <div className="relative h-9 w-24">
                <Image src={profile.logo} alt={profile.storeName} fill className="object-contain object-left" />
              </div>
            ) : (
              <span className="text-white font-bold text-lg">{profile.storeName}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-white text-xs font-body">
            <span>Inicio</span>
            <span>Productos</span>
            <span>Contacto</span>
          </div>
        </div>

        {/* Banner */}
        {profile.bannerUrl && (
          <div className="relative h-40 overflow-hidden">
            <Image src={profile.bannerUrl} alt="Banner" fill className="object-cover" sizes="900px" />
            <div className="absolute inset-0 flex items-center px-8" style={{ background: `${profile.brandColor}99` }}>
              <div>
                <h2 className="text-white font-bold text-2xl">{profile.storeName}</h2>
                <p className="text-white/80 text-sm mt-1">{profile.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div className="bg-[#FAFAFA] px-6 py-6">
          <h3 className="text-sm font-bold text-[#0A0A0A] mb-4">
            Productos disponibles <span className="text-[#8F8780] font-normal">({activeProducts.length})</span>
          </h3>
          {activeProducts.length === 0 ? (
            <div className="text-center py-10 text-[#8F8780] font-body text-sm">
              Sin productos activos. Activa productos en Inventario.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activeProducts.slice(0, 8).map((p) => (
                <div key={p.id} className="bg-white rounded-xl overflow-hidden border border-[#EDEBE8]">
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="200px" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-[#0A0A0A] line-clamp-2">{p.name}</p>
                    <p className="text-sm font-bold mt-1" style={{ color: profile.accentColor }}>${p.price.toFixed(2)}</p>
                    <button
                      className="mt-2 w-full py-1.5 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: profile.brandColor }}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeProducts.length > 8 && (
            <p className="text-center text-xs text-[#8F8780] font-body mt-4">
              +{activeProducts.length - 8} productos más en la tienda completa
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDEBE8] bg-white flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#0A0A0A]">{profile.storeName}</p>
            <p className="text-[10px] text-[#8F8780] font-body">{profile.email} · {profile.phone}</p>
          </div>
          {profile.showPoweredBy && (
            <span className="text-[10px] text-[#8F8780] font-body">Powered by MARIASCLUB™</span>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#8F8780] font-body mt-4">
        Esta es una vista previa. <a href={`/tienda/${profile.slug}`} target="_blank" className="text-[#3B82F6] hover:underline">Abrir tienda real →</a>
      </p>
    </div>
  );
}
