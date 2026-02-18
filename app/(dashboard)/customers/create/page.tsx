'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { ErrorMessage } from '@/components/ui/error-message';
import { customerApi } from '@/lib/api-client';
import { CustomerCreate } from '@/types';
import Link from 'next/link';

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerCreate>({
    customerCode: '',
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isActive: true,
  });

  const handleChange = (field: keyof CustomerCreate, value: string | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await customerApi.create(formData);
      router.push('/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Customer</h1>
          <p className="text-muted-foreground">Add a new customer</p>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Enter customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Customer code" value={formData.customerCode} onChange={(v) => handleChange('customerCode', v)} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="First name" value={formData.firstName} onChange={(v) => handleChange('firstName', v)} />
              <TextField label="Last name" value={formData.lastName} onChange={(v) => handleChange('lastName', v)} />
            </div>
            <TextField label="Email" type="email" value={formData.email} onChange={(v) => handleChange('email', v)} />
            <TextField label="Phone" value={formData.phone} onChange={(v) => handleChange('phone', v)} />
            <TextField label="Date of birth" type="date" value={formData.dateOfBirth} onChange={(v) => handleChange('dateOfBirth', v)} />
            <TextField label="Address line 1" value={formData.addressLine1} onChange={(v) => handleChange('addressLine1', v)} />
            <TextField label="Address line 2" value={formData.addressLine2} onChange={(v) => handleChange('addressLine2', v)} />
            <div className="grid grid-cols-3 gap-4">
              <TextField label="City" value={formData.city} onChange={(v) => handleChange('city', v)} />
              <TextField label="State" value={formData.state} onChange={(v) => handleChange('state', v)} />
              <TextField label="Postal code" value={formData.postalCode} onChange={(v) => handleChange('postalCode', v)} />
            </div>
            <TextField label="Country" value={formData.country} onChange={(v) => handleChange('country', v)} />
            <CheckboxField label="Active" checked={formData.isActive ?? true} onCheckedChange={(v) => handleChange('isActive', !!v)} />
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/customers')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
