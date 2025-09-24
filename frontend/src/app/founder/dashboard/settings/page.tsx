import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function FounderSettingsPage() {
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
              <Input id="founder-name" defaultValue="Priya Founder" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founder-email">Email</Label>
              <Input id="founder-email" type="email" defaultValue="priya@quantumleap.ai" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" defaultValue="QuantumLeap AI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-website">Company Website</Label>
              <Input id="company-website" defaultValue="https://quantumleap.ai" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn Profile URL</Label>
            <Input id="linkedin-url" placeholder="https://linkedin.com/in/..." />
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
