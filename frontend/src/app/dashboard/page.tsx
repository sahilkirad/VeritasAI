"use client"
import { ArrowUpRight, FileWarning, Users } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deals, recentActivities } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Analyzed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Red Flags Found</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+12 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9</div>
            <p className="text-xs text-muted-foreground">2 waiting on founder</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Ongoing Deals</CardTitle>
              <CardDescription>An overview of your current investment pipeline.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="#">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden lg:table-cell">Stage</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-right">Last Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id} className="cursor-pointer">
                    <TableCell>
                      <Link href="/dashboard/memo" className="flex items-center gap-3 hover:underline">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={deal.logoUrl || "/placeholder.svg"}
                            alt={deal.companyName}
                            data-ai-hint="logo"
                          />
                          <AvatarFallback>{deal.companyName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{deal.companyName}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Link href="/dashboard/memo" className="hover:underline">
                        {deal.stage}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Link href="/dashboard/memo" className="hover:underline">
                        <Badge
                          variant="outline"
                          className={
                            deal.status === "Diligence"
                              ? "text-blue-600 border-blue-600"
                              : deal.status === "AI Interview"
                                ? "text-yellow-600 border-yellow-600"
                                : "text-green-600 border-green-600"
                          }
                        >
                          {deal.status}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href="/dashboard/memo" className="hover:underline">
                        {deal.lastUpdate}
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={activity.avatarUrl || "/placeholder.svg"} alt="Avatar" data-ai-hint="person face" />
                  <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium">{activity.target}</span>.
                  </p>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
