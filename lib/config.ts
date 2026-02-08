/**
 * Application configuration
 * Centralized configuration for API, Keycloak, and other settings
 */

export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "https://auth.atparui.com",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "rms-demo",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "rms-web",
};

export const apiConfig = {
  // API Origin (gateway URL without path)
  apiOrigin:
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    "https://rms-demo.atparui.com",
  
  // Legacy base URL (for compatibility with existing code)
  baseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://rms-demo.atparui.com/services/rms-service/api",
  
  // Application configuration
  appKey: process.env.NEXT_PUBLIC_APP_KEY || "RMS",
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID || "",
};
