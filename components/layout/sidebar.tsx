"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Loader2 } from "lucide-react";
import { MenuTreeNode } from "@/lib/menu";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: MenuTreeNode[];
  loading?: boolean;
  error?: string | null;
};

export function Sidebar({ items, loading, error }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-card/50">
      <div className="px-4 py-4">
        <p className="text-sm font-semibold text-foreground">Navigation</p>
        <p className="text-xs text-muted-foreground">
          Driven by App Menu permissions
        </p>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-4">
        {loading && (
          <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading menu…
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="rounded-md border bg-card px-3 py-2 text-sm text-muted-foreground">
            No menu items returned.
          </div>
        )}
        {!loading && !error && items.map((item) => renderNode(item, pathname))}
      </div>
    </aside>
  );
}

function renderNode(node: MenuTreeNode, pathname: string, depth = 0) {
  const isActive = pathname === node.routePath;
  const hasChildren = !!node.children && node.children.length > 0;

  return (
    <div key={node.id} className="space-y-1">
      <Link
        href={node.routePath || "#"}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-accent",
          isActive && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: 12 + depth * 12 }}
      >
        {hasChildren && (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <span>{node.label}</span>
      </Link>
      {hasChildren && (
        <div className="space-y-1">
          {node.children!.map((child) => renderNode(child, pathname, depth + 1))}
        </div>
      )}
    </div>
  );
}
