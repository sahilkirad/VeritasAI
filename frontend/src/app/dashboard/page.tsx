"use client"
import { ArrowUpRight, FileWarning, Users, MessageSquare, FileText, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deals, recentActivities } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChat } from "@/hooks/useChat"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // Redirect if not authenticated or not an investor
  useEffect(() => {
    if (!loading && (!user || user.role !== 'investor')) {
      router.push('/investor/login')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user || user.role !== 'investor') {
    return null
  }

  // Use actual user data or fallback to mock data
  const userId = user.uid || 'inv1';
  const userRole = 'investor' as const;
  
  const { rooms, totalUnread } = useChat(userId, userRole);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.displayName || 'Investor'}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your investment pipeline today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            All Systems Active
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deals Analyzed</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5 since last month
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Red Flags Found</CardTitle>
            <div className="p-2 bg-red-50 rounded-lg border border-red-100">
              <FileWarning className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12 since last month
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Deals</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg border border-green-100">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">9</div>
            <p className="text-xs text-muted-foreground mt-1">2 waiting on founder</p>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground mt-1">Portfolio value</p>
          </CardContent>
        </Card>
      </div>

      {/* Founder Conversations Card */}
      <Card className="border hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            Founder Conversations
          </CardTitle>
          <CardDescription className="mt-1">
            Connect with founders and evaluate investment opportunities. Build relationships and advance your deal pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Section */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  8
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    3 new
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-medium mt-1">Active Conversations</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <div className="text-lg font-semibold">6</div>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border">
                  <div className="text-lg font-semibold">3</div>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Recent Conversations</h4>
              <div className="space-y-2">
                <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        Arnav Gupta
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        we360.ai
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      2
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Thank you for reviewing our memo. We'd love to discuss our traction metrics...
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        Utkarsh Choudhary
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        CASHVISORY
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      1
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Following up on the Series A discussion. Can we schedule a call this week?
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        Sarah Johnson
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        TechStart Inc.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Appreciate your feedback on our unit economics. We've updated our projections...
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  +5 more conversations
                </p>
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Quick Actions</h4>
              <div className="space-y-2">
                <Link href="/dashboard/messages" className="block">
                  <Button className="w-full" variant="default">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View All Messages
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Founders
                </Button>
                
                <Link href="/dashboard/memo" className="block">
                  <Button variant="ghost" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Review Memos
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-xl font-bold mt-0.5">98%</p>
                <p className="text-xs text-green-600 mt-0.5">+2% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
                <p className="text-xl font-bold mt-0.5">2.4h</p>
                <p className="text-xs text-green-600 mt-0.5">-0.5h improvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-100">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Memos Reviewed</p>
                <p className="text-xl font-bold mt-0.5">42</p>
                <p className="text-xs text-muted-foreground mt-0.5">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg border border-orange-100">
                <CheckCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deals Closed</p>
                <p className="text-xl font-bold mt-0.5">3</p>
                <p className="text-xs text-orange-600 mt-0.5">+1 this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="grid gap-1">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ongoing Deals
              </CardTitle>
              <CardDescription className="mt-0.5">An overview of your current investment pipeline.</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="gap-1">
              <Link href="/dashboard/memo">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold">Stage</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id} className="cursor-pointer hover:bg-muted/50 border-b">
                      <TableCell className="py-3">
                        <Link href="/dashboard/memo" className="flex items-center gap-3 hover:underline">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage
                              src={deal.logoUrl || "/placeholder.svg"}
                              alt={deal.companyName}
                              data-ai-hint="logo"
                            />
                            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                              {deal.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{deal.companyName}</span>
                            <p className="text-xs text-muted-foreground">Fintech • B2B</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3">
                        <Link href="/dashboard/memo" className="hover:underline">
                          <Badge variant="secondary" className="text-xs">
                            {deal.stage}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3">
                        <Link href="/dashboard/memo" className="hover:underline">
                          <Badge
                            variant="outline"
                            className={
                              deal.status === "Diligence"
                                ? "text-blue-600 border-blue-600 bg-blue-50"
                                : deal.status === "AI Interview"
                                  ? "text-yellow-600 border-yellow-600 bg-yellow-50"
                                  : "text-green-600 border-green-600 bg-green-50"
                            }
                          >
                            {deal.status}
                          </Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <Link href="/dashboard/memo" className="hover:underline">
                          <span className="text-sm text-muted-foreground">{deal.lastUpdate}</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={activity.avatarUrl || "/placeholder.svg"} alt="Avatar" data-ai-hint="person face" />
                  <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xs">
                    {activity.user.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium text-foreground">{activity.user}</span> {activity.action}{" "}
                    <span className="font-medium text-primary">{activity.target}</span>.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:bg-muted/50">
                View all activity
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
