"use client";

import { PropsWithChildren, useEffect } from "react";
import { useAuth } from "./keycloak-provider";

export function AuthGuard({ children }: PropsWithChildren) {
  const { initialized, authenticated, login } = useAuth();

  useEffect(() => {
    if (!initialized) return;
    if (!authenticated) {
      login().catch(() => {
        // no-op; login will redirect
      });
    }
  }, [initialized, authenticated, login]);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Preparing your session…</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Redirecting to login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
