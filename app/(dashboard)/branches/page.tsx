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
import { branchApi } from '@/lib/api-client';
import { Branch } from '@/types';
import Link from 'next/link';

/**
 * Branch List Page
 * Displays all branches in a table with CRUD actions
 */
export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load branches on mount
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await branchApi.getAll();
      setBranches(data);
    } catch (err) {
      console.error('Failed to load branches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      return;
    }

    try {
      await branchApi.delete(id);
      await loadBranches();
    } catch (err) {
      console.error('Failed to delete branch:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete branch');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading branches..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Branches"
          description="Manage restaurant branches"
        />
        <ErrorMessage message={error} />
        <Button onClick={loadBranches}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Manage all restaurant branches and locations"
        action={
          <Link href="/branches/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Branch
            </Button>
          </Link>
        }
      />

      {branches.length === 0 ? (
        <EmptyState
          title="No branches found"
          description="Get started by creating your first branch. Branches represent physical locations of restaurants."
          action={
            <Link href="/branches/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Branch
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={branches}
          columns={[
            {
              key: 'code',
              label: 'Code',
              className: 'font-mono text-sm',
              render: (item) => item.code || '-',
            },
            {
              key: 'name',
              label: 'Name',
              className: 'font-medium',
            },
            {
              key: 'restaurant',
              label: 'Restaurant',
              render: (item) => item.restaurant?.name || '-',
            },
            {
              key: 'city',
              label: 'City',
              render: (item) => item.city || '-',
            },
            {
              key: 'contactPhone',
              label: 'Phone',
              render: (item) => item.contactPhone || '-',
            },
            {
              key: 'isActive',
              label: 'Status',
              render: (item) => (
                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ),
            },
          ]}
          editPath={(item) => `/branches/${item.id}`}
          onDelete={(item) => handleDelete(item.id)}
          idField="id"
        />
      )}
    </div>
  );
}
