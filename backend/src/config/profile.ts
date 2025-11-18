import { UserProfile } from '../types';

// Hardcoded profile for POC
// This will be replaced with CV parsing in future versions
export const userProfile: UserProfile = {
  name: 'Developer',
  location: 'Nanterre, Île-de-France',
  skills: [
    // Primary skills
    'React',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Express',

    // Maps & Visualization
    'MapboxGL',
    'Mapbox',
    'DeckGL',
    'D3.js',
    'Charts',
    'Data Visualization',

    // Frontend
    'HTML',
    'CSS',
    'SCSS',
    'Sass',
    'Tailwind',
    'Redux',
    'Next.js',
    'Vite',
    'Webpack',

    // Backend & Database
    'REST API',
    'GraphQL',
    'PostgreSQL',
    'MongoDB',
    'SQL',

    // Tools & Practices
    'Git',
    'GitHub',
    'Docker',
    'CI/CD',
    'Agile',
    'Scrum',
    'Jest',
    'Testing',

    // General
    'Full-Stack',
    'Frontend',
    'Front-end',
    'Web Development',
  ],
  experience: [
    'Front-End Developer',
    'Full-Stack Developer',
    'Web Developer',
  ],
  preferredContractTypes: ['CDI', 'CDD'],
};
