import type { UserProfile } from '../types';

// Hardcoded profile for POC
// This will be replaced with CV parsing in future versions
export const userProfile: UserProfile = {
  name: 'Achraf Bougattaya',
  location: 'Nanterre, Île-de-France',
  skills: [
    // Programming Languages
    'Python',
    'JavaScript',
    'TypeScript',

    // Frontend
    'React',
    'HTML',
    'CSS',
    'Next.js',

    // Backend & Runtime
    'Node.js',
    'Express',
    'FastAPI',

    // APIs
    'GraphQL',
    'REST',

    // Maps & Visualization
    'Mapbox',
    'DeckGL',
    'D3',

    // Databases
    'SQL',
    'PostgreSQL',
    'MongoDB',
    'Elasticsearch',

    // DevOps & Cloud
    'Docker',
    'Kubernetes',
    'GCP',
    'Git',
    'CI/CD',

    // Testing
    'Cypress',
    'Jest',

    // Methodologies
    'Agile',
  ],
  experience: [
    'Front-End Developer',
    'Full-Stack Developer',
    'Web Developer',
    'Freelance',
  ],
  preferredContractTypes: ['CDI', 'CDD'],
};
