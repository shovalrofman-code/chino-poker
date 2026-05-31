"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, ReactNode } from "react";
import { setBaseUrl } from "@/lib/api-hooks";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Shared application providers.
 * Manages React Query client, UI tooltips, and API client configuration.
 */
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // The generated API client hooks already include the "/api" prefix.
    // We only need to set a base URL if the API is on a different domain.
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    setBaseUrl(baseUrl);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
