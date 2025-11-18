import type { JobMatchResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function fetchJobMatches(): Promise<JobMatchResponse> {
  const url = `${API_BASE_URL}/api/jobs/matches`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch jobs: ${response.statusText}`);
  }

  return response.json();
}
