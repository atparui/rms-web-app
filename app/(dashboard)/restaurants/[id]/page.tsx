'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TextField,
  TextAreaField,
  CheckboxField,
  FormSection,
} from '@/components/forms';
import { PageHeader } from '@/components/ui/page-header';
import { FormActions } from '@/components/ui/form-actions';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { restaurantApi } from '@/lib/api-client';
import { Restaurant, RestaurantUpdate } from '@/types';
import Link from 'next/link';

/**
 * Restaurant Edit Page
 * Form to edit an existing restaurant
 */
export default function RestaurantEditPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RestaurantUpdate>({
    id: restaurantId,
    code: '',
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    timezone: '',
    logoUrl: '',
    isActive: true,
  });

  // Load existing restaurant data
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await restaurantApi.getById(restaurantId);

        // Populate form with existing data
        setFormData({
          id: data.id,
          code: data.code || '',
          name: data.name || '',
          description: data.description || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
          timezone: data.timezone || '',
          logoUrl: data.logoUrl || '',
          isActive: data.isActive !== false,
        });
      } catch (err) {
        console.error('Failed to load restaurant:', err);
        setError(err instanceof Error ? err.message : 'Failed to load restaurant');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId]);

  const handleChange = (field: keyof RestaurantUpdate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      await restaurantApi.update(formData);
      // Redirect to list page on success
      router.push('/restaurants');
    } catch (err) {
      console.error('Failed to update restaurant:', err);
      setError(err instanceof Error ? err.message : 'Failed to update restaurant');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner text="Loading restaurant..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Edit Restaurant"
        description="Update restaurant information"
        backButton={
          <Link href="/restaurants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Restaurants
            </Button>
          </Link>
        }
      />

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Basic Information"
          description="Core restaurant details"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="code"
              label="Restaurant Code"
              value={formData.code}
              onChange={(value) => handleChange('code', value)}
              required
              placeholder="e.g., REST001"
              helpText="Unique identifier for the restaurant"
            />

            <TextField
              id="name"
              label="Restaurant Name"
              value={formData.name}
              onChange={(value) => handleChange('name', value)}
              required
              placeholder="e.g., My Restaurant"
            />
          </div>

          <TextAreaField
            id="description"
            label="Description"
            value={formData.description || ''}
            onChange={(value) => handleChange('description', value)}
            rows={4}
            placeholder="Brief description of the restaurant"
          />

          <CheckboxField
            id="isActive"
            label="Active"
            checked={formData.isActive || false}
            onChange={(checked) => handleChange('isActive', checked)}
            helpText="Enable this restaurant for operations"
          />
        </FormSection>

        <FormSection
          title="Contact Information"
          description="How to reach this restaurant"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="contactEmail"
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(value) => handleChange('contactEmail', value)}
              required
              placeholder="contact@restaurant.com"
            />

            <TextField
              id="contactPhone"
              label="Contact Phone"
              type="tel"
              value={formData.contactPhone || ''}
              onChange={(value) => handleChange('contactPhone', value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </FormSection>

        <FormSection
          title="Location"
          description="Physical address of the restaurant"
        >
          <TextField
            id="addressLine1"
            label="Address Line 1"
            value={formData.addressLine1 || ''}
            onChange={(value) => handleChange('addressLine1', value)}
            placeholder="Street address"
          />

          <TextField
            id="addressLine2"
            label="Address Line 2"
            value={formData.addressLine2 || ''}
            onChange={(value) => handleChange('addressLine2', value)}
            placeholder="Apt, suite, etc. (optional)"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="city"
              label="City"
              value={formData.city || ''}
              onChange={(value) => handleChange('city', value)}
              placeholder="City"
            />

            <TextField
              id="state"
              label="State/Province"
              value={formData.state || ''}
              onChange={(value) => handleChange('state', value)}
              placeholder="State or Province"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="postalCode"
              label="Postal Code"
              value={formData.postalCode || ''}
              onChange={(value) => handleChange('postalCode', value)}
              placeholder="ZIP or Postal Code"
            />

            <TextField
              id="country"
              label="Country"
              value={formData.country || ''}
              onChange={(value) => handleChange('country', value)}
              placeholder="Country"
            />
          </div>
        </FormSection>

        <FormSection
          title="Additional Settings"
          description="Optional configuration"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              id="timezone"
              label="Timezone"
              value={formData.timezone || ''}
              onChange={(value) => handleChange('timezone', value)}
              placeholder="e.g., America/New_York"
              helpText="IANA timezone identifier"
            />

            <TextField
              id="logoUrl"
              label="Logo URL"
              type="url"
              value={formData.logoUrl || ''}
              onChange={(value) => handleChange('logoUrl', value)}
              placeholder="https://example.com/logo.png"
            />
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push('/restaurants')}
          submitText="Save Changes"
          isSubmitting={saving}
        />
      </form>
    </div>
  );
}
