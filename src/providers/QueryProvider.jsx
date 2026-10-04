// src/providers/QueryProvider.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // ✅ کاهش از 5min به 1min
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,      // ✅ فعال برای sync
      refetchOnReconnect: true,
      // ✅ وقتی mount شد، اگر stale بود، refetch کن
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default QueryProvider;