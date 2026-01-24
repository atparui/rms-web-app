import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/keycloak-provider";
import { apiConfig } from "./config";
import { fetchJson } from "./api-client";

export type PermissionLogic = "ANY" | "ALL";

export type MenuTreeNode = {
  id: number;
  menuKey?: string;
  label: string;
  routePath: string;
  type?: string;
  icon?: string | null;
  sortOrder?: number | null;
  isActive?: boolean;
  requiredPermissions?: string[];
  permissionLogic?: PermissionLogic;
  children?: MenuTreeNode[];
};

type MenuQueryOptions = {
  enabled?: boolean;
};

export function useMenuTree(options?: MenuQueryOptions) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["menu-tree", apiConfig.appKey],
    queryFn: async () => {
      const token = await getToken();
      const suffix = apiConfig.appKey ? `?appKey=${apiConfig.appKey}` : "?appKey=";
      return fetchJson<MenuTreeNode[]>(`/app-menus/tree${suffix}`, { token });
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}
