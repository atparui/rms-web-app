"use client";

import { Button } from "@/components/ui/button";
import { AuthGuard } from "../auth/auth-guard";
import { useAuth } from "../auth/keycloak-provider";
import { Sidebar } from "./sidebar";
import { useMenuTree } from "@/lib/menu";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile, logout, initialized, authenticated } = useAuth();
  const { data, isLoading, error, refetch } = useMenuTree({
    enabled: initialized && authenticated,
  });

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-muted/30 text-foreground">
        <Sidebar
          items={data || []}
          loading={isLoading}
          error={error ? error.message : null}
        />
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b bg-card/70 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-sm font-semibold">Restaurant Management</p>
              <p className="text-xs text-muted-foreground">
                Protected by Keycloak · Menu driven by backend permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn("text-right")}>
                <p className="text-sm font-medium">
                  {profile?.firstName ? `${profile.firstName} ${profile?.lastName || ""}`.trim() : "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.email || "Authenticated"}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh menu
              </Button>
              <Button variant="secondary" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
