"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Briefcase,
  Building2,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"

interface AdminDashboardProps {
  currentUser: any
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [timeRange, setTimeRange] = useState("30d")

  // Mock comprehensive admin stats
  const systemStats = [
    {
      label: "Total Users",
      value: "247",
      change: "+12 this month",
      color: "text-blue-600",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      trend: "up",
    },
    {
      label: "Active Jobs",
      value: "89",
      change: "+7 this week",
      color: "text-green-600",
      icon: <Briefcase className="w-5 h-5 text-green-600" />,
      trend: "up",
    },
    {
      label: "Total Companies",
      value: "156",
      change: "+3 this month",
      color: "text-purple-600",
      icon: <Building2 className="w-5 h-5 text-purple-600" />,
      trend: "up",
    },
    {
      label: "System Revenue",
      value: "$2.4M",
      change: "+18% vs last month",
      color: "text-orange-600",
      icon: <DollarSign className="w-5 h-5 text-orange-600" />,
      trend: "up",
    },
    {
      label: "Avg. Time to Hire",
      value: "16.5 days",
      change: "-2.1 days improved",
      color: "text-emerald-600",
      icon: <Clock className="w-5 h-5 text-emerald-600" />,
      trend: "down",
    },
    {
      label: "System Health",
      value: "99.2%",
      change: "Uptime this month",
      color: "text-cyan-600",
      icon: <Shield className="w-5 h-5 text-cyan-600" />,
      trend: "stable",
    },
  ]

  const departmentStats = [
    { department: "Technology", recruiters: 12, activeJobs: 34, hires: 8, revenue: "$450K" },
    { department: "Marketing", recruiters: 8, activeJobs: 18, hires: 5, revenue: "$285K" },
    { department: "Sales", recruiters: 6, activeJobs: 22, hires: 7, revenue: "$320K" },
    { department: "Operations", recruiters: 4, activeJobs: 15, hires: 3, revenue: "$180K" },
  ]

  const systemAlerts = [
    {
      id: 1,
      type: "warning",
      title: "High Login Failures",
      message: "Unusual login failure rate detected from IP range 192.168.1.x",
      time: "15 minutes ago",
      severity: "medium",
    },
    {
      id: 2,
      type: "info",
      title: "Bulk Import Completed",
      message: "Successfully imported 156 candidate profiles",
      time: "1 hour ago",
      severity: "low",
    },
    {
      id: 3,
      type: "success",
      title: "System Backup Complete",
      message: "Daily backup completed successfully at 02:00 AM",
      time: "6 hours ago",
      severity: "low",
    },
  ]

  const topPerformers = [
    { name: "Sarah Wilson", role: "Senior Recruiter", hires: 23, revenue: "$345K", efficiency: 94 },
    { name: "Emily Chen", role: "Technical Recruiter", hires: 19, revenue: "$298K", efficiency: 91 },
    { name: "Mike Johnson", role: "Executive Recruiter", hires: 15, revenue: "$412K", efficiency: 89 },
    { name: "David Brown", role: "Sales Recruiter", hires: 18, revenue: "$267K", efficiency: 87 },
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-orange-200 bg-orange-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">System-wide overview and administration</p>
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

      {/* System Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {stat.icon}
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                    <TrendingUp
                      className={`w-3 h-3 ${stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-500"}`}
                    />
                    <span>{stat.change}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>System Alerts</span>
            <Badge variant="outline" className="ml-2">
              {systemAlerts.filter((a) => a.severity !== "low").length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.severity)}`}>
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      alert.severity === "high"
                        ? "border-red-300 text-red-700"
                        : alert.severity === "medium"
                          ? "border-orange-300 text-orange-700"
                          : "border-blue-300 text-blue-700"
                    }
                  >
                    {alert.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <p className="text-sm text-gray-600">Key metrics by department</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                    <Badge variant="outline">{dept.recruiters} recruiters</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Active Jobs</p>
                      <p className="font-semibold text-blue-600">{dept.activeJobs}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Hires</p>
                      <p className="font-semibold text-green-600">{dept.hires}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold text-purple-600">{dept.revenue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <p className="text-sm text-gray-600">Highest performing recruiters</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        index === 0
                          ? "bg-gold-500"
                          : index === 1
                            ? "bg-gray-400"
                            : index === 2
                              ? "bg-orange-400"
                              : "bg-blue-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.name}</p>
                      <p className="text-sm text-gray-600">{performer.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{performer.revenue}</p>
                    <p className="text-sm text-gray-600">{performer.hires} hires</p>
                    <Badge variant="outline" className="mt-1">
                      {performer.efficiency}% efficiency
                    </Badge>
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
