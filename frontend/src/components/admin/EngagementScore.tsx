// Engagement score component for investors
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EngagementScoreProps {
  score: number;
  dealsSent: number;
  dealsOpened: number;
  dealsReplied: number;
  avgResponseTime: number;
  showDetails?: boolean;
  className?: string;
}

export function EngagementScore({ 
  score, 
  dealsSent, 
  dealsOpened, 
  dealsReplied, 
  avgResponseTime,
  showDetails = false,
  className 
}: EngagementScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default" as const;
    if (score >= 60) return "secondary" as const;
    return "destructive" as const;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "High";
    if (score >= 60) return "Medium";
    return "Low";
  };

  const openRate = dealsSent > 0 ? (dealsOpened / dealsSent) * 100 : 0;
  const replyRate = dealsSent > 0 ? (dealsReplied / dealsSent) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Engagement Score</span>
        <Badge variant={getScoreBadgeVariant(score)} className="text-xs">
          {getScoreLabel(score)}
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Progress value={score} className="flex-1 h-2" />
          <span className={cn("text-sm font-medium min-w-[3rem] text-right", getScoreColor(score))}>
            {score}%
          </span>
        </div>
        
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>Open Rate: {openRate.toFixed(0)}%</div>
            <div>Reply Rate: {replyRate.toFixed(0)}%</div>
            <div>Deals Sent: {dealsSent}</div>
            <div>Avg Response: {avgResponseTime.toFixed(1)}d</div>
          </div>
        )}
      </div>
    </div>
  );
}
