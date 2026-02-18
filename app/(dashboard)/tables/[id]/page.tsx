'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { NumberField } from '@/components/forms/number-field';
import { SelectField } from '@/components/forms/select-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { branchTableApi, branchApi } from '@/lib/api-client';
import { BranchTable, Branch } from '@/types';
import Link from 'next/link';

export default function EditTablePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BranchTable> & { id: string }>({ id, tableNumber: '', tableName: '', capacity: 4, floor: '', section: '', status: '', isActive: true });

  useEffect(() => {
    branchApi.getAll().then(setBranches);
    branchTableApi.getById(id).then((r) => {
      setFormData({ id: r.id, tableNumber: r.tableNumber, tableName: r.tableName, capacity: r.capacity, floor: r.floor, section: r.section, status: r.status, isActive: r.isActive, branchId: r.branch?.id });
      setInitialLoading(false);
    }).catch(() => { setError('Failed to load'); setInitialLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await branchTableApi.update(formData as any);
      router.push('/tables');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tables"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Edit Table {formData.tableNumber}</h1><p className="text-muted-foreground">Update table details</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Table</CardTitle><CardDescription>Branch: {formData.branch?.name ?? '—'}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <TextField label="Table number" value={formData.tableNumber} onChange={(v) => setFormData((p) => ({ ...p, tableNumber: v }))} />
            <TextField label="Table name" value={formData.tableName} onChange={(v) => setFormData((p) => ({ ...p, tableName: v }))} />
            <NumberField label="Capacity" value={formData.capacity} onValueChange={(v) => setFormData((p) => ({ ...p, capacity: v }))} />
            <TextField label="Floor" value={formData.floor} onChange={(v) => setFormData((p) => ({ ...p, floor: v }))} />
            <TextField label="Section" value={formData.section} onChange={(v) => setFormData((p) => ({ ...p, section: v }))} />
            <SelectField id="status" label="Status" value={formData.status} onChange={(v) => setFormData((p) => ({ ...p, status: v }))} options={[{ value: 'AVAILABLE', label: 'Available' }, { value: 'OCCUPIED', label: 'Occupied' }, { value: 'RESERVED', label: 'Reserved' }]} />
            <CheckboxField label="Active" checked={formData.isActive ?? true} onCheckedChange={(v) => setFormData((p) => ({ ...p, isActive: !!v }))} />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button><Button type="button" variant="outline" onClick={() => router.push('/tables')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
