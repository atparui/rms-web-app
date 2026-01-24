export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "rms-service",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "rms-service-web",
};

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  appKey: process.env.NEXT_PUBLIC_APP_KEY || "",
};
