import type { JobFilters } from '../types';

interface FiltersProps {
  filters: JobFilters;
  onFilterChange: (filters: JobFilters) => void;
}

export function Filters({ filters, onFilterChange }: FiltersProps) {
  const handleChange = (key: keyof JobFilters, value: string | number) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filters">
      <h3>Filters</h3>

      <div className="filter-group">
        <label htmlFor="minMatchScore">
          Minimum Match Score: {filters.minMatchScore}%
        </label>
        <input
          type="range"
          id="minMatchScore"
          min="0"
          max="100"
          value={filters.minMatchScore}
          onChange={(e) => handleChange('minMatchScore', parseInt(e.target.value))}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          placeholder="e.g., Paris, Nanterre..."
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="contractType">Contract Type</label>
        <select
          id="contractType"
          value={filters.contractType}
          onChange={(e) => handleChange('contractType', e.target.value)}
        >
          <option value="">All</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Intérim">Intérim</option>
          <option value="Stage">Stage</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sortBy">Sort By</label>
        <select
          id="sortBy"
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <option value="matchScore">Match Score</option>
          <option value="date">Date Posted</option>
          <option value="location">Location</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sortOrder">Order</label>
        <select
          id="sortOrder"
          value={filters.sortOrder}
          onChange={(e) => handleChange('sortOrder', e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
    </div>
  );
}
