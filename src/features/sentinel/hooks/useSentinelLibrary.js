// src/features/sentinel/hooks/useSentinelLibrary.js
import { useQuery } from '@tanstack/react-query';
import { listAreas, listAreaScenes } from '../services/sentinelApi';

export const sentinelKeys = {
  all: ['sentinel'],
  areas: () => [...sentinelKeys.all, 'areas'],
  scenes: (areaId) => [...sentinelKeys.all, 'scenes', areaId],
};

export const useSentinelAreas = () => {
  return useQuery({
    queryKey: sentinelKeys.areas(),
    queryFn: () => listAreas(),
    staleTime: 30_000,
  });
};

export const useSentinelScenes = (areaId) => {
  return useQuery({
    queryKey: sentinelKeys.scenes(areaId),
    queryFn: () => listAreaScenes(areaId),
    enabled: !!areaId,
    staleTime: 30_000,
  });
};