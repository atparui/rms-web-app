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
import { menuItemApi } from '@/lib/api-client';
import { MenuItem } from '@/types';
import Link from 'next/link';

/**
 * Menu Items List Page
 */
export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuItemApi.getAll();
      setItems(data);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    try {
      await menuItemApi.delete(id);
      await loadItems();
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete menu item');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading menu items..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Menu Items" description="Manage your menu" />
        <ErrorMessage message={error} />
        <Button onClick={loadItems}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Items"
        description="Manage all items available on your menu"
        action={
          <Link href="/menu-items/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Menu Item
            </Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          title="No menu items found"
          description="Create your first menu item like dishes, beverages, etc."
          action={
            <Link href="/menu-items/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Menu Item
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={items}
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
              key: 'category',
              label: 'Category',
              render: (item) => item.category?.name || '-',
            },
            {
              key: 'basePrice',
              label: 'Price',
              render: (item) => `$${item.basePrice.toFixed(2)}`,
            },
            {
              key: 'isVegetarian',
              label: 'Type',
              render: (item) => {
                const tags = [];
                if (item.isVegan) tags.push('Vegan');
                else if (item.isVegetarian) tags.push('Vegetarian');
                return tags.length > 0 ? tags.join(', ') : 'Regular';
              },
            },
            {
              key: 'isAvailable',
              label: 'Availability',
              render: (item) => (
                <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              ),
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
          editPath={(item) => `/menu-items/${item.id}`}
          onDelete={(item) => handleDelete(item.id)}
          idField="id"
        />
      )}
    </div>
  );
}
