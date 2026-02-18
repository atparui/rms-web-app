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
import { billApi, orderApi, branchApi, customerApi } from '@/lib/api-client';
import { Branch, Customer, Order } from '@/types';
import Link from 'next/link';

export default function CreateBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ orderId: '', branchId: '', customerId: '', billNumber: '', subtotal: 0, taxAmount: 0, discountAmount: 0, serviceCharge: 0, totalAmount: 0, amountPaid: 0, amountDue: 0, status: 'PENDING', notes: '' });

  useEffect(() => {
    Promise.all([branchApi.getAll(), orderApi.getAll(), customerApi.getAll()]).then(([b, o, c]) => { setBranches(b); setOrders(o); setCustomers(c); setLoadingOptions(false); }).catch(() => setLoadingOptions(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.branchId) { setError('Select order and branch'); return; }
    try {
      setLoading(true);
      setError(null);
      await billApi.create({
        ...formData,
        billDate: new Date().toISOString(),
        generatedBy: '',
      } as any);
      router.push('/billing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setLoading(false);
    }
  };

  if (loadingOptions) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/billing"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">New Bill</h1><p className="text-muted-foreground">Create a bill for an order</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Bill</CardTitle><CardDescription>Order, amounts, and status</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <SelectField id="orderId" label="Order" value={formData.orderId} onChange={(v) => setFormData((p) => ({ ...p, orderId: v }))} options={orders.map((o) => ({ value: o.id, label: o.orderNumber || o.id }))} placeholder="Select order" />
            <SelectField id="branchId" label="Branch" value={formData.branchId} onChange={(v) => setFormData((p) => ({ ...p, branchId: v }))} options={branches.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select branch" />
            <SelectField id="customerId" label="Customer (optional)" value={formData.customerId} onChange={(v) => setFormData((p) => ({ ...p, customerId: v }))} options={[{ value: '', label: '—' }, ...customers.map((c) => ({ value: c.id, label: `${c.firstName} ${c.lastName}`.trim() || c.email }))]} placeholder="Optional" />
            <TextField label="Bill number" value={formData.billNumber} onChange={(v) => setFormData((p) => ({ ...p, billNumber: v }))} />
            <NumberField label="Subtotal" value={formData.subtotal} onValueChange={(v) => setFormData((p) => ({ ...p, subtotal: v ?? 0 }))} />
            <NumberField label="Tax amount" value={formData.taxAmount} onValueChange={(v) => setFormData((p) => ({ ...p, taxAmount: v ?? 0 }))} />
            <NumberField label="Discount amount" value={formData.discountAmount} onValueChange={(v) => setFormData((p) => ({ ...p, discountAmount: v ?? 0 }))} />
            <NumberField label="Total amount" value={formData.totalAmount} onValueChange={(v) => setFormData((p) => ({ ...p, totalAmount: v ?? 0, amountDue: (v ?? 0) - formData.amountPaid }))} />
            <NumberField label="Amount paid" value={formData.amountPaid} onValueChange={(v) => setFormData((p) => ({ ...p, amountPaid: v ?? 0, amountDue: formData.totalAmount - (v ?? 0) }))} />
            <NumberField label="Amount due" value={formData.amountDue} onValueChange={(v) => setFormData((p) => ({ ...p, amountDue: v ?? 0 }))} />
            <TextField label="Notes" value={formData.notes} onChange={(v) => setFormData((p) => ({ ...p, notes: v }))} />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => router.push('/billing')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
