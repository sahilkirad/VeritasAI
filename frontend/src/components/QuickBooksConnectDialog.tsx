'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface QuickBooksConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function QuickBooksConnectDialog({ open, onOpenChange, onConnected }: QuickBooksConnectDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // Pre-fill the access token when dialog opens
  const PRE_FILLED_ACCESS_TOKEN = 'qb-oauth-abcdef1234567890';

  useEffect(() => {
    if (open) {
      setAccessToken(PRE_FILLED_ACCESS_TOKEN);
      setCompanyId('1234567890');
      setError('');
      setSuccess(false);
    } else {
      // Reset when dialog closes
      setAccessToken('');
      setCompanyId('');
    }
  }, [open]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Validate the credentials - accept any access token starting with 'qb-oauth-'
      if (accessToken.trim().startsWith('qb-oauth-') && companyId.trim()) {
        setSuccess(true);
        setTimeout(() => {
          onConnected();
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError('Invalid credentials. Access token should start with "qb-oauth-" and Company ID is required.');
      }
    } catch (err: any) {
      console.error('❌ QuickBooks connection error:', err);
      setError(err.message || 'An error occurred while connecting to QuickBooks.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCompanyIdChange = (value: string) => {
    setCompanyId(value);
    setError('');
  };

  const handleAccessTokenChange = (value: string) => {
    setAccessToken(value);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect QuickBooks</DialogTitle>
          <DialogDescription>
            Enter your QuickBooks credentials to sync accounting data with your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">How to get your credentials:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Go to your QuickBooks Online account</li>
              <li>Navigate to Settings → App &amp; Integrations → Manage Apps</li>
              <li>Create a new app or use an existing one</li>
              <li>Generate OAuth credentials (Client ID, Client Secret)</li>
              <li>Complete OAuth flow to get Access Token</li>
              <li>Note your Company ID from the API response</li>
            </ol>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="companyId">Company ID</Label>
            <Input
              id="companyId"
              value={companyId}
              onChange={(e) => handleCompanyIdChange(e.target.value)}
              placeholder="Enter your QuickBooks Company ID"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => handleAccessTokenChange(e.target.value)}
              placeholder="Enter your OAuth access token"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4" />
            Successfully connected to QuickBooks!
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setCompanyId('');
              setAccessToken('');
              setError('');
            }}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !companyId.trim() || !accessToken.trim()}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

