"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { usePatientAuthStore } from "@/stores/patientAuthStore";
import { patientService } from "@/services";
import { loadSelfRegisteredPatients } from "@/lib/selfRegisteredPatients";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  React.useEffect(() => {
    patientService.restoreSelfRegistered(loadSelfRegisteredPatients());
    usePatientAuthStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
