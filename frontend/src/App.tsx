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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchJobMatches({ filters, page, pageSize });
      setJobs(response.jobs);
      setProfile(response.profile);
      setTotalJobs(response.totalJobs);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters, page, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

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
          <Filters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <section className="content">
          <JobList jobs={jobs} loading={loading} error={error} />

          {!loading && !error && totalPages > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {jobs.length} of {totalJobs} jobs (Page {page} of {totalPages})
              </div>

              <div className="pagination-controls">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-page">Page {page}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Last
                </button>
              </div>

              <div className="page-size-selector">
                <label>Per page: </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
