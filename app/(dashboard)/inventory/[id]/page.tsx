'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NumberField } from '@/components/forms/number-field';
import { TextField } from '@/components/forms/text-field';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { inventoryApi } from '@/lib/api-client';
import { Inventory } from '@/types';
import Link from 'next/link';

export default function EditInventoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Inventory> & { id: string }>({ id, currentStock: 0, unit: '', minStockLevel: 0, maxStockLevel: 100 });

  useEffect(() => {
    inventoryApi.getById(id).then((r) => {
      setFormData({ id: r.id, currentStock: r.currentStock, unit: r.unit, minStockLevel: r.minStockLevel, maxStockLevel: r.maxStockLevel });
      setInitialLoading(false);
    }).catch(() => { setError('Failed to load'); setInitialLoading(false); });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.update(formData as any);
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Edit Inventory</h1><p className="text-muted-foreground">Update stock levels</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Inventory</CardTitle><CardDescription>Branch: {formData.branch?.name ?? '—'}, Menu item: {formData.menuItem?.name ?? '—'}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <NumberField label="Current stock" value={formData.currentStock} onValueChange={(v) => setFormData((p) => ({ ...p, currentStock: v }))} />
            <TextField label="Unit" value={formData.unit} onChange={(v) => setFormData((p) => ({ ...p, unit: v }))} />
            <NumberField label="Min stock level" value={formData.minStockLevel} onValueChange={(v) => setFormData((p) => ({ ...p, minStockLevel: v }))} />
            <NumberField label="Max stock level" value={formData.maxStockLevel} onValueChange={(v) => setFormData((p) => ({ ...p, maxStockLevel: v }))} />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button><Button type="button" variant="outline" onClick={() => router.push('/inventory')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
