// Score bar component for AI scores
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ScoreBarProps {
  score?: number;
  maxScore?: number;
  showLabel?: boolean;
  className?: string;
}

export function ScoreBar({ 
  score, 
  maxScore = 10, 
  showLabel = true, 
  className 
}: ScoreBarProps) {
  if (score === undefined || score === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Progress value={0} className="flex-1" />
        {showLabel && (
          <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
            N/A
          </span>
        )}
      </div>
    );
  }

  const percentage = (score / maxScore) * 100;
  
  const getScoreColor = (score: number) => {
    if (score < 4) return "bg-red-500";
    if (score < 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score < 4) return "text-red-600";
    if (score < 7) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 relative">
        <Progress 
          value={percentage} 
          className="h-2"
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-2 rounded-full transition-all duration-300",
            getScoreColor(score)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          "text-sm font-medium min-w-[3rem] text-right",
          getScoreTextColor(score)
        )}>
          {score.toFixed(1)}/{maxScore}
        </span>
      )}
    </div>
  );
}
