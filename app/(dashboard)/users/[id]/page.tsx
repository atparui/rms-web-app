'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { rmsUserApi } from '@/lib/api-client';
import { RmsUserUpdate } from '@/types';
import Link from 'next/link';

/**
 * Edit User Page
 */
export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RmsUserUpdate>({
    id: userId,
    keycloakUserId: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isActive: true,
  });

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const user = await rmsUserApi.getById(userId);
      setFormData({
        id: user.id,
        keycloakUserId: user.keycloakUserId,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isActive: user.isActive,
      });
      setInitialLoading(false);
    } catch (err) {
      console.error('Failed to load user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setInitialLoading(false);
    }
  };

  const handleChange = (field: keyof RmsUserUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await rmsUserApi.update(formData);
      router.push('/users');
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner text="Loading user..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">Update user information</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Update the details for this user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                id="keycloakUserId"
                label="Keycloak User ID"
                value={formData.keycloakUserId}
                onChange={(value) => handleChange('keycloakUserId', value)}
                required
                placeholder="UUID from Keycloak"
                disabled
              />

              <TextField
                id="username"
                label="Username"
                value={formData.username}
                onChange={(value) => handleChange('username', value)}
                required
                placeholder="e.g., john_doe"
              />

              <TextField
                id="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleChange('email', value)}
                required
                placeholder="user@example.com"
              />

              <TextField
                id="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(value) => handleChange('phoneNumber', value)}
                placeholder="e.g., +1-555-0123"
              />

              <TextField
                id="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleChange('firstName', value)}
                placeholder="John"
              />

              <TextField
                id="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleChange('lastName', value)}
                placeholder="Doe"
              />
            </div>

            <CheckboxField
              id="isActive"
              label="Active"
              checked={formData.isActive || false}
              onChange={(checked) => handleChange('isActive', checked)}
              description="User can access the system"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update User'}
              </Button>
              <Link href="/users">
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
