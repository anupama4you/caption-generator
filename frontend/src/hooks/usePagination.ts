import { useState, useCallback } from 'react';

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLimit: (limit: number) => void;
  setPagination: (pagination: PaginationState) => void;
  reset: () => void;
}

/**
 * Custom hook for handling pagination state
 */
export function usePagination(initialLimit = 10): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });

  const setPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.pages || 1)),
    }));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.pages || 1),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState((prev) => ({
      ...prev,
      limit,
      page: 1, // Reset to first page when limit changes
    }));
  }, []);

  const setPagination = useCallback((pagination: PaginationState) => {
    setState(pagination);
  }, []);

  const reset = useCallback(() => {
    setState({
      page: 1,
      limit: initialLimit,
      total: 0,
      pages: 0,
    });
  }, [initialLimit]);

  return {
    ...state,
    hasNext: state.page < state.pages,
    hasPrev: state.page > 1,
    setPage,
    nextPage,
    prevPage,
    setLimit,
    setPagination,
    reset,
  };
}

export default usePagination;
