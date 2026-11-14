// src/features/sentinel/hooks/useSentinelJobs.js
import { useQuery } from '@tanstack/react-query';
import { getJobStatus } from '../services/sentinelApi';

const TERMINAL = new Set(['succeeded', 'failed', 'cancelled']);

export const useSentinelJob = (jobId) => {
  return useQuery({
    queryKey: ['sentinel', 'job', jobId],
    queryFn: () => getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query?.state?.data;
      if (!data) return 2000;
      if (TERMINAL.has(data.status)) return false;
      return 3000;
    },
    staleTime: 0,
    cacheTime: 0,
  });
};