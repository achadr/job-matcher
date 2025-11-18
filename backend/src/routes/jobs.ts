import { Router, Request, Response } from 'express';
import { searchJobs, getMockJobs } from '../services/poleEmploi';
import { matchJobs } from '../services/matching';
import { userProfile } from '../config/profile';
import { JobFilters, JobMatchResponse } from '../types';

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

    let jobs;

    // Check if we should use mock data (for development without API credentials)
    const useMock = process.env.USE_MOCK_DATA === 'true' ||
      (!process.env.POLE_EMPLOI_CLIENT_ID || !process.env.POLE_EMPLOI_CLIENT_SECRET);

    if (useMock) {
      console.log('Using mock job data');
      jobs = getMockJobs();
    } else {
      // Fetch jobs from Pôle Emploi API
      const keywords = req.query.keywords as string | undefined;
      jobs = await searchJobs({ keywords });
    }

    // Match jobs against user profile
    const matchedJobs = matchJobs(jobs, userProfile, filters);

    const response: JobMatchResponse = {
      jobs: matchedJobs,
      totalJobs: matchedJobs.length,
      profile: userProfile,
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
