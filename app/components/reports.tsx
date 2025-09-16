"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"
import { Alert, AlertDescription } from "../../components/ui/alert"
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  IndianRupee,
  Clock,
  Calendar,
  Target,
  Award,
  Rocket,
  FileText,
  UserCheck,
  Building2,
  Timer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
} from "lucide-react"
import BASE_API_URL from "../../BaseUrlApi"
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useCompany } from "../../lib/company-context"

interface ReportsData {
  metadata: {
    generatedAt: string
    totalRecords: number
  }
  summary: {
    overall: {
      totalJobs: number
      totalCandidates: number
      totalInterviews: number
      totalCustomers: number
      totalTimesheets: number
      totalActivities: number
    }
    jobs: {
      total: number
      active: number
      filled: number
      paused: number
      closed: number
      fillRate: string
    }
    candidates: {
      total: number
      pending: number
      shortlisted: number
      rejected: number
      hired: number
      conversionRate: string
    }
    interviews: {
      total: number
      scheduled: number
      completed: number
      cancelled: number
      rescheduled: number
      completionRate: string
    }
    customers: {
      total: number
      active: number
      inactive: number
      prospect: number
      suspended: number
      activeRate: string
    }
    timesheets: {
      total: number
      totalHours: string
      billableHours: string
      approved: number
      pending: number
      approvalRate: string
    }
  }
  details: {
    jobs: {
      data: any[]
      total: number
      statusBreakdown: any[]
      workTypeBreakdown: any[]
      topCompanies: any[]
    }
    candidates: {
      data: any[]
      total: number
      statusBreakdown: any[]
      topSkills: any[]
      experienceBreakdown: any[]
    }
    interviews: {
      data: any[]
      total: number
      statusBreakdown: any[]
      typeBreakdown: any[]
      modeBreakdown: any[]
    }
    customers: {
      data: any[]
      total: number
      statusBreakdown: any[]
      priorityBreakdown: any[]
      industryBreakdown: any[]
    }
    timesheets: {
      data: any[]
      total: number
      taskCategoryBreakdown: any[]
      entityTypeBreakdown: any[]
      priorityBreakdown: any[]
    }
  }
  insights: any[]
  trends: any[]
}

