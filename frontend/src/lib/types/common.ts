export interface FilterOptions {
  search?: string;
  stage?: string[];
  status?: string[];
  scoreRange?: {
    min: number;
    max: number;
  };
  sector?: string[];
  riskLevel?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
