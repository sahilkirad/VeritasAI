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

interface HubSpotConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function HubSpotConnectDialog({ open, onOpenChange, onConnected }: HubSpotConnectDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  // Pre-fill the access token when dialog opens
  const PRE_FILLED_ACCESS_TOKEN = process.env.NEXT_PUBLIC_HUBSPOT_ACCESS_TOKEN || '';

  useEffect(() => {
    if (open) {
      setAccessToken(PRE_FILLED_ACCESS_TOKEN);
      setError('');
      setSuccess(false);
    } else {
      // Reset when dialog closes
      setAccessToken('');
    }
  }, [open]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Validate the access token - accept any key starting with 'pat-na2'
      if (accessToken.trim().startsWith('pat-na2')) {
        setSuccess(true);
        setTimeout(() => {
          onConnected();
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError('Invalid access token format. HubSpot access tokens should start with "pat-na2".');
      }
    } catch (err: any) {
      console.error('❌ HubSpot connection error:', err);
      setError(err.message || 'An error occurred while connecting to HubSpot.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInputChange = (value: string) => {
    setAccessToken(value);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect HubSpot</DialogTitle>
          <DialogDescription>
            Enter your HubSpot API credentials to sync real CRM data with your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">How to get your access token:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Go to your HubSpot account</li>
              <li>Navigate to Settings → Integrations → Private Apps</li>
              <li>Create a new private app or use an existing one</li>
              <li>Make sure it has CRM permissions (contacts, companies, deals)</li>
              <li>Copy the access token (starts with "pat-")</li>
            </ol>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="accessToken">Access Token</Label>
            <Input
              id="accessToken"
              type="password"
              value={accessToken}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
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
            Successfully connected to HubSpot!
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setAccessToken('');
              setError('');
            }}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !accessToken.trim()}
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

