import { Job, MatchedJob, UserProfile, JobFilters } from '../types';

// Skill aliases - map variations to canonical names
const SKILL_ALIASES: Record<string, string[]> = {
  'React': ['react', 'reactjs', 'react.js'],
  'TypeScript': ['typescript', 'ts'],
  'JavaScript': ['javascript', 'js', 'ecmascript'],
  'Node.js': ['node.js', 'nodejs', 'node'],
  'Python': ['python', 'python3'],
  'Docker': ['docker', 'dockerfile'],
  'Kubernetes': ['kubernetes', 'k8s'],
  'PostgreSQL': ['postgresql', 'postgres', 'psql'],
  'MongoDB': ['mongodb', 'mongo'],
  'GraphQL': ['graphql', 'gql'],
  'REST': ['rest', 'restful', 'rest api'],
  'Git': ['git', 'github', 'gitlab'],
  'CI/CD': ['ci/cd', 'cicd', 'ci-cd', 'continuous integration'],
  'AWS': ['aws', 'amazon web services'],
  'GCP': ['gcp', 'google cloud', 'google cloud platform'],
  'HTML': ['html', 'html5'],
  'CSS': ['css', 'css3', 'scss', 'sass'],
  'Vue': ['vue', 'vuejs', 'vue.js'],
  'Angular': ['angular', 'angularjs'],
  'Express': ['express', 'expressjs', 'express.js'],
  'SQL': ['sql', 'mysql', 'mariadb'],
  'Redis': ['redis'],
  'Elasticsearch': ['elasticsearch', 'elastic'],
  'Mapbox': ['mapbox', 'mapboxgl', 'mapbox-gl'],
  'DeckGL': ['deckgl', 'deck.gl'],
  'D3': ['d3', 'd3.js', 'd3js'],
  'Next.js': ['next.js', 'nextjs', 'next'],
  'FastAPI': ['fastapi', 'fast-api'],
  'Django': ['django'],
  'Flask': ['flask'],
  'Spring': ['spring', 'spring boot', 'springboot'],
  'Java': ['java'],
  'C#': ['c#', 'csharp', '.net', 'dotnet'],
  'Go': ['go', 'golang'],
  'Rust': ['rust'],
  'PHP': ['php', 'laravel', 'symfony'],
  'Ruby': ['ruby', 'rails', 'ruby on rails'],
  'Agile': ['agile', 'scrum', 'kanban'],
  'TDD': ['tdd', 'test driven'],
  'Jest': ['jest'],
  'Cypress': ['cypress'],
  'Webpack': ['webpack'],
  'Vite': ['vite'],
};

// Known tech skills to look for in job descriptions
const KNOWN_SKILLS = Object.keys(SKILL_ALIASES);

// Job title patterns that indicate a relevant developer role
const RELEVANT_TITLE_PATTERNS = [
  // Developer roles - must have these words
  /\b(développeur|developpeur|developer)\b/i,
  /\b(ingénieur|ingenieur|engineer)\s*(logiciel|software|développement|informatique|full.?stack|front.?end|back.?end|web|cloud|devops|data)/i,
  // Specific tech roles
  /\b(frontend|front-end|front end)\b/i,
  /\b(backend|back-end|back end)\b/i,
  /\b(fullstack|full-stack|full stack)\b/i,
  /\b(devops|sre)\b/i,
  // Tech lead / architect with context
  /\b(lead|architect|architecte)\s*(technique|tech|développeur|developer|logiciel|software)/i,
  /\b(tech|technical)\s*lead\b/i,
  // Specific tech in title (when it's the main job)
  /\b(react|node\.?js|angular|vue\.?js)\s*(developer|développeur)?\b/i,
];

// Exclude titles that might match but aren't dev roles
const EXCLUDED_TITLE_PATTERNS = [
  /\b(commercial|assistant|administratif|financier|comptable|rh|ressources humaines|marketing|vente|chargé)\b/i,
  /\b(foncier|immobilier|juridique|judiciaire)\b/i,
  /\b(responsable)\s*(administratif|financier|commercial|marketing|rh)/i,
];

// Check if job title indicates a relevant developer role
function isRelevantJobTitle(title: string): boolean {
  // First check exclusions
  if (EXCLUDED_TITLE_PATTERNS.some(pattern => pattern.test(title))) {
    return false;
  }

  // Then check if it matches relevant patterns
  return RELEVANT_TITLE_PATTERNS.some(pattern => pattern.test(title));
}

// Extract tech skills mentioned in job text
function extractJobSkills(jobText: string): string[] {
  const text = jobText.toLowerCase();
  const foundSkills: string[] = [];

  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    for (const alias of aliases) {
      // Use word boundary matching for better accuracy
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        foundSkills.push(canonical);
        break; // Found this skill, move to next
      }
    }
  }

  return foundSkills;
}

// Normalize user skills to canonical names
function normalizeUserSkills(skills: string[]): Set<string> {
  const normalized = new Set<string>();

  for (const skill of skills) {
    const skillLower = skill.toLowerCase();
    let found = false;

    // Check if skill matches any alias
    for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
      if (aliases.includes(skillLower) || canonical.toLowerCase() === skillLower) {
        normalized.add(canonical);
        found = true;
        break;
      }
    }

    // If not in aliases, add as-is (for custom skills)
    if (!found) {
      normalized.add(skill);
    }
  }

  return normalized;
}

// Calculate match score between a job and user profile
export function calculateMatchScore(job: Job, profile: UserProfile): {
  score: number;
  matchedSkills: string[];
} {
  const jobText = `${job.title} ${job.description}`;

  // Extract skills required by the job
  const jobSkills = extractJobSkills(jobText);

  // Get normalized user skills
  const userSkills = normalizeUserSkills(profile.skills);

  // Find which job skills the user has
  const matchedSkills = jobSkills.filter(skill => userSkills.has(skill));

  // Calculate score: what percentage of job requirements does the user meet?
  // If job has no detected skills, give a base score based on any keyword matches
  let score: number;

  if (jobSkills.length === 0) {
    // Fallback: check for any user skill mentions
    const fallbackMatches: string[] = [];
    for (const skill of userSkills) {
      const skillLower = skill.toLowerCase();
      if (jobText.toLowerCase().includes(skillLower)) {
        fallbackMatches.push(skill);
      }
    }
    score = fallbackMatches.length > 0 ? Math.min(30, fallbackMatches.length * 10) : 0;
    return { score, matchedSkills: fallbackMatches };
  }

  // Main scoring: percentage of job requirements met
  // But penalize jobs with very few detected skills (likely not real tech jobs)
  const matchPercentage = matchedSkills.length / jobSkills.length;

  if (jobSkills.length === 1) {
    // Only 1 skill detected - cap at 50% max, likely not a real tech job
    score = Math.round(matchPercentage * 50);
  } else if (jobSkills.length === 2) {
    // 2 skills - cap at 70%
    score = Math.round(matchPercentage * 70);
  } else if (jobSkills.length <= 3) {
    // 3 skills - cap at 85%
    score = Math.round(matchPercentage * 85);
  } else {
    // 4+ skills - full percentage
    score = Math.round(matchPercentage * 100);
  }

  return { score, matchedSkills };
}

// Match jobs against user profile
export function matchJobs(
  jobs: Job[],
  profile: UserProfile,
  filters?: JobFilters
): MatchedJob[] {
  // Filter out jobs with irrelevant titles first
  const relevantJobs = jobs.filter(job => isRelevantJobTitle(job.title));

  // Calculate match scores for relevant jobs
  let matchedJobs: MatchedJob[] = relevantJobs.map(job => {
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
