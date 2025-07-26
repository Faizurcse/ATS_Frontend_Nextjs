"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Calendar,
  FileText,
  CheckCircle,
  DollarSign,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Download,
} from "lucide-react"

import PerformanceDashboard from "../../components/performance/performance-dashboard"
import RecruiterJobs from "./recruiter-jobs"
import PostedCandidates from "./posted-candidates"
import AddedInterviews from "./added-interviews"
import { MOCK_PERFORMANCE_DATA } from "../../lib/performance-data"
import {
  MOCK_ACTIVITY_LOG,
  getJobsByRecruiter,
  getCandidatesByRecruiter,
  getInterviewsByRecruiter,
  getOffersByRecruiter,
  getHiresByRecruiter,
  calculateRevenue,
  getAverageTimeToHire,
} from "../../lib/recruiter-data"
import { getCurrentUser } from "../../lib/auth-utils"

interface RecruiterPerformanceProps {
  currentUser?: {
    id: string
    name: string
    role: string
  }
}

// Mock data for offers, hires, and revenue
const MOCK_OFFERS_DATA = [
  {
    id: "1",
    candidateName: "Michael Chen",
    jobTitle: "Data Scientist",
    salary: 130000,
    status: "pending",
    offerDate: "2024-01-19",
    responseDeadline: "2024-01-26",
    benefits: ["Health Insurance", "401k", "Flexible PTO", "Stock Options"],
    recruiterId: "2",
  },
  {
    id: "2",
    candidateName: "Sarah Johnson",
    jobTitle: "Marketing Manager",
    salary: 95000,
    status: "accepted",
    offerDate: "2024-01-15",
    responseDeadline: "2024-01-22",
    benefits: ["Health Insurance", "401k", "Remote Work"],
    recruiterId: "2",
  },
  {
    id: "3",
    candidateName: "Robert Kim",
    jobTitle: "Senior Software Engineer",
    salary: 155000,
    status: "negotiating",
    offerDate: "2024-01-20",
    responseDeadline: "2024-01-27",
    benefits: ["Health Insurance", "401k", "Stock Options", "Gym Membership"],
    recruiterId: "2",
  },
  {
    id: "4",
    candidateName: "Lisa Rodriguez",
    jobTitle: "UX Designer",
    salary: 105000,
    status: "rejected",
    offerDate: "2024-01-12",
    responseDeadline: "2024-01-19",
    benefits: ["Health Insurance", "401k", "Flexible PTO"],
    recruiterId: "2",
  },
]

const MOCK_HIRES_DATA = [
  {
    id: "1",
    candidateName: "Lisa Rodriguez",
    jobTitle: "UX Designer",
    hireDate: "2024-01-10",
    startDate: "2024-01-24",
    salary: 95000,
    department: "Design",
    manager: "Alex Thompson",
    placementFee: 19000,
    recruiterId: "2",
  },
  {
    id: "2",
    candidateName: "James Wilson",
    jobTitle: "Backend Engineer",
    hireDate: "2024-01-05",
    startDate: "2024-01-19",
    salary: 125000,
    department: "Engineering",
    manager: "Sarah Chen",
    placementFee: 25000,
    recruiterId: "2",
  },
  {
    id: "3",
    candidateName: "Maria Garcia",
    jobTitle: "Product Manager",
    hireDate: "2023-12-28",
    startDate: "2024-01-15",
    salary: 135000,
    department: "Product",
    manager: "David Kim",
    placementFee: 27000,
    recruiterId: "2",
  },
  {
    id: "4",
    candidateName: "Kevin Park",
    jobTitle: "DevOps Engineer",
    hireDate: "2023-12-20",
    startDate: "2024-01-08",
    salary: 120000,
    department: "Engineering",
    manager: "Jennifer Lee",
    placementFee: 24000,
    recruiterId: "2",
  },
]

const MOCK_REVENUE_DATA = [
  {
    month: "January 2024",
    totalRevenue: 95000,
    placementFees: 71000,
    bonuses: 24000,
    hiresCount: 3,
    averageRevenuePerHire: 31667,
  },
  {
    month: "December 2023",
    totalRevenue: 78000,
    placementFees: 51000,
    bonuses: 27000,
    hiresCount: 2,
    averageRevenuePerHire: 39000,
  },
  {
    month: "November 2023",
    totalRevenue: 112000,
    placementFees: 89000,
    bonuses: 23000,
    hiresCount: 4,
    averageRevenuePerHire: 28000,
  },
  {
    month: "October 2023",
    totalRevenue: 67000,
    placementFees: 45000,
    bonuses: 22000,
    hiresCount: 2,
    averageRevenuePerHire: 33500,
  },
]

