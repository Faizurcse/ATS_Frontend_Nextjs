"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface ManagerDashboardProps {
  currentUser: any
}

export default function ManagerDashboard({ currentUser }: ManagerDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")

  // Mock manager-specific stats
  const teamStats = [
    {
      label: "Team Members",
      value: "12",
      change: "+2 this quarter",
      color: "text-blue-600",
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "Active Jobs",
      value: "18",
      change: "+3 this week",
      color: "text-green-600",
      icon: <Briefcase className="w-5 h-5 text-green-600" />,
    },
    {
      label: "Team Revenue",
      value: "$284K",
      change: "+22% vs last month",
      color: "text-purple-600",
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
    },
    {
      label: "Avg. Time to Fill",
      value: "14.2 days",
      change: "-1.8 days improved",
      color: "text-orange-600",
      icon: <Clock className="w-5 h-5 text-orange-600" />,
    },
    {
      label: "Team Target",
      value: "87%",
      change: "of monthly goal",
      color: "text-emerald-600",
      icon: <Target className="w-5 h-5 text-emerald-600" />,
    },
    {
      label: "Success Rate",
      value: "76%",
      change: "offer acceptance",
      color: "text-cyan-600",
      icon: <CheckCircle className="w-5 h-5 text-cyan-600" />,
    },
  ]

  const teamMembers = [
    {
      id: "1",
      name: "Sarah Wilson",
      role: "Senior Recruiter",
      activeJobs: 5,
      candidates: 23,
      hires: 3,
      revenue: "$89K",
      target: 92,
      status: "on-track",
    },
    {
      id: "2",
      name: "Emily Chen",
      role: "Technical Recruiter",
      activeJobs: 4,
      candidates: 18,
      hires: 2,
      revenue: "$67K",
      target: 78,
      status: "behind",
    },
    {
      id: "3",
      name: "Mike Johnson",
      role: "Executive Recruiter",
      activeJobs: 6,
      candidates: 31,
      hires: 4,
      revenue: "$128K",
      target: 105,
      status: "ahead",
    },
    {
      id: "4",
      name: "David Brown",
      role: "Sales Recruiter",
      activeJobs: 3,
      candidates: 15,
      hires: 2,
      revenue: "$54K",
      target: 89,
      status: "on-track",
    },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      type: "interview",
      title: "Panel Interview - Senior Developer",
      candidate: "John Smith",
      date: "Today, 2:00 PM",
      recruiter: "Sarah Wilson",
      priority: "high",
    },
    {
      id: 2,
      type: "offer",
      title: "Offer Response Deadline",
      candidate: "Alice Johnson",
      date: "Tomorrow, EOD",
      recruiter: "Emily Chen",
      priority: "high",
    },
    {
      id: 3,
      type: "review",
      title: "Team Performance Review",
      candidate: "Team Meeting",
      date: "Friday, 10:00 AM",
      recruiter: "All Team",
      priority: "medium",
    },
  ]

  const teamInsights = [
    {
      insight: "Technical recruitment team is performing 15% above target",
      type: "positive",
      action: "Consider expanding technical job postings",
    },
    {
      insight: "Average response time to candidates has increased to 2.3 days",
      type: "warning",
      action: "Review and optimize communication workflows",
    },
    {
      insight: "Q4 hiring goal achievement probability: 89%",
      type: "info",
      action: "Maintain current pace to meet quarterly targets",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ahead":
        return "text-green-600"
      case "on-track":
        return "text-blue-600"
      case "behind":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ahead":
        return "bg-green-100 text-green-800 border-green-200"
      case "on-track":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "behind":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-gray-600">Manage your team's performance and goals</p>
        </div>
        <div className="flex space-x-2">
          {["7d", "30d", "90d"].map((range) => (
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

      {/* Team Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {stat.icon}
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <p className="text-sm text-gray-600">Individual team member metrics</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(member.status)}>{member.status.replace("-", " ")}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Jobs</p>
                      <p className="font-semibold text-blue-600">{member.activeJobs}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Candidates</p>
                      <p className="font-semibold text-green-600">{member.candidates}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hires</p>
                      <p className="font-semibold text-purple-600">{member.hires}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold text-orange-600">{member.revenue}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Target Progress</span>
                      <span className={getStatusColor(member.status)}>{member.target}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          member.target >= 100 ? "bg-green-600" : member.target >= 80 ? "bg-blue-600" : "bg-red-600"
                        }`}
                        style={{ width: `${Math.min(member.target, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Upcoming Deadlines</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Important dates and deadlines</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className={`p-4 rounded-lg border ${getPriorityColor(deadline.priority)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{deadline.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{deadline.candidate}</p>
                      <p className="text-xs text-gray-500 mt-1">Assigned to: {deadline.recruiter}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          deadline.priority === "high"
                            ? "border-red-300 text-red-700"
                            : "border-yellow-300 text-yellow-700"
                        }
                      >
                        {deadline.priority}
                      </Badge>
                      <p className="text-sm font-medium text-gray-900 mt-1">{deadline.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Team Insights</span>
          </CardTitle>
          <p className="text-sm text-gray-600">AI-powered recommendations and insights</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === "positive"
                    ? "border-green-200 bg-green-50"
                    : insight.type === "warning"
                      ? "border-orange-200 bg-orange-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {insight.type === "positive" ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : insight.type === "warning" ? (
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{insight.insight}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Recommended Action:</strong> {insight.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
