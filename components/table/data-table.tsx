'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  editPath?: (item: T) => string;
  idField?: keyof T;
  showActions?: boolean;
}

/**
 * Reusable data table component with actions
 * Generic component that works with any data type
 * 
 * @example
 * <DataTable
 *   data={restaurants}
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'contactEmail', label: 'Email' },
 *     {
 *       key: 'isActive',
 *       label: 'Status',
 *       render: (item) => (
 *         <Badge variant={item.isActive ? 'default' : 'secondary'}>
 *           {item.isActive ? 'Active' : 'Inactive'}
 *         </Badge>
 *       ),
 *     },
 *   ]}
 *   editPath={(item) => `/restaurants/${item.id}`}
 *   onDelete={(item) => handleDelete(item.id)}
 *   idField="id"
 * />
 */
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onEdit,
  onDelete,
  editPath,
  idField = 'id' as keyof T,
  showActions = true,
}: DataTableProps<T>) {
  const hasActions = showActions && (onEdit || onDelete || editPath);

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.label}
              </TableHead>
            ))}
            {hasActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={String(item[idField])}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key] || '')}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editPath && (
                        <Link href={editPath(item)}>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Helper function to create a status badge renderer
 * 
 * @example
 * const columns = [
 *   { key: 'name', label: 'Name' },
 *   {
 *     key: 'isActive',
 *     label: 'Status',
 *     render: createStatusBadge('isActive'),
 *   },
 * ];
 */
export function createStatusBadge(field: string) {
  return (item: any) => (
    <Badge variant={item[field] ? 'default' : 'secondary'}>
      {item[field] ? 'Active' : 'Inactive'}
    </Badge>
  );
}
