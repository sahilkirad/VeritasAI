"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { useState, useEffect } from "react"

export default function FounderSettingsPage() {
  const { userProfile } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    companyWebsite: '',
    linkedinProfile: ''
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.displayName || '',
        email: userProfile.email || '',
        companyName: userProfile.companyName || '',
        companyWebsite: userProfile.companyWebsite || '',
        linkedinProfile: userProfile.linkedinProfile || ''
      })
    }
  }, [userProfile])
  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal and company information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founder-name">Full Name</Label>
              <Input 
                id="founder-name" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founder-email">Email</Label>
              <Input 
                id="founder-email" 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input 
                id="company-name" 
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Company Website</Label>
              <Input 
                id="company-website" 
                value={formData.companyWebsite}
                onChange={(e) => setFormData({...formData, companyWebsite: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <Input 
              id="linkedin-url" 
              value={formData.linkedinProfile}
              onChange={(e) => setFormData({...formData, linkedinProfile: e.target.value})}
              placeholder="https://linkedin.com/in/..." 
            />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive notifications from Veritas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="profile-views" className="font-medium">
                Profile Views
              </Label>
              <p className="text-sm text-muted-foreground">Notify me when an investor views my profile.</p>
            </div>
            <Switch id="profile-views" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="document-downloads" className="font-medium">
                Document Downloads
              </Label>
              <p className="text-sm text-muted-foreground">Notify me when an investor downloads my documents.</p>
            </div>
            <Switch id="document-downloads" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="weekly-summary" className="font-medium">
                Weekly Summary
              </Label>
              <p className="text-sm text-muted-foreground">Send me a weekly summary of all activity.</p>
            </div>
            <Switch id="weekly-summary" />
          </div>
          <Button>Update Notifications</Button>
        </CardContent>
      </Card>
    </div>
  )
}
