"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Shield, Bot, Database, Users, Mail, Save } from "lucide-react"
import Link from "next/link"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: "Veritas AI",
    adminEmail: "admin@veritas.ai",
    timezone: "UTC",
    language: "en",
    
    // AI Settings
    aiEnabled: true,
    autoGenerateMemos: true,
    aiConfidenceThreshold: 0.8,
    maxRetries: 3,
    
    // Security Settings
    requireTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    allowSelfRegistration: true,
    
    // Notification Settings
    emailNotifications: true,
    slackIntegration: false,
    webhookUrl: "",
    
    // Data Settings
    dataRetentionDays: 365,
    autoBackup: true,
    exportFormat: "json"
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    console.log('Saving settings:', settings)
    // TODO: Implement settings save
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure system settings and manage platform preferences
            </p>
          </div>
        </div>
        
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic platform configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => handleSettingChange('platformName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Configuration
              </CardTitle>
              <CardDescription>
                Configure AI agents and automation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Agents</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow AI agents to process and analyze data
                    </p>
                  </div>
                  <Switch
                    checked={settings.aiEnabled}
                    onCheckedChange={(checked) => handleSettingChange('aiEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate Memos</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate memos when data is available
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoGenerateMemos}
                    onCheckedChange={(checked) => handleSettingChange('autoGenerateMemos', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="aiConfidenceThreshold">AI Confidence Threshold</Label>
                  <Input
                    id="aiConfidenceThreshold"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.aiConfidenceThreshold}
                    onChange={(e) => handleSettingChange('aiConfidenceThreshold', parseFloat(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum confidence level for AI recommendations (0.0 - 1.0)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxRetries}
                    onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of retries for failed AI operations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Force all users to enable 2FA
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange('requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="32"
                    value={settings.passwordMinLength}
                    onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Self Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register themselves
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowSelfRegistration}
                    onCheckedChange={(checked) => handleSettingChange('allowSelfRegistration', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure notification preferences and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Integration</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to Slack channels
                    </p>
                  </div>
                  <Switch
                    checked={settings.slackIntegration}
                    onCheckedChange={(checked) => handleSettingChange('slackIntegration', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.webhookUrl}
                    onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Configure data retention and backup policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetentionDays">Data Retention (days)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    min="30"
                    max="3650"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground">
                    How long to keep data before automatic deletion
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup data daily
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('autoBackup', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <Input
                    id="exportFormat"
                    value={settings.exportFormat}
                    onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
