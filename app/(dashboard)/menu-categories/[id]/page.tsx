'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { TextAreaField } from '@/components/forms/text-area-field';
import { NumberField } from '@/components/forms/number-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { menuCategoryApi } from '@/lib/api-client';
import { MenuCategoryUpdate } from '@/types';
import Link from 'next/link';

/**
 * Edit Menu Category Page
 */
export default function EditMenuCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MenuCategoryUpdate>({
    id: categoryId,
    name: '',
    code: '',
    description: '',
    displayOrder: undefined,
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      const category = await menuCategoryApi.getById(categoryId);
      setFormData({
        id: category.id,
        name: category.name,
        code: category.code,
        description: category.description,
        displayOrder: category.displayOrder,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
      });
      setInitialLoading(false);
    } catch (err) {
      console.error('Failed to load category:', err);
      setError(err instanceof Error ? err.message : 'Failed to load category');
      setInitialLoading(false);
    }
  };

  const handleChange = (field: keyof MenuCategoryUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await menuCategoryApi.update(formData);
      router.push('/menu-categories');
    } catch (err) {
      console.error('Failed to update category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text="Loading category..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/menu-categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Menu Category</h1>
          <p className="text-muted-foreground">Update category information</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Update the details for this menu category
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
              
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Category'}
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
