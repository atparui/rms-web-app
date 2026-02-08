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
import { branchApi, restaurantApi } from '@/lib/api-client';
import { BranchCreate, Restaurant } from '@/types';
import Link from 'next/link';

/**
 * Create Branch Page
 * Form for creating a new branch
 */
export default function CreateBranchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BranchCreate>({
    name: '',
    code: '',
    description: '',
    restaurantId: '',
    contactEmail: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    timezone: '',
    latitude: undefined,
    longitude: undefined,
    openingTime: '',
    closingTime: '',
    maxCapacity: undefined,
    isActive: true,
  });

  // Load restaurants for dropdown
  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantApi.getAll();
      setRestaurants(data.filter(r => r.isActive));
      setLoadingRestaurants(false);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setError('Failed to load restaurants');
      setLoadingRestaurants(false);
    }
  };

  const handleChange = (field: keyof BranchCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantId) {
      setError('Please select a restaurant');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await branchApi.create(formData);
      router.push('/branches');
    } catch (err) {
      console.error('Failed to create branch:', err);
      setError(err instanceof Error ? err.message : 'Failed to create branch');
      setLoading(false);
    }
  };

  if (loadingRestaurants) {
    return <LoadingSpinner text="Loading form..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/branches">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Branch</h1>
          <p className="text-muted-foreground">Add a new branch location</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
            <CardDescription>
              Enter the details for the new branch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                id="restaurantId"
                label="Restaurant"
                value={formData.restaurantId}
                onChange={(value) => handleChange('restaurantId', value)}
                options={restaurants.map(r => ({ value: r.id, label: r.name }))}
                required
              />

              <TextField
                id="code"
                label="Branch Code"
                value={formData.code}
                onChange={(value) => handleChange('code', value)}
                placeholder="e.g., BR001"
              />

              <TextField
                id="name"
                label="Branch Name"
                value={formData.name}
                onChange={(value) => handleChange('name', value)}
                required
                placeholder="e.g., Downtown Location"
              />

              <TextField
                id="contactEmail"
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(value) => handleChange('contactEmail', value)}
                placeholder="branch@example.com"
              />

              <TextField
                id="contactPhone"
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(value) => handleChange('contactPhone', value)}
                placeholder="e.g., +1-555-0123"
              />

              <TextField
                id="timezone"
                label="Timezone"
                value={formData.timezone}
                onChange={(value) => handleChange('timezone', value)}
                placeholder="e.g., America/New_York"
              />
            </div>

            <TextAreaField
              id="description"
              label="Description"
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="Brief description of this branch..."
            />

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  id="addressLine1"
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={(value) => handleChange('addressLine1', value)}
                  placeholder="Street address"
                />

                <TextField
                  id="addressLine2"
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={(value) => handleChange('addressLine2', value)}
                  placeholder="Apt, suite, etc."
                />

                <TextField
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={(value) => handleChange('city', value)}
                />

                <TextField
                  id="state"
                  label="State/Province"
                  value={formData.state}
                  onChange={(value) => handleChange('state', value)}
                />

                <TextField
                  id="postalCode"
                  label="Postal Code"
                  value={formData.postalCode}
                  onChange={(value) => handleChange('postalCode', value)}
                />

                <TextField
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={(value) => handleChange('country', value)}
                />
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Coordinates</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <NumberField
                  id="latitude"
                  label="Latitude"
                  value={formData.latitude}
                  onChange={(value) => handleChange('latitude', value)}
                  placeholder="e.g., 40.7128"
                  step={0}
                />

                <NumberField
                  id="longitude"
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(value) => handleChange('longitude', value)}
                  placeholder="e.g., -74.0060"
                  step={0}
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Operating Hours</h3>
              
              <div className="grid gap-4 md:grid-cols-3">
                <TextField
                  id="openingTime"
                  label="Opening Time"
                  type="time"
                  value={formData.openingTime}
                  onChange={(value) => handleChange('openingTime', value)}
                />

                <TextField
                  id="closingTime"
                  label="Closing Time"
                  type="time"
                  value={formData.closingTime}
                  onChange={(value) => handleChange('closingTime', value)}
                />

                <NumberField
                  id="maxCapacity"
                  label="Max Capacity"
                  value={formData.maxCapacity}
                  onChange={(value) => handleChange('maxCapacity', value)}
                  placeholder="Number of people"
                />
              </div>
            </div>

            {/* Status */}
            <CheckboxField
              id="isActive"
              label="Active"
              checked={formData.isActive || false}
              onChange={(checked) => handleChange('isActive', checked)}
              description="Branch is active and accepting orders"
            />

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Branch'}
              </Button>
              <Link href="/branches">
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
