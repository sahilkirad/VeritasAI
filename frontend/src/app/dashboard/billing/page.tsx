'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Professional Plan</h3>
                <p className="text-sm text-muted-foreground">Unlimited deal analysis</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Cost</span>
              <span className="font-semibold">$299/month</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Next Billing Date</span>
              <span className="text-sm">Dec 15, 2024</span>
            </div>
            <Button variant="outline" className="w-full">
              Change Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>Your current usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deals Analyzed</span>
              <span className="font-semibold">47</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Interviews</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diligence Reports</span>
              <span className="font-semibold">23</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage Used</span>
              <span className="font-semibold">2.3 GB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">November 2024</p>
                  <p className="text-sm text-muted-foreground">Professional Plan</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$299.00</p>
                <p className="text-sm text-green-600">Paid</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">October 2024</p>
                  <p className="text-sm text-muted-foreground">Professional Plan</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">$299.00</p>
                <p className="text-sm text-green-600">Paid</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
