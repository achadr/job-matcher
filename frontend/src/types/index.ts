// Job-related types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  datePosted: string;
  contractType?: string;
  salary?: string;
  source: 'france-travail' | 'adzuna' | 'mock';
}

export interface MatchedJob extends Job {
  matchScore: number;
  matchedSkills: string[];
  totalSkills: number;
}

// User profile types
export interface UserProfile {
  name: string;
  location: string;
  skills: string[];
  experience: string[];
  preferredContractTypes: string[];
}

// API response types
export interface JobMatchResponse {
  jobs: MatchedJob[];
  profile: UserProfile;
  cachedAt?: number;
}

// Filter types
export interface JobFilters {
  minMatchScore: number;
  location: string;
  contractType: string;
  sortBy: 'matchScore' | 'date' | 'location';
  sortOrder: 'asc' | 'desc';
}
