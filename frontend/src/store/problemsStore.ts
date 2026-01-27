/**
 * Problems Store
 */
import { create } from 'zustand';
import { Problem, PaginatedProblemsResponse } from '@/types/problem.types';
import { problemsApi, GetProblemsParams } from '@/lib/api/problems.api';

interface ProblemsState {
  problems: Problem[];
  selectedProblem: Problem | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProblems: (params: GetProblemsParams) => Promise<void>;
  fetchProblemById: (problemId: string) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  clearSelectedProblem: () => void;
}

export const useProblemsStore = create<ProblemsState>((set, get) => ({
  problems: [],
  selectedProblem: null,
  total: 0,
  page: 1,
  limit: 25,
  totalPages: 0,
  sortBy: 'startTime',
  sortOrder: 'desc',
  isLoading: false,
  error: null,

  fetchProblems: async (params: GetProblemsParams) => {
    set({ isLoading: true, error: null });
    try {
      const response: PaginatedProblemsResponse = await problemsApi.getProblems({
        ...params,
        page: params.page || get().page,
        limit: params.limit || get().limit,
        sortBy: params.sortBy || get().sortBy,
        sortOrder: params.sortOrder || get().sortOrder,
      });

      set({
        problems: response.problems,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch problems',
        isLoading: false,
      });
    }
  },

  fetchProblemById: async (problemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const problem = await problemsApi.getProblemById(problemId);
      set({
        selectedProblem: problem,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch problem',
        isLoading: false,
      });
    }
  },

  setPage: (page: number) => {
    set({ page });
  },

  setLimit: (limit: number) => {
    set({ limit, page: 1 }); // Reset to first page when changing limit
  },

  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => {
    set({ sortBy, sortOrder });
  },

  clearSelectedProblem: () => {
    set({ selectedProblem: null });
  },
}));
