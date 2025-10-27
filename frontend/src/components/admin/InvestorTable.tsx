// Investor table component for admin dashboard
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
  Mail, 
  ExternalLink,
  Phone,
  Building2,
  Target
} from "lucide-react"
import { Investor } from "@/lib/types/investor"
import { EngagementScore } from "./EngagementScore"

interface InvestorTableProps {
  investors: Investor[];
  onSendDeal?: (investorId: string) => void;
  onEdit?: (investorId: string) => void;
  onDelete?: (investorId: string) => void;
  className?: string;
}

type SortField = 'name' | 'firm' | 'dealsSent' | 'engagementScore' | 'lastActive';
type SortDirection = 'asc' | 'desc';

export function InvestorTable({ 
  investors, 
  onSendDeal, 
  onEdit,
  onDelete,
  className 
}: InvestorTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>('engagementScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedInvestors = [...investors].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'firm':
        aValue = a.firm.toLowerCase();
        bValue = b.firm.toLowerCase();
        break;
      case 'dealsSent':
        aValue = a.dealsSent;
        bValue = b.dealsSent;
        break;
      case 'engagementScore':
        aValue = a.engagementScore;
        bValue = b.engagementScore;
        break;
      case 'lastActive':
        aValue = new Date(a.lastActive).getTime();
        bValue = new Date(b.lastActive).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleRowClick = (investorId: string) => {
    router.push(`/admin/investors/${investorId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  if (investors.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No investors found</h3>
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
                  Investor Name
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Firm</TableHead>
              <TableHead>Sector Focus</TableHead>
              <TableHead>Check Size</TableHead>
              <TableHead>Deals Sent</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('engagementScore')}
              >
                <div className="flex items-center gap-2">
                  Engagement
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('lastActive')}
              >
                <div className="flex items-center gap-2">
                  Last Active
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedInvestors.map((investor) => (
              <TableRow 
                key={investor.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(investor.id)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{investor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {investor.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{investor.firm}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {investor.sectorFocus.slice(0, 2).map((sector, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                    {investor.sectorFocus.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{investor.sectorFocus.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(investor.checkSizeMin)} - {formatCurrency(investor.checkSizeMax)}
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-semibold">{investor.dealsSent}</div>
                    <div className="text-xs text-muted-foreground">
                      {investor.dealsOpened} opened
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <EngagementScore
                    score={investor.engagementScore}
                    dealsSent={investor.dealsSent}
                    dealsOpened={investor.dealsOpened}
                    dealsReplied={investor.dealsReplied}
                    avgResponseTime={investor.avgResponseTime}
                    showDetails={false}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={investor.status === 'Active' ? 'default' : 'secondary'}
                    className={
                      investor.status === 'Active' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                        : ''
                    }
                  >
                    {investor.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(investor.lastActive)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRowClick(investor.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/admin/investors/${investor.id}`, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`mailto:${investor.email}`)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      {investor.phone && (
                        <DropdownMenuItem onClick={() => window.open(`tel:${investor.phone}`)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                      )}
                      {onSendDeal && (
                        <DropdownMenuItem onClick={() => onSendDeal(investor.id)}>
                          <Target className="h-4 w-4 mr-2" />
                          Send Deal
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(investor.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(investor.id)}
                          className="text-destructive"
                        >
                          <MoreHorizontal className="h-4 w-4 mr-2" />
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
