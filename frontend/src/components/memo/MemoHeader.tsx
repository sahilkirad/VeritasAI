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
    <div className="space-y-2">
      {/* Red Instructional Banner */}
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-red-800">
            ⚠️ Important Instructions:
          </p>
          <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
            <li>
              If any field is missing, marked as "N/A," or unspecified, run AI validation to verify the data from public online sources and confirm whether it matches the information provided in the pitch deck.
            </li>
            <li>
              First, run <strong>Diligence Hub</strong> by clicking the <strong>"Run Diligence"</strong> button, then return here and click <strong>"Refresh"</strong> button on Memo2.
            </li>
          </ul>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex-1">
          <h1 className="text-xl font-bold">Deal Memo</h1>
          <p className="text-muted-foreground text-xs">
            AI-powered analysis for {memo1.title || memoData?.filename || 'Unknown Company'}
          </p>
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium">
              ⏳ Please wait for 5 to 6 Minutes to load
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-1 py-0">
            {memoData?.memo_1 ? 'Complete' : 'Processing'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
