"use client"
import { ArrowUpRight, FileWarning, Users, MessageSquare, FileText } from "lucide-react"
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
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="h-5 w-5" />
              Founder Conversations
            </CardTitle>
            <CardDescription className="text-blue-700">
              Connect with founders and evaluate investment opportunities. Build relationships and advance your deal pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900 flex items-center justify-center gap-2">
                    {rooms.length}
                    {totalUnread > 0 && (
                      <Badge variant="destructive" className="text-xs animate-pulse">
                        {totalUnread} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-blue-700 font-medium">Active Conversations</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-semibold text-blue-900">
                      {rooms.filter(room => room.status === 'active').length}
                    </div>
                    <p className="text-xs text-blue-600">Active</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="text-lg font-semibold text-blue-900">
                      {rooms.filter(room => room.unreadCount > 0).length}
                    </div>
                    <p className="text-xs text-blue-600">Unread</p>
                  </div>
                </div>
              </div>

              {/* Recent Conversations */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900 text-sm">Recent Conversations</h4>
                {rooms.length > 0 ? (
                  <div className="space-y-2">
                    {rooms.slice(0, 3).map((room, index) => (
                      <div key={room.id} className="bg-white/60 rounded-lg p-3 hover:bg-white/80 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-blue-900 text-sm truncate">
                              {room.founderName}
                            </p>
                            <p className="text-xs text-blue-600 truncate">
                              {room.companyName}
                            </p>
                          </div>
                          {room.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                              {room.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 mt-1 truncate">
                          {room.lastMessage}
                        </p>
                      </div>
                    ))}
                    {rooms.length > 3 && (
                      <p className="text-xs text-blue-600 text-center">
                        +{rooms.length - 3} more conversations
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="h-8 w-8 text-blue-300 mx-auto mb-2" />
                    <p className="text-sm text-blue-600">No conversations yet</p>
                    <p className="text-xs text-blue-500">Start conversations from Memo 3 reviews</p>
                  </div>
                )}
              </div>

              {/* Actions Section */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900 text-sm">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/dashboard/messages" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View All Messages
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Users className="mr-2 h-4 w-4" />
                    Browse Founders
                  </Button>
                  
                  <Link href="/dashboard/memo" className="block">
                    <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50">
                      <FileText className="mr-2 h-4 w-4" />
                      Review Memos
                    </Button>
                  </Link>
                </div>

                {/* Tips */}
                <div className="bg-blue-100/50 rounded-lg p-3 mt-4">
                  <h5 className="font-medium text-blue-900 text-xs mb-1">💡 Pro Tip</h5>
                  <p className="text-xs text-blue-700">
                    Ask specific questions about traction, unit economics, and market opportunity to evaluate deals effectively.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-xl font-bold text-gray-900">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-xl font-bold text-gray-900">9</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Memos Reviewed</p>
                <p className="text-xl font-bold text-gray-900">42</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowUpRight className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deals Closed</p>
                <p className="text-xl font-bold text-gray-900">3</p>
              </div>
            </div>
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
