import { Router, Request, Response } from 'express';
import { searchJobs, getMockJobs } from '../services/poleEmploi';
import { searchAdzunaJobs } from '../services/adzuna';
import { matchJobs } from '../services/matching';
import { userProfile } from '../config/profile';
import type { JobFilters, JobMatchResponse, Job, MatchedJob } from '../types';

const router = Router();

// Cache for matched jobs (in production, use Redis or similar)
let jobsCache: {
  jobs: MatchedJob[];
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/jobs/matches - returns all jobs, frontend handles pagination
router.get('/matches', async (req: Request, res: Response) => {
  try {
    let allMatchedJobs: MatchedJob[];

    // Check if we have valid cached data
    const now = Date.now();
    const cacheValid = jobsCache && (now - jobsCache.timestamp) < CACHE_TTL;

    if (cacheValid && jobsCache) {
      console.log('Using cached job data');
      allMatchedJobs = jobsCache.jobs;
    } else {
      // Fetch fresh data from APIs
      let jobs: Job[] = [];

      // Check if we should use mock data (for development without API credentials)
      const useMock = process.env.USE_MOCK_DATA === 'true';

      if (useMock) {
        console.log('Using mock job data');
        jobs = getMockJobs();
      } else {
        const keywords = req.query.keywords as string | undefined;

        // Fetch maximum jobs from both sources (multi-page fetching)
        const [franceTravailResult, adzunaResult] = await Promise.all([
          // France Travail API - fetches 3 pages of 150 = up to 450 jobs
          (process.env.POLE_EMPLOI_CLIENT_ID && process.env.POLE_EMPLOI_CLIENT_SECRET)
            ? searchJobs({ keywords })
            : Promise.resolve({ jobs: [], total: 0 }),
          // Adzuna API - fetches 2 pages of 50 = up to 100 jobs (rate limited)
          searchAdzunaJobs({ keywords }),
        ]);

        // Combine results from all sources
        jobs = [...franceTravailResult.jobs, ...adzunaResult.jobs];

        console.log(`Fetched ${franceTravailResult.jobs.length} jobs from France Travail, ${adzunaResult.jobs.length} from Adzuna`);
      }

      // Match and sort all jobs by score (highest first)
      allMatchedJobs = matchJobs(jobs, userProfile);

      // Cache the results
      jobsCache = {
        jobs: allMatchedJobs,
        timestamp: now,
      };

      console.log(`Cached ${allMatchedJobs.length} matched jobs`);
    }

    // Return all jobs - frontend handles pagination and filtering
    res.json({
      jobs: allMatchedJobs,
      profile: userProfile,
      cachedAt: jobsCache?.timestamp,
    });
  } catch (error) {
    console.error('Error fetching job matches:', error);
    res.status(500).json({
      error: 'Failed to fetch job matches',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/jobs/profile
router.get('/profile', (_req: Request, res: Response) => {
  res.json(userProfile);
});

export default router;
