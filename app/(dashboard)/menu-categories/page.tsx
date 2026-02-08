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
import { menuCategoryApi } from '@/lib/api-client';
import { MenuCategory } from '@/types';
import Link from 'next/link';

/**
 * Menu Categories List Page
 */
export default function MenuCategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuCategoryApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load menu categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await menuCategoryApi.delete(id);
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading menu categories..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Menu Categories" description="Organize your menu items" />
        <ErrorMessage message={error} />
        <Button onClick={loadCategories}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Categories"
        description="Organize your menu items into categories"
        action={
          <Link href="/menu-categories/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </Link>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          title="No categories found"
          description="Create your first menu category to organize menu items like Appetizers, Main Course, Desserts, etc."
          action={
            <Link href="/menu-categories/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={categories}
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
              key: 'description',
              label: 'Description',
              render: (item) => item.description || '-',
            },
            {
              key: 'displayOrder',
              label: 'Display Order',
              render: (item) => item.displayOrder || '-',
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
          editPath={(item) => `/menu-categories/${item.id}`}
          onDelete={(item) => handleDelete(item.id)}
          idField="id"
        />
      )}
    </div>
  );
}
