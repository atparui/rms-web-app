"use client";

import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Restaurant = {
  name: string;
  city: string;
  status: string;
  updatedAt: string;
};

const sampleData: Restaurant[] = [
  { name: "Central Kitchen", city: "San Jose", status: "Active", updatedAt: "2024-12-10" },
  { name: "Downtown Bistro", city: "Austin", status: "Inactive", updatedAt: "2024-11-03" },
  { name: "Harbor Grill", city: "Seattle", status: "Active", updatedAt: "2024-12-01" },
  { name: "Mountain View Cafe", city: "Denver", status: "Active", updatedAt: "2024-12-18" },
];

export default function DashboardPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");

  const data = useMemo(() => {
    if (!search) return sampleData;
    return sampleData.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const columns = useMemo<ColumnDef<Restaurant>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "city", header: "City" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "updatedAt", header: "Updated" },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Protected area guarded by Keycloak, menu driven by backend App Menu tree, table powered by TanStack Table.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Restaurants</p>
            <p className="text-xs text-muted-foreground">
              Replace this mock data with `/api/restaurants` once endpoints are wired.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button size="sm">New</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-muted/70">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="cursor-pointer border-b px-4 py-2 text-left font-medium text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header?.toString()}
                      {{
                        asc: " ↑",
                        desc: " ↓",
                      }[header.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-b-0 hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 text-foreground">
                      {cell.getValue() as string}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
