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

// Fetch a single page from Adzuna
async function fetchAdzunaPage(params: {
  appId: string;
  appKey: string;
  keywords?: string;
  location?: string;
  page: number;
  pageSize: number;
}): Promise<{ jobs: Job[]; total: number }> {
  const queryParams = new URLSearchParams({
    app_id: params.appId,
    app_key: params.appKey,
    results_per_page: params.pageSize.toString(),
    what: params.keywords || 'developer',
    where: params.location || 'Île-de-France',
    // Search in title for better relevance
    what_or: 'développeur react javascript frontend backend fullstack node typescript',
    // Only jobs from last 14 days
    max_days_old: '14',
  });

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/fr/search/${params.page}?${queryParams.toString()}`,
    {
      headers: {
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Adzuna API error:', error);
    return { jobs: [], total: 0 };
  }

  const data: AdzunaResponse = await response.json();

  return {
    jobs: (data.results || []).map(transformAdzunaJob),
    total: data.count || 0,
  };
}

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Search for jobs on Adzuna - fetches multiple pages sequentially to avoid rate limits
export async function searchAdzunaJobs(params: {
  keywords?: string;
  location?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ jobs: Job[]; total: number }> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.log('Adzuna API credentials not configured, skipping Adzuna source');
    return { jobs: [], total: 0 };
  }

  // Adzuna limit is 50 per page
  // Fetch 2 pages = 100 jobs max (reduced to avoid rate limits)
  const pagesToFetch = 2;
  const pageSize = 50;

  const allJobs: Job[] = [];
  let totalAvailable = 0;

  try {
    // Fetch pages sequentially with delay to avoid rate limits
    for (let i = 1; i <= pagesToFetch; i++) {
      if (i > 1) {
        await delay(300); // 300ms delay between requests
      }

      const result = await fetchAdzunaPage({
        appId,
        appKey,
        keywords: params.keywords,
        location: params.location,
        page: i,
        pageSize,
      });

      allJobs.push(...result.jobs);
      totalAvailable = Math.max(totalAvailable, result.total);
    }

    return {
      jobs: allJobs,
      total: totalAvailable,
    };
  } catch (error) {
    console.error('Error fetching from Adzuna:', error);
    return { jobs: [], total: 0 };
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
