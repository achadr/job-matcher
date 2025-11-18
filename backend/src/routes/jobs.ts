import { Router, Request, Response } from 'express';
import { searchJobs, getMockJobs } from '../services/poleEmploi';
import { searchAdzunaJobs } from '../services/adzuna';
import { matchJobs } from '../services/matching';
import { userProfile } from '../config/profile';
import type { JobFilters, JobMatchResponse, Job } from '../types';

const router = Router();

// GET /api/jobs/matches
router.get('/matches', async (req: Request, res: Response) => {
  try {
    // Parse query parameters for filters
    const filters: JobFilters = {
      minMatchScore: req.query.minMatchScore
        ? parseInt(req.query.minMatchScore as string)
        : undefined,
      location: req.query.location as string | undefined,
      contractType: req.query.contractType as string | undefined,
      sortBy: req.query.sortBy as JobFilters['sortBy'],
      sortOrder: req.query.sortOrder as JobFilters['sortOrder'],
    };

    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 25));

    let jobs: Job[] = [];

    // Check if we should use mock data (for development without API credentials)
    const useMock = process.env.USE_MOCK_DATA === 'true';

    if (useMock) {
      console.log('Using mock job data');
      jobs = getMockJobs();
    } else {
      const keywords = req.query.keywords as string | undefined;

      // Fetch from multiple sources in parallel
      const [franceTravailJobs, adzunaJobs] = await Promise.all([
        // France Travail API
        (process.env.POLE_EMPLOI_CLIENT_ID && process.env.POLE_EMPLOI_CLIENT_SECRET)
          ? searchJobs({ keywords })
          : Promise.resolve([]),
        // Adzuna API
        searchAdzunaJobs({ keywords }),
      ]);

      // Combine results from all sources
      jobs = [...franceTravailJobs, ...adzunaJobs];

      console.log(`Fetched ${franceTravailJobs.length} jobs from France Travail, ${adzunaJobs.length} from Adzuna`);
    }

    // Match jobs against user profile
    const matchedJobs = matchJobs(jobs, userProfile, filters);

    // Apply pagination
    const totalJobs = matchedJobs.length;
    const totalPages = Math.ceil(totalJobs / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedJobs = matchedJobs.slice(startIndex, startIndex + pageSize);

    const response: JobMatchResponse = {
      jobs: paginatedJobs,
      totalJobs,
      profile: userProfile,
      pagination: {
        page,
        pageSize,
        totalPages,
      },
    };

    res.json(response);
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
