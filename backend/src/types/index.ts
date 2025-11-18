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
  totalJobs: number;
  profile: UserProfile;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Pôle Emploi API types
export interface PoleEmploiJob {
  id: string;
  intitule: string;
  description: string;
  dateCreation: string;
  lieuTravail: {
    libelle: string;
    commune?: string;
    codePostal?: string;
  };
  entreprise: {
    nom?: string;
    description?: string;
  };
  typeContrat: string;
  typeContratLibelle: string;
  salaire?: {
    libelle?: string;
  };
  origineOffre: {
    urlOrigine: string;
  };
}

export interface PoleEmploiSearchResponse {
  resultats: PoleEmploiJob[];
  filtresPossibles?: Array<{
    agregation?: Array<{
      nbResultats?: number;
    }>;
  }>;
}

// Filter types
export interface JobFilters {
  minMatchScore?: number;
  location?: string;
  contractType?: string;
  sortBy?: 'matchScore' | 'date' | 'location';
  sortOrder?: 'asc' | 'desc';
}
