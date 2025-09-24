'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Mail, Phone, Clock } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Support Center</h1>
        <p className="text-muted-foreground">Get help with your Veritas account and features.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat
            </CardTitle>
            <CardDescription>Chat with our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant help from our support team. Average response time: 2 minutes.
            </p>
            <Button className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>Send us a detailed message</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              For complex issues or detailed questions. Response within 24 hours.
            </p>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Support
            </CardTitle>
            <CardDescription>Call our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Available Monday-Friday, 9 AM - 6 PM EST for urgent issues.
            </p>
            <Button variant="outline" className="w-full">
              Call Now
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit a Support Ticket</CardTitle>
          <CardDescription>Describe your issue and we'll get back to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Brief description of your issue" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing Question</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Please provide detailed information about your issue..."
              rows={4}
            />
          </div>
          <Button>Submit Ticket</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Support Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Live Chat & Phone</h4>
              <p className="text-sm text-muted-foreground">
                Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                Saturday: 10:00 AM - 4:00 PM EST<br />
                Sunday: Closed
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Email Support</h4>
              <p className="text-sm text-muted-foreground">
                Available 24/7<br />
                Response time: Within 24 hours<br />
                support@veritas.ai
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
