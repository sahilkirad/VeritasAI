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
import { googleAnalyticsService, type GoogleAnalyticsConfig } from '@/lib/google-analytics';

interface GoogleAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
}

export function GoogleAnalyticsDialog({ open, onOpenChange, onConnected }: GoogleAnalyticsDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [config, setConfig] = useState<GoogleAnalyticsConfig>({
    accountId: '54516992', // Demo Account ID from the screenshot
    propertyId: '213025502',
    measurementId: 'G-PRT33XGJNS'
  });

  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsGoogleLoaded(true);
        };
        document.head.appendChild(script);
      } else if (window.google) {
        setIsGoogleLoaded(true);
      }
    };

    if (open) {
      loadGoogleScript();
    }
  }, [open]);

  const handleGoogleSignIn = async () => {
    setIsConnecting(true);
    setError('');

    try {
      console.log('🔄 Connecting with provided credentials');
      
      // Connect without access token - using mock data
      const connected = await googleAnalyticsService.connect(config);
      
      if (connected) {
        setSuccess(true);
        console.log('✅ Google Analytics connected successfully');
        setTimeout(() => {
          onConnected();
          onOpenChange(false);
          setSuccess(false);
        }, 1500);
      } else {
        setError('Failed to connect. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('❌ Google Analytics connection error:', err);
      setError(err.message || 'An error occurred while connecting to Google Analytics.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInputChange = (field: keyof GoogleAnalyticsConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Google Analytics</DialogTitle>
          <DialogDescription>
            Connect your Google Analytics account to sync data with your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="accountId">Account ID</Label>
            <Input
              id="accountId"
              value={config.accountId}
              onChange={(e) => handleInputChange('accountId', e.target.value)}
              placeholder="54516992"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="propertyId">Property ID</Label>
            <Input
              id="propertyId"
              value={config.propertyId}
              onChange={(e) => handleInputChange('propertyId', e.target.value)}
              placeholder="213025502"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="measurementId">Measurement ID</Label>
            <Input
              id="measurementId"
              value={config.measurementId}
              onChange={(e) => handleInputChange('measurementId', e.target.value)}
              placeholder="G-PRT33XGJNS"
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
            Successfully connected to Google Analytics!
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGoogleSignIn}
            disabled={isConnecting || !config.accountId || !config.propertyId || !config.measurementId}
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
