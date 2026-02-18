'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/table/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { inventoryApi } from '@/lib/api-client';
import { Inventory } from '@/types';
import Link from 'next/link';

export default function InventoryPage() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await inventoryApi.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this inventory record?')) return;
    try { await inventoryApi.delete(id); await load(); } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading inventory..." />;
  if (error) return (<div className="space-y-6"><PageHeader title="Inventory" description="Stock levels" /><ErrorMessage message={error} /><Button onClick={load}>Try Again</Button></div>);

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory" description="Manage stock levels by branch and menu item" action={<Link href="/inventory/create"><Button><Plus className="mr-2 h-4 w-4" />Add Inventory</Button></Link>} />
      {items.length === 0 ? (
        <EmptyState title="No inventory found" description="Add inventory for menu items at branches." action={<Link href="/inventory/create"><Button><Plus className="mr-2 h-4 w-4" />Add Inventory</Button></Link>} />
      ) : (
        <DataTable data={items} columns={[
          { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
          { key: 'menuItem', label: 'Menu item', render: (r) => r.menuItem?.name || '-' },
          { key: 'currentStock', label: 'Current stock', render: (r) => String(r.currentStock ?? '-') },
          { key: 'unit', label: 'Unit', render: (r) => r.unit || '-' },
          { key: 'minStockLevel', label: 'Min', render: (r) => String(r.minStockLevel ?? '-') },
          { key: 'maxStockLevel', label: 'Max', render: (r) => String(r.maxStockLevel ?? '-') },
        ]} editPath={(r) => `/inventory/${r.id}`} onDelete={(r) => handleDelete(r.id)} idField="id" />
      )}
    </div>
  );
}
