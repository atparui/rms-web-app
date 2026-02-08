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
import { rmsUserApi } from '@/lib/api-client';
import { RmsUser } from '@/types';
import Link from 'next/link';

/**
 * Users List Page
 */
export default function UsersPage() {
  const [users, setUsers] = useState<RmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rmsUserApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await rmsUserApi.delete(id);
      await loadUsers();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Users" description="Manage system users" />
        <ErrorMessage message={error} />
        <Button onClick={loadUsers}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage all users in the restaurant management system"
        action={
          <Link href="/users/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </Link>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Users are synchronized from Keycloak. Create or sync users from your authentication provider."
          action={
            <Link href="/users/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={users}
          columns={[
            {
              key: 'username',
              label: 'Username',
              className: 'font-medium',
            },
            {
              key: 'firstName',
              label: 'First Name',
              render: (item) => item.firstName || '-',
            },
            {
              key: 'lastName',
              label: 'Last Name',
              render: (item) => item.lastName || '-',
            },
            {
              key: 'email',
              label: 'Email',
            },
            {
              key: 'phoneNumber',
              label: 'Phone',
              render: (item) => item.phoneNumber || '-',
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
          editPath={(item) => `/users/${item.id}`}
          onDelete={(item) => handleDelete(item.id)}
          idField="id"
        />
      )}
    </div>
  );
}
