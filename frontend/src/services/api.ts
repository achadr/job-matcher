import type { JobMatchResponse, JobFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface FetchJobsOptions {
  filters?: Partial<JobFilters>;
  page?: number;
  pageSize?: number;
}

export async function fetchJobMatches(options?: FetchJobsOptions): Promise<JobMatchResponse> {
  const params = new URLSearchParams();
  const { filters, page, pageSize } = options || {};

  if (filters) {
    if (filters.minMatchScore !== undefined) {
      params.set('minMatchScore', filters.minMatchScore.toString());
    }
    if (filters.location) {
      params.set('location', filters.location);
    }
    if (filters.contractType) {
      params.set('contractType', filters.contractType);
    }
    if (filters.sortBy) {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.set('sortOrder', filters.sortOrder);
    }
  }

  if (page) {
    params.set('page', page.toString());
  }
  if (pageSize) {
    params.set('pageSize', pageSize.toString());
  }

  const url = `${API_BASE_URL}/api/jobs/matches${params.toString() ? `?${params}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`);
  }

  return response.json();
}
