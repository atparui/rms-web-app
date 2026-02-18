'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { orderApi } from '@/lib/api-client';
import { Order } from '@/types';
import Link from 'next/link';

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    orderApi.getById(id).then(setOrder).then(() => setInitialLoading(false)).catch(() => { setError('Failed to load order'); setInitialLoading(false); });
  }, [id]);

  if (initialLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/orders"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Order {order?.orderNumber || id}</h1><p className="text-muted-foreground">View order details</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      {order && (
        <Card>
          <CardHeader><CardTitle>Order details</CardTitle><CardDescription>Status: {order.status}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : '—'}</p>
            <p><strong>Type:</strong> {order.orderType}</p>
            <p><strong>Subtotal:</strong> ₹{Number(order.subtotal).toFixed(2)}</p>
            <p><strong>Total:</strong> ₹{Number(order.totalAmount).toFixed(2)}</p>
            <p><strong>Branch:</strong> {order.branch?.name ?? '—'}</p>
            <p><strong>Customer:</strong> {order.customer ? `${order.customer.firstName} ${order.customer.lastName}`.trim() || order.customer.email : '—'}</p>
            <p><strong>Table:</strong> {order.branchTable?.tableNumber ?? '—'}</p>
            {order.specialInstructions && <p><strong>Instructions:</strong> {order.specialInstructions}</p>}
            <div className="pt-4"><Button variant="outline" onClick={() => router.push('/orders')}>Back to list</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
