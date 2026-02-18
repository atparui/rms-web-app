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
import { billApi } from '@/lib/api-client';
import { Bill } from '@/types';
import Link from 'next/link';

export default function BillingPage() {
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await billApi.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bills');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bill?')) return;
    try { await billApi.delete(id); await load(); } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading bills..." />;
  if (error) return (<div className="space-y-6"><PageHeader title="Billing &amp; Payments" description="Bills and payments" /><ErrorMessage message={error} /><Button onClick={load}>Try Again</Button></div>);

  return (
    <div className="space-y-6">
      <PageHeader title="Billing &amp; Payments" description="Manage bills and payments" action={<Link href="/billing/create"><Button><Plus className="mr-2 h-4 w-4" />New Bill</Button></Link>} />
      {items.length === 0 ? (
        <EmptyState title="No bills found" description="Bills will appear here." action={<Link href="/billing/create"><Button><Plus className="mr-2 h-4 w-4" />New Bill</Button></Link>} />
      ) : (
        <DataTable data={items} columns={[
          { key: 'billNumber', label: 'Bill #' },
          { key: 'billDate', label: 'Date', render: (r) => r.billDate ? new Date(r.billDate).toLocaleDateString() : '-' },
          { key: 'totalAmount', label: 'Total', render: (r) => r.totalAmount != null ? `₹${Number(r.totalAmount).toFixed(2)}` : '-' },
          { key: 'amountDue', label: 'Due', render: (r) => r.amountDue != null ? `₹${Number(r.amountDue).toFixed(2)}` : '-' },
          { key: 'status', label: 'Status', render: (r) => <Badge variant="secondary">{r.status || '—'}</Badge> },
          { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
        ]} editPath={(r) => `/billing/${r.id}`} onDelete={(r) => handleDelete(r.id)} idField="id" />
      )}
    </div>
  );
}
