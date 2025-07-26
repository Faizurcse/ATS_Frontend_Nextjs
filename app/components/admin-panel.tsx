"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Users, Activity, Database, AlertTriangle, CheckCircle, Server, Globe, Zap } from "lucide-react"
import UserManagement from "@/components/admin/user-management"
import { getCurrentUser, hasPermission } from "../../lib/auth-utils"
import GeneralSettings from "@/components/admin/general-settings"
import SecuritySettings from "@/components/admin/security-settings"

export default function AdminPanel() {
  const currentUser = getCurrentUser()
  const [activeTab, setActiveTab] = useState("overview")

  // Check if current user has admin permissions
  const canAccessAdmin = hasPermission(currentUser, "admin-system")

  if (!canAccessAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Shield className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
            <p className="text-gray-600 text-center">You don't have permission to access the administrative panel.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock system statistics
  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalSessions: 89,
    systemUptime: "99.9%",
    dataStorage: "2.4 TB",
    apiCalls: "1.2M",
    securityAlerts: 3,
    systemHealth: "Excellent",
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Administrative Panel</h2>
          <p className="text-gray-600">System administration and user management</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          System Healthy
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers}</div>
                <p className="text-xs text-gray-600">{systemStats.activeUsers} active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStats.totalSessions}</div>
                <p className="text-xs text-gray-600">Current user sessions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Server className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{systemStats.systemUptime}</div>
                <p className="text-xs text-gray-600">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{systemStats.securityAlerts}</div>
                <p className="text-xs text-gray-600">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                    </div>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "62%" }}></div>
                    </div>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Disk Usage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Network I/O</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New user registration: Sarah Johnson</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">System backup completed successfully</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Security alert: Multiple failed login attempts</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Database optimization completed</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional System Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
                <Database className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">{systemStats.dataStorage}</div>
                <p className="text-xs text-gray-600">Total used storage</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Globe className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{systemStats.apiCalls}</div>
                <p className="text-xs text-gray-600">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemStats.systemHealth}</div>
                <p className="text-xs text-gray-600">Overall status</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Overview</CardTitle>
                <p className="text-gray-600">Monitor and manage system security</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Password Policy Compliance</span>
                      <Badge className="bg-green-100 text-green-800">98%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Two-Factor Authentication</span>
                      <Badge className="bg-orange-100 text-orange-800">76%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "76%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Multiple failed login attempts detected</p>
                      <p className="text-xs text-gray-500">IP: 192.168.1.100 - 5 attempts in 10 minutes</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">High</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Unusual login location detected</p>
                      <p className="text-xs text-gray-500">User: john.doe from New York (usual: California)</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Security scan completed</p>
                      <p className="text-xs text-gray-500">No vulnerabilities found in system scan</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Info</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="security">Security Settings</TabsTrigger>
              <TabsTrigger value="ai">AI Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <p className="text-gray-600">Manage AI models, API keys, and related settings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">API Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">OpenAI API Key</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="password"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                              placeholder="sk-..."
                              defaultValue="sk-••••••••••••••••••••••••••••••••••••••••"
                            />
                            <button className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                              Update
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Default Model</label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">AI Features</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Candidate Resume Analysis</p>
                            <p className="text-xs text-gray-500">Automatically analyze and score candidate resumes</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Job Description Optimization</p>
                            <p className="text-xs text-gray-500">AI-powered job posting improvements</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Interview Question Generation</p>
                            <p className="text-xs text-gray-500">Generate tailored interview questions</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded" />
                            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Usage Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">2,847</div>
                          <p className="text-sm text-gray-600">API Calls This Month</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">156</div>
                          <p className="text-sm text-gray-600">Resumes Analyzed</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">$127.50</div>
                          <p className="text-sm text-gray-600">Monthly AI Costs</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Model Performance</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Resume Matching Accuracy</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full" style={{ width: "94%" }}></div>
                            </div>
                            <span className="text-sm font-medium">94%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Job Description Quality Score</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: "87%" }}></div>
                            </div>
                            <span className="text-sm font-medium">87%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Response Time (avg)</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className="bg-orange-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                            </div>
                            <span className="text-sm font-medium">2.3s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
