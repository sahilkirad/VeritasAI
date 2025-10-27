// Portfolio view component for investor details
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, Calendar, DollarSign } from "lucide-react"
import { PortfolioCompany } from "@/lib/types/investor"

interface PortfolioViewProps {
  portfolio: PortfolioCompany[];
  className?: string;
}

export function PortfolioView({ portfolio, className }: PortfolioViewProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'Exited':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Failed':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return '';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Pre-Seed':
      case 'Seed':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'Series A':
      case 'Series B':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'Series C':
      case 'Series D':
      case 'Series E':
      case 'Series F':
      case 'Series G':
      case 'Series H':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (portfolio.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Portfolio Companies
          </CardTitle>
          <CardDescription>
            Investment portfolio and track record
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Portfolio Data</h3>
          <p className="text-muted-foreground">
            Portfolio information will be displayed here when available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Portfolio Companies ({portfolio.length})
        </CardTitle>
        <CardDescription>
          Investment portfolio and track record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {portfolio.map((company) => (
            <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{company.name}</h4>
                  <Badge variant="outline" className={getStageColor(company.stage)}>
                    {company.stage}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(company.status)}>
                    {company.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Invested: {formatCurrency(company.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(company.investmentDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{company.sector}</span>
                  </div>
                </div>
              </div>
              
              {company.website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {/* Portfolio Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {portfolio.filter(c => c.status === 'Active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {portfolio.filter(c => c.status === 'Exited').length}
              </div>
              <div className="text-sm text-muted-foreground">Exited</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolio.reduce((sum, c) => sum + c.amount, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
