// src/features/sentinel/hooks/useSentinelSearch.js
import { useMutation } from '@tanstack/react-query';
import { searchProducts } from '../services/sentinelApi';

export const useSentinelSearch = () => {
  return useMutation({ mutationFn: (payload) => searchProducts(payload) });
};