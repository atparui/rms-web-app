'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { tableAssignmentApi } from '@/lib/api-client';
import { TableAssignment } from '@/types';
import Link from 'next/link';

export default function EditTableRosterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState<TableAssignment | null>(null);

  useEffect(() => {
    tableAssignmentApi.getById(id).then(setItem).then(() => setInitialLoading(false)).catch(() => { setError('Failed to load'); setInitialLoading(false); });
  }, [id]);

  if (initialLoading) return <LoadingSpinner text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/table-roster"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Table Roster Entry</h1><p className="text-muted-foreground">View assignment details</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      {item && (
        <Card>
          <CardHeader><CardTitle>Assignment</CardTitle><CardDescription>Date: {item.assignmentDate}</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Table:</strong> {item.branchTable?.tableNumber ?? '—'} ({item.branchTable?.branch?.name})</p>
            <p><strong>Start:</strong> {item.startTime ? new Date(item.startTime).toLocaleString() : '—'}</p>
            <p><strong>End:</strong> {item.endTime ? new Date(item.endTime).toLocaleString() : '—'}</p>
            <p><strong>Supervisor:</strong> {item.supervisor ? `${item.supervisor.firstName} ${item.supervisor.lastName}`.trim() : '—'}</p>
            <p><strong>Active:</strong> {item.isActive ? 'Yes' : 'No'}</p>
            <div className="pt-4"><Button variant="outline" onClick={() => router.push('/table-roster')}>Back to list</Button></div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