export default function RecruiterPerformance({ currentUser }: RecruiterPerformanceProps) {
  const user = currentUser ?? getCurrentUser()
  const [selectedRecruiter, setSelectedRecruiter] = useState(user.id)
  const [selectedPeriod, setSelectedPeriod] = useState("Q1 2024")

  // Get data for selected recruiter
  const recruiterJobs = getJobsByRecruiter(selectedRecruiter)
  const recruiterCandidates = getCandidatesByRecruiter(selectedRecruiter)
  const recruiterInterviews = getInterviewsByRecruiter(selectedRecruiter)
  const recruiterOffers = getOffersByRecruiter(selectedRecruiter)
  const recruiterHires = getHiresByRecruiter(selectedRecruiter)

  // Calculate key metrics
  const totalRevenue = calculateRevenue(recruiterHires)
  const avgTimeToHire = getAverageTimeToHire(recruiterHires)

  // Get performance data
  const performanceMetrics =
    MOCK_PERFORMANCE_DATA.find((data) => data.recruiterId === selectedRecruiter) || MOCK_PERFORMANCE_DATA[0]

  // Recent activity for selected recruiter
  const recentActivity = MOCK_ACTIVITY_LOG.filter((activity) => activity.userId === selectedRecruiter).slice(0, 10)

  const overviewStats = {
    jobs: {
      total: recruiterJobs.length,
      open: recruiterJobs.filter((job) => job.status === "open").length,
      filled: recruiterJobs.filter((job) => job.status === "filled").length,
    },
    candidates: {
      total: recruiterCandidates.length,
      new: recruiterCandidates.filter((c) => c.status === "new").length,
      interviewed: recruiterCandidates.filter((c) => c.status === "interviewed").length,
    },
    interviews: {
      total: recruiterInterviews.length,
      scheduled: recruiterInterviews.filter((i) => i.status === "scheduled").length,
      completed: recruiterInterviews.filter((i) => i.status === "completed").length,
    },
    offers: {
      total: MOCK_OFFERS_DATA.length,
      pending: MOCK_OFFERS_DATA.filter((o) => o.status === "pending").length,
      accepted: MOCK_OFFERS_DATA.filter((o) => o.status === "accepted").length,
    },
    hires: {
      total: MOCK_HIRES_DATA.length,
      thisMonth: MOCK_HIRES_DATA.filter((h) => {
        const hireDate = new Date(h.hireDate)
        const thisMonth = new Date()
        return hireDate.getMonth() === thisMonth.getMonth() && hireDate.getFullYear() === thisMonth.getFullYear()
      }).length,
    },
  }

  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job":
        return <FileText className="w-4 h-4 text-blue-600" />
      case "candidate":
        return <Users className="w-4 h-4 text-green-600" />
      case "interview":
        return <Calendar className="w-4 h-4 text-purple-600" />
      case "offer":
        return <CheckCircle className="w-4 h-4 text-orange-600" />
      case "hire":
        return <DollarSign className="w-4 h-4 text-emerald-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "negotiating":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Performance</h1>
          <p className="text-gray-600">Comprehensive performance analytics and workflow management</p>
        </div>

        <div className="flex gap-2">
          {user.role === "admin" && (
            <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_PERFORMANCE_DATA.map((recruiter) => (
                  <SelectItem key={recruiter.recruiterId} value={recruiter.recruiterId}>
                    {recruiter.recruiterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
              <SelectItem value="Q4 2023">Q4 2023</SelectItem>
              <SelectItem value="Q3 2023">Q3 2023</SelectItem>
              <SelectItem value="2023">Full Year 2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="hires">Hires</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
                <FileText className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.jobs.total}</div>
                <p className="text-xs text-gray-600">
                  {overviewStats.jobs.open} open, {overviewStats.jobs.filled} filled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <Users className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.candidates.total}</div>
                <p className="text-xs text-gray-600">
                  {overviewStats.candidates.new} new, {overviewStats.candidates.interviewed} interviewed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <Calendar className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats.interviews.total}</div>
                <p className="text-xs text-gray-600">{overviewStats.interviews.completed} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Average Time to Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{avgTimeToHire} days</div>
                <p className="text-sm text-gray-600 mt-1">
                  {avgTimeToHire <= 18 ? "Below industry average" : "Above industry average"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
                  Average Time to Hire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{avgTimeToHire} days</div>
                <p className="text-sm text-gray-600 mt-1">
                  {avgTimeToHire <= 18 ? "Below industry average" : "Above industry average"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                <p className="text-sm text-gray-600 mt-1">Generated from {MOCK_HIRES_DATA.length} successful hires</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {recruiterCandidates.length > 0
                    ? ((MOCK_HIRES_DATA.length / recruiterCandidates.length) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <p className="text-sm text-gray-600 mt-1">Candidate to hire conversion</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-gray-600">Latest updates on your recruitment activities</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                          {activity.entityName}
                        </p>
                        <p className="text-xs text-gray-600">{formatActivityTime(activity.timestamp)}</p>
                      </div>
                      <Badge
                        className={
                          activity.importance === "high"
                            ? "bg-red-100 text-red-800"
                            : activity.importance === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {activity.importance}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceDashboard recruiterId={selectedRecruiter} />
        </TabsContent>

        <TabsContent value="jobs">
          <RecruiterJobs recruiterId={selectedRecruiter} />
        </TabsContent>

        <TabsContent value="candidates">
          <PostedCandidates recruiterId={selectedRecruiter} />
        </TabsContent>

        <TabsContent value="interviews">
          <AddedInterviews recruiterId={selectedRecruiter} />
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Job Offers</CardTitle>
                  <p className="text-gray-600">Track and manage job offers extended to candidates</p>
                </div>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export Offers
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Offers Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{MOCK_OFFERS_DATA.length}</div>
                    <div className="text-sm text-blue-800">Total Offers</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {MOCK_OFFERS_DATA.filter((o) => o.status === "pending").length}
                    </div>
                    <div className="text-sm text-yellow-800">Pending</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {MOCK_OFFERS_DATA.filter((o) => o.status === "accepted").length}
                    </div>
                    <div className="text-sm text-green-800">Accepted</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      $
                      {Math.round(
                        MOCK_OFFERS_DATA.reduce((sum, o) => sum + o.salary, 0) / MOCK_OFFERS_DATA.length,
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-800">Avg. Salary</div>
                  </div>
                </div>

                {/* Offers Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Offer Date</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_OFFERS_DATA.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {offer.candidateName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{offer.candidateName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{offer.jobTitle}</TableCell>
                        <TableCell className="font-semibold">${offer.salary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getOfferStatusColor(offer.status)}>
                            {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(offer.offerDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(offer.responseDeadline).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hires">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Successful Hires</CardTitle>
                  <p className="text-gray-600">View all successfully completed hires and their details</p>
                </div>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export Hires
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Hires Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{MOCK_HIRES_DATA.length}</div>
                    <div className="text-sm text-green-800">Total Hires</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${MOCK_HIRES_DATA.reduce((sum, h) => sum + h.placementFee, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-800">Total Fees</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      $
                      {Math.round(
                        MOCK_HIRES_DATA.reduce((sum, h) => sum + h.salary, 0) / MOCK_HIRES_DATA.length,
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-800">Avg. Salary</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {
                        MOCK_HIRES_DATA.filter((h) => {
                          const hireDate = new Date(h.hireDate)
                          const thisMonth = new Date()
                          return hireDate.getMonth() === thisMonth.getMonth()
                        }).length
                      }
                    </div>
                    <div className="text-sm text-orange-800">This Month</div>
                  </div>
                </div>

                {/* Hires Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Placement Fee</TableHead>
                      <TableHead>Manager</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_HIRES_DATA.map((hire) => (
                      <TableRow key={hire.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {hire.candidateName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{hire.candidateName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{hire.jobTitle}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{hire.department}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${hire.salary.toLocaleString()}</TableCell>
                        <TableCell>{new Date(hire.hireDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(hire.startDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ${hire.placementFee.toLocaleString()}
                        </TableCell>
                        <TableCell>{hire.manager}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <p className="text-gray-600">Track revenue generated from successful placements</p>
                </div>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export Revenue Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Revenue Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.totalRevenue, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-green-800">Total Revenue</div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      ${MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.placementFees, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-800">Placement Fees</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.bonuses, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-800">Bonuses</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      $
                      {Math.round(
                        MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.averageRevenuePerHire, 0) /
                          MOCK_REVENUE_DATA.length,
                      ).toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-800">Avg. Per Hire</div>
                  </div>
                </div>

                {/* Monthly Revenue Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monthly Revenue Breakdown</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Total Revenue</TableHead>
                        <TableHead>Placement Fees</TableHead>
                        <TableHead>Bonuses</TableHead>
                        <TableHead>Hires Count</TableHead>
                        <TableHead>Avg. Revenue/Hire</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_REVENUE_DATA.map((revenue, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{revenue.month}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            ${revenue.totalRevenue.toLocaleString()}
                          </TableCell>
                          <TableCell>${revenue.placementFees.toLocaleString()}</TableCell>
                          <TableCell>${revenue.bonuses.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{revenue.hiresCount}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${revenue.averageRevenuePerHire.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Revenue Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Performance Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-900">Best Month</span>
                        </div>
                        <p className="text-sm text-green-800 mt-1">
                          November 2023 with ${MOCK_REVENUE_DATA[2].totalRevenue.toLocaleString()} revenue
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-900">Highest Per-Hire Revenue</span>
                        </div>
                        <p className="text-sm text-blue-800 mt-1">
                          December 2023 with ${MOCK_REVENUE_DATA[1].averageRevenuePerHire.toLocaleString()} per hire
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-purple-900">Total Placements</span>
                        </div>
                        <p className="text-sm text-purple-800 mt-1">
                          {MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.hiresCount, 0)} successful hires completed
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Revenue Targets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Q1 2024 Target</span>
                          <span className="font-semibold">$400,000</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.totalRevenue, 0) / 400000) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          ${MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.totalRevenue, 0).toLocaleString()} of $400,000
                          ({Math.round((MOCK_REVENUE_DATA.reduce((sum, r) => sum + r.totalRevenue, 0) / 400000) * 100)}
                          %)
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <p className="text-gray-600">Complete history of all recruitment activities</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ACTIVITY_LOG.filter((activity) => activity.userId === selectedRecruiter).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {activity.action.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                          {activity.entityName}
                        </p>
                        <span className="text-sm text-gray-500">{formatActivityTime(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} activity
                      </p>
                      {Object.keys(activity.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">{JSON.stringify(activity.details, null, 2)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
