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
import { customerApi } from '@/lib/api-client';
import { Customer, CustomerUpdate } from '@/types';
import Link from 'next/link';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CustomerUpdate>({ id, firstName: '', lastName: '', email: '', isActive: true });

  useEffect(() => {
    customerApi.getById(id).then((r: Customer) => {
      setFormData({
        id: r.id,
        customerCode: r.customerCode,
        phone: r.phone,
        email: r.email,
        firstName: r.firstName,
        lastName: r.lastName,
        dateOfBirth: r.dateOfBirth,
        addressLine1: r.addressLine1,
        addressLine2: r.addressLine2,
        city: r.city,
        state: r.state,
        country: r.country,
        postalCode: r.postalCode,
        isActive: r.isActive,
      });
      setInitialLoading(false);
    }).catch(() => { setError('Failed to load customer'); setInitialLoading(false); });
  }, [id]);

  const handleChange = (field: keyof CustomerUpdate, value: string | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await customerApi.update(formData);
      router.push('/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-muted-foreground">Update customer details</p>
        </div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Customer Information</CardTitle><CardDescription>Edit details</CardDescription></CardHeader>
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
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/customers')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
