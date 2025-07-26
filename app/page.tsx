"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Building2,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Search,
  Bell,
  Plus,
  TrendingUp,
  Clock,
  Mail,
  Video,
  Brain,
  Target,
  Upload,
  ChevronRight,
  Home,
  Briefcase,
  UserCheck,
  Shield,
  Database,
  Rocket,
  Activity,
  DollarSign,
  LogOut,
} from "lucide-react"

// Import components
import CandidateManagement from "./components/candidate-management"
import JobPostings from "./components/job-postings"
import InterviewManagement from "./components/interview-management"
import Pipeline from "./components/pipeline"
import AnalyticsDashboard from "./components/analytics-dashboard"
import CustomerManagement from "./components/customer-management"
import Reports from "./components/reports"
import AdminPanel from "./components/admin-panel"
import RecruiterJobs from "./components/recruiter-jobs"
import RecruiterPerformance from "./components/recruiter-performance"
import RecruiterTimesheet from "./components/recruiter-timesheet"
import PostedCandidates from "./components/posted-candidates"
import BulkImport from "./components/bulk-import"
import AICandidateAnalysis from "./components/ai-candidate-analysis"
import CustomerProfiles from "./components/customer-profiles"
import EmailAnalytics from "./components/email-analytics"
import { useRouter } from "next/navigation"

interface NavigationItem {
  id: string
  label: string
  icon: any
  component: React.ComponentType<any>
  badge?: string
  description?: string
}

