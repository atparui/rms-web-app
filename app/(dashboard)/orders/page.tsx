'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { orderApi } from '@/lib/api-client';
import { Order } from '@/types';
import Link from 'next/link';

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await orderApi.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    try { await orderApi.delete(id); await load(); } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;
  if (error) return (<div className="space-y-6"><PageHeader title="Orders" description="Manage orders" /><ErrorMessage message={error} /><Button onClick={load}>Try Again</Button></div>);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage restaurant orders" action={<Link href="/orders/create"><Button><Plus className="mr-2 h-4 w-4" />New Order</Button></Link>} />
      {items.length === 0 ? (
        <EmptyState title="No orders found" description="Orders will appear here." action={<Link href="/orders/create"><Button><Plus className="mr-2 h-4 w-4" />New Order</Button></Link>} />
      ) : (
        <DataTable data={items} columns={[
          { key: 'orderNumber', label: 'Order #' },
          { key: 'status', label: 'Status', render: (r) => <Badge variant="secondary">{r.status || '—'}</Badge> },
          { key: 'orderDate', label: 'Date', render: (r) => r.orderDate ? new Date(r.orderDate).toLocaleString() : '-' },
          { key: 'totalAmount', label: 'Total', render: (r) => r.totalAmount != null ? `₹${Number(r.totalAmount).toFixed(2)}` : '-' },
          { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
          { key: 'customer', label: 'Customer', render: (r) => r.customer ? `${r.customer.firstName} ${r.customer.lastName}`.trim() || r.customer.email : '-' },
        ]} editPath={(r) => `/orders/${r.id}`} onDelete={(r) => handleDelete(r.id)} idField="id" />
      )}
    </div>
  );
}
