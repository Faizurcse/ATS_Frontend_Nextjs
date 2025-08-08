"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Mail,
  Send,
  Eye,
  MousePointer,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Target,
  BarChart3,
  Download,
  Search,
  RefreshCw,
  CheckCircle,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Edit,
  Trash2,
  Plus,
  Settings,
  Zap,
  Brain,
  Globe,
  Briefcase,
  DollarSign,
  Play,
  Pause,
} from "lucide-react"
import { DateFilter } from "@/components/date-filter"
import { RecruiterFilter } from "@/components/recruiter-filter"
import { isDateInRange } from "../../lib/date-utils"

interface EmailCampaign {
  id: string
  name: string
  type:
    | "job_posting"
    | "candidate_outreach"
    | "interview_invitation"
    | "offer_notification"
    | "follow_up"
    | "newsletter"
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "completed"
  subject: string
  recipientCount: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  repliedCount: number
  bouncedCount: number
  unsubscribedCount: number
  createdDate: string
  sentDate?: string
  scheduledDate?: string
  createdBy: string
  createdByName: string
  jobId?: string
  jobTitle?: string
  candidateIds?: string[]
  templateId?: string
  tags: string[]
  priority: "urgent" | "high" | "medium" | "low"
  automationRuleId?: string
  abTestId?: string
  conversionGoal?: string
  conversionCount: number
  revenue?: number
}

interface EmailTemplate {
  id: string
  name: string
  type:
    | "job_posting"
    | "candidate_outreach"
    | "interview_invitation"
    | "offer_notification"
    | "follow_up"
    | "newsletter"
  subject: string
  content: string
  variables: string[]
  isActive: boolean
  createdDate: string
  lastUsed?: string
  usageCount: number
  avgOpenRate: number
  avgClickRate: number
  createdBy: string
}

interface EmailRecipient {
  id: string
  campaignId: string
  email: string
  name: string
  type: "candidate" | "client" | "interviewer" | "internal"
  status: "pending" | "sent" | "delivered" | "opened" | "clicked" | "replied" | "bounced" | "unsubscribed"
  sentAt?: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  repliedAt?: string
  bouncedAt?: string
  unsubscribedAt?: string
  openCount: number
  clickCount: number
  deviceType?: "desktop" | "mobile" | "tablet"
  location?: string
  candidateId?: string
  jobId?: string
  interviewId?: string
}

interface EmailAutomation {
  id: string
  name: string
  trigger: "job_posted" | "candidate_applied" | "interview_scheduled" | "offer_sent" | "hire_completed" | "time_based"
  conditions: Array<{
    field: string
    operator: string
    value: string
  }>
  actions: Array<{
    type: "send_email" | "add_tag" | "update_status" | "create_task"
    templateId?: string
    delay?: number
    parameters: Record<string, any>
  }>
  isActive: boolean
  createdDate: string
  lastTriggered?: string
  triggerCount: number
  successCount: number
  createdBy: string
}

interface EmailAnalytics {
  totalCampaigns: number
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalReplied: number
  avgOpenRate: number
  avgClickRate: number
  avgReplyRate: number
  bounceRate: number
  unsubscribeRate: number
  conversionRate: number
  revenue: number
  topPerformingCampaign: string
  bestOpenRate: number
  bestClickRate: number
  peakSendingTime: string
  topDevice: string
  topLocation: string
}

