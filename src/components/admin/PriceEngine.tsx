'use client';

import { useEffect, useState, useCallback } from 'react';
import { Lock, RotateCcw, ChevronDown, ChevronRight, Eye, EyeOff, Check } from 'lucide-react';
import { products as catalogProducts } from '@/lib/mock-data';
import {
  getPricing, setProductPrice, applySupplierBulkAdjustment,
  resetSupplierPrices, setSupplierWholesaleRate, getSupplierWholesaleRate,
  PricingData,
} from '@/lib/pricing-store';

/* ── Agrupación de productos por proveedor ──────────────────────── */
const SUPPLIERS = [
  { id: 'fashion-hogar-zamora',  name: 'Moda & Hogar Zamora' },
  { id: 'deportes-tech-zamora',  name: 'Deportes & Tech Zamora' },
];

function pct(effective: number, base: number): string {
  if (base === 0) return '—';
  const diff = ((effective - base) / base) * 100;
  return (diff >= 0 ? '+' : '') + diff.toFixed(1) + '%';
}

function pctColor(effective: number, base: number): string {
  if (effective > base) return 'text-green-600';
  if (effective < base) return 'text-red-500';
  return 'text-gray-400';
}

/* ── Componente principal ──────────────────────────────────────── */
export function PriceEngine() {
  const [pricing, setPricing] = useState<PricingData>({ products: {}, suppliers: {} });
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [bulkPct, setBulkPct] = useState<Record<string, string>>({});
  const [wholesaleInputs, setWholesaleInputs] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(SUPPLIERS.map((s) => [s.id, true])),
  );
  const [showWholesale, setShowWholesale] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const reload = useCallback(() => {
    const data = getPricing();
    setPricing(data);
    // Inicializar inputs con precios actuales
    const ep: Record<string, string> = {};
    for (const p of catalogProducts) {
      ep[p.id] = (data.products[p.id]?.price ?? p.price).toFixed(2);
    }
    setEditPrices(ep);
    // Inicializar inputs de mayoreo
    const wi: Record<string, string> = {};
    for (const s of SUPPLIERS) {
      wi[s.id] = String(
        data.suppliers[s.id]?.wholesaleRate ?? getSupplierWholesaleRate(s.id),
      );
    }
    setWholesaleInputs(wi);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  /* Guardar precio individual */
  const saveProductPrice = (productId: string) => {
    const val = parseFloat(editPrices[productId]);
    if (isNaN(val) || val < 0) return;
    setProductPrice(productId, val);
    setSaved(productId);
    setTimeout(() => setSaved(null), 1500);
    reload();
  };

  /* Ajuste masivo por proveedor */
  const applyBulk = (supplierId: string) => {
    const pct = parseFloat(bulkPct[supplierId] ?? '0');
    if (isNaN(pct)) return;
    const supplierProducts = catalogProducts
      .filter((p) => p.supplierId === supplierId)
      .map((p) => ({ id: p.id, basePrice: p.price }));
    applySupplierBulkAdjustment(supplierProducts, pct);
    setBulkPct((prev) => ({ ...prev, [supplierId]: '' }));
    reload();
  };

  /* Resetear precios de un proveedor */
  const resetSupplier = (supplierId: string) => {
    const ids = catalogProducts.filter((p) => p.supplierId === supplierId).map((p) => p.id);
    resetSupplierPrices(ids);
    reload();
  };

  /* Guardar tarifa de mayoreo */
  const saveWholesaleRate = (supplierId: string) => {
    const val = parseFloat(wholesaleInputs[supplierId]);
    if (isNaN(val)) return;
    setSupplierWholesaleRate(supplierId, val);
    setSaved(`wholesale-${supplierId}`);
    setTimeout(() => setSaved(null), 1500);
    reload();
  };

  return (
    <div className="space-y-6">

      {/* Header con toggle de visibilidad */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#C0392B]" />
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            Solo Admin — Confidencial
          </span>
        </div>
        <button
          onClick={() => setShowWholesale((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-[#6B6359] hover:text-[#0A0A0A] border border-[#EDEBE8] px-3 py-1.5 rounded-xl transition-colors"
        >
          {showWholesale ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showWholesale ? 'Ocultar tarifas mayoreo' : 'Mostrar tarifas mayoreo'}
        </button>
      </div>

      <p className="text-xs text-[#8F8780] font-body">
        Controla los precios de menudeo que se muestran en MariasClub y las tarifas de mayoreo
        que se pagan a cada proveedor. Los proveedores no ven estos datos.
      </p>

      {/* Una sección por proveedor */}
      {SUPPLIERS.map((supplier) => {
        const supplierProducts = catalogProducts.filter((p) => p.supplierId === supplier.id);
        const isExpanded = expanded[supplier.id];
        const totalBase = supplierProducts.reduce((s, p) => s + p.price, 0);
        const totalEffective = supplierProducts.reduce(
          (s, p) => s + (pricing.products[p.id]?.price ?? p.price), 0,
        );
        const overrideCount = supplierProducts.filter((p) => pricing.products[p.id]).length;

        return (
          <div key={supplier.id} className="bg-white border border-[#EDEBE8] rounded-2xl overflow-hidden">

            {/* Cabecera del proveedor */}
            <div
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#FAFAFA] transition-colors"
              onClick={() => setExpanded((prev) => ({ ...prev, [supplier.id]: !isExpanded }))}
            >
              <div className="flex items-center gap-3">
                {isExpanded
                  ? <ChevronDown className="h-4 w-4 text-[#8F8780]" />
                  : <ChevronRight className="h-4 w-4 text-[#8F8780]" />}
                <div>
                  <p className="text-sm font-bold text-[#0A0A0A]">{supplier.name}</p>
                  <p className="text-[10px] text-[#8F8780] font-body mt-0.5">
                    {supplierProducts.length} productos
                    {overrideCount > 0 && ` · ${overrideCount} con precio modificado`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-[10px] text-[#8F8780] font-body">Suma precios base</p>
                  <p className="text-sm font-bold text-[#0A0A0A]">
                    ${totalBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[#8F8780] font-body">Suma precios MariasClub</p>
                  <p className={`text-sm font-bold ${pctColor(totalEffective, totalBase)}`}>
                    ${totalEffective.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {isExpanded && (
              <>
                {/* Herramientas de proveedor */}
                <div className="px-5 py-4 bg-[#FAFAFA] border-t border-[#F7F6F5] flex flex-wrap gap-4 items-end">

                  {/* Ajuste masivo */}
                  <div className="flex items-end gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B6359] mb-1">
                        Ajuste masivo (%)
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="ej. 10 o -5"
                          value={bulkPct[supplier.id] ?? ''}
                          onChange={(e) => setBulkPct((prev) => ({ ...prev, [supplier.id]: e.target.value }))}
                          className="w-28 border border-[#EDEBE8] rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00C9B1] bg-white"
                        />
                        <button
                          onClick={() => applyBulk(supplier.id)}
                          className="px-3 py-2 bg-[#00C9B1] text-white text-xs font-bold rounded-r-lg hover:bg-[#00B09C] transition-colors whitespace-nowrap"
                        >
                          Aplicar
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8F8780] font-body mt-0.5">
                        Se aplica sobre precios actuales
                      </p>
                    </div>
                    <button
                      onClick={() => resetSupplier(supplier.id)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-[#EDEBE8] rounded-lg text-xs font-semibold text-[#6B6359] hover:bg-white hover:border-red-300 hover:text-red-600 transition-colors mb-5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Resetear
                    </button>
                  </div>

                  {/* Tarifa mayoreo (solo visible si showWholesale) */}
                  {showWholesale && (
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-purple-600 mb-1">
                        Tarifa mayoreo (%) — confidencial
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex border border-purple-200 rounded-lg overflow-hidden focus-within:border-purple-400">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={wholesaleInputs[supplier.id] ?? '70'}
                            onChange={(e) => setWholesaleInputs((prev) => ({ ...prev, [supplier.id]: e.target.value }))}
                            className="w-20 px-3 py-2 text-sm focus:outline-none bg-white"
                          />
                          <span className="px-2 py-2 text-xs text-[#8F8780] bg-purple-50 border-l border-purple-200 font-body">%</span>
                        </div>
                        <button
                          onClick={() => saveWholesaleRate(supplier.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          {saved === `wholesale-${supplier.id}`
                            ? <><Check className="h-3 w-3" />Guardado</>
                            : 'Guardar'}
                        </button>
                      </div>
                      <p className="text-[10px] text-purple-500 font-body mt-0.5">
                        El proveedor recibe este % del precio menudeo
                      </p>
                    </div>
                  )}
                </div>

                {/* Tabla de productos */}
                <div className="divide-y divide-[#F7F6F5]">
                  {/* Cabecera */}
                  <div className="px-5 py-2 grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#8F8780] bg-[#F7F6F5]">
                    <span className="col-span-5">Producto</span>
                    <span className="col-span-2 text-right">Precio base</span>
                    <span className="col-span-3 text-right">Precio MariasClub</span>
                    <span className="col-span-2 text-right">Variación</span>
                  </div>

                  {supplierProducts.map((product) => {
                    const effective = pricing.products[product.id]?.price ?? product.price;
                    const hasOverride = !!pricing.products[product.id];
                    const isSaved = saved === product.id;

                    return (
                      <div key={product.id} className="px-5 py-2.5 grid grid-cols-12 gap-2 items-center">
                        {/* Nombre */}
                        <div className="col-span-5 min-w-0">
                          <p className="text-xs font-medium text-[#0A0A0A] truncate">{product.name}</p>
                          <p className="text-[10px] text-[#8F8780] font-body">{product.category}</p>
                        </div>

                        {/* Precio base */}
                        <div className="col-span-2 text-right">
                          <p className="text-xs text-[#8F8780] font-body">${product.price.toFixed(2)}</p>
                        </div>

                        {/* Precio MariasClub — editable */}
                        <div className="col-span-3 flex items-center justify-end">
                          <div className="flex items-center border rounded-lg overflow-hidden focus-within:border-[#00C9B1]"
                            style={{ borderColor: hasOverride ? '#00C9B120' : '#EDEBE8', backgroundColor: hasOverride ? '#F0FDF9' : 'white' }}>
                            <span className="pl-2 text-xs text-[#8F8780]">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editPrices[product.id] ?? product.price.toFixed(2)}
                              onChange={(e) =>
                                setEditPrices((prev) => ({ ...prev, [product.id]: e.target.value }))
                              }
                              onBlur={() => saveProductPrice(product.id)}
                              onKeyDown={(e) => e.key === 'Enter' && saveProductPrice(product.id)}
                              className="w-20 pl-1 pr-2 py-1.5 text-xs text-right focus:outline-none bg-transparent"
                            />
                          </div>
                          {isSaved && (
                            <Check className="h-3.5 w-3.5 text-green-500 ml-1.5 flex-shrink-0" />
                          )}
                        </div>

                        {/* Variación */}
                        <div className="col-span-2 text-right">
                          <span className={`text-[10px] font-bold ${pctColor(effective, product.price)}`}>
                            {pct(effective, product.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      })}

      <p className="text-[10px] text-[#8F8780] font-body text-center">
        Los cambios se guardan automáticamente al confirmar cada campo.
        En Phase 2 estos precios se sincronizarán con la base de datos en tiempo real.
      </p>
    </div>
  );
}
