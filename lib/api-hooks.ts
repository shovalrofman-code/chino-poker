import { useQuery, useMutation, UseQueryOptions, QueryKey } from "@tanstack/react-query";

/**
 * Shared fetcher for API calls.
 */
async function apiFetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw error;
  }

  // Return null if 204 No Content or empty body
  if (response.status === 204) return null as T;
  
  return response.json();
}

// --- Player Hooks ---

export const getListPlayersQueryKey = () => ["players"];
export function useListPlayers(options?: any) {
  return useQuery({
    queryKey: getListPlayersQueryKey(),
    queryFn: () => apiFetcher<any[]>("/api/players"),
    ...options?.query,
  });
}

export const getSearchPlayersQueryKey = (params: { q: string }) => ["players", "search", params.q];
export function useSearchPlayers(params: { q: string }, options?: any) {
  return useQuery({
    queryKey: getSearchPlayersQueryKey(params),
    queryFn: () => apiFetcher<any[]>(`/api/players/search?q=${encodeURIComponent(params.q)}`),
    ...options?.query,
  });
}

export function useCreatePlayer() {
  return useMutation({
    mutationFn: (data: { data: any }) => apiFetcher<any>("/api/players", {
      method: "POST",
      body: JSON.stringify(data.data),
    }),
  });
}

export const getGetPlayerQueryKey = (id: number) => ["players", id];
export function useGetPlayer(id: number, options?: any) {
  return useQuery({
    queryKey: getGetPlayerQueryKey(id),
    queryFn: () => apiFetcher<any>(`/api/players/${id}`),
    ...options?.query,
  });
}

export const getGetPlayerStatsQueryKey = (id: number) => ["players", id, "stats"];
export function useGetPlayerStats(id: number, options?: any) {
  return useQuery({
    queryKey: getGetPlayerStatsQueryKey(id),
    queryFn: () => apiFetcher<any>(`/api/players/${id}/stats`),
    ...options?.query,
  });
}

// --- Session Hooks ---

export const getListSessionsQueryKey = () => ["sessions"];
export function useListSessions(options?: any) {
  return useQuery({
    queryKey: getListSessionsQueryKey(),
    queryFn: () => apiFetcher<any[]>("/api/sessions"),
    ...options?.query,
  });
}

export const getGetActiveSessionQueryKey = () => ["sessions", "active"];
export function useGetActiveSession(options?: any) {
  return useQuery({
    queryKey: getGetActiveSessionQueryKey(),
    queryFn: () => apiFetcher<any | null>("/api/sessions/active"),
    ...options?.query,
  });
}

export function useCreateSession() {
  return useMutation({
    mutationFn: (data: { data: any }) => apiFetcher<any>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(data.data),
    }),
  });
}

export function useAddPlayerToSession() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiFetcher<any>(`/api/sessions/${id}/players`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  });
}

export function useRecordBuyin() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiFetcher<any>(`/api/sessions/${id}/buyins`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  });
}

export function useCloseSession() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiFetcher<any>(`/api/sessions/${id}/close`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  });
}

export const getGetSessionSettlementQueryKey = (id: number) => ["sessions", id, "settlement"];
export function useGetSessionSettlement(id: number, options?: any) {
  return useQuery({
    queryKey: getGetSessionSettlementQueryKey(id),
    queryFn: () => apiFetcher<any>(`/api/sessions/${id}/settlement`),
    ...options?.query,
  });
}

// --- Stats & Global Hooks ---

export const getGetGroupBalanceQueryKey = () => ["group-balance"];
export function useGetGroupBalance(options?: any) {
  return useQuery({
    queryKey: getGetGroupBalanceQueryKey(),
    queryFn: () => apiFetcher<any>("/api/group-balance"),
    ...options?.query,
  });
}

export const getGetLeaderboardQueryKey = () => ["leaderboard"];
export function useGetLeaderboard(options?: any) {
  return useQuery({
    queryKey: getGetLeaderboardQueryKey(),
    queryFn: () => apiFetcher<any[]>("/api/stats/leaderboard"),
    ...options?.query,
  });
}

/**
 * Placeholder for setBaseUrl logic.
 */
export function setBaseUrl(url: string) {
  // In a unified Next.js app, we use relative URLs by default.
  console.log("API Base URL set to:", url);
}
