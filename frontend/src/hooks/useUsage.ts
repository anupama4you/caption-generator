import { useState, useCallback } from 'react';
import api from '../services/api';
import { UsageStats } from '../types';

interface UseUsageReturn {
  usage: UsageStats | null;
  loading: boolean;
  error: string | null;
  fetchUsage: () => Promise<void>;
  progressPercentage: number;
  isLimitReached: boolean;
  remaining: number;
}

/**
 * Custom hook for fetching and managing usage statistics
 */
export function useUsage(): UseUsageReturn {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: UsageStats }>('/profile/usage');
      setUsage(response.data.data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to fetch usage';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const progressPercentage = usage
    ? Math.min((usage.captionsGenerated / usage.monthlyLimit) * 100, 100)
    : 0;

  const isLimitReached = usage
    ? usage.captionsGenerated >= usage.monthlyLimit
    : false;

  const remaining = usage
    ? Math.max(usage.monthlyLimit - usage.captionsGenerated, 0)
    : 0;

  return {
    usage,
    loading,
    error,
    fetchUsage,
    progressPercentage,
    isLimitReached,
    remaining,
  };
}

export default useUsage;
