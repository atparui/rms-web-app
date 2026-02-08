'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Branch, BranchUpdate, Restaurant } from '@/types';
import Link from 'next/link';

/**
 * Edit Branch Page
 * Form for editing an existing branch
 */
export default function EditBranchPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BranchUpdate>({
    id: branchId,
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

  // Load branch data and restaurants
  useEffect(() => {
    loadRestaurants();
    loadBranch();
  }, [branchId]);

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

  const loadBranch = async () => {
    try {
      const branch = await branchApi.getById(branchId);
      setFormData({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        description: branch.description,
        restaurantId: branch.restaurant?.id || branch.restaurantId,
        contactEmail: branch.contactEmail,
        contactPhone: branch.contactPhone,
        addressLine1: branch.addressLine1,
        addressLine2: branch.addressLine2,
        city: branch.city,
        state: branch.state,
        postalCode: branch.postalCode,
        country: branch.country,
        timezone: branch.timezone,
        latitude: branch.latitude,
        longitude: branch.longitude,
        openingTime: branch.openingTime,
        closingTime: branch.closingTime,
        maxCapacity: branch.maxCapacity,
        isActive: branch.isActive,
      });
      setInitialLoading(false);
    } catch (err) {
      console.error('Failed to load branch:', err);
      setError(err instanceof Error ? err.message : 'Failed to load branch');
      setInitialLoading(false);
    }
  };

  const handleChange = (field: keyof BranchUpdate, value: any) => {
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
      await branchApi.update(formData);
      router.push('/branches');
    } catch (err) {
      console.error('Failed to update branch:', err);
      setError(err instanceof Error ? err.message : 'Failed to update branch');
      setLoading(false);
    }
  };

  if (initialLoading || loadingRestaurants) {
    return <LoadingSpinner text="Loading branch..." />;
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Branch</h1>
          <p className="text-muted-foreground">Update branch information</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
            <CardDescription>
              Update the details for this branch
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
                  step="any"
                />

                <NumberField
                  id="longitude"
                  label="Longitude"
                  value={formData.longitude}
                  onChange={(value) => handleChange('longitude', value)}
                  placeholder="e.g., -74.0060"
                  step="any"
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
                {loading ? 'Updating...' : 'Update Branch'}
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
