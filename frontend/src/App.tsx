import { useState, useEffect, useMemo } from 'react';
import { fetchJobMatches } from './services/api';
import { SkillChips } from './components/SkillChips';
import { Filters } from './components/Filters';
import { JobList } from './components/JobList';
import type { MatchedJob, UserProfile, JobFilters } from './types';
import './App.css';

function App() {
  const [allJobs, setAllJobs] = useState<MatchedJob[]>([]);
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

  // Fetch all jobs once
  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchJobMatches();
      setAllJobs(response.jobs);
      setProfile(response.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Apply filters and sorting on frontend
  const filteredJobs = useMemo(() => {
    let result = [...allJobs];

    // Filter by minimum match score
    if (filters.minMatchScore > 0) {
      result = result.filter(job => job.matchScore >= filters.minMatchScore);
    }

    // Filter by location
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(job =>
        job.location.toLowerCase().includes(locationLower)
      );
    }

    // Filter by contract type
    if (filters.contractType) {
      result = result.filter(job =>
        job.contractType?.toLowerCase() === filters.contractType.toLowerCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
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
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [allJobs, filters]);

  // Paginate filtered results
  const totalJobs = filteredJobs.length;
  const totalPages = Math.ceil(totalJobs / pageSize);
  const paginatedJobs = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredJobs.slice(startIndex, startIndex + pageSize);
  }, [filteredJobs, page, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Get all matched skills across displayed jobs for highlighting
  const allMatchedSkills = [...new Set(paginatedJobs.flatMap((job) => job.matchedSkills))];

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
          <JobList jobs={paginatedJobs} loading={loading} error={error} />

          {!loading && !error && totalPages > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {paginatedJobs.length} of {totalJobs} jobs (Page {page} of {totalPages})
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
