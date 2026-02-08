'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { TextAreaField } from '@/components/forms/text-area-field';
import { NumberField } from '@/components/forms/number-field';
import { SelectField } from '@/components/forms/select-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { menuItemApi, menuCategoryApi } from '@/lib/api-client';
import { MenuItemCreate, MenuCategory } from '@/types';
import Link from 'next/link';

/**
 * Create Menu Item Page
 */
export default function CreateMenuItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<MenuItemCreate>({
    name: '',
    code: '',
    description: '',
    categoryId: '',
    basePrice: 0,
    imageUrl: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    allergens: '',
    preparationTime: undefined,
    calories: undefined,
    servingSize: '',
    isActive: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await menuCategoryApi.getAll();
      setCategories(data.filter(c => c.isActive));
      setLoadingCategories(false);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
      setLoadingCategories(false);
    }
  };

  const handleChange = (field: keyof MenuItemCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await menuItemApi.create(formData);
      router.push('/menu-items');
    } catch (err) {
      console.error('Failed to create menu item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create menu item');
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return <LoadingSpinner text="Loading form..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/menu-items">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Menu Item</h1>
          <p className="text-muted-foreground">Add a new item to your menu</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Menu Item Information</CardTitle>
            <CardDescription>
              Enter the details for the new menu item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="categoryId"
                label="Category"
                value={formData.categoryId}
                onChange={(value) => handleChange('categoryId', value)}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                required
              />

              <TextField
                id="code"
                label="Item Code"
                value={formData.code}
                onChange={(value) => handleChange('code', value)}
                placeholder="e.g., ITEM001"
              />

              <TextField
                id="name"
                label="Item Name"
                value={formData.name}
                onChange={(value) => handleChange('name', value)}
                required
                placeholder="e.g., Margherita Pizza"
                className="md:col-span-2"
              />

              <NumberField
                id="basePrice"
                label="Base Price"
                value={formData.basePrice}
                onChange={(value) => handleChange('basePrice', value)}
                required
                placeholder="0.00"
                step="0.01"
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
              placeholder="Brief description of this menu item..."
            />

            {/* Dietary Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dietary Information</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <CheckboxField
                  id="isVegetarian"
                  label="Vegetarian"
                  checked={formData.isVegetarian || false}
                  onChange={(checked) => handleChange('isVegetarian', checked)}
                />

                <CheckboxField
                  id="isVegan"
                  label="Vegan"
                  checked={formData.isVegan || false}
                  onChange={(checked) => handleChange('isVegan', checked)}
                />
              </div>

              <TextField
                id="allergens"
                label="Allergens"
                value={formData.allergens}
                onChange={(value) => handleChange('allergens', value)}
                placeholder="e.g., Nuts, Dairy, Gluten"
              />
            </div>

            {/* Nutritional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Nutritional Information</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <NumberField
                  id="calories"
                  label="Calories"
                  value={formData.calories}
                  onChange={(value) => handleChange('calories', value)}
                  placeholder="e.g., 250"
                />

                <TextField
                  id="servingSize"
                  label="Serving Size"
                  value={formData.servingSize}
                  onChange={(value) => handleChange('servingSize', value)}
                  placeholder="e.g., 200g, 1 plate"
                />

                <NumberField
                  id="preparationTime"
                  label="Prep Time (minutes)"
                  value={formData.preparationTime}
                  onChange={(value) => handleChange('preparationTime', value)}
                  placeholder="e.g., 15"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Availability</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <CheckboxField
                  id="isAvailable"
                  label="Available"
                  checked={formData.isAvailable || false}
                  onChange={(checked) => handleChange('isAvailable', checked)}
                  description="Item is currently available for ordering"
                />

                <CheckboxField
                  id="isActive"
                  label="Active"
                  checked={formData.isActive || false}
                  onChange={(checked) => handleChange('isActive', checked)}
                  description="Item is active in the system"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Menu Item'}
              </Button>
              <Link href="/menu-items">
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
