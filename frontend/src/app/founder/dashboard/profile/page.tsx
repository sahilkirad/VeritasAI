"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-new';
import { Plus, X, Save, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface EducationEntry {
  institution: string;
  degree: string;
  year: number;
}

interface PreviousCompany {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface FounderProfile {
  fullName: string;
  linkedinUrl: string;
  professionalBackground: string;
  education: EducationEntry[];
  previousCompanies: PreviousCompany[];
  yearsOfExperience: string;
  teamSize: string;
  expertise: string[];
  completionStatus: string;
  createdAt: any;
  lastUpdated: any;
}

// Validation function for profile completion
const validateProfileCompletion = (profileData: any): boolean => {
  // Check all required fields
  const requiredFields = [
    'fullName',
    'linkedinUrl',
    'professionalBackground',
    'yearsOfExperience',
    'teamSize'
  ];
  
  for (const field of requiredFields) {
    if (!profileData[field] || profileData[field].toString().trim() === '') {
      return false;
    }
  }
  
  // Check at least one education entry
  if (!profileData.education || profileData.education.length === 0) {
    return false;
  }
  
  // Check at least one previous company entry
  if (!profileData.previousCompanies || profileData.previousCompanies.length === 0) {
    return false;
  }
  
  // Check at least one expertise entry
  if (!profileData.expertise || profileData.expertise.length === 0) {
    return false;
  }
  
  return true;
};

export default function FounderProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [profile, setProfile] = useState<FounderProfile>({
    fullName: '',
    linkedinUrl: '',
    professionalBackground: '',
    education: [],
    previousCompanies: [],
    yearsOfExperience: '',
    teamSize: '',
    expertise: [],
    completionStatus: 'incomplete',
    createdAt: null,
    lastUpdated: null
  });

  const [newEducation, setNewEducation] = useState<EducationEntry>({
    institution: '',
    degree: '',
    year: new Date().getFullYear()
  });

  const [newCompany, setNewCompany] = useState<PreviousCompany>({
    company: '',
    role: '',
    duration: '',
    description: ''
  });

  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    calculateProgress();
  }, [profile]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileRef = doc(db, 'founderProfiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setProfile({
          fullName: data.fullName || '',
          linkedinUrl: data.linkedinUrl || '',
          professionalBackground: data.professionalBackground || '',
          education: data.education || [],
          previousCompanies: data.previousCompanies || [],
          yearsOfExperience: data.yearsOfExperience || '',
          teamSize: data.teamSize || '',
          expertise: data.expertise || [],
          completionStatus: data.completionStatus || 'incomplete',
          createdAt: data.createdAt || null,
          lastUpdated: data.lastUpdated || null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const fields = [
      profile.fullName,
      profile.linkedinUrl,
      profile.professionalBackground,
      profile.yearsOfExperience,
      profile.teamSize,
      profile.expertise.length > 0
    ];
    
    const completed = fields.filter(field => field && field.toString().trim() !== '').length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProgress(percentage);
  };

  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const profileRef = doc(db, 'founderProfiles', user.uid);
      const now = new Date();
      
      // Determine completion status
      const isComplete = validateProfileCompletion(profile);
      
      const profileData = {
        uid: user.uid,
        email: user.email,
        fullName: profile.fullName,
        linkedinUrl: profile.linkedinUrl,
        professionalBackground: profile.professionalBackground,
        education: profile.education,
        previousCompanies: profile.previousCompanies,
        yearsOfExperience: profile.yearsOfExperience,
        teamSize: profile.teamSize,
        expertise: profile.expertise,
        completionStatus: isComplete ? "complete" : "incomplete",
        lastUpdated: now.toISOString(),
        createdAt: profile.createdAt || now.toISOString()
      };

      await setDoc(profileRef, profileData, { merge: true });
      
      toast({
        title: "Success",
        description: isComplete 
          ? "Profile saved and marked as complete!" 
          : "Profile saved. Complete all fields to enable full diligence.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }));
      setNewEducation({ institution: '', degree: '', year: new Date().getFullYear() });
    }
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addCompany = () => {
    if (newCompany.company && newCompany.role) {
      setProfile(prev => ({
        ...prev,
        previousCompanies: [...prev.previousCompanies, { ...newCompany }]
      }));
      setNewCompany({ company: '', role: '', duration: '', description: '' });
    }
  };

  const removeCompany = (index: number) => {
    setProfile(prev => ({
      ...prev,
      previousCompanies: prev.previousCompanies.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile(prev => ({
        ...prev,
        expertise: [...prev.expertise, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Founder Profile</h1>
        <p className="text-muted-foreground">
          Complete your profile to enable advanced diligence validation for investors.
        </p>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Profile Completion</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your personal and professional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL *</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={profile.linkedinUrl}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="professionalBackground">Professional Background *</Label>
              <Textarea
                id="professionalBackground"
                value={profile.professionalBackground}
                onChange={(e) => setProfile(prev => ({ ...prev, professionalBackground: e.target.value }))}
                placeholder="Describe your professional background, key achievements, and expertise..."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {profile.professionalBackground.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader>
            <CardTitle>Education History</CardTitle>
            <CardDescription>
              Your educational background and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.education.map((edu, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Institution</Label>
                    <Input value={edu.institution} readOnly />
                  </div>
                  <div>
                    <Label>Degree</Label>
                    <Input value={edu.degree} readOnly />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input value={edu.year} readOnly />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeEducation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={newEducation.institution}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="University/College name"
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="Degree/Certification"
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={newEducation.year}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    placeholder="Graduation year"
                  />
                </div>
              </div>
              <Button onClick={addEducation} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Companies</CardTitle>
            <CardDescription>
              Your work experience and career history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.previousCompanies.map((company, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{company.company}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeCompany(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Input value={company.role} readOnly />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input value={company.duration} readOnly />
                  </div>
                </div>
                <div className="mt-2">
                  <Label>Description</Label>
                  <Textarea value={company.description} readOnly rows={2} />
                </div>
              </div>
            ))}

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company</Label>
                  <Input
                    value={newCompany.company}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input
                    value={newCompany.role}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Your role/position"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input
                    value={newCompany.duration}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., Jan 2020 - Dec 2022"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your role and achievements"
                    rows={2}
                  />
                </div>
              </div>
              <Button onClick={addCompany} className="mt-4" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Experience & Team */}
        <Card>
          <CardHeader>
            <CardTitle>Experience & Team</CardTitle>
            <CardDescription>
              Your experience level and current team size
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                <Select
                  value={profile.yearsOfExperience}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, yearsOfExperience: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10-15">10-15 years</SelectItem>
                    <SelectItem value="15+">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamSize">Team/Company Size *</Label>
                <Select
                  value={profile.teamSize}
                  onValueChange={(value) => setProfile(prev => ({ ...prev, teamSize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="just-me">Just me</SelectItem>
                    <SelectItem value="2-5">2-5 people</SelectItem>
                    <SelectItem value="6-10">6-10 people</SelectItem>
                    <SelectItem value="11-25">11-25 people</SelectItem>
                    <SelectItem value="26-50">26-50 people</SelectItem>
                    <SelectItem value="51-100">51-100 people</SelectItem>
                    <SelectItem value="100+">100+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expertise/Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Expertise & Skills</CardTitle>
            <CardDescription>
              Your areas of expertise and technical skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.expertise.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(index)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill or expertise"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill();
                  }
                }}
              />
              <Button onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Completion Status Indicator */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            {validateProfileCompletion(profile) ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Profile Complete</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">Profile Incomplete - Fill all required fields</span>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveProfile}
            disabled={saving}
            className="min-w-32"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
