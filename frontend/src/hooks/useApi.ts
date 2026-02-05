import { useState, useCallback } from 'react';
import { AxiosResponse, AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (apiCall: () => Promise<AxiosResponse<T>>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Custom hook for handling API calls with loading and error states
 */
export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<AxiosResponse<T>>): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiCall();
        const data = response.data;
        setState({ data, loading: false, error: null });
        return data;
      } catch (err) {
        const error = err as AxiosError<{ error?: string; message?: string }>;
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'An error occurred';

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

/**
 * Custom hook for handling API calls that return paginated data
 */
interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UsePaginatedApiReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedData<T>['pagination'] | null;
  execute: (apiCall: () => Promise<AxiosResponse<{ data: T[]; pagination: PaginatedData<T>['pagination'] }>>) => Promise<void>;
  reset: () => void;
}

export function usePaginatedApi<T>(): UsePaginatedApiReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginatedData<T>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<AxiosResponse<{ data: T[]; pagination: PaginatedData<T>['pagination'] }>>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiCall();
        setData(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        const error = err as AxiosError<{ error?: string; message?: string }>;
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData([]);
    setPagination(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, pagination, execute, reset };
}

export default useApi;
