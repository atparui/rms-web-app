'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { billApi } from '@/lib/api-client';
import { Bill } from '@/types';
import Link from 'next/link';

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);

  useEffect(() => {
    billApi.getById(id).then(setBill).then(() => setInitialLoading(false)).catch(() => { setError('Failed to load bill'); setInitialLoading(false); });
  }, [id]);

  if (initialLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/billing"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Bill {bill?.billNumber || id}</h1><p className="text-muted-foreground">View bill details</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      {bill && (
        <Card>
          <CardHeader><CardTitle>Bill details</CardTitle><CardDescription>Status: {bill.status}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Date:</strong> {bill.billDate ? new Date(bill.billDate).toLocaleString() : '—'}</p>
            <p><strong>Subtotal:</strong> ₹{Number(bill.subtotal).toFixed(2)}</p>
            <p><strong>Tax:</strong> ₹{Number(bill.taxAmount ?? 0).toFixed(2)}</p>
            <p><strong>Total:</strong> ₹{Number(bill.totalAmount).toFixed(2)}</p>
            <p><strong>Amount paid:</strong> ₹{Number(bill.amountPaid ?? 0).toFixed(2)}</p>
            <p><strong>Amount due:</strong> ₹{Number(bill.amountDue).toFixed(2)}</p>
            <p><strong>Branch:</strong> {bill.branch?.name ?? '—'}</p>
            <p><strong>Order:</strong> {bill.order?.orderNumber ?? '—'}</p>
            {bill.notes && <p><strong>Notes:</strong> {bill.notes}</p>}
            <div className="pt-4"><Button variant="outline" onClick={() => router.push('/billing')}>Back to list</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
