import type { Job } from '../types';

interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  created: string;
  company: {
    display_name: string;
  };
  location: {
    display_name: string;
    area: string[];
  };
  redirect_url: string;
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
}

interface AdzunaResponse {
  results: AdzunaJob[];
  count: number;
}

// Search for jobs on Adzuna
export async function searchAdzunaJobs(params: {
  keywords?: string;
  location?: string;
  page?: number;
}): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('Adzuna API credentials not configured, skipping Adzuna source');
    return [];
  }

  // Build query parameters
  const queryParams = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: '50',
    what: params.keywords || 'developer',
    where: params.location || 'Île-de-France',
    // Search in title for better relevance
    what_or: 'développeur react javascript frontend backend fullstack node typescript',
    // Only jobs from last 14 days
    max_days_old: '14',
  });

  try {
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/fr/search/${params.page || 1}?${queryParams.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Adzuna API error:', error);
      return [];
    }

    const data: AdzunaResponse = await response.json();

    // Transform Adzuna jobs to our Job format
    return (data.results || []).map(transformAdzunaJob);
  } catch (error) {
    console.error('Error fetching from Adzuna:', error);
    return [];
  }
}

// Transform Adzuna job format to our Job format
function transformAdzunaJob(adzunaJob: AdzunaJob): Job {
  let salary: string | undefined;
  if (adzunaJob.salary_min && adzunaJob.salary_max) {
    salary = `${Math.round(adzunaJob.salary_min / 1000)}K€ - ${Math.round(adzunaJob.salary_max / 1000)}K€`;
  } else if (adzunaJob.salary_min) {
    salary = `${Math.round(adzunaJob.salary_min / 1000)}K€+`;
  }

  return {
    id: `adzuna-${adzunaJob.id}`,
    title: adzunaJob.title,
    company: adzunaJob.company?.display_name || 'Entreprise confidentielle',
    location: adzunaJob.location?.display_name || 'Non spécifié',
    description: adzunaJob.description || '',
    url: adzunaJob.redirect_url,
    datePosted: adzunaJob.created,
    contractType: adzunaJob.contract_type,
    salary,
    source: 'adzuna',
  };
}
