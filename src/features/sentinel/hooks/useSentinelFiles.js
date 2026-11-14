// src/features/sentinel/hooks/useSentinelFiles.js
import { useQuery } from '@tanstack/react-query';
import { listAreas, listAreaScenes } from '../services/sentinelApi';

export const sentinelFilesKeys = {
  all: ['sentinel', 'files'],
  areas: () => [...sentinelFilesKeys.all, 'areas'],
  scenes: (areaId) => [...sentinelFilesKeys.all, 'scenes', areaId],
};

export const useSentinelFiles = () => {
  return useQuery({
    queryKey: sentinelFilesKeys.areas(),
    queryFn: () => listAreas({ limit: 100 }),
    staleTime: 30_000,
  });
};

export const useSentinelAreaScenes = (areaId) => {
  return useQuery({
    queryKey: sentinelFilesKeys.scenes(areaId),
    queryFn: () => listAreaScenes(areaId),
    enabled: !!areaId,
    staleTime: 30_000,
  });
};