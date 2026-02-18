'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/table/data-table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { tableAssignmentApi } from '@/lib/api-client';
import { TableAssignment } from '@/types';
import Link from 'next/link';

export default function TableRosterPage() {
  const [items, setItems] = useState<TableAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await tableAssignmentApi.getAll());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table roster');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this roster entry?')) return;
    try { await tableAssignmentApi.delete(id); await load(); } catch (err) { alert(err instanceof Error ? err.message : 'Failed'); }
  };

  if (loading) return <LoadingSpinner text="Loading table roster..." />;
  if (error) return (<div className="space-y-6"><PageHeader title="Table Roster" description="Table assignments" /><ErrorMessage message={error} /><Button onClick={load}>Try Again</Button></div>);

  return (
    <div className="space-y-6">
      <PageHeader title="Table Roster" description="Manage table assignments and roster" action={<Link href="/table-roster/create"><Button><Plus className="mr-2 h-4 w-4" />Add Assignment</Button></Link>} />
      {items.length === 0 ? (
        <EmptyState title="No roster entries" description="Add table assignments." action={<Link href="/table-roster/create"><Button><Plus className="mr-2 h-4 w-4" />Add Assignment</Button></Link>} />
      ) : (
        <DataTable data={items} columns={[
          { key: 'assignmentDate', label: 'Date', render: (r) => r.assignmentDate || '-' },
          { key: 'branchTable', label: 'Table', render: (r) => r.branchTable?.tableNumber || '-' },
          { key: 'startTime', label: 'Start', render: (r) => r.startTime ? new Date(r.startTime).toLocaleTimeString() : '-' },
          { key: 'endTime', label: 'End', render: (r) => r.endTime ? new Date(r.endTime).toLocaleTimeString() : '-' },
          { key: 'supervisor', label: 'Supervisor', render: (r) => r.supervisor ? `${r.supervisor.firstName} ${r.supervisor.lastName}`.trim() : '-' },
          { key: 'isActive', label: 'Active', render: (r) => <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Yes' : 'No'}</Badge> },
        ]} editPath={(r) => `/table-roster/${r.id}`} onDelete={(r) => handleDelete(r.id)} idField="id" />
      )}
    </div>
  );
}
