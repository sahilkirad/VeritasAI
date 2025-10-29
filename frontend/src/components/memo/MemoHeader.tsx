'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/api';

interface MemoHeaderProps {
  memoData: any;
  diligenceData: any;
  onTriggerDiligence: () => void;
}

export default function MemoHeader({ memoData, diligenceData, onTriggerDiligence }: MemoHeaderProps) {
  const { toast } = useToast();

  const handleTriggerDiligence = async () => {
    if (!memoData?.id) {
      toast({
        title: "Error",
        description: "No memo data available to trigger diligence",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.TRIGGER_DILIGENCE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          memoId: memoData.id,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger diligence: ${response.status}`);
      }

      const result = await response.json();

      toast({
        title: "Diligence Triggered",
        description: "Due diligence analysis has been started. This may take a few minutes.",
      });

      // Refresh the page after a short delay to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error triggering diligence:', error);
      toast({
        title: "Error",
        description: "Failed to trigger diligence. Please try again.",
        variant: "destructive",
      });
    }
  };

  const memo1 = memoData?.memo_1 || {};

  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <h1 className="text-xl font-bold">Deal Memo</h1>
        <p className="text-muted-foreground text-xs">
          AI-powered analysis for {memo1.title || memoData?.filename || 'Unknown Company'}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0">
          {memoData?.memo_1 ? 'Complete' : 'Processing'}
        </Badge>
        <Button
          onClick={handleTriggerDiligence}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
        >
          Run Diligence
        </Button>
      </div>
    </div>
  );
}