interface NavigationCategory {
  id: string
  label: string
  items: NavigationItem[]
}

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get("tab")

    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [])

  // Auth guard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("authenticated") === "true"
      if (!isAuthenticated) {
        router.replace("/login")
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("authenticated")
    localStorage.removeItem("auth_email")
    router.replace("/login")
  }

  // Navigation structure
  const navigationCategories: NavigationCategory[] = [
    {
      id: "overview",
      label: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: Home, component: DashboardOverview },
        { id: "analytics", label: "Analytics", icon: BarChart3, component: AnalyticsDashboard },
        { id: "reports", label: "Reports", icon: FileText, component: Reports },
      ],
    },
    {
      id: "recruitment",
      label: "Recruitment",
      items: [
        { id: "candidates", label: "Candidates", icon: Users, component: CandidateManagement, badge: "156" },
        { id: "jobs", label: "Job Postings", icon: Briefcase, component: JobPostings, badge: "23" },
        { id: "interviews", label: "Interviews", icon: Calendar, component: InterviewManagement, badge: "12" },
        { id: "pipeline", label: "Pipeline", icon: Target, component: Pipeline },
        { id: "ai-analysis", label: "AI Analysis", icon: Brain, component: AICandidateAnalysis, badge: "New" },
      ],
    },
    {
      id: "management",
      label: "Management",
      items: [
        { id: "customers", label: "Customers", icon: Building2, component: CustomerManagement, badge: "45" },
        { id: "customer-profiles", label: "Customer Profiles", icon: UserCheck, component: CustomerProfiles },
        { id: "email-analytics", label: "Email Analytics", icon: Mail, component: EmailAnalytics },
        { id: "bulk-import", label: "Bulk Import", icon: Upload, component: BulkImport },
      ],
    },
    {
      id: "recruiter",
      label: "Recruiter Tools",
      items: [
        { id: "recruiter-jobs", label: "My Jobs", icon: Briefcase, component: RecruiterJobs, badge: "8" },
        { id: "performance", label: "Performance", icon: TrendingUp, component: RecruiterPerformance },
        { id: "timesheet", label: "Timesheet", icon: Clock, component: RecruiterTimesheet },
        { id: "posted-candidates", label: "Posted Candidates", icon: Users, component: PostedCandidates },
      ],
    },
    {
      id: "administration",
      label: "Administration",
      items: [
        { id: "admin", label: "Admin Panel", icon: Settings, component: AdminPanel },
        { id: "user-management", label: "User Management", icon: Shield, component: AdminPanel },
        { id: "system-settings", label: "System Settings", icon: Database, component: AdminPanel },
      ],
    },

  ]

  // Get current component
  const getCurrentComponent = () => {
    const allItems = navigationCategories.flatMap((cat) => cat.items)
    const found = allItems.find((item) => item.id === activeTab)
    if (found) {
      return found.component
    }
    // Return DashboardOverview as fallback
    return (props: any) => (
      <DashboardOverview
        setActiveTab={setActiveTab}
        showQuickActions={showQuickActions}
        setShowQuickActions={setShowQuickActions}
        {...props}
      />
    )
  }

  const CurrentComponent = getCurrentComponent()

  // Filter navigation items based on search
  const filteredCategories = navigationCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.items.length > 0)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("auth_email") || ""
      setUserEmail(email)
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">APPIT ATS</h1>
                  <p className="text-xs text-gray-500">Recruitment Platform</p>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          {!sidebarCollapsed && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-6 py-4">
              {filteredCategories.map((category) => (
                <div key={category.id}>
                  {!sidebarCollapsed && (
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {category.label}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeTab === item.id
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!sidebarCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <Badge variant={item.badge === "New" ? "default" : "secondary"} className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-center"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {navigationCategories.flatMap((cat) => cat.items).find((item) => item.id === activeTab)?.label ||
                  "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2 text-xs">
                  3
                </Badge>
              </Button>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar>
                      <AvatarImage src="/placeholder-user.jpg" alt={userEmail} />
                      <AvatarFallback>{userEmail ? userEmail[0].toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-4 flex flex-col gap-2">
                  <div className="text-sm text-gray-700 font-medium mb-2">{userEmail}</div>
                  <Button variant="destructive" onClick={handleLogout} className="w-full">Logout</Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "dashboard" ? (
            <DashboardOverview
              setActiveTab={setActiveTab}
              showQuickActions={showQuickActions}
              setShowQuickActions={setShowQuickActions}
            />
          ) : (
            <CurrentComponent
              setActiveTab={setActiveTab}
              showQuickActions={showQuickActions}
              setShowQuickActions={setShowQuickActions}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview({ setActiveTab, showQuickActions, setShowQuickActions }: {
  setActiveTab: (tab: string) => void;
  showQuickActions: boolean;
  setShowQuickActions: (show: boolean) => void;
}) {
  const [timeRange, setTimeRange] = useState("30d")
  const [showQuickActionsState, setShowQuickActionsState] = useState(showQuickActions)

  // Enhanced stats incorporating all features
  const enhancedStats = [
    {
      label: "Active Candidates",
      value: "1,247",
      change: "+89 this week",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total candidates in pipeline",
    },
    {
      label: "Video Interviews",
      value: "45",
      change: "+12 scheduled",
      trend: "up",
      icon: Video,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Zoom, Teams, Webex sessions",
    },
    {
      label: "AI Analysis",
      value: "156",
      change: "94% accuracy",
      trend: "stable",
      icon: Brain,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Candidates analyzed by AI",
    },
    {
      label: "Open Positions",
      value: "23",
      change: "+3 new",
      trend: "up",
      icon: Briefcase,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Active job postings",
    },
    {
      label: "Customer Accounts",
      value: "156",
      change: "+8 this month",
      trend: "up",
      icon: Building2,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      description: "Active client relationships",
    },
    {
      label: "Revenue Generated",
      value: "$2.4M",
      change: "+18% vs last month",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Total placement revenue",
    },
  ]

  // Platform status data
  const platformStatus = [
    { name: "Zoom", status: "active", meetings: 12, color: "bg-blue-500" },
    { name: "Teams", status: "active", meetings: 8, color: "bg-purple-500" },
    { name: "Webex", status: "active", meetings: 5, color: "bg-green-500" },
    { name: "Google Meet", status: "maintenance", meetings: 0, color: "bg-gray-400" },
  ]

  // Recent activities with enhanced data
  const recentActivities = [
    {
      id: 1,
      action: "AI Analysis completed",
      details: "Sarah Johnson scored 94% for Senior Developer role",
      time: "2 minutes ago",
      icon: Brain,
      color: "text-emerald-600",
      type: "ai-analysis",
      priority: "high",
    },
    {
      id: 2,
      action: "Video interview scheduled",
      details: "Michael Chen - Product Manager via Zoom",
      time: "15 minutes ago",
      icon: Video,
      color: "text-purple-600",
      type: "interview",
      priority: "medium",
    },
    {
      id: 3,
      action: "Customer profile updated",
      details: "TechCorp Inc. - Added 3 new requirements",
      time: "1 hour ago",
      icon: Building2,
      color: "text-cyan-600",
      type: "customer",
      priority: "low",
    },
    {
      id: 4,
      action: "Bulk import completed",
      details: "156 candidates imported successfully",
      time: "2 hours ago",
      icon: Upload,
      color: "text-blue-600",
      type: "import",
      priority: "medium",
    },
    {
      id: 5,
      action: "Pipeline stage updated",
      details: "Alex Rodriguez moved to final interview",
      time: "3 hours ago",
      icon: Target,
      color: "text-orange-600",
      type: "pipeline",
      priority: "high",
    },
  ]

  // Upcoming interviews with video platform info
  const upcomingInterviews = [
    {
      id: 1,
      candidate: "Sarah Johnson",
      position: "Senior Frontend Developer",
      time: "10:00 AM",
      type: "Video",
      platform: "Zoom",
      aiScore: 94,
      status: "confirmed",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 2,
      candidate: "Michael Chen",
      position: "Product Manager",
      time: "2:00 PM",
      type: "Video",
      platform: "Teams",
      aiScore: 87,
      status: "confirmed",
      avatar: "/placeholder-user.jpg",
    },
    {
      id: 3,
      candidate: "Alex Rodriguez",
      position: "Data Scientist",
      time: "4:00 PM",
      type: "Video",
      platform: "Webex",
      aiScore: 91,
      status: "pending",
      avatar: "/placeholder-user.jpg",
    },
  ]

  // Performance metrics
  const performanceMetrics = {
    conversionRate: 76,
    avgTimeToHire: 14.2,
    customerSatisfaction: 94,
    aiAccuracy: 96,
    interviewCompletionRate: 89,
    revenueGrowth: 18,
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
              <p className="text-blue-100 text-lg">Your AI-powered recruitment platform is performing excellently.</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">All systems operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span className="text-sm">
                    {platformStatus.filter((p) => p.status === "active").length} video platforms active
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">94%</div>
              <div className="text-blue-100">AI Accuracy</div>
              <div className="text-2xl font-semibold mt-2">$2.4M</div>
              <div className="text-blue-100">Revenue YTD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          {["7d", "30d", "90d", "1y"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enhancedStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className={`w-3 h-3 ${stat.trend === "up" ? "text-green-500" : "text-gray-400"}`} />
                      <p className="text-xs text-gray-600">{stat.change}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-purple-600" />
            <span>Video Platform Status</span>
          </CardTitle>
          <CardDescription>Real-time status of integrated video conferencing platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {platformStatus.map((platform) => (
              <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${platform.color} ${platform.status === "active" ? "animate-pulse" : ""}`}
                  ></div>
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{platform.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{platform.meetings}</p>
                  <p className="text-xs text-gray-500">active</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Key Performance Indicators</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Conversion Rate", value: performanceMetrics.conversionRate, target: 80, color: "bg-blue-500" },
              {
                label: "Avg. Time to Hire",
                value: performanceMetrics.avgTimeToHire,
                target: 15,
                color: "bg-green-500",
                suffix: " days",
              },
              {
                label: "Customer Satisfaction",
                value: performanceMetrics.customerSatisfaction,
                target: 90,
                color: "bg-purple-500",
              },
              { label: "AI Accuracy", value: performanceMetrics.aiAccuracy, target: 95, color: "bg-emerald-500" },
              {
                label: "Interview Completion",
                value: performanceMetrics.interviewCompletionRate,
                target: 85,
                color: "bg-orange-500",
              },
            ].map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {metric.value}
                    {metric.suffix || "%"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${metric.color} transition-all duration-500`}
                    style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-1.5 rounded-full bg-white shadow-sm`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          activity.priority === "high"
                            ? "border-red-200 text-red-700"
                            : activity.priority === "medium"
                              ? "border-yellow-200 text-yellow-700"
                              : "border-gray-200 text-gray-700"
                        }`}
                      >
                        {activity.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews with Enhanced Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Today's Video Interviews</span>
          </CardTitle>
          <CardDescription>Scheduled interviews with AI scores and platform details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={interview.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {interview.candidate
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">{interview.candidate}</h4>
                    <p className="text-sm text-gray-600">{interview.position}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1">
                        <Video className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-gray-500">{interview.platform}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Brain className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">{interview.aiScore}% AI Score</span>
                      </div>
                      <Badge variant={interview.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                        {interview.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{interview.time}</span>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Video className="w-3 h-3 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Rocket className="w-5 h-5 text-blue-600" />
              <span>Quick Actions</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowQuickActionsState(!showQuickActionsState)}>
              {showQuickActionsState ? "Hide" : "Show"}
            </Button>
          </CardTitle>
          <CardDescription>Streamlined access to common recruitment tasks</CardDescription>
        </CardHeader>
        {showQuickActionsState && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                {
                  icon: Plus,
                  label: "Add Candidate",
                  color: "bg-blue-600 hover:bg-blue-700",
                  action: () => setActiveTab("candidates"),
                },
                {
                  icon: Briefcase,
                  label: "Post Job",
                  color: "bg-green-600 hover:bg-green-700",
                  action: () => setActiveTab("jobs"),
                },
                {
                  icon: Video,
                  label: "Schedule Interview",
                  color: "bg-purple-600 hover:bg-purple-700",
                  action: () => setActiveTab("interviews"),
                },
                {
                  icon: Brain,
                  label: "AI Analysis",
                  color: "bg-emerald-600 hover:bg-emerald-700",
                  action: () => setActiveTab("ai-analysis"),
                },
                {
                  icon: Upload,
                  label: "Bulk Import",
                  color: "bg-orange-600 hover:bg-orange-700",
                  action: () => setActiveTab("bulk-import"),
                },
                {
                  icon: FileText,
                  label: "Generate Report",
                  color: "bg-cyan-600 hover:bg-cyan-700",
                  action: () => setActiveTab("reports"),
                },
              ].map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  className={`h-20 flex flex-col items-center justify-center space-y-2 ${action.color} text-white`}
                >
                  <action.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI Insights Panel */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-900">AI Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">Top Performer</span>
              </div>
              <p className="text-sm text-gray-700">
                Sarah Johnson has the highest AI compatibility score (94%) for the Senior Developer role.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">Optimization</span>
              </div>
              <p className="text-sm text-gray-700">
                Consider scheduling interviews between 10-11 AM for 23% higher completion rates.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-emerald-200">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-emerald-900">Pipeline Health</span>
              </div>
              <p className="text-sm text-gray-700">
                Your pipeline is 18% above target. Consider expanding to new markets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