export default function Reports() {
  const { companyId, isAuthenticated, isLoading } = useCompany()
  const [reportsData, setReportsData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Show loading while company context is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-6 h-6 text-white">⏳</div>
          </div>
          <p className="text-gray-600">Loading company context...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (isAuthenticated && companyId) {
      fetchReportsData()
    }
  }, [isAuthenticated, companyId])

  const fetchReportsData = async () => {
    if (!companyId) {
      setError('Company context required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get JWT token from localStorage
      const user = JSON.parse(localStorage.getItem('ats_user') || 'null');
      const token = user?.token;
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      console.log('Fetching reports data from:', `${BASE_API_URL}/reports/reports-all?companyId=${companyId}`)
      const response = await fetch(`${BASE_API_URL}/reports/reports-all?companyId=${companyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error('Failed to fetch reports data')
      }
      const data = await response.json()
      console.log('Reports data received:', data)
      setReportsData(data.data)
    } catch (err) {
      console.error('Error fetching reports:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!reportsData) return

    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Jobs', reportsData.summary.overall.totalJobs],
      ['Total Candidates', reportsData.summary.overall.totalCandidates],
      ['Total Interviews', reportsData.summary.overall.totalInterviews],
      ['Total Customers', reportsData.summary.overall.totalCustomers],
      ['Total Timesheets', reportsData.summary.overall.totalTimesheets],
      ['Total Activities', reportsData.summary.overall.totalActivities],
      ['', ''],
      ['Jobs Fill Rate', `${reportsData.summary.jobs.fillRate}%`],
      ['Candidate Conversion Rate', `${reportsData.summary.candidates.conversionRate}%`],
      ['Interview Completion Rate', `${reportsData.summary.interviews.completionRate}%`],
      ['Customer Active Rate', `${reportsData.summary.customers.activeRate}%`],
      ['Timesheet Approval Rate', `${reportsData.summary.timesheets.approvalRate}%`],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Jobs sheet
    const jobsData = [
      ['Title', 'Company', 'Department', 'Recruiter', 'Job Type', 'Experience Level', 'Location', 'Work Type', 'Status', 'Salary Range', 'Priority', 'Applications']
    ]
    reportsData.details.jobs.data.forEach(job => {
      jobsData.push([
        job.title,
        job.company,
        job.department,
        job.recruiter,
        job.jobType,
        job.experienceLevel,
        job.fullLocation,
        job.workType,
        job.jobStatus,
        `${job.salaryMin}-${job.salaryMax}`,
        job.priority,
        job.applications?.length || 0
      ])
    })
    const jobsSheet = XLSX.utils.aoa_to_sheet(jobsData)
    XLSX.utils.book_append_sheet(workbook, jobsSheet, 'Jobs')

    // Candidates sheet
    const candidatesData = [
      ['Name', 'Email', 'Phone', 'Location', 'Job Title', 'Company', 'Status', 'Experience', 'Skills', 'Salary Expectation', 'Applied Date']
    ]
    reportsData.details.candidates.data.forEach(candidate => {
      candidatesData.push([
        `${candidate.firstName} ${candidate.lastName}`,
        candidate.email,
        candidate.phone,
        candidate.currentLocation,
        candidate.job?.title || '',
        candidate.job?.company || '',
        candidate.status,
        candidate.yearsOfExperience,
        candidate.keySkills,
        candidate.salaryExpectation,
        new Date(candidate.appliedAt).toLocaleDateString()
      ])
    })
    const candidatesSheet = XLSX.utils.aoa_to_sheet(candidatesData)
    XLSX.utils.book_append_sheet(workbook, candidatesSheet, 'Candidates')

    // Interviews sheet
    const interviewsData = [
      ['Candidate', 'Interview Date', 'Time', 'Type', 'Mode', 'Platform', 'Interviewer', 'Status', 'Job Title', 'Company']
    ]
    reportsData.details.interviews.data.forEach(interview => {
      interviewsData.push([
        interview.candidateName,
        new Date(interview.interviewDate).toLocaleDateString(),
        interview.interviewTime,
        interview.interviewType,
        interview.interviewMode,
        interview.platform,
        interview.interviewer,
        interview.status,
        interview.candidate?.job?.title || '',
        interview.candidate?.job?.company || ''
      ])
    })
    const interviewsSheet = XLSX.utils.aoa_to_sheet(interviewsData)
    XLSX.utils.book_append_sheet(workbook, interviewsSheet, 'Interviews')

    // Customers sheet
    const customersData = [
      ['Company Name', 'Industry', 'Size', 'Status', 'Priority', 'Location', 'Revenue', 'Contract Value', 'Billing Cycle']
    ]
    reportsData.details.customers.data.forEach(customer => {
      customersData.push([
        customer.companyName,
        customer.industry,
        customer.companySize,
        customer.status,
        customer.priority,
        `${customer.city}, ${customer.country}`,
        customer.annualRevenue,
        customer.contractValue,
        customer.billingCycle
      ])
    })
    const customersSheet = XLSX.utils.aoa_to_sheet(customersData)
    XLSX.utils.book_append_sheet(workbook, customersSheet, 'Customers')

    // Timesheets sheet
    const timesheetsData = [
      ['Recruiter', 'Date', 'Hours', 'Break Time', 'Entity Type', 'Task Type', 'Category', 'Priority', 'Status', 'Billable', 'Comments']
    ]
    reportsData.details.timesheets.data.forEach(timesheet => {
      timesheetsData.push([
        timesheet.recruiterName,
        timesheet.date,
        timesheet.hours,
        timesheet.breakTime,
        timesheet.entityType,
        timesheet.taskType,
        timesheet.taskCategory,
        timesheet.priority,
        timesheet.status,
        timesheet.billable ? 'Yes' : 'No',
        timesheet.comments
      ])
    })
    const timesheetsSheet = XLSX.utils.aoa_to_sheet(timesheetsData)
    XLSX.utils.book_append_sheet(workbook, timesheetsSheet, 'Timesheets')

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `ATS_Reports_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">Error loading reports</p>
          <Button onClick={fetchReportsData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!reportsData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <FileText className="w-8 h-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No reports data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Generated on {new Date(reportsData.metadata.generatedAt).toLocaleString()}
          </p>
        </div>
        <Button onClick={exportToExcel} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export to Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.overall.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {reportsData.summary.jobs.fillRate}% fill rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.overall.totalCandidates}</div>
            <p className="text-xs text-muted-foreground">
              {reportsData.summary.candidates.conversionRate}% conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.overall.totalInterviews}</div>
            <p className="text-xs text-muted-foreground">
              {reportsData.summary.interviews.completionRate}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.overall.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {reportsData.summary.customers.activeRate}% active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timesheets</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.overall.totalTimesheets}</div>
            <p className="text-xs text-muted-foreground">
              {reportsData.summary.timesheets.approvalRate}% approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.summary.overall.totalActivities}</div>
            <p className="text-xs text-muted-foreground">
              Total activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      {reportsData.insights.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportsData.insights.map((insight, index) => (
              <Alert key={index} className={insight.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{insight.message}</div>
                  <div className="text-sm text-muted-foreground mt-1">{insight.metric}</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Comprehensive job listings and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Job Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportsData.summary.jobs.active}</div>
                    <div className="text-sm text-gray-600">Active Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportsData.summary.jobs.filled}</div>
                    <div className="text-sm text-gray-600">Filled Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{reportsData.summary.jobs.paused}</div>
                    <div className="text-sm text-gray-600">Paused Jobs</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{reportsData.summary.jobs.closed}</div>
                    <div className="text-sm text-gray-600">Closed Jobs</div>
                  </div>
                </div>

                {/* Jobs Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Recruiter</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applications</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.details.jobs.data.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.recruiter}</TableCell>
                          <TableCell>{job.fullLocation}</TableCell>
                          <TableCell>
                            <Badge variant={job.jobStatus === 'ACTIVE' ? 'default' : 'secondary'}>
                              {job.jobStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{job.applications?.length || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Details</CardTitle>
              <CardDescription>Candidate applications and profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Candidate Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportsData.summary.candidates.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{reportsData.summary.candidates.shortlisted}</div>
                    <div className="text-sm text-gray-600">Shortlisted</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{reportsData.summary.candidates.rejected}</div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportsData.summary.candidates.hired}</div>
                    <div className="text-sm text-gray-600">Hired</div>
                  </div>
                </div>

                {/* Candidates Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.details.candidates.data.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">
                            {candidate.firstName} {candidate.lastName}
                          </TableCell>
                          <TableCell>{candidate.email}</TableCell>
                          <TableCell>{candidate.job?.title || '-'}</TableCell>
                          <TableCell>{candidate.job?.company || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={candidate.status === 'Interview Scheduled' ? 'default' : 'secondary'}>
                              {candidate.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(candidate.appliedAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>Scheduled and completed interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Interview Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportsData.summary.interviews.scheduled}</div>
                    <div className="text-sm text-gray-600">Scheduled</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportsData.summary.interviews.completed}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{reportsData.summary.interviews.cancelled}</div>
                    <div className="text-sm text-gray-600">Cancelled</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{reportsData.summary.interviews.rescheduled}</div>
                    <div className="text-sm text-gray-600">Rescheduled</div>
                  </div>
                </div>

                {/* Interviews Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Interview Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Interviewer</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.details.interviews.data.map((interview) => (
                        <TableRow key={interview.id}>
                          <TableCell className="font-medium">{interview.candidateName}</TableCell>
                          <TableCell>{new Date(interview.interviewDate).toLocaleDateString()}</TableCell>
                          <TableCell>{interview.interviewTime}</TableCell>
                          <TableCell>{interview.interviewType}</TableCell>
                          <TableCell>{interview.interviewMode}</TableCell>
                          <TableCell>{interview.interviewer}</TableCell>
                          <TableCell>
                            <Badge variant={interview.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                              {interview.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Customer information and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Customer Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportsData.summary.customers.active}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{reportsData.summary.customers.inactive}</div>
                    <div className="text-sm text-gray-600">Inactive</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{reportsData.summary.customers.prospect}</div>
                    <div className="text-sm text-gray-600">Prospect</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{reportsData.summary.customers.suspended}</div>
                    <div className="text-sm text-gray-600">Suspended</div>
                  </div>
                </div>

                {/* Customers Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.details.customers.data.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.companyName}</TableCell>
                          <TableCell>{customer.industry}</TableCell>
                          <TableCell>{customer.companySize}</TableCell>
                          <TableCell>
                            <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={customer.priority === 'CRITICAL' ? 'destructive' : 'outline'}>
                              {customer.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.city}, {customer.country}</TableCell>
                          <TableCell>{customer.annualRevenue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timesheet Details</CardTitle>
              <CardDescription>Time tracking and approval status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timesheet Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{reportsData.summary.timesheets.total}</div>
                    <div className="text-sm text-gray-600">Total Timesheets</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{reportsData.summary.timesheets.approved}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{reportsData.summary.timesheets.pending}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{reportsData.summary.timesheets.totalHours}</div>
                    <div className="text-sm text-gray-600">Total Hours</div>
                  </div>
                </div>

                {/* Timesheets Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recruiter</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Task Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Billable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportsData.details.timesheets.data.map((timesheet) => (
                        <TableRow key={timesheet.id}>
                          <TableCell className="font-medium">{timesheet.recruiterName}</TableCell>
                          <TableCell>{timesheet.date}</TableCell>
                          <TableCell>{timesheet.hours}</TableCell>
                          <TableCell>{timesheet.entityType}</TableCell>
                          <TableCell>{timesheet.taskCategory}</TableCell>
                          <TableCell>
                            <Badge variant={timesheet.priority === 'HIGH' ? 'destructive' : 'outline'}>
                              {timesheet.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={timesheet.status === 'APPROVED' ? 'default' : 'secondary'}>
                              {timesheet.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={timesheet.billable ? 'default' : 'secondary'}>
                              {timesheet.billable ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
