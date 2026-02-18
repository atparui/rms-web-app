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
import { orderApi, branchApi, customerApi, branchTableApi } from '@/lib/api-client';
import { Branch, Customer, BranchTable } from '@/types';
import Link from 'next/link';

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tables, setTables] = useState<BranchTable[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ branchId: '', customerId: '', branchTableId: '', orderNumber: '', orderType: 'DINE_IN', orderSource: 'POS', status: 'PENDING', subtotal: 0, taxAmount: 0, discountAmount: 0, totalAmount: 0, isPaid: false, specialInstructions: '' });

  useEffect(() => {
    Promise.all([branchApi.getAll(), customerApi.getAll(), branchTableApi.getAll()]).then(([b, c, t]) => { setBranches(b); setCustomers(c); setTables(t); setLoadingOptions(false); }).catch(() => setLoadingOptions(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchId) { setError('Select branch'); return; }
    try {
      setLoading(true);
      setError(null);
      await orderApi.create({
        ...formData,
        orderDate: new Date().toISOString(),
      } as any);
      router.push('/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setLoading(false);
    }
  };

  if (loadingOptions) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">New Order</h1><p className="text-muted-foreground">Create an order</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Order</CardTitle><CardDescription>Branch, customer, amounts</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <SelectField id="branchId" label="Branch" value={formData.branchId} onChange={(v) => setFormData((p) => ({ ...p, branchId: v }))} options={branches.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select branch" />
            <SelectField id="customerId" label="Customer (optional)" value={formData.customerId} onChange={(v) => setFormData((p) => ({ ...p, customerId: v }))} options={[{ value: '', label: '—' }, ...customers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}`.trim() || c.email }))]} placeholder="Optional" />
            <SelectField id="branchTableId" label="Table (optional)" value={formData.branchTableId} onChange={(v) => setFormData((p) => ({ ...p, branchTableId: v }))} options={[{ value: '', label: '—' }, ...tables.map((t) => ({ value: t.id, label: t.tableNumber }))]} placeholder="Optional" />
            <TextField label="Order number" value={formData.orderNumber} onChange={(v) => setFormData((p) => ({ ...p, orderNumber: v }))} />
            <SelectField id="orderType" label="Order type" value={formData.orderType} onChange={(v) => setFormData((p) => ({ ...p, orderType: v }))} options={[{ value: 'DINE_IN', label: 'Dine-in' }, { value: 'TAKEAWAY', label: 'Takeaway' }, { value: 'DELIVERY', label: 'Delivery' }]} />
            <NumberField label="Subtotal" value={formData.subtotal} onValueChange={(v) => setFormData((p) => ({ ...p, subtotal: v ?? 0 }))} />
            <NumberField label="Tax" value={formData.taxAmount} onValueChange={(v) => setFormData((p) => ({ ...p, taxAmount: v ?? 0 }))} />
            <NumberField label="Total" value={formData.totalAmount} onValueChange={(v) => setFormData((p) => ({ ...p, totalAmount: v ?? 0 }))} />
            <TextField label="Special instructions" value={formData.specialInstructions} onChange={(v) => setFormData((p) => ({ ...p, specialInstructions: v }))} />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => router.push('/orders')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
