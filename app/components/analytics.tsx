"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Building2, 
  Clock, 
  TrendingUp,
  UserCheck,
  FileText,
  Target,
  Award
} from 'lucide-react';
import BASE_API_URL from '../../BaseUrlApi';

interface AnalyticsData {
  timestamp: string;
  period: {
    current: {
      month: string;
      year: string;
    };
  };
  jobs: {
    overview: {
      total: number;
      active: number;
      filled: number;
      paused: number;
      closed: number;
      fillRate: string;
    };
    byWorkType: {
      onsite: number;
      remote: number;
      hybrid: number;
    };
    trends: {
      thisMonth: number;
      thisYear: number;
    };
    topCompanies: Array<{
      company: string;
      jobCount: number;
    }>;
    recentJobs: Array<{
      id: number;
      title: string;
      company: string;
      jobStatus: string;
      createdAt: string;
      workType: string;
    }>;
  };
  candidates: {
    overview: {
      total: number;
      pending: number;
      shortlisted: number;
      hired: number;
      rejected: number;
    };
    conversionRates: {
      shortlistRate: number;
      hireRate: number;
    };
    trends: {
      thisMonth: number;
      thisYear: number;
    };
    experienceLevels: Array<{
      experience: string;
      count: number;
    }>;
    recentApplications: Array<{
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      status: string;
      appliedAt: string;
      yearsOfExperience: string;
      job: {
        title: string;
        company: string;
      };
    }>;
  };
  interviews: {
    overview: {
      total: number;
      scheduled: number;
      completed: number;
      cancelled: number;
    };
    current: {
      today: number;
      thisMonth: number;
    };
    byType: Array<{
      type: string;
      count: number;
    }>;
    byMode: Array<{
      mode: string;
      count: number;
    }>;
    upcoming: Array<any>;
  };
  customers: {
    overview: {
      total: number;
      active: number;
      inactive: number;
      prospects: number;
    };
    byPriority: Array<{
      priority: string;
      count: number;
    }>;
    byIndustry: Array<{
      industry: string;
      count: number;
    }>;
    topCustomers: Array<{
      id: number;
      companyName: string;
      industry: string;
      status: string;
      jobCount: number;
    }>;
  };
  timesheets: {
    overview: {
      totalEntries: number;
      pending: number;
      approved: number;
      rejected: number;
    };
    hours: {
      total: number;
      thisMonth: number;
      thisYear: number;
    };
    byCategory: Array<{
      category: string;
      hours: number;
    }>;
    byEntity: Array<{
      entity: string;
      hours: number;
    }>;
    topRecruiters: Array<{
      name: string;
      hours: number;
    }>;
  };
  performance: {
    avgTimeToFill: number;
    interviewConversionRate: number;
    hireConversionRate: number;
    totalFilledJobs: number;
  };
  recentActivity: {
    recentJobs: Array<{
      id: number;
      title: string;
      company: string;
      createdAt: string;
    }>;
    recentApplications: Array<{
      id: number;
      firstName: string;
      lastName: string;
      status: string;
      appliedAt: string;
      job: {
        title: string;
        company: string;
      };
    }>;
    recentInterviews: Array<{
      id: number;
      candidateName: string;
      interviewDate: string;
      interviewType: string;
      status: string;
    }>;
  };
  trends: {
    monthlyJobTrend: Array<{
      month: string;
      count: number;
    }>;
    monthlyApplicationTrend: Array<{
      month: string;
      count: number;
    }>;
    topJobCategories: Array<{
      department: string;
      jobCount: number;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/analytics`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      const result = await response.json();
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">No data available</p>
      </div>
    );
  }

  // Prepare data for charts
  const jobStatusData = [
    { name: 'Active', value: analyticsData.jobs.overview.active, color: '#10B981' },
    { name: 'Filled', value: analyticsData.jobs.overview.filled, color: '#3B82F6' },
    { name: 'Paused', value: analyticsData.jobs.overview.paused, color: '#F59E0B' },
    { name: 'Closed', value: analyticsData.jobs.overview.closed, color: '#EF4444' },
  ].filter(item => item.value > 0); // Filter out zero values

  const workTypeData = [
    { name: 'Onsite', value: analyticsData.jobs.byWorkType.onsite, color: '#10B981' },
    { name: 'Remote', value: analyticsData.jobs.byWorkType.remote, color: '#3B82F6' },
    { name: 'Hybrid', value: analyticsData.jobs.byWorkType.hybrid, color: '#F59E0B' },
  ].filter(item => item.value > 0); // Filter out zero values

  const candidateStatusData = [
    { name: 'Pending', value: analyticsData.candidates.overview.pending, color: '#F59E0B' },
    { name: 'Shortlisted', value: analyticsData.candidates.overview.shortlisted, color: '#3B82F6' },
    { name: 'Hired', value: analyticsData.candidates.overview.hired, color: '#10B981' },
    { name: 'Rejected', value: analyticsData.candidates.overview.rejected, color: '#EF4444' },
  ].filter(item => item.value > 0); // Filter out zero values

  const interviewTypeData = analyticsData.interviews.byType.map((item, index) => ({
    name: item.type,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const interviewModeData = analyticsData.interviews.byMode.map((item, index) => ({
    name: item.mode,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const customerPriorityData = analyticsData.customers.byPriority.map((item, index) => ({
    name: item.priority,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const customerIndustryData = analyticsData.customers.byIndustry.map((item, index) => ({
    name: item.industry,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const timesheetCategoryData = analyticsData.timesheets.byCategory.map((item, index) => ({
    name: item.category,
    value: item.hours,
    color: COLORS[index % COLORS.length]
  }));

  const topCompaniesData = analyticsData.jobs.topCompanies.map((company, index) => ({
    name: company.company,
    jobs: company.jobCount,
    color: COLORS[index % COLORS.length]
  }));

  const experienceLevelData = analyticsData.candidates.experienceLevels.map((level, index) => ({
    name: level.experience,
    candidates: level.count,
    color: COLORS[index % COLORS.length]
  }));

  const monthlyJobTrendData = analyticsData.trends.monthlyJobTrend;
  const monthlyApplicationTrendData = analyticsData.trends.monthlyApplicationTrend;
  const topJobCategoriesData = analyticsData.trends.topJobCategories.map((category, index) => ({
    name: category.department,
    jobs: category.jobCount,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date(analyticsData.timestamp).toLocaleString()}
          </p>
        </div>
        <button 
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.jobs.overview.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.jobs.overview.active} active, {analyticsData.jobs.overview.filled} filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.candidates.overview.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.candidates.overview.shortlisted} shortlisted, {analyticsData.candidates.overview.hired} hired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.interviews.overview.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.interviews.overview.scheduled} scheduled, {analyticsData.interviews.overview.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.customers.overview.total}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.customers.overview.active} active, {analyticsData.customers.overview.inactive} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Fill Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analyticsData.jobs.overview.fillRate}%
            </div>
            <Progress value={parseFloat(analyticsData.jobs.overview.fillRate)} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Interview Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {analyticsData.performance.interviewConversionRate}%
            </div>
            <Progress value={analyticsData.performance.interviewConversionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Hire Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {analyticsData.performance.hireConversionRate}%
            </div>
            <Progress value={analyticsData.performance.hireConversionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Jobs Analytics */}
        <TabsContent value="jobs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <Card>
               <CardHeader>
                 <CardTitle>Job Status Distribution</CardTitle>
               </CardHeader>
               <CardContent>
                 {jobStatusData.length > 0 ? (
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={jobStatusData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name}\n${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {jobStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="flex items-center justify-center h-[300px] text-gray-500">
                     <p>No job status data available</p>
                   </div>
                 )}
               </CardContent>
             </Card>

                         <Card>
               <CardHeader>
                 <CardTitle>Work Type Distribution</CardTitle>
               </CardHeader>
               <CardContent>
                 {workTypeData.length > 0 ? (
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={workTypeData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name}\n${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {workTypeData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="flex items-center justify-center h-[300px] text-gray-500">
                     <p>No work type data available</p>
                   </div>
                 )}
               </CardContent>
             </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Companies by Job Count</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCompaniesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Candidates Analytics */}
        <TabsContent value="candidates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <Card>
               <CardHeader>
                 <CardTitle>Candidate Status Distribution</CardTitle>
               </CardHeader>
               <CardContent>
                 {candidateStatusData.length > 0 ? (
                   <ResponsiveContainer width="100%" height={300}>
                     <PieChart>
                       <Pie
                         data={candidateStatusData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name}\n${((percent || 0) * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="value"
                       >
                         {candidateStatusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 ) : (
                   <div className="flex items-center justify-center h-[300px] text-gray-500">
                     <p>No candidate status data available</p>
                   </div>
                 )}
               </CardContent>
             </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={experienceLevelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="candidates" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Interviews Analytics */}
        <TabsContent value="interviews" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Interview Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={interviewTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {interviewTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interview Modes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={interviewModeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {interviewModeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Analytics */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerPriorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerPriorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Industry Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerIndustryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerIndustryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timesheets Analytics */}
        <TabsContent value="timesheets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Timesheet Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timesheetCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {timesheetCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timesheet Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Total Entries</span>
                      <span className="font-semibold">{analyticsData.timesheets.overview.totalEntries}</span>
                    </div>
                    <Progress value={100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-semibold">{analyticsData.timesheets.overview.pending}</span>
                    </div>
                    <Progress value={(analyticsData.timesheets.overview.pending / analyticsData.timesheets.overview.totalEntries) * 100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Approved</span>
                      <span className="font-semibold">{analyticsData.timesheets.overview.approved}</span>
                    </div>
                    <Progress value={(analyticsData.timesheets.overview.approved / analyticsData.timesheets.overview.totalEntries) * 100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Rejected</span>
                      <span className="font-semibold">{analyticsData.timesheets.overview.rejected}</span>
                    </div>
                    <Progress value={(analyticsData.timesheets.overview.rejected / analyticsData.timesheets.overview.totalEntries) * 100} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Analytics */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Job Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyJobTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Application Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyApplicationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Job Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topJobCategoriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Recent Jobs</h4>
              <div className="space-y-2">
                {analyticsData.recentActivity.recentJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.company}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recent Applications</h4>
              <div className="space-y-2">
                {analyticsData.recentActivity.recentApplications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{app.firstName} {app.lastName}</div>
                    <div className="text-sm text-gray-600">{app.job.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary" className="mt-1">{app.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recent Interviews</h4>
              <div className="space-y-2">
                {analyticsData.recentActivity.recentInterviews.slice(0, 3).map((interview) => (
                  <div key={interview.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{interview.candidateName}</div>
                    <div className="text-sm text-gray-600">{interview.interviewType}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(interview.interviewDate).toLocaleDateString()}
                    </div>
                    <Badge variant="secondary" className="mt-1">{interview.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 