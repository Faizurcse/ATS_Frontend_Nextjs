"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Target,
  Award,
} from "lucide-react"
import { formatDate, isDateInRange } from "../../lib/date-utils"
import { DateFilter } from "@/components/date-filter"
import { RecruiterFilter } from "@/components/recruiter-filter"

interface RecruiterActivity {
  recruiterId: string
  recruiterName: string
  recruiterLoginName: string
  recruiterEmail: string
  department: string
  jobsPosted: number
  candidatesAdded: number
  interviewsScheduled: number
  interviewsConducted: number
  offersExtended: number
  successfulHires: number
  avgTimeToHire: number
  totalRevenue: number
  placementFees: number
  bonuses: number
  activeJobs: number
  lastActivity: string
  joinedDate: string
  clientMeetings: number
  responseTime: number
  candidateQualityScore: number
  clientSatisfactionScore: number
  offerAcceptanceRate: number
  pipelineConversionRate: number
  targetRevenue: number
  previousPeriodComparison: {
    hires: number
    revenue: number
    timeToHire: number
  }
}

interface MetricCard {
  title: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
}

export default function Reports() {
  const [dateFilter, setDateFilter] = useState("this-month")
  const [recruiterFilter, setRecruiterFilter] = useState("all")

  const recruiters = [
    { id: "1", name: "John Doe", loginName: "jdoe" },
    { id: "2", name: "Sarah Wilson", loginName: "swilson" },
    { id: "3", name: "Emily Chen", loginName: "echen" },
    { id: "4", name: "David Brown", loginName: "dbrown" },
  ]

  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedRecruiter, setSelectedRecruiter] = useState("all")

  const recruiterActivities: RecruiterActivity[] = [
    {
      recruiterId: "1",
      recruiterName: "John Doe",
      recruiterLoginName: "jdoe",
      recruiterEmail: "john.doe@company.com",
      department: "Technology",
      jobsPosted: 12,
      candidatesAdded: 85,
      interviewsScheduled: 45,
      interviewsConducted: 42,
      offersExtended: 8,
      successfulHires: 6,
      avgTimeToHire: 22,
      totalRevenue: 180000,
      placementFees: 135000,
      bonuses: 45000,
      activeJobs: 7,
      lastActivity: "2024-01-18",
      joinedDate: "2023-06-15",
      clientMeetings: 24,
      responseTime: 4.2,
      candidateQualityScore: 7.8,
      clientSatisfactionScore: 8.2,
      offerAcceptanceRate: 75,
      pipelineConversionRate: 14.1,
      targetRevenue: 200000,
      previousPeriodComparison: {
        hires: 1,
        revenue: 15000,
        timeToHire: -2,
      },
    },
    {
      recruiterId: "2",
      recruiterName: "Sarah Wilson",
      recruiterLoginName: "swilson",
      recruiterEmail: "sarah.wilson@company.com",
      department: "Technology",
      jobsPosted: 15,
      candidatesAdded: 120,
      interviewsScheduled: 68,
      interviewsConducted: 65,
      offersExtended: 12,
      successfulHires: 9,
      avgTimeToHire: 18,
      totalRevenue: 270000,
      placementFees: 202500,
      bonuses: 67500,
      activeJobs: 8,
      lastActivity: "2024-01-18",
      joinedDate: "2023-04-10",
      clientMeetings: 32,
      responseTime: 2.8,
      candidateQualityScore: 8.5,
      clientSatisfactionScore: 9.1,
      offerAcceptanceRate: 83,
      pipelineConversionRate: 13.2,
      targetRevenue: 250000,
      previousPeriodComparison: {
        hires: 2,
        revenue: 45000,
        timeToHire: -3,
      },
    },
    {
      recruiterId: "3",
      recruiterName: "Emily Chen",
      recruiterLoginName: "echen",
      recruiterEmail: "emily.chen@company.com",
      department: "Marketing",
      jobsPosted: 18,
      candidatesAdded: 95,
      interviewsScheduled: 52,
      interviewsConducted: 50,
      offersExtended: 10,
      successfulHires: 8,
      avgTimeToHire: 16,
      totalRevenue: 240000,
      placementFees: 180000,
      bonuses: 60000,
      activeJobs: 9,
      lastActivity: "2024-01-18",
      joinedDate: "2023-08-20",
      clientMeetings: 28,
      responseTime: 3.1,
      candidateQualityScore: 8.8,
      clientSatisfactionScore: 8.7,
      offerAcceptanceRate: 80,
      pipelineConversionRate: 15.8,
      targetRevenue: 220000,
      previousPeriodComparison: {
        hires: 1,
        revenue: 30000,
        timeToHire: -1,
      },
    },
    {
      recruiterId: "4",
      recruiterName: "David Brown",
      recruiterLoginName: "dbrown",
      recruiterEmail: "david.brown@company.com",
      department: "Sales",
      jobsPosted: 10,
      candidatesAdded: 65,
      interviewsScheduled: 35,
      interviewsConducted: 32,
      offersExtended: 6,
      successfulHires: 4,
      avgTimeToHire: 25,
      totalRevenue: 120000,
      placementFees: 90000,
      bonuses: 30000,
      activeJobs: 5,
      lastActivity: "2024-01-16",
      joinedDate: "2023-11-05",
      clientMeetings: 18,
      responseTime: 5.5,
      candidateQualityScore: 7.2,
      clientSatisfactionScore: 7.8,
      offerAcceptanceRate: 67,
      pipelineConversionRate: 12.3,
      targetRevenue: 150000,
      previousPeriodComparison: {
        hires: -1,
        revenue: -15000,
        timeToHire: 3,
      },
    },
  ]

  const filteredActivities = recruiterActivities.filter((activity) => {
    const matchesRecruiter = recruiterFilter === "all" || activity.recruiterId === recruiterFilter
    const matchesDate = dateFilter === "all" || isDateInRange(activity.lastActivity, dateFilter)
    return matchesRecruiter && matchesDate
  })

  const totalMetrics = recruiterActivities.reduce(
    (acc, activity) => ({
      jobsPosted: acc.jobsPosted + activity.jobsPosted,
      candidatesAdded: acc.candidatesAdded + activity.candidatesAdded,
      interviewsScheduled: acc.interviewsScheduled + activity.interviewsScheduled,
      interviewsConducted: acc.interviewsConducted + activity.interviewsConducted,
      offersExtended: acc.offersExtended + activity.offersExtended,
      successfulHires: acc.successfulHires + activity.successfulHires,
      totalRevenue: acc.totalRevenue + activity.totalRevenue,
      placementFees: acc.placementFees + activity.placementFees,
      bonuses: acc.bonuses + activity.bonuses,
      activeJobs: acc.activeJobs + activity.activeJobs,
      clientMeetings: acc.clientMeetings + activity.clientMeetings,
      targetRevenue: acc.targetRevenue + activity.targetRevenue,
    }),
    {
      jobsPosted: 0,
      candidatesAdded: 0,
      interviewsScheduled: 0,
      interviewsConducted: 0,
      offersExtended: 0,
      successfulHires: 0,
      totalRevenue: 0,
      placementFees: 0,
      bonuses: 0,
      activeJobs: 0,
      clientMeetings: 0,
      targetRevenue: 0,
    },
  )

  const avgTimeToHire =
    recruiterActivities.reduce((sum, activity) => sum + activity.avgTimeToHire, 0) / recruiterActivities.length

  const avgOfferAcceptanceRate =
    recruiterActivities.reduce((sum, activity) => sum + activity.offerAcceptanceRate, 0) / recruiterActivities.length

  const metricCards: MetricCard[] = [
    {
      title: "Total Jobs Posted",
      value: totalMetrics.jobsPosted,
      change: "+12%",
      trend: "up",
      icon: <Briefcase className="h-4 w-4 text-blue-600" />,
    },
    {
      title: "Candidates Added",
      value: totalMetrics.candidatesAdded,
      change: "+8%",
      trend: "up",
      icon: <Users className="h-4 w-4 text-green-600" />,
    },
    {
      title: "Successful Hires",
      value: totalMetrics.successfulHires,
      change: "+15%",
      trend: "up",
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: "Total Revenue",
      value: `$${totalMetrics.totalRevenue.toLocaleString()}`,
      change: "+22%",
      trend: "up",
      icon: <DollarSign className="h-4 w-4 text-purple-600" />,
    },
    {
      title: "Avg. Time to Hire",
      value: `${Math.round(avgTimeToHire)} days`,
      change: "-3 days",
      trend: "up",
      icon: <Clock className="h-4 w-4 text-orange-600" />,
    },
    {
      title: "Offer Acceptance Rate",
      value: `${Math.round(avgOfferAcceptanceRate)}%`,
      change: "+5%",
      trend: "up",
      icon: <Target className="h-4 w-4 text-indigo-600" />,
    },
  ]

  const getPerformanceColor = (value: number, type: "hires" | "revenue" | "time" | "rate") => {
    if (type === "hires") {
      if (value >= 7) return "text-green-600"
      if (value >= 4) return "text-orange-600"
      return "text-red-600"
    }
    if (type === "revenue") {
      if (value >= 200000) return "text-green-600"
      if (value >= 150000) return "text-orange-600"
      return "text-red-600"
    }
    if (type === "time") {
      if (value <= 18) return "text-green-600"
      if (value <= 22) return "text-orange-600"
      return "text-red-600"
    }
    if (type === "rate") {
      if (value >= 80) return "text-green-600"
      if (value >= 70) return "text-orange-600"
      return "text-red-600"
    }
    return "text-gray-600"
  }

  const getPerformanceBadge = (activity: RecruiterActivity) => {
    const score =
      (activity.successfulHires / 10) * 0.3 +
      (activity.totalRevenue / activity.targetRevenue) * 0.3 +
      (activity.offerAcceptanceRate / 100) * 0.2 +
      (activity.candidateQualityScore / 10) * 0.2

    if (score >= 0.85) return { label: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 0.7) return { label: "Good", color: "bg-blue-100 text-blue-800" }
    if (score >= 0.55) return { label: "Average", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  const exportReport = () => {
    // In a real app, this would generate and download a report
    alert("Report exported successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recruiter Activity Reports</h2>
          <p className="text-gray-600">Track performance metrics and key recruiting indicators</p>
        </div>
        <div className="flex space-x-3">
          <DateFilter value={dateFilter} onValueChange={setDateFilter} />
          <RecruiterFilter value={recruiterFilter} onValueChange={setRecruiterFilter} recruiters={recruiters} />
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>{metric.change}</span>
                <span className="text-gray-600">from last {selectedPeriod}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recruiter Performance Overview</CardTitle>
              <CardDescription>Individual recruiter metrics and comprehensive KPIs</CardDescription>
            </div>
            <Select value={selectedRecruiter} onValueChange={setSelectedRecruiter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                {recruiterActivities.map((recruiter) => (
                  <SelectItem key={recruiter.recruiterId} value={recruiter.recruiterId}>
                    {recruiter.recruiterName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recruiter</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Jobs Posted</TableHead>
                <TableHead>Candidates</TableHead>
                <TableHead>Interviews</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead>Hires</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Target Progress</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => {
                const performanceBadge = getPerformanceBadge(activity)
                const targetProgress = (activity.totalRevenue / activity.targetRevenue) * 100
                return (
                  <TableRow key={activity.recruiterId} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${activity.recruiterName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
                          />
                          <AvatarFallback>
                            {activity.recruiterName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{activity.recruiterName}</div>
                          <div className="text-sm text-gray-500">@{activity.recruiterLoginName}</div>
                          <div className="text-xs text-gray-400">{activity.recruiterEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {activity.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{activity.jobsPosted}</div>
                        <div className="text-xs text-gray-500">{activity.activeJobs} active</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{activity.candidatesAdded}</div>
                        <div className="text-xs text-gray-500">Quality: {activity.candidateQualityScore}/10</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{activity.interviewsConducted}</div>
                        <div className="text-xs text-gray-500">{activity.interviewsScheduled} scheduled</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{activity.offersExtended}</div>
                        <div className={`text-xs ${getPerformanceColor(activity.offerAcceptanceRate, "rate")}`}>
                          {activity.offerAcceptanceRate}% accepted
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span
                          className={`font-semibold text-lg ${getPerformanceColor(activity.successfulHires, "hires")}`}
                        >
                          {activity.successfulHires}
                        </span>
                        <div className="text-xs text-gray-500">
                          {activity.previousPeriodComparison.hires > 0 ? "+" : ""}
                          {activity.previousPeriodComparison.hires} vs last period
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className={`font-semibold ${getPerformanceColor(activity.totalRevenue, "revenue")}`}>
                          ${activity.totalRevenue.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-500">Fees: ${activity.placementFees.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Bonus: ${activity.bonuses.toLocaleString()}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{targetProgress.toFixed(0)}%</span>
                          <span className="text-gray-500">${activity.targetRevenue.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              targetProgress >= 100
                                ? "bg-green-600"
                                : targetProgress >= 80
                                  ? "bg-blue-600"
                                  : targetProgress >= 60
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                            }`}
                            style={{ width: `${Math.min(targetProgress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={performanceBadge.color}>{performanceBadge.label}</Badge>
                        <div className="text-xs text-gray-500">Avg. Time: {activity.avgTimeToHire}d</div>
                        <div className="text-xs text-gray-500">Client Sat: {activity.clientSatisfactionScore}/10</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(activity.lastActivity)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Joined: {formatDate(activity.joinedDate)}</div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <span>Key Performance Indicators</span>
            </CardTitle>
            <CardDescription>Critical metrics for recruiting success</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Candidate-to-Hire Ratio</span>
              <span className="text-lg font-bold text-blue-600">
                {Math.round(totalMetrics.candidatesAdded / totalMetrics.successfulHires)}:1
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Interview-to-Offer Ratio</span>
              <span className="text-lg font-bold text-green-600">
                {Math.round((totalMetrics.offersExtended / totalMetrics.interviewsConducted) * 100)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Revenue per Hire</span>
              <span className="text-lg font-bold text-purple-600">
                ${Math.round(totalMetrics.totalRevenue / totalMetrics.successfulHires).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Team Target Achievement</span>
              <span className="text-lg font-bold text-orange-600">
                {Math.round((totalMetrics.totalRevenue / totalMetrics.targetRevenue) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>Recent recruiting activities and trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Jobs with Active Candidates</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <span className="text-sm font-medium">
                    {totalMetrics.activeJobs}/{totalMetrics.jobsPosted}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Interviews This Period</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                  <span className="text-sm font-medium">{totalMetrics.interviewsConducted}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Offers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <span className="text-sm font-medium">{totalMetrics.offersExtended}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Client Meetings</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                  <span className="text-sm font-medium">{totalMetrics.clientMeetings}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
