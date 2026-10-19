// app/providers.tsx
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountAccessProvider } from './account-access.provider';
import { isAccountBlockedError } from '../lib/account-status';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000, retry: (count, error) => !isAccountBlockedError(error) && count < 3 } },
      }),
  );

  return <QueryClientProvider client={queryClient}><AccountAccessProvider>{children}</AccountAccessProvider></QueryClientProvider>;
}
