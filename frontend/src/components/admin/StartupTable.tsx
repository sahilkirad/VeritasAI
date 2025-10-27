// Startup table component for admin dashboard
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Eye, 
  FileText, 
  Trash2,
  ExternalLink
} from "lucide-react"
import { Startup } from "@/lib/types/startup"
import { StatusBadge } from "./StatusBadge"
import { ScoreBar } from "./ScoreBar"

interface StartupTableProps {
  startups: Startup[];
  onGenerateMemo?: (startupId: string) => void;
  onDelete?: (startupId: string) => void;
  className?: string;
}

type SortField = 'name' | 'stage' | 'status' | 'score' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

export function StartupTable({ 
  startups, 
  onGenerateMemo, 
  onDelete,
  className 
}: StartupTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStartups = [...startups].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.companyName.toLowerCase();
        bValue = b.companyName.toLowerCase();
        break;
      case 'stage':
        const stageOrder = { 'Pre-Seed': 0, 'Seed': 1, 'Series A': 2, 'Series B': 3 };
        aValue = stageOrder[a.stage];
        bValue = stageOrder[b.stage];
        break;
      case 'status':
        const statusOrder = { 'Intake': 0, 'Memo 1': 1, 'Memo 2': 2, 'Memo 3': 3, 'Sent': 4 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
        break;
      case 'score':
        aValue = a.aiScore || 0;
        bValue = b.aiScore || 0;
        break;
      case 'lastUpdated':
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRowClick = (startupId: string) => {
    // Validate startup ID before navigation
    if (!startupId || typeof startupId !== 'string' || startupId.trim() === '') {
      console.error('❌ Invalid startup ID for navigation:', startupId);
      return;
    }
    
    // Encode special characters in the ID for URL safety
    const encodedId = encodeURIComponent(startupId);
    console.log('🔄 Navigating to startup details:', encodedId);
    
    try {
      router.push(`/admin/startups/${encodedId}`);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback: try direct URL navigation
      window.location.href = `/admin/startups/${encodedId}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: string) => {
    if (!value || value === 'Not specified') return value;
    
    // Try to extract number from string
    const match = value.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}K`;
      } else {
        return `$${num.toFixed(0)}`;
      }
    }
    return value;
  };

  if (startups.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No startups found</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Startup Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Founder</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('stage')}
              >
                <div className="flex items-center gap-2">
                  Stage
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Funding Ask</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-2">
                  AI Score
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('lastUpdated')}
              >
                <div className="flex items-center gap-2">
                  Last Updated
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStartups.map((startup) => (
              <TableRow 
                key={startup.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(startup.id)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{startup.companyName}</div>
                    <div className="text-sm text-muted-foreground">
                      {startup.sector.join(', ')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{startup.founderName}</div>
                    <div className="text-sm text-muted-foreground">
                      {startup.founderEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{startup.stage}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(startup.fundingAsk)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={startup.status} type="status" />
                </TableCell>
                <TableCell>
                  <ScoreBar score={startup.aiScore} showLabel={false} className="w-20" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={startup.riskLevel} type="risk" />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(startup.lastUpdated)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRowClick(startup.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/admin/startups/${startup.id}`, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                      {onGenerateMemo && (
                        <DropdownMenuItem onClick={() => onGenerateMemo(startup.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Memo
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(startup.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
