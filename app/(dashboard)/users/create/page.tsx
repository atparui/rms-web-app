'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { ErrorMessage } from '@/components/ui/error-message';
import { rmsUserApi } from '@/lib/api-client';
import { RmsUserCreate } from '@/types';
import Link from 'next/link';

/**
 * Create User Page
 */
export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<RmsUserCreate>({
    keycloakUserId: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    isActive: true,
  });

  const handleChange = (field: keyof RmsUserCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      await rmsUserApi.create(formData);
      router.push('/users');
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Enter the details for the new user (synced from Keycloak)
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
                {loading ? 'Creating...' : 'Create User'}
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
