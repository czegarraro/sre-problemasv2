/**
 * Problem Service - Business Logic Layer
 */
import { ProblemRepository } from '../repositories/problem.repository';
import { Problem, ProblemFilters, PaginatedProblemsResponse } from '../types/problem.types';

export class ProblemService {
  private repository: ProblemRepository;

  constructor() {
    this.repository = new ProblemRepository();
  }

  /**
   * Get paginated problems with filters
   */
  async getProblems(
    filters: ProblemFilters,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'startTime',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<PaginatedProblemsResponse> {
    return await this.repository.findAll(filters, page, limit, sortBy, sortOrder);
  }

  /**
   * Get problem by ID
   */
  async getProblemById(problemId: string): Promise<Problem> {
    const problem = await this.repository.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  /**
   * Update problem status
   */
  async updateProblemStatus(problemId: string, status: 'OPEN' | 'CLOSED'): Promise<Problem> {
    const problem = await this.repository.updateStatus(problemId, status);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  /**
   * Add comment to problem
   */
  async addComment(problemId: string, content: string, authorName: string): Promise<Problem> {
    const comment = {
      id: `comment-${Date.now()}`,
      createdAtTimestamp: Date.now(),
      content,
      authorName,
      context: 'USER_COMMENT',
    };

    const problem = await this.repository.addComment(problemId, comment);
    if (!problem) {
      throw new Error('Problem not found');
    }
    return problem;
  }

  /**
   * Get filter options
   */
  async getFilterOptions() {
    return await this.repository.getFilterOptions();
  }
}
