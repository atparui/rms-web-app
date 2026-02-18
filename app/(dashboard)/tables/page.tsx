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
import { branchTableApi } from '@/lib/api-client';
import { BranchTable } from '@/types';
import Link from 'next/link';

export default function TablesPage() {
  const [items, setItems] = useState<BranchTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await branchTableApi.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this table?')) return;
    try { await branchTableApi.delete(id); await load(); } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading tables..." />;
  if (error) return (<div className="space-y-6"><PageHeader title="Table Management" description="Branch tables" /><ErrorMessage message={error} /><Button onClick={load}>Try Again</Button></div>);

  return (
    <div className="space-y-6">
      <PageHeader title="Table Management" description="Manage branch tables" action={<Link href="/tables/create"><Button><Plus className="mr-2 h-4 w-4" />Add Table</Button></Link>} />
      {items.length === 0 ? (
        <EmptyState title="No tables found" description="Add tables for your branches." action={<Link href="/tables/create"><Button><Plus className="mr-2 h-4 w-4" />Add Table</Button></Link>} />
      ) : (
        <DataTable data={items} columns={[
          { key: 'tableNumber', label: 'Table #' },
          { key: 'tableName', label: 'Name', render: (r) => r.tableName || '-' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'floor', label: 'Floor', render: (r) => r.floor || '-' },
          { key: 'section', label: 'Section', render: (r) => r.section || '-' },
          { key: 'status', label: 'Status', render: (r) => <Badge variant="secondary">{r.status || '—'}</Badge> },
          { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
          { key: 'isActive', label: 'Active', render: (r) => <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Yes' : 'No'}</Badge> },
        ]} editPath={(r) => `/tables/${r.id}`} onDelete={(r) => handleDelete(r.id)} idField="id" />
      )}
    </div>
  );
}
