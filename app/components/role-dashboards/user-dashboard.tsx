"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface UserDashboardProps {
  currentUser: any
}

export default function UserDashboard({ currentUser }: UserDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")

  // Mock user-specific stats
  const personalStats = [
    {
      label: "My Active Jobs",
      value: "6",
      change: "+1 this week",
      color: "text-blue-600",
      icon: <Briefcase className="w-5 h-5 text-blue-600" />,
    },
    {
      label: "My Candidates",
      value: "34",
      change: "+8 this month",
      color: "text-green-600",
      icon: <Users className="w-5 h-5 text-green-600" />,
    },
    {
      label: "Interviews Scheduled",
      value: "5",
      change: "2 this week",
      color: "text-purple-600",
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
    },
    {
      label: "My Revenue",
      value: "$89K",
      change: "+12% vs last month",
      color: "text-orange-600",
      icon: <DollarSign className="w-5 h-5 text-orange-600" />,
    },
    {
      label: "Avg. Time to Fill",
      value: "12.5 days",
      change: "-2.3 days improved",
      color: "text-emerald-600",
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
    },
    {
      label: "Target Progress",
      value: "92%",
      change: "of monthly goal",
      color: "text-cyan-600",
      icon: <Target className="w-5 h-5 text-cyan-600" />,
    },
  ]

  const myJobs = [
    {
      id: "1",
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      candidates: 8,
      status: "active",
      deadline: "2024-02-15",
      priority: "high",
    },
    {
      id: "2",
      title: "Marketing Manager",
      company: "StartupXYZ",
      candidates: 5,
      status: "active",
      deadline: "2024-02-20",
      priority: "medium",
    },
    {
      id: "3",
      title: "Data Scientist",
      company: "DataFlow Solutions",
      candidates: 12,
      status: "filled",
      deadline: "2024-02-10",
      priority: "urgent",
    },
  ]

  const recentCandidates = [
    {
      id: "1",
      name: "John Smith",
      position: "Senior Software Engineer",
      status: "interviewed",
      lastUpdate: "2 hours ago",
      score: 85,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      position: "Marketing Manager",
      status: "new",
      lastUpdate: "1 day ago",
      score: 78,
    },
    {
      id: "3",
      name: "Michael Chen",
      position: "Data Scientist",
      status: "offered",
      lastUpdate: "3 hours ago",
      score: 92,
    },
    {
      id: "4",
      name: "Alice Wilson",
      position: "Senior Software Engineer",
      status: "screening",
      lastUpdate: "4 hours ago",
      score: 81,
    },
  ]

  const upcomingTasks = [
    {
      id: 1,
      task: "Interview with John Smith",
      time: "Today, 2:00 PM",
      type: "interview",
      priority: "high",
    },
    {
      id: 2,
      task: "Follow up with Sarah Johnson",
      time: "Tomorrow, 10:00 AM",
      type: "follow-up",
      priority: "medium",
    },
    {
      id: 3,
      task: "Submit weekly report",
      time: "Friday, EOD",
      type: "admin",
      priority: "low",
    },
  ]

  const personalInsights = [
    {
      insight: "Your interview-to-offer ratio improved by 15% this month",
      type: "positive",
      action: "Keep up the excellent screening process",
    },
    {
      insight: "Response time to candidates has increased slightly",
      type: "warning",
      action: "Consider setting up automated follow-up reminders",
    },
    {
      insight: "You're on track to exceed your monthly target by 8%",
      type: "info",
      action: "Consider taking on 1-2 additional challenging roles",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "filled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "screening":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "interviewed":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "offered":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-200 bg-red-50"
      case "high":
        return "border-orange-200 bg-orange-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Dashboard</h2>
          <p className="text-gray-600">Your personal recruitment overview</p>
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

      {/* Personal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalStats.map((stat, index) => (
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
        {/* My Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>My Active Jobs</CardTitle>
            <p className="text-sm text-gray-600">Jobs you're currently managing</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{job.candidates} candidates</span>
                    <span className="text-gray-600">Due: {job.deadline}</span>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={
                        job.priority === "urgent"
                          ? "border-red-300 text-red-700"
                          : job.priority === "high"
                            ? "border-orange-300 text-orange-700"
                            : "border-yellow-300 text-yellow-700"
                      }
                    >
                      {job.priority} priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Candidates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Candidates</CardTitle>
            <p className="text-sm text-gray-600">Latest candidate activities</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.position}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getCandidateStatusColor(candidate.status)}>{candidate.status}</Badge>
                      <p className={`text-sm font-semibold mt-1 ${getScoreColor(candidate.score)}`}>
                        AI Score: {candidate.score}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{candidate.lastUpdate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Upcoming Tasks</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Your schedule and deadlines</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className={`p-4 rounded-lg border ${getPriorityColor(task.priority)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.task}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.time}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        task.priority === "high"
                          ? "border-red-300 text-red-700"
                          : task.priority === "medium"
                            ? "border-orange-300 text-orange-700"
                            : "border-blue-300 text-blue-700"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Personal Insights</span>
            </CardTitle>
            <p className="text-sm text-gray-600">AI-powered recommendations for you</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {personalInsights.map((insight, index) => (
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
                        <strong>Suggestion:</strong> {insight.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
