import { orders, Order } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';

const statusStyles: Record<Order['status'], string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-[#00C9B1]/10 text-[#009E8C] border-[#00C9B1]/20',
  returned: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  returned: 'Devuelto',
};

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <div>
      <h2 className="font-body text-base font-bold text-[#0A0A0A] mb-5">Pedidos Recientes</h2>
      <div className="overflow-x-auto rounded-xl border border-[#EDEBE8]">
        <table className="w-full text-sm">
          <thead className="bg-[#F7F6F5] border-b border-[#EDEBE8]">
            <tr>
              {['Pedido', 'Cliente', 'Producto', 'Cant.', 'Estado', 'Fecha', 'Total', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8F8780] font-body whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEBE8]">
            {orders.map((order) => (
              <tr key={order.id} className="bg-white hover:bg-[#F7F6F5] transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0A0A0A]">{order.id}</td>
                <td className="px-4 py-3 text-xs font-body text-[#0A0A0A] whitespace-nowrap">{order.customerName}</td>
                <td className="px-4 py-3 text-xs font-body text-[#6B6359] max-w-[150px] truncate">{order.product}</td>
                <td className="px-4 py-3 text-xs font-body text-center">{order.qty}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyles[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#8F8780] font-body whitespace-nowrap">{order.date}</td>
                <td className="px-4 py-3 text-xs font-bold font-body">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <button className="text-[10px] text-[#00C9B1] hover:text-[#009E8C] font-semibold whitespace-nowrap">
                    Ver →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
