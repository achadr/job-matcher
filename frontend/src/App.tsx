import { useState, useEffect } from 'react';
import { fetchJobMatches } from './services/api';
import { SkillChips } from './components/SkillChips';
import { Filters } from './components/Filters';
import { JobList } from './components/JobList';
import type { MatchedJob, UserProfile, JobFilters } from './types';
import './App.css';

function App() {
  const [jobs, setJobs] = useState<MatchedJob[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    minMatchScore: 0,
    location: '',
    contractType: '',
    sortBy: 'matchScore',
    sortOrder: 'desc',
  });

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchJobMatches(filters);
      setJobs(response.jobs);
      setProfile(response.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters]);

  // Get all matched skills across all jobs for highlighting
  const allMatchedSkills = [...new Set(jobs.flatMap((job) => job.matchedSkills))];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Job Matcher</h1>
        <p>Find developer jobs that match your skills in Ile-de-France</p>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          {profile && (
            <SkillChips profile={profile} highlightedSkills={allMatchedSkills} />
          )}
          <Filters filters={filters} onFilterChange={setFilters} />
        </aside>

        <section className="content">
          <JobList jobs={jobs} loading={loading} error={error} />
        </section>
      </main>
    </div>
  );
}

export default App;
