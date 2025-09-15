import { useQuery } from "@tanstack/react-query";
import { useSmartPolling } from "../../ui/hooks";
import { mcpApi } from "../services";

// Query keys factory
export const mcpKeys = {
  all: ["mcp"] as const,
  status: () => [...mcpKeys.all, "status"] as const,
  config: () => [...mcpKeys.all, "config"] as const,
  sessions: () => [...mcpKeys.all, "sessions"] as const,
  clients: () => [...mcpKeys.all, "clients"] as const,
};

export function useMcpStatus() {
  const { refetchInterval } = useSmartPolling(10000); // Reduced from 5s to 10s for better CPU efficiency

  return useQuery({
    queryKey: mcpKeys.status(),
    queryFn: () => mcpApi.getStatus(),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: 8000, // Increased from 3s to 8s
    throwOnError: true,
  });
}

export function useMcpConfig() {
  return useQuery({
    queryKey: mcpKeys.config(),
    queryFn: () => mcpApi.getConfig(),
    staleTime: Infinity, // Config rarely changes
    throwOnError: true,
  });
}

export function useMcpClients() {
  const { refetchInterval } = useSmartPolling(15000); // Increased from 10s to 15s

  return useQuery({
    queryKey: mcpKeys.clients(),
    queryFn: () => mcpApi.getClients(),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: 12000, // Increased from 8s to 12s
    throwOnError: true,
  });
}

export function useMcpSessionInfo() {
  const { refetchInterval } = useSmartPolling(15000); // Increased from 10s to 15s

  return useQuery({
    queryKey: mcpKeys.sessions(),
    queryFn: () => mcpApi.getSessionInfo(),
    refetchInterval,
    refetchOnWindowFocus: false,
    staleTime: 12000, // Increased from 8s to 12s
    throwOnError: true,
  });
}
