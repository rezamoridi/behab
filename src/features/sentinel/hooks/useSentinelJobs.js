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
      const status = query?.state?.data?.status;
      if (!status || TERMINAL.has(status)) return false;
      return 2000;
    },
    staleTime: 1000,
  });
};