"use client";

import Keycloak, { KeycloakProfile } from "keycloak-js";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { keycloakConfig } from "@/lib/config";

type AuthContextValue = {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  profile?: KeycloakProfile | null;
  login: (redirectUri?: string) => Promise<void>;
  logout: (redirectUri?: string) => Promise<void>;
  getToken: () => Promise<string | undefined>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [kc, setKc] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | undefined>();
  const [profile, setProfile] = useState<KeycloakProfile | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || kc) return;

    console.log("[auth] keycloak config", {
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
      origin: window.location.origin,
    });

    const instance = new Keycloak({
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
    });

    instance.onTokenExpired = () => {
      instance
        .updateToken(30)
        .then((refreshed) => {
          if (refreshed) {
            setToken(instance.token || undefined);
          }
        })
        .catch(() => {
          instance.login();
        });
    };

    instance
      .init({
        onLoad: "login-required",
        pkceMethod: "S256",
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: undefined,
        messageReceiveTimeout: 5000,
      })
      .then(async (auth) => {
        setKc(instance);
        setAuthenticated(auth);
        setToken(instance.token || undefined);
        
        // Store token in localStorage for API client
        if (instance.token) {
          localStorage.setItem('kc_token', instance.token);
        }
        
        if (auth) {
          try {
            const userProfile = await instance.loadUserProfile();
            setProfile(userProfile);
          } catch {
            setProfile(null);
          }
        }
      })
      .catch((err) => {
        console.error("[auth] keycloak init error", err);
      })
      .finally(() => setInitialized(true));
  }, [kc]);

  const login = useCallback(
    async (redirectUri?: string) => {
      if (!kc) return;
      await kc.login({ redirectUri: redirectUri || window.location.href });
    },
    [kc]
  );

  const logout = useCallback(
    async (redirectUri?: string) => {
      if (!kc) return;
      // Clear token from localStorage on logout
      localStorage.removeItem('kc_token');
      await kc.logout({ redirectUri: redirectUri || window.location.origin });
    },
    [kc]
  );

  const getToken = useCallback(async () => {
    if (!kc) return undefined;
    if (kc.isTokenExpired(30)) {
      try {
        await kc.updateToken(30);
        // Update localStorage after token refresh
        if (kc.token) {
          localStorage.setItem('kc_token', kc.token);
        }
      } catch {
        await kc.login();
        return undefined;
      }
    }
    const currentToken = kc.token || undefined;
    setToken(currentToken);
    // Ensure token is in localStorage
    if (currentToken) {
      localStorage.setItem('kc_token', currentToken);
    }
    return currentToken;
  }, [kc]);

  const value = useMemo(
    () => ({
      initialized,
      authenticated,
      token,
      profile,
      login,
      logout,
      getToken,
    }),
    [authenticated, initialized, login, logout, token, profile, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
