# Job Matcher POC - Project Context

## Project Overview
A Proof of Concept application that matches job postings from multiple sources against your CV/profile, specifically focused on front-end/full-stack developer positions in Île-de-France, France.

## Goals
- **Primary**: Personal/hobby/portfolio project
- **Scope**: Weekend POC with potential for future improvements
- **Target User**: Initially for personal use (you), potentially expandable to other users
- **No monetization** for now - focus on learning and building something useful

## Your Profile
- **Location**: Nanterre, Île-de-France, France
- **Role**: Front-End / Full-Stack Developer
- **Tech Stack**: 
  - React, TypeScript, JavaScript, Node.js
  - MapboxGL and DeckGL (maps expertise)
  - Graphics and charts experience
  - Additional secondary skills
- **CV**: Already prepared and ready to use

## Core Problem Being Solved
Finding relevant job postings across multiple job boards is time-consuming. Instead of setting up alerts on 5+ platforms, this tool aggregates and matches jobs against your profile in one place.

## MVP Functionality (First Implementation)
1. Parse/analyze your CV to extract skills, experience, and preferences
2. Aggregate job listings from multiple French job boards
3. Match jobs against your profile using relevance scoring
4. Display matched results in a consolidated view

**NOT included in POC**: Auto-apply functionality (too complex for first version)

## Weekend POC Plan

### Tech Stack
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Job Source**: Pôle Emploi API (official French employment agency API)
- **Storage**: In-memory for POC (no database yet)
- **CV Parsing**: Hardcoded profile for POC

### Day 1 (Saturday) - Backend
1. Set up Node/Express API with TypeScript
2. Integrate Pôle Emploi API
   - Register for API key at https://www.emploi-store-dev.fr/
   - Implement job search endpoint
   - Parameters: job category (rome_code), location (commune)
3. Implement matching logic:
   - Hardcode your skills array
   - Keyword matching against job descriptions
   - Calculate match score (% of your skills mentioned)
4. Create API endpoint: `/api/jobs/matches`

### Day 2 (Sunday) - Frontend
1. React app with TypeScript setup
2. Build UI components:
   - Display your key skills as chips/tags
   - Job listings with:
     - Job title, company, location
     - Match score percentage
     - Matched skills highlighted
     - Link to original posting
   - Basic filters:
     - Minimum match percentage
     - Location radius
     - Sort by: match score, date, location

### POC Limitations (Acceptable for Weekend)
- Hardcoded profile (no CV upload/parsing)
- Single job source (Pôle Emploi only)
- No data persistence (results refresh each time)
- Basic keyword matching (not semantic/AI-powered)
- No authentication/user accounts

## French Job Sources Identified

### Priority for POC
1. **Pôle Emploi API** ✅ Best for POC
   - Official French employment agency
   - Free API available
   - Well-documented
   - Large job database

### Future Additions
2. **Welcome to the Jungle**
   - Very popular for tech/startup jobs in France
   - Would require scraping (no public API)
   - Modern companies, good job descriptions

3. **Indeed France** (fr.indeed.com)
   - Large coverage
   - May have API or require scraping

4. **APEC**
   - For executives and engineers (cadres)

5. **LinkedIn France**
   - Widely used but API restrictions

### Tech-Focused Sources
- Choose Your Boss
- RemoteFR (for remote positions)

## Future Enhancements (Post-POC)

### Features
- CV upload and parsing (PDF/DOCX support)
- Multiple job sources integration
- Better matching algorithm:
  - Semantic search using embeddings
  - Machine learning-based relevance
- Job map view using MapboxGL (leverage your expertise!)
- Save/bookmark functionality
- Email notifications for new matches
- User profiles and preferences
- Application tracking

### Technical Improvements
- Database integration (PostgreSQL)
- User authentication
- Caching layer for API results
- Rate limiting and error handling
- Automated job refresh scheduler
- Advanced filters and search

## Value Proposition
"Upload your CV once, and we'll continuously monitor multiple French job boards to find developer positions that match your profile in Île-de-France"

## Success Metrics for POC
- Can successfully fetch jobs from Pôle Emploi API
- Matching algorithm identifies relevant jobs
- UI clearly displays match scores and reasoning
- Can filter and sort results effectively
- Completes in a weekend with working demo

## Key Considerations
- **Language**: Handle both French and English job descriptions
- **Location**: Support French location formats (regions, departments, communes)
- **CV Format**: French CV formats may differ from US/UK formats
- **Legal**: Use official APIs where available; be careful with scraping ToS

## Next Steps
1. Register for Pôle Emploi API key
2. Set up project structure (monorepo or separate repos)
3. Start with backend API integration
4. Build frontend UI
5. Test with your actual CV/profile
6. Demo and iterate
