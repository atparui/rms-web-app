'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { TextAreaField } from '@/components/forms/text-area-field';
import { NumberField } from '@/components/forms/number-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { ErrorMessage } from '@/components/ui/error-message';
import { menuCategoryApi } from '@/lib/api-client';
import { MenuCategoryCreate } from '@/types';
import Link from 'next/link';

/**
 * Create Menu Category Page
 */
export default function CreateMenuCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MenuCategoryCreate>({
    name: '',
    code: '',
    description: '',
    displayOrder: undefined,
    imageUrl: '',
    isActive: true,
  });

  const handleChange = (field: keyof MenuCategoryCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await menuCategoryApi.create(formData);
      router.push('/menu-categories');
    } catch (err) {
      console.error('Failed to create category:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/menu-categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Menu Category</h1>
          <p className="text-muted-foreground">Add a new category to organize your menu</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Enter the details for the new menu category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="name"
                label="Category Name"
                value={formData.name}
                onChange={(value) => handleChange('name', value)}
                required
                placeholder="e.g., Appetizers, Main Course, Desserts"
              />

              <TextField
                id="code"
                label="Category Code"
                value={formData.code}
                onChange={(value) => handleChange('code', value)}
                placeholder="e.g., CAT001"
              />

              <NumberField
                id="displayOrder"
                label="Display Order"
                value={formData.displayOrder}
                onChange={(value) => handleChange('displayOrder', value)}
                placeholder="Order in menu (lower numbers appear first)"
              />

              <TextField
                id="imageUrl"
                label="Image URL"
                value={formData.imageUrl}
                onChange={(value) => handleChange('imageUrl', value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <TextAreaField
              id="description"
              label="Description"
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="Brief description of this category..."
            />

            <CheckboxField
              id="isActive"
              label="Active"
              checked={formData.isActive || false}
              onChange={(checked) => handleChange('isActive', checked)}
              description="Category is visible in the menu"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </Button>
              <Link href="/menu-categories">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
