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
import { customerApi } from '@/lib/api-client';
import { Customer } from '@/types';
import Link from 'next/link';

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerApi.delete(id);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner text="Loading customers..." />;
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customers" description="Manage customers" />
        <ErrorMessage message={error} />
        <Button onClick={load}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage restaurant customers"
        action={
          <Link href="/customers/create">
            <Button><Plus className="mr-2 h-4 w-4" />Create Customer</Button>
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Add your first customer."
          action={<Link href="/customers/create"><Button><Plus className="mr-2 h-4 w-4" />Create Customer</Button></Link>}
        />
      ) : (
        <DataTable
          data={items}
          columns={[
            { key: 'customerCode', label: 'Code', render: (r) => r.customerCode || '-' },
            { key: 'firstName', label: 'First name' },
            { key: 'lastName', label: 'Last name' },
            { key: 'email', label: 'Email', render: (r) => r.email || '-' },
            { key: 'phone', label: 'Phone', render: (r) => r.phone || '-' },
            { key: 'city', label: 'City', render: (r) => r.city || '-' },
            { key: 'isActive', label: 'Status', render: (r) => <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge> },
          ]}
          editPath={(r) => `/customers/${r.id}`}
          onDelete={(r) => handleDelete(r.id)}
          idField="id"
        />
      )}
    </div>
  );
}
