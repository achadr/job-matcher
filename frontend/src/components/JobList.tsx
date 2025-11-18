import type { MatchedJob } from '../types';
import { JobCard } from './JobCard';

interface JobListProps {
  jobs: MatchedJob[];
  loading: boolean;
  error: string | null;
}

export function JobList({ jobs, loading, error }: JobListProps) {
  if (loading) {
    return (
      <div className="job-list-status">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-status error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="job-list-status">
        <p>No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      <p className="job-count">{jobs.length} jobs found</p>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
