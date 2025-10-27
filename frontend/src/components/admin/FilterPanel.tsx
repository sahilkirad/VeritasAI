// Filter panel component for startups list
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"
import { FilterOptions } from "@/lib/types/startup"

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  filterOptions: {
    stages: string[];
    statuses: string[];
    sectors: string[];
    riskLevels: string[];
  };
  className?: string;
}

export function FilterPanel({ 
  filters, 
  onFiltersChange, 
  filterOptions,
  className 
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStageChange = (value: string) => {
    const stages = value ? [value] : [];
    onFiltersChange({ ...filters, stage: stages });
  };

  const handleStatusChange = (value: string) => {
    const statuses = value ? [value] : [];
    onFiltersChange({ ...filters, status: statuses });
  };

  const handleSectorChange = (value: string) => {
    const sectors = value ? [value] : [];
    onFiltersChange({ ...filters, sector: sectors });
  };

  const handleRiskLevelChange = (value: string) => {
    const riskLevels = value ? [value] : [];
    onFiltersChange({ ...filters, riskLevel: riskLevels });
  };

  const handleScoreRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    if (numValue !== undefined) {
      onFiltersChange({
        ...filters,
        scoreRange: {
          min: filters.scoreRange?.min || 0,
          max: filters.scoreRange?.max || 10,
          [field]: numValue
        }
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterOptions];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return true;
    return value !== undefined && value !== '';
  });

  return (
    <div className={className}>
      {/* Search and Toggle */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search startups, founders, or emails..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          {/* Stage Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Stage</label>
            <Select value={filters.stage?.[0] || ''} onValueChange={handleStageChange}>
              <SelectTrigger>
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All stages</SelectItem>
                {filterOptions.stages.map(stage => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status?.[0] || ''} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {filterOptions.statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sector</label>
            <Select value={filters.sector?.[0] || ''} onValueChange={handleSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="All sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sectors</SelectItem>
                {filterOptions.sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Risk Level</label>
            <Select value={filters.riskLevel?.[0] || ''} onValueChange={handleRiskLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="All risk levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All risk levels</SelectItem>
                {filterOptions.riskLevels.map(risk => (
                  <SelectItem key={risk} value={risk}>
                    {risk}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Score Range Filter */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-2 block">AI Score Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                min="0"
                max="10"
                value={filters.scoreRange?.min || ''}
                onChange={(e) => handleScoreRangeChange('min', e.target.value)}
                className="w-20"
              />
              <span className="flex items-center text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                min="0"
                max="10"
                value={filters.scoreRange?.max || ''}
                onChange={(e) => handleScoreRangeChange('max', e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
          {filters.stage?.map(stage => (
            <Badge key={stage} variant="secondary" className="flex items-center gap-1">
              Stage: {stage}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleStageChange('')}
              />
            </Badge>
          ))}
          {filters.status?.map(status => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              Status: {status}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleStatusChange('')}
              />
            </Badge>
          ))}
          {filters.sector?.map(sector => (
            <Badge key={sector} variant="secondary" className="flex items-center gap-1">
              Sector: {sector}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleSectorChange('')}
              />
            </Badge>
          ))}
          {filters.riskLevel?.map(risk => (
            <Badge key={risk} variant="secondary" className="flex items-center gap-1">
              Risk: {risk}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleRiskLevelChange('')}
              />
            </Badge>
          ))}
          {filters.scoreRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Score: {filters.scoreRange.min}-{filters.scoreRange.max}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, scoreRange: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
