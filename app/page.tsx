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
import PipelineAPI from "./components/pipeline-api"
import AnalyticsDashboard from "./components/analytics-dashboard"
import CustomerManagement from "./components/customer-management"
import Reports from "./components/reports"
import RecruiterJobs from "./components/recruiter-jobs"
import MyJobs from "./components/my-jobs"
import RecruiterTimesheet from "./components/recruiter-timesheet"
// import RequirementTimesheet from "./components/requirement-timesheet"
import BulkImport from "./components/bulk-import"
// import AICandidateAnalysis from "./components/ai-candidate-analysis"
import EmailAnalytics from "./components/email-analytics"
import UserManagement from "../components/admin/user-management"
import CandidatesSearch from "./components/candidates-search"
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
        { id: "candidates", label: "Candidates", icon: Users, component: CandidateManagement },
        { id: "candidates-search", label: "Candidates Search", icon: Search, component: CandidatesSearch, badge: "AI" },
        { id: "jobs", label: "Job Postings", icon: Briefcase, component: JobPostings},
        { id: "interviews", label: "Interviews", icon: Calendar, component: InterviewManagement},
        { id: "pipeline", label: "Pipeline", icon: Target, component: PipelineAPI },
        // { id: "ai-analysis", label: "AI Analysis", icon: Brain, component: AICandidateAnalysis, badge: "New" },
      ],
    },
    {
      id: "management",
      label: "Management",
      items: [
        { id: "customers", label: "Customers", icon: Building2, component: CustomerManagement},
        { id: "email-analytics", label: "Email Analytics", icon: Mail, component: EmailAnalytics},
        { id: "bulk-import", label: "Bulk Import", icon: Upload, component: BulkImport },
      ],
    },
    {
      id: "recruiter",
      label: "Recruiter Tools",
      items: [
        { id: "recruiter-jobs", label: "My Jobs", icon: Briefcase, component: MyJobs },
        { id: "timesheet", label: "Timesheet", icon: Clock, component: RecruiterTimesheet },

      ],
    },
    {
      id: "administration",
      label: "Administration",
      items: [
        { id: "user-management", label: "User Management", icon: Shield, component: UserManagement }
        // { id: "system-settings", label: "System Settings", icon: Database,badge: "New", component: () => <div>System Settings - Coming Soon</div> },
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
              {/* <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                <Badge variant="destructive" className="ml-2 text-xs">
                  3
                </Badge>
              </Button> */}
              {/* <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button> */}
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
  
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [greeting, setGreeting] = useState("")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark component as mounted on client
    setIsClient(true)
    
    // Get user data from localStorage
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("auth_email") || ""
      setUserEmail(email)
      
      // Extract name from email (first part before @)
      const nameFromEmail = email.split("@")[0]
      // Capitalize first letter of the name
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)
      
      setUserName(formattedName || "User")
      
      // Set current time
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      setCurrentTime(timeString)
      
      // Set greeting
      const hour = now.getHours()
      if (hour < 12) setGreeting("Good Morning")
      else if (hour < 17) setGreeting("Good Afternoon")
      else setGreeting("Good Evening")
    }
  }, [])

  // Fetch dashboard data with timeout and retry
  useEffect(() => {
    const fetchDashboardData = async (retryCount = 0) => {
      try {
        setLoading(true)
        setError(null)
        
        // Create AbortController for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 50000) // 10 second timeout
        
        const response = await fetch('https://atsapi.workisy.in/api/dashboard', {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setDashboardData(result.data)
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data')
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        
        if (error.name === 'AbortError') {
          setError('Request timed out. Please check your connection.')
        } else if (retryCount < 2) {
          // Retry after 2 seconds
          setTimeout(() => fetchDashboardData(retryCount + 1), 2000)
          return
        } else {
          setError('Failed to load dashboard data. Please refresh the page.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getGreeting = () => {
    if (!isClient) return "" // Return empty string during SSR
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FILLED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Beautiful Welcome Section - Always show immediately */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{greeting || getGreeting()}, {userName}!</h1>
                  <p className="text-blue-100 text-lg">Welcome to your recruitment dashboard</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Current Time</p>
                      <p className="text-white font-semibold">{currentTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Email</p>
                      <p className="text-white font-semibold text-sm truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Status</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-white font-semibold">Online</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State for Data */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Activity className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 font-medium">Error loading data</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Data */}
      {dashboardData && !loading && !error && (
        <>
          {/* Real Data Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                        <p className="text-xs text-gray-500">Currently open positions</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-blue-600">{dashboardData.summary.activeJobs}</p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-gray-600">Total: {dashboardData.summary.totalJobs}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-50">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                        <p className="text-xs text-gray-500">In your pipeline</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-green-600">{dashboardData.summary.totalCandidates}</p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-gray-600">Pending: {dashboardData.summary.pendingCandidates}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-50">
                        <Video className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interviews</p>
                        <p className="text-xs text-gray-500">Scheduled for today</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-purple-600">{dashboardData.summary.scheduledInterviews}</p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-gray-600">Total: {dashboardData.summary.totalInterviews}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 rounded-lg bg-orange-50">
                        <Building2 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Customers</p>
                        <p className="text-xs text-gray-500">Client companies</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-orange-600">{dashboardData.summary.activeCustomers}</p>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <p className="text-xs text-gray-600">Total: {dashboardData.summary.totalCustomers}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Jobs */}
          {dashboardData.recent.jobs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <span>Recent Job Postings</span>
                </CardTitle>
                <CardDescription>Latest job positions added to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recent.jobs.slice(0, 5).map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <p className="text-xs text-gray-500 mt-1">Posted: {formatDate(job.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(job.jobStatus)}>
                          {job.jobStatus}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("jobs")}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Applications */}
          {dashboardData.recent.applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span>Recent Applications</span>
                </CardTitle>
                <CardDescription>Latest candidate applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recent.applications.slice(0, 5).map((application: any) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {application.firstName[0]}{application.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {application.firstName} {application.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{application.email}</p>
                          <p className="text-xs text-gray-500">
                            Applied for: {application.job.title} at {application.job.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          {application.status}
                        </Badge>
                        <p className="text-xs text-gray-500">{formatDate(application.appliedAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Customers */}
          {dashboardData.recent.customers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <span>Recent Customers</span>
                </CardTitle>
                <CardDescription>Latest client companies added</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recent.customers.slice(0, 5).map((customer: any) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{customer.companyName}</h4>
                        <p className="text-sm text-gray-600">Industry: {customer.industry}</p>
                        <p className="text-xs text-gray-500 mt-1">Added: {formatDate(customer.createdAt)}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("customers")}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Timesheets */}
          {dashboardData.recent.timesheets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>Recent Timesheets</span>
                </CardTitle>
                <CardDescription>Latest time tracking entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recent.timesheets.slice(0, 5).map((timesheet: any) => (
                    <div
                      key={timesheet.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{timesheet.recruiterName}</h4>
                        <p className="text-sm text-gray-600">Task: {timesheet.taskType}</p>
                        <p className="text-xs text-gray-500 mt-1">Date: {timesheet.date} ({timesheet.hours} hours)</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(timesheet.status)}>
                          {timesheet.status}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => setActiveTab("timesheet")}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-blue-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Access your most common tasks</CardDescription>
        </CardHeader>
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
      </Card>
    </div>
  )
}
