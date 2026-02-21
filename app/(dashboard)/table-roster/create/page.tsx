'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SelectField } from '@/components/forms/select-field';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { ErrorMessage } from '@/components/ui/error-message';
import { tableAssignmentApi, branchTableApi } from '@/lib/api-client';
import { BranchTable } from '@/types';
import Link from 'next/link';

export default function CreateTableRosterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<BranchTable[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ branchTableId: '', assignmentDate: new Date().toISOString().slice(0, 10), startTime: '', endTime: '', isActive: true });

  useEffect(() => {
    branchTableApi.getAll().then(setTables).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branchTableId) { setError('Select a table'); return; }
    try {
      setLoading(true);
      setError(null);
      await tableAssignmentApi.create(formData as any);
      router.push('/table-roster');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/table-roster"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div><h1 className="text-3xl font-bold">Add Table Assignment</h1><p className="text-muted-foreground">Assign table to roster</p></div>
      </div>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Table Roster</CardTitle><CardDescription>Table and date</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <SelectField id="branchTableId" label="Table" value={formData.branchTableId} onChange={(v) => setFormData((p) => ({ ...p, branchTableId: v }))} options={tables.map((t) => ({ value: t.id, label: `${t.tableNumber} (${t.branch?.name ?? '—'})` }))} placeholder="Select table" />
            <div className="flex gap-2 pt-4"><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button><Button type="button" variant="outline" onClick={() => router.push('/table-roster')}>Cancel</Button></div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
