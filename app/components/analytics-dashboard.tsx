"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Users,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Eye,
  UserCheck,
  FileText,
  Briefcase,
  MessageSquare,
  Settings,
  Shield,
  AlertTriangle,
} from "lucide-react"

// User activity types
interface UserActivity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  details: string
  timestamp: Date
  ipAddress: string
  location: string
  device: string
  sessionDuration?: number
}

// Mock data for user activities
const mockUserActivities: UserActivity[] = [
  {
    id: "1",
    userId: "user1",
    userName: "John Smith",
    userAvatar: "/placeholder-user.jpg",
    action: "login",
    details: "User logged in successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    ipAddress: "192.168.1.100",
    location: "New York, NY",
    device: "Desktop - Chrome",
    sessionDuration: 45,
  },
  {
    id: "2",
    userId: "user2",
    userName: "Sarah Johnson",
    userAvatar: "/placeholder-user.jpg",
    action: "job_create",
    details: "Created new job posting: Senior Developer",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    ipAddress: "10.0.0.50",
    location: "San Francisco, CA",
    device: "Mobile - Safari",
    sessionDuration: 25,
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Wilson",
    userAvatar: "/placeholder-user.jpg",
    action: "resume_upload",
    details: "Uploaded resume for candidate: Alice Brown",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    ipAddress: "172.16.0.10",
    location: "Chicago, IL",
    device: "Desktop - Firefox",
    sessionDuration: 60,
  },
  {
    id: "4",
    userId: "user4",
    userName: "Emma Davis",
    userAvatar: "/placeholder-user.jpg",
    action: "interview_schedule",
    details: "Scheduled interview with David Lee",
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    ipAddress: "192.168.2.200",
    location: "Austin, TX",
    device: "Tablet - Chrome",
    sessionDuration: 35,
  },
  {
    id: "5",
    userId: "user5",
    userName: "Alex Turner",
    userAvatar: "/placeholder-user.jpg",
    action: "candidate_review",
    details: "Reviewed candidate profile: Jennifer White",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    ipAddress: "203.0.113.50",
    location: "Seattle, WA",
    device: "Desktop - Edge",
    sessionDuration: 20,
  },
]

// Helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Helper function to get time ago
const getTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${minutes}m ago`
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "login":
      return <UserCheck className="w-4 h-4 text-green-600" />
    case "job_create":
      return <Briefcase className="w-4 h-4 text-blue-600" />
    case "resume_upload":
      return <FileText className="w-4 h-4 text-purple-600" />
    case "interview_schedule":
      return <Calendar className="w-4 h-4 text-orange-600" />
    case "candidate_review":
      return <Eye className="w-4 h-4 text-indigo-600" />
    case "message_send":
      return <MessageSquare className="w-4 h-4 text-pink-600" />
    case "settings_update":
      return <Settings className="w-4 h-4 text-gray-600" />
    case "security_alert":
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    default:
      return <Activity className="w-4 h-4 text-gray-500" />
  }
}

const getActionColor = (action: string) => {
  switch (action) {
    case "login":
      return "bg-green-100 text-green-800 border-green-200"
    case "job_create":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "resume_upload":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "interview_schedule":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "candidate_review":
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    case "message_send":
      return "bg-pink-100 text-pink-800 border-pink-200"
    case "settings_update":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "security_alert":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-600 border-gray-200"
  }
}

export default function AnalyticsDashboard() {
  const [activities, setActivities] = useState<UserActivity[]>(mockUserActivities)
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [selectedAction, setSelectedAction] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  // Filter activities based on selected filters
  const filteredActivities = activities.filter((activity) => {
    if (selectedAction !== "all" && activity.action !== selectedAction) {
      return false
    }

    const now = new Date()
    const activityDate = new Date(activity.timestamp)
    const diffDays = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)

    switch (selectedTimeRange) {
      case "1d":
        return diffDays <= 1
      case "7d":
        return diffDays <= 7
      case "30d":
        return diffDays <= 30
      default:
        return true
    }
  })

  // Calculate analytics metrics
  const totalUsers = new Set(activities.map((a) => a.userId)).size
  const totalActivities = activities.length
  const avgSessionDuration = Math.round(
    activities.reduce((sum, a) => sum + (a.sessionDuration || 0), 0) / activities.length,
  )
  const uniqueLocations = new Set(activities.map((a) => a.location)).size

  // Device type breakdown
  const deviceBreakdown = activities.reduce(
    (acc, activity) => {
      const deviceType = activity.device.includes("Mobile")
        ? "Mobile"
        : activity.device.includes("Tablet")
          ? "Tablet"
          : "Desktop"
      acc[deviceType] = (acc[deviceType] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Location breakdown
  const locationBreakdown = activities.reduce(
    (acc, activity) => {
      acc[activity.location] = (acc[activity.location] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Action breakdown
  const actionBreakdown = activities.reduce(
    (acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const exportToCSV = () => {
    const headers = ["User", "Action", "Details", "Timestamp", "IP Address", "Location", "Device", "Session Duration"]
    const csvData = [
      headers.join(","),
      ...filteredActivities.map((activity) =>
        [
          activity.userName,
          activity.action,
          `"${activity.details}"`,
          activity.timestamp.toISOString(),
          activity.ipAddress,
          `"${activity.location}"`,
          `"${activity.device}"`,
          activity.sessionDuration || 0,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `user-analytics-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-600">Track user activities, login patterns, and system usage</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Logins</SelectItem>
                <SelectItem value="job_create">Job Creation</SelectItem>
                <SelectItem value="resume_upload">Resume Uploads</SelectItem>
                <SelectItem value="interview_schedule">Interviews</SelectItem>
                <SelectItem value="candidate_review">Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Unique users tracked</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-3xl font-bold text-green-600">{totalActivities}</p>
                <p className="text-xs text-gray-500 mt-1">System interactions</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-3xl font-bold text-purple-600">{avgSessionDuration}m</p>
                <p className="text-xs text-gray-500 mt-1">Average duration</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locations</p>
                <p className="text-3xl font-bold text-orange-600">{uniqueLocations}</p>
                <p className="text-xs text-gray-500 mt-1">Unique locations</p>
              </div>
              <MapPin className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">Recent Activities</TabsTrigger>
          <TabsTrigger value="devices">Device Analytics</TabsTrigger>
          <TabsTrigger value="locations">Location Analytics</TabsTrigger>
          <TabsTrigger value="actions">Action Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent User Activities</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Latest system interactions and user actions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.userAvatar || "/placeholder.svg"} alt={activity.userName} />
                      <AvatarFallback>
                        {activity.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getActionColor(activity.action)} border text-xs`}>
                            {getActionIcon(activity.action)}
                            <span className="ml-1">{activity.action.replace("_", " ")}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>{activity.ipAddress}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {activity.device.includes("Mobile") ? (
                            <Smartphone className="w-3 h-3" />
                          ) : (
                            <Monitor className="w-3 h-3" />
                          )}
                          <span>{activity.device}</span>
                        </div>
                        {activity.sessionDuration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{activity.sessionDuration}m session</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5" />
                  <span>Device Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(deviceBreakdown).map(([device, count]) => {
                    const percentage = Math.round((count / totalActivities) * 100)
                    return (
                      <div key={device}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{device}</span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((deviceBreakdown.Desktop || 0) / totalActivities) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Desktop Usage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(((deviceBreakdown.Mobile || 0) / totalActivities) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Mobile Usage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(((deviceBreakdown.Tablet || 0) / totalActivities) * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Tablet Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Geographic Distribution</span>
              </CardTitle>
              <p className="text-sm text-gray-600">User activity by location</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(locationBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([location, count]) => {
                    const percentage = Math.round((count / totalActivities) * 100)
                    return (
                      <div key={location} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{count} activities</span>
                          <Badge variant="secondary">{percentage}%</Badge>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Action Analytics</span>
              </CardTitle>
              <p className="text-sm text-gray-600">Most common user actions and system interactions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(actionBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([action, count]) => {
                    const percentage = Math.round((count / totalActivities) * 100)
                    return (
                      <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getActionIcon(action)}
                          <span className="font-medium">{action.replace("_", " ").toUpperCase()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{count} times</span>
                          <div className="w-20">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <Badge variant="secondary">{percentage}%</Badge>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
