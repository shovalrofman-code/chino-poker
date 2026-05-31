"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect, ReactNode } from "react";
import { setBaseUrl } from "@workspace/api-client-react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Shared application providers.
 * Manages React Query client, UI tooltips, and API client configuration.
 */
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Configure base URL for the generated API client hooks.
    // Default to relative /api which works correctly in Next.js App Router.
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
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
