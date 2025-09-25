'use client';

import { Button } from "@/components/ui/button";

// Updated to handle availableMemos prop

interface MemoDebugProps {
  user: any;
  loading: boolean;
  hasRecentData: boolean;
  memoData: any;
  diligenceData: any;
  availableMemos?: any[];
  onRefresh: () => void;
  onTestMemo: () => void;
}

export default function MemoDebug({ 
  user, 
  loading, 
  hasRecentData, 
  memoData, 
  diligenceData, 
  availableMemos = [], 
  onRefresh, 
  onTestMemo 
}: MemoDebugProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-semibold mb-2">Debug Information</h3>
      <div className="text-xs space-y-2">
        <div><strong>User:</strong> {user ? user.email : 'Not logged in'}</div>
        <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
        <div><strong>Has Recent Data:</strong> {hasRecentData ? 'Yes' : 'No'}</div>
        <div><strong>Available Memos:</strong> {availableMemos.length}</div>
        {memoData && (
          <>
            <div><strong>Document ID:</strong> {memoData.id}</div>
            <div><strong>Filename:</strong> {memoData.filename}</div>
            <div><strong>Has Memo Data:</strong> {memoData.memo_1 ? 'Yes' : 'No'}</div>
            <div><strong>Has Diligence Data:</strong> {diligenceData ? 'Yes' : 'No'}</div>
            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Raw Memo Data</summary>
              <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(memoData.memo_1, null, 2)}
              </pre>
            </details>
            {diligenceData && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">Raw Diligence Data</summary>
                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(diligenceData, null, 2)}
                </pre>
              </details>
            )}
          </>
        )}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={onRefresh}
            size="sm"
            variant="outline"
          >
            Refresh Data
          </Button>
          <Button
            onClick={onTestMemo}
            size="sm"
            variant="outline"
            className="bg-blue-100"
          >
            Test Memo Display
          </Button>
        </div>
      </div>
    </div>
  );
}
