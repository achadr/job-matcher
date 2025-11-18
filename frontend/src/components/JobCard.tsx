import type { MatchedJob } from '../types';

interface JobCardProps {
  job: MatchedJob;
}

export function JobCard({ job }: JobCardProps) {
  const scoreColor = job.matchScore >= 30 ? 'high' : job.matchScore >= 15 ? 'medium' : 'low';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <h3 className="job-title">{job.title}</h3>
          <p className="job-company">{job.company}</p>
        </div>
        <div className={`match-score ${scoreColor}`}>
          <span className="score-value">{job.matchScore}%</span>
          <span className="score-label">match</span>
        </div>
      </div>

      <div className="job-meta">
        <span className="job-location">{job.location}</span>
        {job.contractType && <span className="job-contract">{job.contractType}</span>}
        {job.salary && <span className="job-salary">{job.salary}</span>}
        <span className="job-date">{formatDate(job.datePosted)}</span>
      </div>

      <div className="matched-skills">
        <strong>Matched skills ({job.matchedSkills.length}):</strong>
        <div className="matched-skills-list">
          {job.matchedSkills.length > 0 ? (
            job.matchedSkills.map((skill) => (
              <span key={skill} className="matched-skill">
                {skill}
              </span>
            ))
          ) : (
            <span className="no-skills">No direct skill matches</span>
          )}
        </div>
      </div>

      <p className="job-description">
        {job.description.length > 300
          ? `${job.description.substring(0, 300)}...`
          : job.description}
      </p>

      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="job-link"
      >
        View Original Posting
      </a>
    </div>
  );
}
