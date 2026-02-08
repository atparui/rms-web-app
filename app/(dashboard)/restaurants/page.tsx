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
import { restaurantApi } from '@/lib/api-client';
import { Restaurant } from '@/types';
import Link from 'next/link';

/**
 * Restaurant List Page
 * Displays all restaurants in a table with CRUD actions
 */
export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load restaurants on mount
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await restaurantApi.getAll();
      setRestaurants(data);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      await restaurantApi.delete(id);
      // Reload the list after successful deletion
      await loadRestaurants();
    } catch (err) {
      console.error('Failed to delete restaurant:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete restaurant');
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner text="Loading restaurants..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Restaurants"
          description="Manage all restaurants"
        />
        <ErrorMessage message={error} />
        <Button onClick={loadRestaurants}>Try Again</Button>
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurants"
        description="Manage all restaurants in the system"
        action={
          <Link href="/restaurants/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Restaurant
            </Button>
          </Link>
        }
      />

      {restaurants.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="Get started by creating your first restaurant. Restaurants are the foundation of your system."
          action={
            <Link href="/restaurants/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Restaurant
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable
          data={restaurants}
          columns={[
            {
              key: 'code',
              label: 'Code',
              className: 'font-mono text-sm',
            },
            {
              key: 'name',
              label: 'Name',
              className: 'font-medium',
            },
            {
              key: 'contactEmail',
              label: 'Email',
            },
            {
              key: 'contactPhone',
              label: 'Phone',
              render: (item) => item.contactPhone || '-',
            },
            {
              key: 'city',
              label: 'City',
              render: (item) => item.city || '-',
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
          editPath={(item) => `/restaurants/${item.id}`}
          onDelete={(item) => handleDelete(item.id)}
          idField="id"
        />
      )}
    </div>
  );
}
