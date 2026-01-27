/**
 * Problems Analyzer V2 Store
 * Manages hierarchical navigation state for the optimized sunburst dashboard
 */
import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export type ViewLevel = 'SEVERITY' | 'CATEGORY' | 'PROBLEMS' | 'DETAILS';
export type SeverityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TrendType = 'UP' | 'DOWN' | 'STABLE';

export interface ProblemType {
  id: string;
  name: string;
  severity: SeverityType;
  category: string;
  problems: number; // Count of problem instances
  frequency: string; // e.g., "Every 2.5 hours"
  mttr: number; // Minutes
  affectedServices: string[];
  impactPercentage: number;
  trend: TrendType;
  trendPercentage: number;
  rootCause: string;
  solution: string;
}

export interface CategoryData {
  name: string;
  problems: number;
  types: number;
  color: string;
}

export interface SeverityData {
  severity: SeverityType;
  problems: number;
  types: number;
  color: string;
  categories: CategoryData[];
}

export interface HierarchyData {
  totalProblems: number;
  uniqueProblemTypes: number;
  avgMttr: number;
  fpRate: number;
  severities: SeverityData[];
  allProblems: ProblemType[];
}

export interface BreadcrumbItem {
  level: ViewLevel;
  label: string;
  value?: string;
}

// ============================================================================
// STORE STATE
// ============================================================================

interface ProblemsAnalyzerV2State {
  // Current view
  currentView: ViewLevel;
  
  // Navigation path
  breadcrumb: BreadcrumbItem[];
  
  // Selected items at each level
  selectedSeverity: SeverityType | null;
  selectedCategory: string | null;
  selectedProblem: ProblemType | null;
  
  // Data
  hierarchyData: HierarchyData | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  searchQuery: string;
  showOnlyCritical: boolean;
  
  // Actions
  setView: (view: ViewLevel) => void;
  selectSeverity: (severity: SeverityType) => void;
  selectCategory: (category: string) => void;
  selectProblem: (problem: ProblemType) => void;
  goBack: () => void;
  resetToHome: () => void;
  setHierarchyData: (data: HierarchyData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  navigateToBreadcrumb: (index: number) => void;
}

// ============================================================================
// SEVERITY COLORS
// ============================================================================

export const SEVERITY_COLORS: Record<SeverityType, string> = {
  CRITICAL: '#C41E3A',
  HIGH: '#E63946',
  MEDIUM: '#F77F00',
  LOW: '#FCBF49'
};

// ============================================================================
// STORE
// ============================================================================

export const useProblemsAnalyzerV2Store = create<ProblemsAnalyzerV2State>((set, get) => ({
  // Initial state
  currentView: 'SEVERITY',
  breadcrumb: [{ level: 'SEVERITY', label: 'Severity Overview' }],
  selectedSeverity: null,
  selectedCategory: null,
  selectedProblem: null,
  hierarchyData: null,
  isLoading: true,
  error: null,
  searchQuery: '',
  showOnlyCritical: false,

  // Actions
  setView: (view) => set({ currentView: view }),

  selectSeverity: (severity) => {
    set({
      currentView: 'CATEGORY',
      selectedSeverity: severity,
      selectedCategory: null,
      selectedProblem: null,
      breadcrumb: [
        { level: 'SEVERITY', label: 'Severity Overview' },
        { level: 'CATEGORY', label: severity, value: severity }
      ]
    });
  },

  selectCategory: (category) => {
    const { selectedSeverity } = get();
    set({
      currentView: 'PROBLEMS',
      selectedCategory: category,
      selectedProblem: null,
      breadcrumb: [
        { level: 'SEVERITY', label: 'Severity Overview' },
        { level: 'CATEGORY', label: selectedSeverity!, value: selectedSeverity! },
        { level: 'PROBLEMS', label: category, value: category }
      ]
    });
  },

  selectProblem: (problem) => {
    const { selectedSeverity, selectedCategory } = get();
    set({
      currentView: 'DETAILS',
      selectedProblem: problem,
      breadcrumb: [
        { level: 'SEVERITY', label: 'Severity Overview' },
        { level: 'CATEGORY', label: selectedSeverity!, value: selectedSeverity! },
        { level: 'PROBLEMS', label: selectedCategory!, value: selectedCategory! },
        { level: 'DETAILS', label: problem.name, value: problem.id }
      ]
    });
  },

  goBack: () => {
    const { currentView, breadcrumb } = get();
    
    if (currentView === 'CATEGORY') {
      set({
        currentView: 'SEVERITY',
        selectedSeverity: null,
        breadcrumb: [{ level: 'SEVERITY', label: 'Severity Overview' }]
      });
    } else if (currentView === 'PROBLEMS') {
      set({
        currentView: 'CATEGORY',
        selectedCategory: null,
        selectedProblem: null,
        breadcrumb: breadcrumb.slice(0, 2)
      });
    } else if (currentView === 'DETAILS') {
      set({
        currentView: 'PROBLEMS',
        selectedProblem: null,
        breadcrumb: breadcrumb.slice(0, 3)
      });
    }
  },

  resetToHome: () => {
    set({
      currentView: 'SEVERITY',
      selectedSeverity: null,
      selectedCategory: null,
      selectedProblem: null,
      breadcrumb: [{ level: 'SEVERITY', label: 'Severity Overview' }]
    });
  },

  navigateToBreadcrumb: (index) => {
    const { breadcrumb } = get();
    if (index === 0) {
      get().resetToHome();
    } else if (index === 1) {
      const severity = breadcrumb[1]?.value as SeverityType;
      if (severity) {
        set({
          currentView: 'CATEGORY',
          selectedCategory: null,
          selectedProblem: null,
          breadcrumb: breadcrumb.slice(0, 2)
        });
      }
    } else if (index === 2) {
      set({
        currentView: 'PROBLEMS',
        selectedProblem: null,
        breadcrumb: breadcrumb.slice(0, 3)
      });
    }
  },

  setHierarchyData: (data) => set({ hierarchyData: data, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
