import type { UserProfile } from '../types';

interface SkillChipsProps {
  profile: UserProfile;
  highlightedSkills?: string[];
}

export function SkillChips({ profile, highlightedSkills = [] }: SkillChipsProps) {
  const highlightedSet = new Set(highlightedSkills.map(s => s.toLowerCase()));

  return (
    <div className="skill-chips">
      <h3>Your Skills ({profile.skills.length})</h3>
      <div className="chips-container">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className={`chip ${highlightedSet.has(skill.toLowerCase()) ? 'highlighted' : ''}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
