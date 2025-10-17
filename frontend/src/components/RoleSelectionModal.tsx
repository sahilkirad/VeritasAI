'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'investor' | 'founder'>('investor');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleRoleSelection = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle(selectedRole);
      router.push('/dashboard');
      onClose();
    } catch (error) {
      console.error('Error setting role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Select Your Role</CardTitle>
          <CardDescription>
            Please select whether you are an investor or founder to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'investor' | 'founder')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="investor" id="investor" />
              <Label htmlFor="investor">Investor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="founder" id="founder" />
              <Label htmlFor="founder">Founder</Label>
            </div>
          </RadioGroup>
          <div className="flex gap-2">
            <Button onClick={handleRoleSelection} disabled={isLoading} className="flex-1">
              {isLoading ? 'Setting up...' : 'Continue'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
