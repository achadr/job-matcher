import { Job, PoleEmploiJob, PoleEmploiSearchResponse } from '../types';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Get OAuth2 access token from Pôle Emploi
async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if still valid
  if (accessToken && tokenExpiry > now) {
    return accessToken;
  }

  const clientId = process.env.POLE_EMPLOI_CLIENT_ID;
  const clientSecret = process.env.POLE_EMPLOI_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Pôle Emploi API credentials not configured. Set POLE_EMPLOI_CLIENT_ID and POLE_EMPLOI_CLIENT_SECRET in .env');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'api_offresdemploiv2 o2dsoffre',
  });

  const response = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Set expiry 5 minutes before actual expiry for safety
  tokenExpiry = now + (data.expires_in - 300) * 1000;

  return accessToken!;
}

// Search for jobs on Pôle Emploi
export async function searchJobs(params: {
  keywords?: string;
  location?: string;
  range?: string;
}): Promise<Job[]> {
  const token = await getAccessToken();

  // Build query parameters
  const queryParams = new URLSearchParams({
    // Search in Île-de-France region (code 11)
    region: '11',
    // Get developer/IT jobs (ROME code M18 is for IT)
    grandDomaine: 'M',
    // Number of results
    range: params.range || '0-149',
    // Only jobs published in last 14 days (accepts: 1, 3, 7, 14, or 31)
    publieeDepuis: '14',
  });

  // Add optional keyword filter
  if (params.keywords) {
    queryParams.set('motsCles', params.keywords);
  }

  const response = await fetch(
    `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to search jobs: ${error}`);
  }

  const data: PoleEmploiSearchResponse = await response.json();

  // Transform Pôle Emploi jobs to our Job format
  return (data.resultats || []).map(transformJob);
}

// Transform Pôle Emploi job format to our Job format
function transformJob(poleEmploiJob: PoleEmploiJob): Job {
  return {
    id: poleEmploiJob.id,
    title: poleEmploiJob.intitule,
    company: poleEmploiJob.entreprise?.nom || 'Entreprise confidentielle',
    location: poleEmploiJob.lieuTravail?.libelle || 'Non spécifié',
    description: poleEmploiJob.description || '',
    url: poleEmploiJob.origineOffre?.urlOrigine || `https://candidat.pole-emploi.fr/offres/recherche/detail/${poleEmploiJob.id}`,
    datePosted: poleEmploiJob.dateCreation,
    contractType: poleEmploiJob.typeContratLibelle,
    salary: poleEmploiJob.salaire?.libelle,
    source: 'france-travail',
  };
}

// For development/testing without API credentials
export function getMockJobs(): Job[] {
  return [
    {
      id: '1',
      title: 'Développeur Front-End React',
      company: 'TechCorp Paris',
      location: 'Paris 8e',
      description: 'Nous recherchons un développeur Front-End expérimenté en React et TypeScript. Vous travaillerez sur des applications web modernes utilisant React, Redux, et TypeScript. Connaissance de Node.js et GraphQL appréciée. Environnement Agile/Scrum.',
      url: 'https://example.com/job/1',
      datePosted: new Date().toISOString(),
      contractType: 'CDI',
      salary: '45K€ - 55K€',
      source: 'mock',
    },
    {
      id: '2',
      title: 'Full-Stack Developer JavaScript',
      company: 'StartupHub',
      location: 'Nanterre',
      description: 'Rejoignez notre équipe pour développer notre plateforme SaaS. Stack technique : React, Node.js, Express, PostgreSQL. Expérience avec Docker et CI/CD requise. Télétravail partiel possible.',
      url: 'https://example.com/job/2',
      datePosted: new Date(Date.now() - 86400000).toISOString(),
      contractType: 'CDI',
      salary: '50K€ - 60K€',
      source: 'mock',
    },
    {
      id: '3',
      title: 'Développeur Web Cartographie',
      company: 'GeoTech Solutions',
      location: 'La Défense',
      description: 'Développement d\'applications de cartographie web avec MapboxGL et DeckGL. Expertise JavaScript/TypeScript requise. Visualisation de données avec D3.js. Travail sur des projets innovants de data visualization.',
      url: 'https://example.com/job/3',
      datePosted: new Date(Date.now() - 172800000).toISOString(),
      contractType: 'CDI',
      salary: '48K€ - 58K€',
      source: 'mock',
    },
    {
      id: '4',
      title: 'Ingénieur Backend Python',
      company: 'DataCorp',
      location: 'Paris 12e',
      description: 'Développement backend en Python avec Django. Base de données PostgreSQL. API REST. Connaissance de AWS appréciée.',
      url: 'https://example.com/job/4',
      datePosted: new Date(Date.now() - 259200000).toISOString(),
      contractType: 'CDD',
      salary: '40K€ - 50K€',
      source: 'mock',
    },
    {
      id: '5',
      title: 'Lead Developer Front-End',
      company: 'Innovation Labs',
      location: 'Boulogne-Billancourt',
      description: 'Lead technique pour équipe front-end. React, TypeScript, Next.js. Architecture de composants, tests Jest, code reviews. Méthodologie Agile. Management d\'une équipe de 3-4 développeurs.',
      url: 'https://example.com/job/5',
      datePosted: new Date(Date.now() - 345600000).toISOString(),
      contractType: 'CDI',
      salary: '55K€ - 70K€',
      source: 'mock',
    },
  ];
}
