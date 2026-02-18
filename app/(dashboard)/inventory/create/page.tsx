'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TextField } from '@/components/forms/text-field';
import { NumberField } from '@/components/forms/number-field';
import { SelectField } from '@/components/forms/select-field';
import { ErrorMessage } from '@/components/ui/error-message';
import { inventoryApi, branchApi, menuItemApi } from '@/lib/api-client';
import { Branch, MenuItem } from '@/types';
import Link from 'next/link';

export default function CreateInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ branchId: '', menuItemId: '', currentStock: 0, unit: '', minStockLevel: 0, maxStockLevel: 100 });

  useEffect(() => {
    Promise.all([branchApi.getAll(), menuItemApi.getAll()]).then(([b, m]) => { setBranches(b); setMenuItems(m); setLoadingOptions(false); }).catch(() => setLoadingOptions(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId || !formData.menuItemId) { setError('Select branch and menu item'); return; }
    try {
      setLoading(true);
      setError(null);
      await inventoryApi.create({
        ...formData,
        lastUpdatedAt: new Date().toISOString(),
        lastUpdatedBy: '',
      } as any);
      router.push('/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setLoading(false);
    }
  };

  if (loadingOptions) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Add Inventory</h1><p className="text-muted-foreground">Record stock for a menu item at a branch</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Inventory</CardTitle><CardDescription>Branch, menu item, and stock levels</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <SelectField id="branchId" label="Branch" value={formData.branchId} onChange={(v) => setFormData((p) => ({ ...p, branchId: v }))} options={branches.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select branch" />
            <SelectField id="menuItemId" label="Menu item" value={formData.menuItemId} onChange={(v) => setFormData((p) => ({ ...p, menuItemId: v }))} options={menuItems.map((m) => ({ value: m.id, label: m.name }))} placeholder="Select menu item" />
            <NumberField label="Current stock" value={formData.currentStock} onValueChange={(v) => setFormData((p) => ({ ...p, currentStock: v ?? 0 }))} />
            <TextField label="Unit" value={formData.unit} onChange={(v) => setFormData((p) => ({ ...p, unit: v }))} placeholder="e.g. kg, pcs" />
            <NumberField label="Min stock level" value={formData.minStockLevel} onValueChange={(v) => setFormData((p) => ({ ...p, minStockLevel: v ?? 0 }))} />
            <NumberField label="Max stock level" value={formData.maxStockLevel} onValueChange={(v) => setFormData((p) => ({ ...p, maxStockLevel: v ?? 100 }))} />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => router.push('/inventory')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
