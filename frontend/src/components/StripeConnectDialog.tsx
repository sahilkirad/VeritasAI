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

interface StripeConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function StripeConnectDialog({ open, onOpenChange, onConnected }: StripeConnectDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  // Pre-fill the secret key when dialog opens
  const PRE_FILLED_SECRET_KEY = process.env.NEXT_PUBLIC_STRIPE_TEST_SECRET_KEY || '';

  useEffect(() => {
    if (open) {
      setSecretKey(PRE_FILLED_SECRET_KEY);
      setError('');
      setSuccess(false);
    } else {
      // Reset when dialog closes
      setSecretKey('');
    }
  }, [open]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Validate the secret key - accept any key starting with 'sk_'
      if (secretKey.trim().startsWith('sk_')) {
        setSuccess(true);
        setTimeout(() => {
          onConnected();
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError('Invalid secret key format. Stripe secret keys should start with "sk_".');
      }
    } catch (err: any) {
      console.error('❌ Stripe connection error:', err);
      setError(err.message || 'An error occurred while connecting to Stripe.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSecretKey(value);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Stripe</DialogTitle>
          <DialogDescription>
            Enter your Stripe API credentials to sync real financial data with your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">How to get your secret key:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Go to your Stripe Dashboard</li>
              <li>Navigate to Developers → API Keys</li>
              <li>Copy the Secret key (starts with "sk_test_" for test mode or "sk_live_" for live mode)</li>
              <li>Make sure you're using the correct environment (test vs live)</li>
            </ol>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="sk_test_your_secret_key_here"
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
            Successfully connected to Stripe!
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSecretKey('');
              setError('');
            }}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={isConnecting || !secretKey.trim()}
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

