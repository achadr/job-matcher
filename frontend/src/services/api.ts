import type { JobMatchResponse, JobFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchJobMatches(filters?: Partial<JobFilters>): Promise<JobMatchResponse> {
  const params = new URLSearchParams();

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

  const url = `${API_BASE_URL}/api/jobs/matches${params.toString() ? `?${params}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`);
  }

  return response.json();
}