export default function EmailAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dateFilter, setDateFilter] = useState("last-30-days")
  const [recruiterFilter, setRecruiterFilter] = useState("all")
  const [campaignTypeFilter, setCampaignTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false)
  const [isAutomationBuilderOpen, setIsAutomationBuilderOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "",
    subject: "",
    templateId: "",
    jobId: "",
    targetAudience: "",
    priority: "medium",
    sendTime: "now",
    tags: "",
  })
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "",
    subject: "",
    content: "",
  })
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    trigger: "",
    conditions: [] as Array<{ field: string; operator: string; value: string }>,
    actions: [] as Array<{ type: string; templateId?: string; delay?: number; parameters: Record<string, any> }>,
  })

  // Mock data
  const recruiters = [
    { id: "1", name: "Sarah Wilson", loginName: "swilson" },
    { id: "2", name: "Mike Johnson", loginName: "mjohnson" },
    { id: "3", name: "Emily Chen", loginName: "echen" },
    { id: "4", name: "David Brown", loginName: "dbrown" },
  ]

  const [emailCampaigns] = useState<EmailCampaign[]>([
    {
      id: "1",
      name: "Senior Software Engineer - Job Alert",
      type: "job_posting",
      status: "completed",
      subject: "🚀 New Opportunity: Senior Software Engineer at TechCorp",
      recipientCount: 1250,
      sentCount: 1250,
      deliveredCount: 1198,
      openedCount: 456,
      clickedCount: 89,
      repliedCount: 23,
      bouncedCount: 52,
      unsubscribedCount: 8,
      createdDate: "2024-01-15",
      sentDate: "2024-01-16",
      createdBy: "1",
      createdByName: "Sarah Wilson",
      jobId: "1",
      jobTitle: "Senior Software Engineer",
      templateId: "1",
      tags: ["tech", "senior", "remote"],
      priority: "high",
      conversionGoal: "applications",
      conversionCount: 23,
      revenue: 0,
    },
    {
      id: "2",
      name: "Interview Invitations - Marketing Manager",
      type: "interview_invitation",
      status: "completed",
      subject: "Interview Invitation - Marketing Manager Position",
      recipientCount: 15,
      sentCount: 15,
      deliveredCount: 15,
      openedCount: 14,
      clickedCount: 12,
      repliedCount: 11,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdDate: "2024-01-18",
      sentDate: "2024-01-18",
      createdBy: "2",
      createdByName: "Mike Johnson",
      jobId: "2",
      jobTitle: "Marketing Manager",
      candidateIds: ["1", "2", "3", "4", "5"],
      templateId: "2",
      tags: ["interview", "marketing"],
      priority: "urgent",
      conversionGoal: "interviews_scheduled",
      conversionCount: 11,
      revenue: 0,
    },
    {
      id: "3",
      name: "Candidate Follow-up - Data Scientists",
      type: "candidate_outreach",
      status: "sent",
      subject: "Following up on your Data Scientist application",
      recipientCount: 45,
      sentCount: 45,
      deliveredCount: 43,
      openedCount: 28,
      clickedCount: 8,
      repliedCount: 5,
      bouncedCount: 2,
      unsubscribedCount: 1,
      createdDate: "2024-01-20",
      sentDate: "2024-01-20",
      createdBy: "3",
      createdByName: "Emily Chen",
      jobId: "3",
      jobTitle: "Data Scientist",
      candidateIds: ["6", "7", "8", "9", "10"],
      templateId: "3",
      tags: ["follow-up", "data-science"],
      priority: "medium",
      conversionGoal: "responses",
      conversionCount: 5,
      revenue: 0,
    },
    {
      id: "4",
      name: "Offer Notifications - Frontend Engineers",
      type: "offer_notification",
      status: "completed",
      subject: "🎉 Job Offer - Frontend Engineer Position",
      recipientCount: 3,
      sentCount: 3,
      deliveredCount: 3,
      openedCount: 3,
      clickedCount: 3,
      repliedCount: 2,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdDate: "2024-01-22",
      sentDate: "2024-01-22",
      createdBy: "1",
      createdByName: "Sarah Wilson",
      jobId: "4",
      jobTitle: "Frontend Engineer",
      candidateIds: ["11", "12", "13"],
      templateId: "4",
      tags: ["offer", "frontend"],
      priority: "urgent",
      conversionGoal: "offers_accepted",
      conversionCount: 2,
      revenue: 250000,
    },
    {
      id: "5",
      name: "Weekly Talent Newsletter",
      type: "newsletter",
      status: "scheduled",
      subject: "Weekly Talent Digest - Hot Jobs & Market Insights",
      recipientCount: 2500,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      repliedCount: 0,
      bouncedCount: 0,
      unsubscribedCount: 0,
      createdDate: "2024-01-23",
      scheduledDate: "2024-01-25",
      createdBy: "4",
      createdByName: "David Brown",
      templateId: "5",
      tags: ["newsletter", "weekly"],
      priority: "low",
      conversionGoal: "engagement",
      conversionCount: 0,
      revenue: 0,
    },
  ])

  const [emailTemplates] = useState<EmailTemplate[]>([
    {
      id: "1",
      name: "Job Posting Alert",
      type: "job_posting",
      subject: "🚀 New Opportunity: {{job_title}} at {{company_name}}",
      content: `Hi {{candidate_name}},

We have an exciting new opportunity that matches your profile!

**Position:** {{job_title}}
**Company:** {{company_name}}
**Location:** {{job_location}}
**Salary Range:** {{salary_range}}

**About the Role:**
{{job_description}}

**Requirements:**
{{job_requirements}}

**Why Join {{company_name}}?**
{{company_benefits}}

Ready to apply? Click the link below:
{{application_link}}

Best regards,
{{recruiter_name}}
{{company_name}} Talent Team

---
If you're no longer interested in opportunities like this, you can {{unsubscribe_link}}.`,
      variables: [
        "candidate_name",
        "job_title",
        "company_name",
        "job_location",
        "salary_range",
        "job_description",
        "job_requirements",
        "company_benefits",
        "application_link",
        "recruiter_name",
        "unsubscribe_link",
      ],
      isActive: true,
      createdDate: "2024-01-10",
      lastUsed: "2024-01-16",
      usageCount: 15,
      avgOpenRate: 38.5,
      avgClickRate: 7.2,
      createdBy: "1",
    },
    {
      id: "2",
      name: "Interview Invitation",
      type: "interview_invitation",
      subject: "Interview Invitation - {{job_title}} Position",
      content: `Dear {{candidate_name}},

Congratulations! We were impressed with your application for the {{job_title}} position at {{company_name}}.

We would like to invite you for an interview:

**Interview Details:**
- **Date:** {{interview_date}}
- **Time:** {{interview_time}}
- **Duration:** {{interview_duration}}
- **Format:** {{interview_format}}
- **Location/Link:** {{interview_location}}

**Interviewer(s):** {{interviewer_name}}
**Interview Type:** {{interview_type}}

**What to Expect:**
{{interview_agenda}}

**Preparation:**
{{interview_preparation}}

Please confirm your attendance by replying to this email or clicking here: {{confirmation_link}}

If you need to reschedule, please let us know as soon as possible: {{reschedule_link}}

Looking forward to meeting you!

Best regards,
{{recruiter_name}}
{{company_name}} Talent Team`,
      variables: [
        "candidate_name",
        "job_title",
        "company_name",
        "interview_date",
        "interview_time",
        "interview_duration",
        "interview_format",
        "interview_location",
        "interviewer_name",
        "interview_type",
        "interview_agenda",
        "interview_preparation",
        "confirmation_link",
        "reschedule_link",
        "recruiter_name",
      ],
      isActive: true,
      createdDate: "2024-01-12",
      lastUsed: "2024-01-18",
      usageCount: 8,
      avgOpenRate: 93.3,
      avgClickRate: 80.0,
      createdBy: "2",
    },
    {
      id: "3",
      name: "Candidate Follow-up",
      type: "candidate_outreach",
      subject: "Following up on your {{job_title}} application",
      content: `Hi {{candidate_name}},

Thank you for your interest in the {{job_title}} position at {{company_name}}.

We wanted to provide you with an update on your application submitted on {{application_date}}.

**Current Status:** {{application_status}}

{{#if next_steps}}
**Next Steps:**
{{next_steps}}
{{/if}}

{{#if timeline}}
**Expected Timeline:**
{{timeline}}
{{/if}}

{{#if additional_info}}
**Additional Information:**
{{additional_info}}
{{/if}}

We appreciate your patience and continued interest in {{company_name}}. If you have any questions, please don't hesitate to reach out.

Best regards,
{{recruiter_name}}
{{company_name}} Talent Team

---
Update your preferences: {{preferences_link}}`,
      variables: [
        "candidate_name",
        "job_title",
        "company_name",
        "application_date",
        "application_status",
        "next_steps",
        "timeline",
        "additional_info",
        "recruiter_name",
        "preferences_link",
      ],
      isActive: true,
      createdDate: "2024-01-14",
      lastUsed: "2024-01-20",
      usageCount: 12,
      avgOpenRate: 62.2,
      avgClickRate: 17.8,
      createdBy: "3",
    },
    {
      id: "4",
      name: "Offer Notification",
      type: "offer_notification",
      subject: "🎉 Job Offer - {{job_title}} Position at {{company_name}}",
      content: `Dear {{candidate_name}},

Congratulations! We are delighted to extend an offer for the {{job_title}} position at {{company_name}}.

**Offer Details:**
- **Position:** {{job_title}}
- **Department:** {{department}}
- **Start Date:** {{start_date}}
- **Salary:** {{salary}}
- **Benefits:** {{benefits_summary}}
- **Reporting To:** {{manager_name}}

**Next Steps:**
1. Review the attached offer letter and employment agreement
2. Feel free to reach out with any questions
3. Please respond by {{response_deadline}}

**To Accept:** {{accept_link}}
**To Decline:** {{decline_link}}
**Questions?** Contact {{recruiter_name}} at {{recruiter_email}}

We're excited about the possibility of you joining our team!

Best regards,
{{recruiter_name}}
{{company_name}} Talent Team

Attachments:
- Offer Letter
- Employment Agreement
- Benefits Package Details`,
      variables: [
        "candidate_name",
        "job_title",
        "company_name",
        "department",
        "start_date",
        "salary",
        "benefits_summary",
        "manager_name",
        "response_deadline",
        "accept_link",
        "decline_link",
        "recruiter_name",
        "recruiter_email",
      ],
      isActive: true,
      createdDate: "2024-01-16",
      lastUsed: "2024-01-22",
      usageCount: 5,
      avgOpenRate: 100.0,
      avgClickRate: 100.0,
      createdBy: "1",
    },
    {
      id: "5",
      name: "Weekly Newsletter",
      type: "newsletter",
      subject: "Weekly Talent Digest - {{week_date}}",
      content: `Hi {{recipient_name}},

Welcome to this week's talent digest! Here's what's happening in the job market:

**🔥 Hot Jobs This Week**
{{hot_jobs_list}}

**📊 Market Insights**
{{market_insights}}

**💡 Career Tips**
{{career_tips}}

**🎯 Featured Companies**
{{featured_companies}}

**📅 Upcoming Events**
{{upcoming_events}}

**📈 Industry Trends**
{{industry_trends}}

Stay ahead of the curve with {{company_name}}!

Best regards,
The {{company_name}} Team

---
Manage your subscription: {{subscription_link}}
Forward to a friend: {{forward_link}}`,
      variables: [
        "recipient_name",
        "week_date",
        "hot_jobs_list",
        "market_insights",
        "career_tips",
        "featured_companies",
        "upcoming_events",
        "industry_trends",
        "company_name",
        "subscription_link",
        "forward_link",
      ],
      isActive: true,
      createdDate: "2024-01-20",
      lastUsed: "2024-01-23",
      usageCount: 3,
      avgOpenRate: 24.8,
      avgClickRate: 4.2,
      createdBy: "4",
    },
  ])

  const [emailAutomations] = useState<EmailAutomation[]>([
    {
      id: "1",
      name: "New Job Application Auto-Response",
      trigger: "candidate_applied",
      conditions: [
        { field: "job_type", operator: "equals", value: "full-time" },
        { field: "candidate_source", operator: "not_equals", value: "referral" },
      ],
      actions: [
        {
          type: "send_email",
          templateId: "3",
          delay: 0,
          parameters: { priority: "medium" },
        },
      ],
      isActive: true,
      createdDate: "2024-01-10",
      lastTriggered: "2024-01-20",
      triggerCount: 156,
      successCount: 148,
      createdBy: "1",
    },
    {
      id: "2",
      name: "Interview Reminder Sequence",
      trigger: "interview_scheduled",
      conditions: [{ field: "interview_type", operator: "in", value: "technical,final" }],
      actions: [
        {
          type: "send_email",
          templateId: "2",
          delay: 1440, // 24 hours before
          parameters: { reminder_type: "24h" },
        },
        {
          type: "send_email",
          templateId: "2",
          delay: 60, // 1 hour before
          parameters: { reminder_type: "1h" },
        },
      ],
      isActive: true,
      createdDate: "2024-01-12",
      lastTriggered: "2024-01-18",
      triggerCount: 45,
      successCount: 43,
      createdBy: "2",
    },
    {
      id: "3",
      name: "Weekly Newsletter Distribution",
      trigger: "time_based",
      conditions: [{ field: "day_of_week", operator: "equals", value: "monday" }],
      actions: [
        {
          type: "send_email",
          templateId: "5",
          delay: 0,
          parameters: { segment: "active_candidates" },
        },
      ],
      isActive: true,
      createdDate: "2024-01-15",
      lastTriggered: "2024-01-22",
      triggerCount: 2,
      successCount: 2,
      createdBy: "4",
    },
    {
      id: "4",
      name: "Follow-up After 7 Days No Response",
      trigger: "candidate_applied",
      conditions: [
        { field: "days_since_application", operator: "equals", value: "7" },
        { field: "application_status", operator: "equals", value: "pending" },
      ],
      actions: [
        {
          type: "send_email",
          templateId: "3",
          delay: 10080, // 7 days
          parameters: { follow_up_type: "status_update" },
        },
      ],
      isActive: false,
      createdDate: "2024-01-18",
      lastTriggered: "2024-01-19",
      triggerCount: 23,
      successCount: 21,
      createdBy: "3",
    },
  ])

  // Calculate analytics
  const analytics: EmailAnalytics = useMemo(() => {
    const filteredCampaigns = emailCampaigns.filter((campaign) => {
      const matchesDate = dateFilter === "all" || isDateInRange(campaign.createdDate, dateFilter)
      const matchesRecruiter = recruiterFilter === "all" || campaign.createdBy === recruiterFilter
      const matchesType = campaignTypeFilter === "all" || campaign.type === campaignTypeFilter
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      const matchesSearch =
        !searchQuery ||
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesDate && matchesRecruiter && matchesType && matchesStatus && matchesSearch
    })

    const totalSent = filteredCampaigns.reduce((sum, c) => sum + c.sentCount, 0)
    const totalDelivered = filteredCampaigns.reduce((sum, c) => sum + c.deliveredCount, 0)
    const totalOpened = filteredCampaigns.reduce((sum, c) => sum + c.openedCount, 0)
    const totalClicked = filteredCampaigns.reduce((sum, c) => sum + c.clickedCount, 0)
    const totalReplied = filteredCampaigns.reduce((sum, c) => sum + c.repliedCount, 0)
    const totalBounced = filteredCampaigns.reduce((sum, c) => sum + c.bouncedCount, 0)
    const totalUnsubscribed = filteredCampaigns.reduce((sum, c) => sum + c.unsubscribedCount, 0)
    const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversionCount, 0)
    const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0)

    const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0
    const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0
    const avgReplyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
    const unsubscribeRate = totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0
    const conversionRate = totalSent > 0 ? (totalConversions / totalSent) * 100 : 0

    const topCampaign = filteredCampaigns.reduce((best, current) => {
      const currentRate = current.sentCount > 0 ? (current.openedCount / current.sentCount) * 100 : 0
      const bestRate = best.sentCount > 0 ? (best.openedCount / best.sentCount) * 100 : 0
      return currentRate > bestRate ? current : best
    }, filteredCampaigns[0] || { name: "N/A", openedCount: 0, sentCount: 1, clickedCount: 0 })

    return {
      totalCampaigns: filteredCampaigns.length,
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalReplied,
      avgOpenRate,
      avgClickRate,
      avgReplyRate,
      bounceRate,
      unsubscribeRate,
      conversionRate,
      revenue: totalRevenue,
      topPerformingCampaign: topCampaign?.name || "N/A",
      bestOpenRate: topCampaign ? (topCampaign.openedCount / Math.max(topCampaign.sentCount, 1)) * 100 : 0,
      bestClickRate: topCampaign ? (topCampaign.clickedCount / Math.max(topCampaign.sentCount, 1)) * 100 : 0,
      peakSendingTime: "2:00 PM",
      topDevice: "Desktop",
      topLocation: "San Francisco, CA",
    }
  }, [emailCampaigns, dateFilter, recruiterFilter, campaignTypeFilter, statusFilter, searchQuery])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "sending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "paused":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "job_posting":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "candidate_outreach":
        return "bg-green-100 text-green-800 border-green-200"
      case "interview_invitation":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "offer_notification":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "follow_up":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "newsletter":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTypeLabel = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const filteredCampaigns = emailCampaigns.filter((campaign) => {
    const matchesDate = dateFilter === "all" || isDateInRange(campaign.createdDate, dateFilter)
    const matchesRecruiter = recruiterFilter === "all" || campaign.createdBy === recruiterFilter
    const matchesType = campaignTypeFilter === "all" || campaign.type === campaignTypeFilter
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesDate && matchesRecruiter && matchesType && matchesStatus && matchesSearch
  })

  const handleCreateCampaign = () => {
    // In a real app, this would make an API call
    console.log("Creating campaign:", newCampaign)
    setIsCreateCampaignOpen(false)
    setNewCampaign({
      name: "",
      type: "",
      subject: "",
      templateId: "",
      jobId: "",
      targetAudience: "",
      priority: "medium",
      sendTime: "now",
      tags: "",
    })
  }

  const handleCreateTemplate = () => {
    // In a real app, this would make an API call
    console.log("Creating template:", newTemplate)
    setIsTemplateEditorOpen(false)
    setNewTemplate({
      name: "",
      type: "",
      subject: "",
      content: "",
    })
  }

  const handleCreateAutomation = () => {
    // In a real app, this would make an API call
    console.log("Creating automation:", newAutomation)
    setIsAutomationBuilderOpen(false)
    setNewAutomation({
      name: "",
      trigger: "",
      conditions: [],
      actions: [],
    })
  }

  const addCondition = () => {
    setNewAutomation({
      ...newAutomation,
      conditions: [...newAutomation.conditions, { field: "", operator: "", value: "" }],
    })
  }

  const addAction = () => {
    setNewAutomation({
      ...newAutomation,
      actions: [...newAutomation.actions, { type: "", parameters: {} }],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Email Analytics & Campaigns</h2>
          <p className="text-gray-600">Track email performance, manage campaigns, and automate communications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsTemplateEditorOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" onClick={() => setIsAutomationBuilderOpen(true)}>
            <Zap className="w-4 h-4 mr-2" />
            Automations
          </Button>
          <Button onClick={() => setIsCreateCampaignOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{analytics.totalSent.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{analytics.avgOpenRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Open Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MousePointer className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{analytics.avgClickRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Click Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">${analytics.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-600">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-600">{analytics.totalCampaigns}</p>
                <p className="text-xs text-gray-600">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search campaigns, subjects, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <DateFilter value={dateFilter} onValueChange={setDateFilter} />
          <RecruiterFilter value={recruiterFilter} onValueChange={setRecruiterFilter} recruiters={recruiters} />

          <Select value={campaignTypeFilter} onValueChange={setCampaignTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Campaign Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="job_posting">Job Posting</SelectItem>
              <SelectItem value="candidate_outreach">Candidate Outreach</SelectItem>
              <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
              <SelectItem value="offer_notification">Offer Notification</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sending">Sending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Delivery Rate</span>
                        <span className="font-semibold">
                          {analytics.totalSent > 0
                            ? ((analytics.totalDelivered / analytics.totalSent) * 100).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <Progress
                        value={analytics.totalSent > 0 ? (analytics.totalDelivered / analytics.totalSent) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Open Rate</span>
                        <span className="font-semibold">{analytics.avgOpenRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.avgOpenRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Click Rate</span>
                        <span className="font-semibold">{analytics.avgClickRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.avgClickRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reply Rate</span>
                        <span className="font-semibold">{analytics.avgReplyRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={analytics.avgReplyRate} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Campaign Type Performance</h4>
                    <div className="space-y-3">
                      {["job_posting", "interview_invitation", "candidate_outreach", "offer_notification"].map(
                        (type) => {
                          const typeCampaigns = filteredCampaigns.filter((c) => c.type === type)
                          const totalSent = typeCampaigns.reduce((sum, c) => sum + c.sentCount, 0)
                          const totalOpened = typeCampaigns.reduce((sum, c) => sum + c.openedCount, 0)
                          const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0

                          return (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge className={getTypeColor(type)} variant="outline">
                                  {formatTypeLabel(type)}
                                </Badge>
                                <span className="text-sm text-gray-600">({typeCampaigns.length} campaigns)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{openRate.toFixed(1)}%</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(openRate, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        },
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Best Performer</span>
                  </div>
                  <p className="text-sm text-green-600">{analytics.topPerformingCampaign}</p>
                  <p className="text-xs text-green-500 mt-1">{analytics.bestOpenRate.toFixed(1)}% open rate</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Peak Time</span>
                  </div>
                  <p className="text-sm text-blue-600">{analytics.peakSendingTime}</p>
                  <p className="text-xs text-blue-500 mt-1">Highest engagement window</p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Conversion</span>
                  </div>
                  <p className="text-sm text-purple-600">{analytics.conversionRate.toFixed(1)}% rate</p>
                  <p className="text-xs text-purple-500 mt-1">
                    {analytics.totalSent > 0 ? Math.round(analytics.totalSent * (analytics.conversionRate / 100)) : 0}{" "}
                    conversions
                  </p>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Top Location</span>
                  </div>
                  <p className="text-sm text-orange-600">{analytics.topLocation}</p>
                  <p className="text-xs text-orange-500 mt-1">Most engaged audience</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Campaigns</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => {
                    const openRate = campaign.sentCount > 0 ? (campaign.openedCount / campaign.sentCount) * 100 : 0
                    const clickRate = campaign.sentCount > 0 ? (campaign.clickedCount / campaign.sentCount) * 100 : 0

                    return (
                      <TableRow key={campaign.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.subject}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              {campaign.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {campaign.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{campaign.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(campaign.type)} variant="outline">
                            {formatTypeLabel(campaign.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(campaign.status)} variant="outline">
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{campaign.recipientCount.toLocaleString()}</div>
                            <div className="text-gray-500">{campaign.sentCount.toLocaleString()} sent</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Eye className="w-3 h-3 text-green-500" />
                              <span>{openRate.toFixed(1)}%</span>
                              <MousePointer className="w-3 h-3 text-blue-500" />
                              <span>{clickRate.toFixed(1)}%</span>
                            </div>
                            <div className="text-xs text-gray-500">{campaign.conversionCount} conversions</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(campaign.createdDate).toLocaleDateString()}</div>
                            <div className="text-gray-500">{campaign.createdByName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Campaign
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Recipients
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detailed Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{analytics.totalSent.toLocaleString()}</div>
                      <div className="text-sm text-blue-600">Total Sent</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.totalDelivered.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Delivered</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{analytics.totalOpened.toLocaleString()}</div>
                      <div className="text-sm text-purple-600">Opened</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.totalClicked.toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-600">Clicked</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="font-semibold text-red-600">{analytics.bounceRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unsubscribe Rate</span>
                      <span className="font-semibold text-yellow-600">{analytics.unsubscribeRate.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Reply Rate</span>
                      <span className="font-semibold text-green-600">{analytics.avgReplyRate.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCampaigns
                    .sort((a, b) => {
                      const aRate = a.sentCount > 0 ? (a.openedCount / a.sentCount) * 100 : 0
                      const bRate = b.sentCount > 0 ? (b.openedCount / b.sentCount) * 100 : 0
                      return bRate - aRate
                    })
                    .slice(0, 5)
                    .map((campaign, index) => {
                      const openRate = campaign.sentCount > 0 ? (campaign.openedCount / campaign.sentCount) * 100 : 0
                      const clickRate = campaign.sentCount > 0 ? (campaign.clickedCount / campaign.sentCount) * 100 : 0

                      return (
                        <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{campaign.name}</div>
                              <div className="text-xs text-gray-500">{campaign.sentCount.toLocaleString()} sent</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-green-600">{openRate.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">{clickRate.toFixed(1)}% CTR</div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Templates</CardTitle>
                <Button onClick={() => setIsTemplateEditorOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge className={getTypeColor(template.type)} variant="outline" size="sm">
                              {formatTypeLabel(template.type)}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTemplate(template)
                                  setNewTemplate({
                                    name: template.name,
                                    type: template.type,
                                    subject: template.subject,
                                    content: template.content,
                                  })
                                  setIsTemplateEditorOpen(true)
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="text-sm text-gray-600">
                          <div className="font-medium mb-1">Subject:</div>
                          <div className="text-xs bg-gray-100 p-2 rounded">{template.subject}</div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Used {template.usageCount} times</span>
                          <span>{template.avgOpenRate.toFixed(1)}% open rate</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.variables.slice(0, 3).map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>Email Automations</span>
                </CardTitle>
                <Button onClick={() => setIsAutomationBuilderOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Automation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailAutomations.map((automation) => (
                  <Card key={automation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${automation.isActive ? "bg-green-500" : "bg-gray-400"}`}
                          />
                          <div>
                            <h4 className="font-medium">{automation.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {automation.trigger.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-gray-500">{automation.triggerCount} triggers</span>
                              <span className="text-xs text-gray-500">
                                {Math.round((automation.successCount / Math.max(automation.triggerCount, 1)) * 100)}%
                                success
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            {automation.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>{automation.isActive ? "Pause" : "Activate"}</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                          <div className="font-medium mb-2">Workflow:</div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {automation.trigger.replace("_", " ")}
                            </span>
                            <span>→</span>
                            {automation.conditions.length > 0 && (
                              <>
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                  {automation.conditions.length} condition{automation.conditions.length > 1 ? "s" : ""}
                                </span>
                                <span>→</span>
                              </>
                            )}
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              {automation.actions.length} action{automation.actions.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Email Campaign</DialogTitle>
            <DialogDescription>
              Create targeted email campaigns for job postings, candidate outreach, and more
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g., Senior Developer Job Alert"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select
                  value={newCampaign.type}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_posting">Job Posting</SelectItem>
                    <SelectItem value="candidate_outreach">Candidate Outreach</SelectItem>
                    <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
                    <SelectItem value="offer_notification">Offer Notification</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Subject</Label>
              <Input
                placeholder="Enter email subject line"
                value={newCampaign.subject}
                onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select
                value={newCampaign.templateId}
                onValueChange={(value) => setNewCampaign({ ...newCampaign, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {formatTypeLabel(template.type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Job Posting</Label>
                  <Select
                    value={newCampaign.jobId}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, jobId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Senior Software Engineer</SelectItem>
                      <SelectItem value="2">Marketing Manager</SelectItem>
                      <SelectItem value="3">Data Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Target Audience</Label>
                  <Select
                    value={newCampaign.targetAudience}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, targetAudience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_candidates">All Candidates</SelectItem>
                      <SelectItem value="job_applicants">Job Applicants</SelectItem>
                      <SelectItem value="talent_pool">Talent Pool</SelectItem>
                      <SelectItem value="custom">Custom List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newCampaign.priority}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Send Time</Label>
                <Select
                  value={newCampaign.sendTime}
                  onValueChange={(value) => setNewCampaign({ ...newCampaign, sendTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="When to send" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Send Now</SelectItem>
                    <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    <SelectItem value="optimal">AI Optimal Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <Input
                placeholder="Add tags separated by commas"
                value={newCampaign.tags}
                onChange={(e) => setNewCampaign({ ...newCampaign, tags: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateCampaign}>
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Editor Dialog */}
      <Dialog open={isTemplateEditorOpen} onOpenChange={setIsTemplateEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Template Editor</DialogTitle>
            <DialogDescription>Create and manage email templates with dynamic variables</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="e.g., Job Application Confirmation"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate({ ...newTemplate, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_posting">Job Posting</SelectItem>
                    <SelectItem value="candidate_outreach">Candidate Outreach</SelectItem>
                    <SelectItem value="interview_invitation">Interview Invitation</SelectItem>
                    <SelectItem value="offer_notification">Offer Notification</SelectItem>
                    <SelectItem value="follow_up">Follow Up</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                placeholder="Use {{variables}} for dynamic content"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Content</Label>
              <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["candidate_name", "job_title", "company_name", "interview_date", "salary_range"].map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        const textarea = document.querySelector("textarea") as HTMLTextAreaElement
                        if (textarea) {
                          const cursorPos = textarea.selectionStart
                          const textBefore = newTemplate.content.substring(0, cursorPos)
                          const textAfter = newTemplate.content.substring(cursorPos)
                          setNewTemplate({
                            ...newTemplate,
                            content: textBefore + `{{${variable}}}` + textAfter,
                          })
                        }
                      }}
                    >
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <Textarea
                  className="w-full h-32 resize-none"
                  placeholder="Write your email content here. Use {{variable_name}} for dynamic content."
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-gray-600 mb-2">
                  Subject: {newTemplate.subject || "Your subject line will appear here"}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {newTemplate.content || "Your email content will appear here..."}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsTemplateEditorOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateTemplate}>
              {selectedTemplate ? "Update Template" : "Save Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Automation Builder Dialog */}
      <Dialog open={isAutomationBuilderOpen} onOpenChange={setIsAutomationBuilderOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>Email Automation Builder</span>
            </DialogTitle>
            <DialogDescription>Create automated email workflows triggered by recruitment events</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Automation Name</Label>
              <Input
                placeholder="e.g., New Application Auto-Response"
                value={newAutomation.name}
                onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Trigger Event</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: "job_posted", label: "Job Posted", icon: Briefcase },
                  { value: "candidate_applied", label: "Candidate Applied", icon: Users },
                  { value: "interview_scheduled", label: "Interview Scheduled", icon: Calendar },
                  { value: "offer_sent", label: "Offer Sent", icon: Mail },
                  { value: "hire_completed", label: "Hire Completed", icon: CheckCircle },
                  { value: "time_based", label: "Time Based", icon: Clock },
                ].map((trigger) => (
                  <div
                    key={trigger.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      newAutomation.trigger === trigger.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => setNewAutomation({ ...newAutomation, trigger: trigger.value })}
                  >
                    <div className="flex items-center space-x-2">
                      <trigger.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">{trigger.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Conditions (Optional)</Label>
                <Button variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
              <div className="space-y-2">
                {newAutomation.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
                    <Select
                      value={condition.field}
                      onValueChange={(value) => {
                        const updatedConditions = [...newAutomation.conditions]
                        updatedConditions[index].field = value
                        setNewAutomation({ ...newAutomation, conditions: updatedConditions })
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job_type">Job Type</SelectItem>
                        <SelectItem value="candidate_source">Candidate Source</SelectItem>
                        <SelectItem value="experience_level">Experience Level</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={condition.operator}
                      onValueChange={(value) => {
                        const updatedConditions = [...newAutomation.conditions]
                        updatedConditions[index].operator = value
                        setNewAutomation({ ...newAutomation, conditions: updatedConditions })
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="in">In</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Value"
                      className="flex-1"
                      value={condition.value}
                      onChange={(e) => {
                        const updatedConditions = [...newAutomation.conditions]
                        updatedConditions[index].value = e.target.value
                        setNewAutomation({ ...newAutomation, conditions: updatedConditions })
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedConditions = newAutomation.conditions.filter((_, i) => i !== index)
                        setNewAutomation({ ...newAutomation, conditions: updatedConditions })
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {newAutomation.conditions.length === 0 && (
                  <p className="text-sm text-gray-600 italic">
                    No conditions added. This automation will run for all triggers.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Actions</Label>
                <Button variant="outline" size="sm" onClick={addAction}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </div>
              <div className="space-y-2">
                {newAutomation.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
                    <Select
                      value={action.type}
                      onValueChange={(value) => {
                        const updatedActions = [...newAutomation.actions]
                        updatedActions[index].type = value
                        setNewAutomation({ ...newAutomation, actions: updatedActions })
                      }}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send_email">Send Email</SelectItem>
                        <SelectItem value="add_tag">Add Tag</SelectItem>
                        <SelectItem value="update_status">Update Status</SelectItem>
                        <SelectItem value="create_task">Create Task</SelectItem>
                      </SelectContent>
                    </Select>
                    {action.type === "send_email" && (
                      <Select
                        value={action.templateId || ""}
                        onValueChange={(value) => {
                          const updatedActions = [...newAutomation.actions]
                          updatedActions[index].templateId = value
                          setNewAutomation({ ...newAutomation, actions: updatedActions })
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Email Template" />
                        </SelectTrigger>
                        <SelectContent>
                          {emailTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      placeholder="Delay (minutes)"
                      className="w-[120px]"
                      type="number"
                      value={action.delay || ""}
                      onChange={(e) => {
                        const updatedActions = [...newAutomation.actions]
                        updatedActions[index].delay = Number.parseInt(e.target.value) || 0
                        setNewAutomation({ ...newAutomation, actions: updatedActions })
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedActions = newAutomation.actions.filter((_, i) => i !== index)
                        setNewAutomation({ ...newAutomation, actions: updatedActions })
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {newAutomation.actions.length === 0 && (
                  <p className="text-sm text-gray-600 italic">
                    No actions added. Add actions to define what happens when triggered.
                  </p>
                )}
              </div>
            </div>

            {newAutomation.name && newAutomation.trigger && newAutomation.actions.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Automation Preview</span>
                </div>
                <div className="text-sm text-blue-600">
                  When <strong>{newAutomation.trigger.replace("_", " ")}</strong>
                  {newAutomation.conditions.length > 0 && <span> and conditions are met</span>}
                  {newAutomation.actions.map((action, index) => (
                    <span key={index}>
                      {" "}
                      → Wait <strong>{action.delay || 0} minutes</strong> →{" "}
                      <strong>{action.type.replace("_", " ")}</strong>
                      {action.templateId && (
                        <span>
                          {" "}
                          using template <strong>{emailTemplates.find((t) => t.id === action.templateId)?.name}</strong>
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAutomationBuilderOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={handleCreateAutomation}
              disabled={!newAutomation.name || !newAutomation.trigger || newAutomation.actions.length === 0}
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Automation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
