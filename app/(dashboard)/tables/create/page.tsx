'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { NumberField } from '@/components/forms/number-field';
import { SelectField } from '@/components/forms/select-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { ErrorMessage } from '@/components/ui/error-message';
import { branchTableApi, branchApi } from '@/lib/api-client';
import { Branch } from '@/types';
import Link from 'next/link';

export default function CreateTablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ branchId: '', tableNumber: '', tableName: '', capacity: 4, floor: '', section: '', status: 'AVAILABLE', isActive: true });

  useEffect(() => {
    branchApi.getAll().then(setBranches).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId || !formData.tableNumber) { setError('Select branch and enter table number'); return; }
    try {
      setLoading(true);
      setError(null);
      await branchTableApi.create(formData as any);
      router.push('/tables');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tables"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Add Table</h1><p className="text-muted-foreground">Add a table to a branch</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Table</CardTitle><CardDescription>Branch and table details</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <SelectField id="branchId" label="Branch" value={formData.branchId} onChange={(v) => setFormData((p) => ({ ...p, branchId: v }))} options={branches.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select branch" />
            <TextField label="Table number" value={formData.tableNumber} onChange={(v) => setFormData((p) => ({ ...p, tableNumber: v }))} required />
            <TextField label="Table name" value={formData.tableName} onChange={(v) => setFormData((p) => ({ ...p, tableName: v }))} />
            <NumberField label="Capacity" value={formData.capacity} onValueChange={(v) => setFormData((p) => ({ ...p, capacity: v ?? 4 }))} />
            <TextField label="Floor" value={formData.floor} onChange={(v) => setFormData((p) => ({ ...p, floor: v }))} />
            <TextField label="Section" value={formData.section} onChange={(v) => setFormData((p) => ({ ...p, section: v }))} />
            <SelectField id="status" label="Status" value={formData.status} onChange={(v) => setFormData((p) => ({ ...p, status: v }))} options={[{ value: 'AVAILABLE', label: 'Available' }, { value: 'OCCUPIED', label: 'Occupied' }, { value: 'RESERVED', label: 'Reserved' }]} />
            <CheckboxField label="Active" checked={formData.isActive} onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: !!v }))} />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => router.push('/tables')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
