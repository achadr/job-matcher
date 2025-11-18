import { Job, MatchedJob, UserProfile, JobFilters } from '../types';

// Calculate match score between a job and user profile
export function calculateMatchScore(job: Job, profile: UserProfile): {
  score: number;
  matchedSkills: string[];
} {
  const jobText = `${job.title} ${job.description}`.toLowerCase();
  const matchedSkills: string[] = [];

  // Check each skill against job text
  for (const skill of profile.skills) {
    // Create regex for skill matching (case insensitive, word boundaries)
    const skillLower = skill.toLowerCase();

    // Check for exact match or common variations
    if (
      jobText.includes(skillLower) ||
      jobText.includes(skillLower.replace('.', '')) || // For "Node.js" -> "nodejs"
      jobText.includes(skillLower.replace('-', ''))    // For "CI-CD" -> "cicd"
    ) {
      matchedSkills.push(skill);
    }
  }

  // Calculate percentage score
  const score = profile.skills.length > 0
    ? Math.round((matchedSkills.length / profile.skills.length) * 100)
    : 0;

  return { score, matchedSkills };
}

// Match jobs against user profile
export function matchJobs(
  jobs: Job[],
  profile: UserProfile,
  filters?: JobFilters
): MatchedJob[] {
  // Calculate match scores for all jobs
  let matchedJobs: MatchedJob[] = jobs.map(job => {
    const { score, matchedSkills } = calculateMatchScore(job, profile);
    return {
      ...job,
      matchScore: score,
      matchedSkills,
      totalSkills: profile.skills.length,
    };
  });

  // Apply filters
  if (filters) {
    // Filter by minimum match score
    if (filters.minMatchScore !== undefined) {
      matchedJobs = matchedJobs.filter(job => job.matchScore >= filters.minMatchScore!);
    }

    // Filter by location
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      matchedJobs = matchedJobs.filter(job =>
        job.location.toLowerCase().includes(locationLower)
      );
    }

    // Filter by contract type
    if (filters.contractType) {
      matchedJobs = matchedJobs.filter(job =>
        job.contractType?.toLowerCase() === filters.contractType!.toLowerCase()
      );
    }

    // Sort results
    const sortBy = filters.sortBy || 'matchScore';
    const sortOrder = filters.sortOrder || 'desc';

    matchedJobs.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'matchScore':
          comparison = a.matchScore - b.matchScore;
          break;
        case 'date':
          comparison = new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
          break;
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  } else {
    // Default sort by match score descending
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
  }

  return matchedJobs;
}
