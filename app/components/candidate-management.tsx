"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Upload,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Building2,
  User,
  Edit,
  MessageSquare,
  Globe,
  AlertCircle,
  Brain,
  Search,
  X,
} from "lucide-react"
import { isDateInRange } from "../../lib/date-utils"
import { DateFilter } from "@/components/date-filter"
import { AdvancedSearch, type SearchFilters } from "@/components/advanced-search"
import {
  JOB_TYPES,
  formatSalary,
  type JobType,
  COUNTRIES,
  getCitiesByCountry,
  getSalaryPlaceholder,
} from "../../lib/location-data"
import AICandidateAnalysis from "./ai-candidate-analysis"
import type { AIAnalysis } from "../../lib/auth-utils"
// Import the auth utilities
import { getAccessibleUserIds } from "../../lib/auth-utils"

// Industry-standard pipeline statuses
const PIPELINE_STATUSES = [
  { key: "new", label: "New Application", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "screening", label: "Initial Screening", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { key: "phone-screen", label: "Phone Screening", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { key: "assessment", label: "Skills Assessment", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { key: "interview-1", label: "First Interview", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { key: "interview-2", label: "Second Interview", color: "bg-violet-100 text-violet-800 border-violet-200" },
  { key: "final-interview", label: "Final Interview", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { key: "reference-check", label: "Reference Check", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  { key: "offer-preparation", label: "Offer Preparation", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { key: "offer-sent", label: "Offer Sent", color: "bg-green-100 text-green-800 border-green-200" },
  { key: "offer-negotiation", label: "Offer Negotiation", color: "bg-lime-100 text-lime-800 border-lime-200" },
  { key: "offer-accepted", label: "Offer Accepted", color: "bg-teal-100 text-teal-800 border-teal-200" },
  { key: "background-check", label: "Background Check", color: "bg-sky-100 text-sky-800 border-sky-200" },
  { key: "hired", label: "Hired", color: "bg-green-200 text-green-900 border-green-300" },
  { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
  { key: "withdrawn", label: "Withdrawn", color: "bg-gray-100 text-gray-800 border-gray-200" },
  { key: "on-hold", label: "On Hold", color: "bg-amber-100 text-amber-800 border-amber-200" },
]

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  currentSalary: number
  expectedSalary: number
  noticePeriod: string
  currentLocation: string
  country: string
  city: string
  skills: string[]
  experience: string
  status: string
  appliedDate: string
  resumeUrl?: string
  lastUpdated: string
  jobId: string
  jobTitle: string
  jobType: JobType
  customerId: string
  customerName: string
  internalSPOC: string
  recruiterId: string
  recruiterName: string
  source: "website" | "referral" | "linkedin" | "recruiter" | "other"
  comments: string
}

const formatDateDDMMMYYYY = (dateString: string) => {
  const date = new Date(dateString)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const day = date.getDate().toString().padStart(2, "0")
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export default function CandidateManagement() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [dateFilter, setDateFilter] = useState("all")
  const [viewMode, setViewMode] = useState("all")
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIAnalysis>>({})
  const [showAiAnalysis, setShowAiAnalysis] = useState<string | null>(null)

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchTerm: "",
    country: "",
    city: "",
    salaryMin: "",
    salaryMax: "",
    experience: "",
    skills: [],
    status: "",
    priority: "",
    source: "",
    jobType: "",
  })

  // Check URL parameters on component mount to pre-fill filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const jobId = urlParams.get("jobId")
    const jobTitle = urlParams.get("jobTitle")
    const skills = urlParams.get("skills")
    const searchTerm = urlParams.get("searchTerm")

    if (jobId || jobTitle || skills || searchTerm) {
      setSearchFilters((prev) => ({
        ...prev,
        searchTerm: searchTerm || jobTitle || "",
        skills: skills ? skills.split(",").map((s) => s.trim()) : prev.skills,
      }))

      // If we have job-specific filters, show a notification
      if (jobTitle) {
        // You could show a toast notification here
        console.log(`Filtering candidates for job: ${jobTitle}`)
      }
    }
  }, [])

  // Mock job postings data with job types and locations
  const jobPostings = [
    {
      id: "1",
      title: "Senior Software Engineer",
      customerName: "TechCorp Inc.",
      spoc: "Sarah Wilson",
      jobType: "full-time" as JobType,
      country: "US",
      city: "San Francisco",
    },
    {
      id: "2",
      title: "Marketing Manager",
      customerName: "StartupXYZ",
      spoc: "Mike Johnson",
      jobType: "full-time" as JobType,
      country: "US",
      city: "New York",
    },
    {
      id: "3",
      title: "Freelance Web Designer",
      customerName: "DataFlow Solutions",
      spoc: "Emily Chen",
      jobType: "freelance" as JobType,
      country: "US",
      city: "Austin",
    },
    {
      id: "4",
      title: "Part-time Data Analyst",
      customerName: "GlobalTech Ltd",
      spoc: "James Smith",
      jobType: "part-time" as JobType,
      country: "CA",
      city: "Toronto",
    },
    {
      id: "5",
      title: "UX Design Intern",
      customerName: "TechCorp Inc.",
      spoc: "Sarah Wilson",
      jobType: "internship" as JobType,
      country: "DE",
      city: "Berlin",
    },
    {
      id: "6",
      title: "Contract DevOps Engineer",
      customerName: "StartupXYZ",
      spoc: "Mike Johnson",
      jobType: "contract" as JobType,
      country: "GB",
      city: "London",
    },
  ]

  const recruiters = [
    { id: "1", name: "Sarah Wilson" },
    { id: "2", name: "Mike Johnson" },
    { id: "3", name: "Emily Chen" },
    { id: "4", name: "David Brown" },
  ]

  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1-555-0123",
      currentSalary: 85000,
      expectedSalary: 120000,
      noticePeriod: "2 weeks",
      currentLocation: "San Francisco, CA",
      country: "US",
      city: "San Francisco",
      skills: ["React", "Node.js", "TypeScript", "AWS"],
      experience: "5 years",
      status: "interview-1",
      appliedDate: "2024-01-15",
      lastUpdated: "2024-01-16",
      jobId: "1",
      jobTitle: "Senior Software Engineer",
      jobType: "full-time",
      customerId: "1",
      customerName: "TechCorp Inc.",
      internalSPOC: "Sarah Wilson",
      recruiterId: "1",
      recruiterName: "Sarah Wilson",
      source: "linkedin",
      comments: "Strong technical background, good communication skills. Passed initial screening with flying colors.",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1-555-0124",
      currentSalary: 75000,
      expectedSalary: 90000,
      noticePeriod: "1 month",
      currentLocation: "New York, NY",
      country: "US",
      city: "New York",
      skills: ["Marketing", "Analytics", "SEO", "Content Strategy"],
      experience: "4 years",
      status: "phone-screen",
      appliedDate: "2024-01-14",
      lastUpdated: "2024-01-15",
      jobId: "2",
      jobTitle: "Marketing Manager",
      jobType: "full-time",
      customerId: "2",
      customerName: "StartupXYZ",
      internalSPOC: "Mike Johnson",
      recruiterId: "2",
      recruiterName: "Mike Johnson",
      source: "website",
      comments: "Excellent marketing background with proven track record in digital campaigns.",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike.chen@email.com",
      phone: "+1-416-555-0125",
      currentSalary: 45,
      expectedSalary: 65,
      noticePeriod: "2 weeks",
      currentLocation: "Toronto, ON",
      country: "CA",
      city: "Toronto",
      skills: ["Python", "SQL", "Tableau", "Statistics"],
      experience: "3 years",
      status: "new",
      appliedDate: "2024-01-13",
      lastUpdated: "2024-01-13",
      jobId: "4",
      jobTitle: "Part-time Data Analyst",
      jobType: "part-time",
      customerId: "4",
      customerName: "GlobalTech Ltd",
      internalSPOC: "James Smith",
      recruiterId: "4",
      recruiterName: "David Brown",
      source: "referral",
      comments:
        "Referred by current employee. Strong analytical skills and Python expertise. Looking for flexible hours.",
    },
    {
      id: "4",
      name: "Lisa Rodriguez",
      email: "lisa.rodriguez@email.com",
      phone: "+1-555-0129",
      currentSalary: 8000,
      expectedSalary: 12000,
      noticePeriod: "Immediate",
      currentLocation: "Austin, TX",
      country: "US",
      city: "Austin",
      skills: ["Web Design", "Figma", "HTML", "CSS", "JavaScript"],
      experience: "6 years",
      status: "offer-sent",
      appliedDate: "2024-01-10",
      lastUpdated: "2024-01-18",
      jobId: "3",
      jobTitle: "Freelance Web Designer",
      jobType: "freelance",
      customerId: "3",
      customerName: "DataFlow Solutions",
      internalSPOC: "Emily Chen",
      recruiterId: "3",
      recruiterName: "Emily Chen",
      source: "website",
      comments: "Exceptional portfolio with diverse client work. Flexible with project timelines and very responsive.",
    },
    {
      id: "5",
      name: "Alex Thompson",
      email: "alex.thompson@email.com",
      phone: "+49-123-456789",
      currentSalary: 0,
      expectedSalary: 1800,
      noticePeriod: "Immediate",
      currentLocation: "Berlin, Germany",
      country: "DE",
      city: "Berlin",
      skills: ["Figma", "UX Design", "Prototyping", "User Research"],
      experience: "1 year",
      status: "screening",
      appliedDate: "2024-01-20",
      lastUpdated: "2024-01-21",
      jobId: "5",
      jobTitle: "UX Design Intern",
      jobType: "internship",
      customerId: "1",
      customerName: "TechCorp Inc.",
      internalSPOC: "Sarah Wilson",
      recruiterId: "1",
      recruiterName: "Sarah Wilson",
      source: "linkedin",
      comments: "Recent graduate with strong design fundamentals. Eager to learn and contribute to the team.",
    },
    {
      id: "6",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      phone: "+44-20-1234-5678",
      currentSalary: 95,
      expectedSalary: 120,
      noticePeriod: "1 month",
      currentLocation: "London, UK",
      country: "GB",
      city: "London",
      skills: ["DevOps", "AWS", "Docker", "Kubernetes", "Terraform"],
      experience: "7 years",
      status: "final-interview",
      appliedDate: "2024-01-12",
      lastUpdated: "2024-01-19",
      jobId: "6",
      jobTitle: "Contract DevOps Engineer",
      jobType: "contract",
      customerId: "2",
      customerName: "StartupXYZ",
      internalSPOC: "Mike Johnson",
      recruiterId: "2",
      recruiterName: "Mike Johnson",
      source: "recruiter",
      comments:
        "Extensive DevOps experience with cloud platforms. Available for 6-month contract with possibility to extend.",
    },
  ])

  const [newCandidate, setNewCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    currentLocation: "",
    country: "",
    city: "",
    skills: "",
    experience: "",
    jobId: "",
    recruiterId: "",
    source: "website" as "website" | "referral" | "linkedin" | "recruiter" | "other",
    comments: "",
  })

  // Mock user data for role-based access control
  const currentUser = {
    id: "1",
    role: "manager", // admin, manager, user
  }

  // Add role-based filtering for candidates
  const getFilteredCandidates = () => {
    if (currentUser.role === "admin") {
      return candidates // Admin sees all candidates
    }

    if (currentUser.role === "manager") {
      // Manager sees candidates assigned to their team members
      const accessibleUserIds = getAccessibleUserIds(currentUser, [
        // Mock users data - in real app this would come from props or context
        { id: "1", managerId: currentUser.id, teamIds: ["team1"] },
        { id: "2", managerId: currentUser.id, teamIds: ["team1"] },
        { id: "3", managerId: "other", teamIds: ["team2"] },
      ])
      return candidates.filter((candidate) => accessibleUserIds.includes(candidate.recruiterId))
    }

    if (currentUser.role === "user") {
      // Users see only their own candidates
      return candidates.filter((candidate) => candidate.recruiterId === currentUser.id)
    }

    return candidates
  }

  // Update the filteredCandidates to use role-based filtering
  const filteredCandidates = getFilteredCandidates().filter((candidate) => {
    console.debug(`[filter] checking candidate: ${candidate.name}`)

    const matchesSearch =
      !searchFilters.searchTerm ||
      candidate.name.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      candidate.customerName.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      candidate.skills.some((skill) => skill.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesDate = dateFilter === "all" || isDateInRange(candidate.appliedDate, dateFilter)
    const matchesJobType =
      !searchFilters.jobType || searchFilters.jobType === "any" || candidate.jobType === searchFilters.jobType
    const matchesCountry =
      !searchFilters.country || searchFilters.country === "all" || candidate.country === searchFilters.country
    const matchesCity = !searchFilters.city || searchFilters.city === "all" || candidate.city === searchFilters.city
    const matchesExperience =
      !searchFilters.experience ||
      searchFilters.experience === "any" ||
      candidate.experience.includes(searchFilters.experience)
    const matchesSkills =
      searchFilters.skills.length === 0 ||
      searchFilters.skills.some((skill) =>
        candidate.skills.some((candidateSkill) => candidateSkill.toLowerCase().includes(skill.toLowerCase())),
      )
    const matchesSource =
      !searchFilters.source || searchFilters.source === "any" || candidate.source === searchFilters.source

    const salaryMin = searchFilters.salaryMin ? Number.parseFloat(searchFilters.salaryMin) : 0
    const salaryMax = searchFilters.salaryMax ? Number.parseFloat(searchFilters.salaryMax) : Number.POSITIVE_INFINITY
    const matchesSalary = candidate.expectedSalary >= salaryMin && candidate.expectedSalary <= salaryMax

    const passes =
      matchesSearch &&
      matchesStatus &&
      matchesDate &&
      matchesJobType &&
      matchesCountry &&
      matchesCity &&
      matchesExperience &&
      matchesSkills &&
      matchesSource &&
      matchesSalary

    console.debug(`[filter] ${candidate.name} passes: ${passes}`)
    return passes
  })

  const handleAiAnalysisComplete = (candidateId: string, analysis: AIAnalysis) => {
    setAiAnalysis((prev) => ({
      ...prev,
      [candidateId]: analysis,
    }))
  }

  const getCandidatesByDate = () => {
    const candidatesByDate: { [key: string]: Candidate[] } = {}
    filteredCandidates.forEach((candidate) => {
      const date = candidate.appliedDate
      if (!candidatesByDate[date]) {
        candidatesByDate[date] = []
      }
      candidatesByDate[date].push(candidate)
    })
    return candidatesByDate
  }

  const getCandidatesByClient = () => {
    const candidatesByClient: { [key: string]: Candidate[] } = {}
    filteredCandidates.forEach((candidate) => {
      const clientKey = candidate.customerId
      if (!candidatesByClient[clientKey]) {
        candidatesByClient[clientKey] = []
      }
      candidatesByClient[clientKey].push(candidate)
    })
    return candidatesByClient
  }

  const getCandidatesByJob = () => {
    const candidatesByJob: { [key: string]: Candidate[] } = {}
    filteredCandidates.forEach((candidate) => {
      const jobKey = candidate.jobId
      if (!candidatesByJob[jobKey]) {
        candidatesByJob[jobKey] = []
      }
      candidatesByJob[jobKey].push(candidate)
    })
    return candidatesByJob
  }

  const getCandidatesByRecruiter = () => {
    const candidatesByRecruiter: { [key: string]: Candidate[] } = {}
    filteredCandidates.forEach((candidate) => {
      const recruiterKey = candidate.recruiterId
      if (!candidatesByRecruiter[recruiterKey]) {
        candidatesByRecruiter[recruiterKey] = []
      }
      candidatesByRecruiter[recruiterKey].push(candidate)
    })
    return candidatesByRecruiter
  }

  const getCandidatesByJobType = () => {
    const candidatesByJobType: { [key: string]: Candidate[] } = {}
    filteredCandidates.forEach((candidate) => {
      const jobTypeKey = candidate.jobType
      if (!candidatesByJobType[jobTypeKey]) {
        candidatesByJobType[jobTypeKey] = []
      }
      candidatesByJobType[jobTypeKey].push(candidate)
    })
    return candidatesByJobType
  }

  const getStatusInfo = (status: string) => {
    return PIPELINE_STATUSES.find((s) => s.key === status) || PIPELINE_STATUSES[0]
  }

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case "full-time":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "part-time":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "contract":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "freelance":
        return "bg-green-100 text-green-800 border-green-200"
      case "internship":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "temporary":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleAddCandidate = () => {
    const selectedJob = jobPostings.find((job) => job.id === newCandidate.jobId)
    const selectedRecruiter = recruiters.find((r) => r.id === newCandidate.recruiterId)
    if (!selectedJob || !selectedRecruiter) return

    const candidate: Candidate = {
      id: Date.now().toString(),
      ...newCandidate,
      currentSalary: Number.parseInt(newCandidate.currentSalary) || 0,
      expectedSalary: Number.parseInt(newCandidate.expectedSalary) || 0,
      skills: newCandidate.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0),
      status: "new",
      appliedDate: new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      jobTitle: selectedJob.title,
      jobType: selectedJob.jobType,
      customerId: "1", // This would be derived from the job
      customerName: selectedJob.customerName,
      internalSPOC: selectedJob.spoc,
      recruiterName: selectedRecruiter.name,
    }
    setCandidates([...candidates, candidate])
    setNewCandidate({
      name: "",
      email: "",
      phone: "",
      currentSalary: "",
      expectedSalary: "",
      noticePeriod: "",
      currentLocation: "",
      country: "",
      city: "",
      skills: "",
      experience: "",
      jobId: "",
      recruiterId: "",
      source: "website",
      comments: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditCandidate = () => {
    if (!editingCandidate) return

    setCandidates(
      candidates.map((candidate) =>
        candidate.id === editingCandidate.id
          ? { ...editingCandidate, lastUpdated: new Date().toISOString().split("T")[0] }
          : candidate,
      ),
    )
    setIsEditDialogOpen(false)
    setEditingCandidate(null)
  }

  const renderCandidateCard = (candidate: Candidate) => {
    const statusInfo = getStatusInfo(candidate.status)
    const jobTypeInfo = JOB_TYPES.find((type) => type.value === candidate.jobType)
    const countryInfo = COUNTRIES.find((country) => country.code === candidate.country)

    return (
      <Card key={candidate.id} className="mb-4 hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{candidate.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <Briefcase className="w-4 h-4" />
                <span>{candidate.jobTitle}</span>
                <span>•</span>
                <Building2 className="w-4 h-4" />
                <span>{candidate.customerName}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getJobTypeColor(candidate.jobType)}>{jobTypeInfo?.label || candidate.jobType}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{candidate.currentLocation}</span>
              {countryInfo && (
                <Badge variant="outline" className="text-xs">
                  {countryInfo.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span>{formatSalary(candidate.expectedSalary, candidate.jobType, candidate.country)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-1">
              {candidate.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {candidate.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{candidate.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>SPOC: {candidate.internalSPOC}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Applied: {formatDateDDMMMYYYY(candidate.appliedDate)}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Dropdowns Section */}
          <div className="mt-3 pt-3 border-t space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Quick Actions</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Pipeline Status Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Pipeline Status</Label>
                <Select
                  value={candidate.status}
                  onValueChange={(value) => {
                    setCandidates(
                      candidates.map((c) =>
                        c.id === candidate.id
                          ? { ...c, status: value, lastUpdated: new Date().toISOString().split("T")[0] }
                          : c,
                      ),
                    )
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            statusInfo.color.includes("blue")
                              ? "bg-blue-500"
                              : statusInfo.color.includes("yellow")
                                ? "bg-yellow-500"
                                : statusInfo.color.includes("orange")
                                  ? "bg-orange-500"
                                  : statusInfo.color.includes("purple")
                                    ? "bg-purple-500"
                                    : statusInfo.color.includes("indigo")
                                      ? "bg-indigo-500"
                                      : statusInfo.color.includes("violet")
                                        ? "bg-violet-500"
                                        : statusInfo.color.includes("pink")
                                          ? "bg-pink-500"
                                          : statusInfo.color.includes("cyan")
                                            ? "bg-cyan-500"
                                            : statusInfo.color.includes("emerald")
                                              ? "bg-emerald-500"
                                              : statusInfo.color.includes("green")
                                                ? "bg-green-500"
                                                : statusInfo.color.includes("lime")
                                                  ? "bg-lime-500"
                                                  : statusInfo.color.includes("teal")
                                                    ? "bg-teal-500"
                                                    : statusInfo.color.includes("sky")
                                                      ? "bg-sky-500"
                                                      : statusInfo.color.includes("red")
                                                        ? "bg-red-500"
                                                        : statusInfo.color.includes("gray")
                                                          ? "bg-gray-500"
                                                          : "bg-amber-500"
                          }`}
                        ></div>
                        <span className="truncate">{statusInfo.label}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STATUSES.map((status) => (
                      <SelectItem key={status.key} value={status.key}>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              status.color.includes("blue")
                                ? "bg-blue-500"
                                : status.color.includes("yellow")
                                  ? "bg-yellow-500"
                                  : status.color.includes("orange")
                                    ? "bg-orange-500"
                                    : status.color.includes("purple")
                                      ? "bg-purple-500"
                                      : status.color.includes("indigo")
                                        ? "bg-indigo-500"
                                        : status.color.includes("violet")
                                          ? "bg-violet-500"
                                          : status.color.includes("pink")
                                            ? "bg-pink-500"
                                            : status.color.includes("cyan")
                                              ? "bg-cyan-500"
                                              : status.color.includes("emerald")
                                                ? "bg-emerald-500"
                                                : status.color.includes("green")
                                                  ? "bg-green-500"
                                                  : status.color.includes("lime")
                                                    ? "bg-lime-500"
                                                    : status.color.includes("teal")
                                                      ? "bg-teal-500"
                                                      : status.color.includes("sky")
                                                        ? "bg-sky-500"
                                                        : status.color.includes("red")
                                                          ? "bg-red-500"
                                                          : status.color.includes("gray")
                                                            ? "bg-gray-500"
                                                            : "bg-amber-500"
                            }`}
                          ></div>
                          <span>{status.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Recruiter Assignment Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Assigned Recruiter</Label>
                <Select
                  value={candidate.recruiterId}
                  onValueChange={(value) => {
                    const selectedRecruiter = recruiters.find((r) => r.id === value)
                    if (selectedRecruiter) {
                      setCandidates(
                        candidates.map((c) =>
                          c.id === candidate.id
                            ? {
                                ...c,
                                recruiterId: value,
                                recruiterName: selectedRecruiter.name,
                                lastUpdated: new Date().toISOString().split("T")[0],
                              }
                            : c,
                        ),
                      )
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{candidate.recruiterName}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {recruiters.map((recruiter) => (
                      <SelectItem key={recruiter.id} value={recruiter.id}>
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3" />
                          <span>{recruiter.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Application Source Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Application Source</Label>
                <Select
                  value={candidate.source}
                  onValueChange={(value) => {
                    setCandidates(
                      candidates.map((c) =>
                        c.id === candidate.id
                          ? {
                              ...c,
                              source: value as "website" | "referral" | "linkedin" | "recruiter" | "other",
                              lastUpdated: new Date().toISOString().split("T")[0],
                            }
                          : c,
                      ),
                    )
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span className="capitalize truncate">{candidate.source}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3 h-3" />
                        <span>Website</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="linkedin">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>LinkedIn</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="referral">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>Referral</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="recruiter">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-3 h-3" />
                        <span>Recruiter</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-3 h-3" />
                        <span>Other</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Job Assignment Dropdown */}
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">Job Assignment</Label>
                <Select
                  value={candidate.jobId}
                  onValueChange={(value) => {
                    const selectedJob = jobPostings.find((job) => job.id === value)
                    if (selectedJob) {
                      setCandidates(
                        candidates.map((c) =>
                          c.id === candidate.id
                            ? {
                                ...c,
                                jobId: value,
                                jobTitle: selectedJob.title,
                                jobType: selectedJob.jobType,
                                customerName: selectedJob.customerName,
                                internalSPOC: selectedJob.spoc,
                                lastUpdated: new Date().toISOString().split("T")[0],
                              }
                            : c,
                        ),
                      )
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{candidate.jobTitle}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {jobPostings.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-3 h-3" />
                          <div className="flex flex-col">
                            <span className="text-sm">{job.title}</span>
                            <span className="text-xs text-gray-500">{job.customerName}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {candidate.comments && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-start space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-700 font-medium">Comments:</p>
                  <p className="text-xs text-gray-600">{candidate.comments}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Section */}
          {aiAnalysis[candidate.id] && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium">AI Score: </span>
                  <Badge
                    className={`${
                      aiAnalysis[candidate.id].overallScore >= 85
                        ? "bg-green-100 text-green-800"
                        : aiAnalysis[candidate.id].overallScore >= 70
                          ? "bg-blue-100 text-blue-800"
                          : aiAnalysis[candidate.id].overallScore >= 55
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {aiAnalysis[candidate.id].overallScore}/100
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAiAnalysis(candidate.id)
                  }}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Brain className="w-3 h-3 mr-1" />
                  View AI Analysis
                </Button>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Verdict: {aiAnalysis[candidate.id].verdict.replace("_", " ")}
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCandidate(candidate)
                setIsEditDialogOpen(true)
              }}
              className="w-full"
            >
              <Edit className="w-3 h-3 mr-1" />
              Advanced Edit
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  // Get available cities based on selected country for new candidate form
  const availableCitiesForNewCandidate = newCandidate.country ? getCitiesByCountry(newCandidate.country) : []
  const selectedJobForNewCandidate = jobPostings.find((job) => job.id === newCandidate.jobId)
  const salaryPlaceholdersForNewCandidate = selectedJobForNewCandidate
    ? getSalaryPlaceholder(selectedJobForNewCandidate.jobType, selectedJobForNewCandidate.country)
    : getSalaryPlaceholder("full-time", "US")

  return (
    <div className="space-y-6">
      {/* AI-Powered Candidate Search Header */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">AI Candidate Intelligence</h2>
            </div>
            <p className="text-gray-600 mb-3">
              Smart candidate discovery with AI-powered matching and intelligent filtering
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {candidates.length} Total Candidates
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {filteredCandidates.length} Filtered Results
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Brain className="w-3 h-3 mr-1" />
                AI Matching Active
              </Badge>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg">
                <Upload className="w-4 h-4 mr-2" />
                Upload Resume & Parse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <span>AI Resume Parser</span>
                </DialogTitle>
                <DialogDescription>
                  Upload candidate resume and let AI automatically extract all information including skills, experience,
                  contact details, and more
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Resume Upload Section */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center bg-gradient-to-br from-purple-50 to-blue-50">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-purple-100 rounded-full">
                        <Upload className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Candidate Resume</h3>
                        <p className="text-gray-600 mb-4">Drag and drop resume files or click to browse</p>
                        <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                          <Badge variant="outline">PDF</Badge>
                          <Badge variant="outline">DOC</Badge>
                          <Badge variant="outline">DOCX</Badge>
                          <Badge variant="outline">TXT</Badge>
                        </div>
                      </div>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {/* AI Processing Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                      <div>
                        <h4 className="font-medium text-blue-900">AI Processing Capabilities</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Our AI will automatically extract and organize the following information:
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <User className="w-4 h-4" />
                        <span>Personal Details</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Mail className="w-4 h-4" />
                        <span>Contact Information</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Briefcase className="w-4 h-4" />
                        <span>Work Experience</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Brain className="w-4 h-4" />
                        <span>Skills & Technologies</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <MapPin className="w-4 h-4" />
                        <span>Location Details</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <DollarSign className="w-4 h-4" />
                        <span>Salary Expectations</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Calendar className="w-4 h-4" />
                        <span>Availability</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Globe className="w-4 h-4" />
                        <span>Education & Certifications</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Assignment Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold">Job Assignment</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobId">Target Job Posting *</Label>
                      <Select
                        value={newCandidate.jobId}
                        onValueChange={(value) => setNewCandidate({ ...newCandidate, jobId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job posting" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobPostings.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              <div className="flex items-center space-x-2">
                                <span>{job.title}</span>
                                <Badge className={getJobTypeColor(job.jobType)} variant="outline">
                                  {JOB_TYPES.find((t) => t.value === job.jobType)?.label}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {COUNTRIES.find((c) => c.code === job.country)?.name} - {job.city}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recruiterId">Assigned Recruiter *</Label>
                      <Select
                        value={newCandidate.recruiterId}
                        onValueChange={(value) => setNewCandidate({ ...newCandidate, recruiterId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recruiter" />
                        </SelectTrigger>
                        <SelectContent>
                          {recruiters.map((recruiter) => (
                            <SelectItem key={recruiter.id} value={recruiter.id}>
                              {recruiter.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* AI Extracted Information Preview */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">AI Extracted Information</h3>
                    <Badge className="bg-green-100 text-green-800">Auto-Generated</Badge>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <div className="text-center text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium mb-2">Ready to Process Resume</p>
                      <p className="text-sm">
                        Upload a resume file above and AI will automatically extract and display all candidate
                        information here
                      </p>
                    </div>
                  </div>
                </div>

                {/* Source and Additional Notes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Application Source</Label>
                    <Select
                      value={newCandidate.source}
                      onValueChange={(value) =>
                        setNewCandidate({
                          ...newCandidate,
                          source: value as "website" | "referral" | "linkedin" | "recruiter" | "other",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={newCandidate.source || "Select a source"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Company Website</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="referral">Employee Referral</SelectItem>
                        <SelectItem value="recruiter">Recruiter Sourced</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comments">Additional Notes (Optional)</Label>
                    <Textarea
                      id="comments"
                      value={newCandidate.comments}
                      onChange={(e) => setNewCandidate({ ...newCandidate, comments: e.target.value })}
                      placeholder="Any additional notes or observations..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCandidate}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!newCandidate.jobId || !newCandidate.recruiterId}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Process & Add Candidate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* AI-Powered Smart Search */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Brain className="text-purple-600 w-5 h-5 animate-pulse" />
              <Search className="text-gray-400 w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Ask AI to find candidates... (e.g., 'Find React developers with 5+ years experience' or 'Show me candidates available immediately')"
              value={searchFilters.searchTerm}
              onChange={(e) => setSearchFilters({ ...searchFilters, searchTerm: e.target.value })}
              className="w-full pl-16 pr-6 py-4 text-lg border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:ring-purple-200 bg-white/80 backdrop-blur-sm placeholder-gray-500"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">AI Powered</Badge>
              {searchFilters.searchTerm && (
                <button
                  onClick={() => setSearchFilters({ ...searchFilters, searchTerm: "" })}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Smart Filter Suggestions */}
          {searchFilters.searchTerm && (
            <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">AI Search Intelligence</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                <div className="flex items-center space-x-2 text-purple-700">
                  <Briefcase className="w-3 h-3" />
                  <span>Analyzing skills & experience match</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-700">
                  <MapPin className="w-3 h-3" />
                  <span>Location & availability preferences</span>
                </div>
                <div className="flex items-center space-x-2 text-purple-700">
                  <DollarSign className="w-3 h-3" />
                  <span>Salary expectations & job type fit</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-purple-600 font-medium">Quick Searches: </span>
                {[
                  "senior developers available now",
                  "marketing experts under $90k",
                  "remote candidates with React",
                  "entry level designers",
                  "contract workers in tech",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchFilters({ ...searchFilters, searchTerm: suggestion })}
                    className="text-xs px-3 py-1 bg-white/80 border border-purple-200 rounded-full hover:bg-purple-50 text-purple-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Smart Filters Row */}
          <div className="flex flex-wrap gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-white/80 border-purple-200">
                <SelectValue placeholder="Pipeline Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span>All Status</span>
                  </div>
                </SelectItem>
                {PIPELINE_STATUSES.map((status) => (
                  <SelectItem key={status.key} value={status.key}>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${status.color.includes("blue") ? "bg-blue-500" : status.color.includes("yellow") ? "bg-yellow-500" : status.color.includes("orange") ? "bg-orange-500" : status.color.includes("purple") ? "bg-purple-500" : status.color.includes("indigo") ? "bg-indigo-500" : status.color.includes("violet") ? "bg-violet-500" : status.color.includes("pink") ? "bg-pink-500" : status.color.includes("cyan") ? "bg-cyan-500" : status.color.includes("emerald") ? "bg-emerald-500" : status.color.includes("green") ? "bg-green-500" : status.color.includes("lime") ? "bg-lime-500" : status.color.includes("teal") ? "bg-teal-500" : status.color.includes("sky") ? "bg-sky-500" : status.color.includes("red") ? "bg-red-500" : status.color.includes("gray") ? "bg-gray-500" : "bg-amber-500"}`}
                      ></div>
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateFilter value={dateFilter} onValueChange={setDateFilter} />

            <Select
              value={searchFilters.jobType}
              onValueChange={(value) => setSearchFilters({ ...searchFilters, jobType: value })}
            >
              <SelectTrigger className="w-[160px] bg-white/80 border-purple-200">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {JOB_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={searchFilters.experience}
              onValueChange={(value) => setSearchFilters({ ...searchFilters, experience: value })}
            >
              <SelectTrigger className="w-[160px] bg-white/80 border-purple-200">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Level</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="lead">Lead/Principal</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchFilters.country}
              onValueChange={(value) => setSearchFilters({ ...searchFilters, country: value, city: "" })}
            >
              <SelectTrigger className="w-[140px] bg-white/80 border-purple-200">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Quick Filters */}

          {/* Active Filters Display */}
          {(searchFilters.searchTerm ||
            searchFilters.jobType ||
            searchFilters.experience ||
            searchFilters.country ||
            statusFilter !== "all" ||
            dateFilter !== "all") && (
            <div className="flex flex-wrap gap-2">
              {searchFilters.searchTerm && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Search: {searchFilters.searchTerm}
                  <button
                    onClick={() => setSearchFilters({ ...searchFilters, searchTerm: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchFilters.jobType && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {JOB_TYPES.find((t) => t.value === searchFilters.jobType)?.label}
                  <button
                    onClick={() => setSearchFilters({ ...searchFilters, jobType: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchFilters.experience && (
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  {searchFilters.experience === "entry" && "Entry Level"}
                  {searchFilters.experience === "mid" && "Mid Level"}
                  {searchFilters.experience === "senior" && "Senior Level"}
                  {searchFilters.experience === "lead" && "Lead/Principal"}
                  <button
                    onClick={() => setSearchFilters({ ...searchFilters, experience: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {searchFilters.country && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <MapPin className="w-3 h-3 mr-1" />
                  {COUNTRIES.find((c) => c.code === searchFilters.country)?.name}
                  <button
                    onClick={() => setSearchFilters({ ...searchFilters, country: "", city: "" })}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Status: {PIPELINE_STATUSES.find((s) => s.key === statusFilter)?.label}
                  <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {dateFilter !== "all" && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  Date: {dateFilter}
                  <button onClick={() => setDateFilter("all")} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        statusOptions={PIPELINE_STATUSES}
        showJobTypeFilter={true}
        showSalaryFilter={true}
        showExperienceFilter={true}
        showSkillsFilter={true}
        showStatusFilter={true}
        showSourceFilter={true}
        className="mb-6"
      />

      <Card>
        <CardContent>
          <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Candidates</TabsTrigger>
              <TabsTrigger value="date">By Date</TabsTrigger>
              <TabsTrigger value="client">By Client</TabsTrigger>
              <TabsTrigger value="job">By Job</TabsTrigger>
              <TabsTrigger value="recruiter">By Recruiter</TabsTrigger>
              <TabsTrigger value="jobtype">By Job Type</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredCandidates.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
                  <p className="text-gray-500 mb-4">
                    {candidates.length === 0
                      ? "No candidates have been added yet."
                      : "Try adjusting your search filters to see more results."}
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Candidate
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Job & Client</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Salary Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => {
                      const statusInfo = getStatusInfo(candidate.status)
                      const jobTypeInfo = JOB_TYPES.find((type) => type.value === candidate.jobType)
                      const countryInfo = COUNTRIES.find((country) => country.code === candidate.country)

                      return (
                        <TableRow key={candidate.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-gray-500">{candidate.experience} experience</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {candidate.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center space-x-2">
                                <Briefcase className="w-4 h-4 text-blue-400" />
                                <span>{candidate.jobTitle}</span>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span>{candidate.customerName}</span>
                              </div>
                              <Badge className={getJobTypeColor(candidate.jobType)} variant="outline">
                                {jobTypeInfo?.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span>{candidate.currentLocation}</span>
                              </div>
                              {countryInfo && (
                                <Badge variant="outline" className="text-xs">
                                  {countryInfo.name}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span className="truncate max-w-[150px]">{candidate.email}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{candidate.phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="w-3 h-3 text-gray-400" />
                                <span>
                                  Current: {formatSalary(candidate.currentSalary, candidate.jobType, candidate.country)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="w-3 h-3 text-green-500" />
                                <span>
                                  Expected:{" "}
                                  {formatSalary(candidate.expectedSalary, candidate.jobType, candidate.country)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {/* Quick Status Update Dropdown */}
                            <Select
                              value={candidate.status}
                              onValueChange={(value) => {
                                setCandidates(
                                  candidates.map((c) =>
                                    c.id === candidate.id
                                      ? { ...c, status: value, lastUpdated: new Date().toISOString().split("T")[0] }
                                      : c,
                                  ),
                                )
                              }}
                            >
                              <SelectTrigger className="w-[180px] h-8">
                                <SelectValue>
                                  <Badge className={statusInfo.color} variant="outline">
                                    {statusInfo.label}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {PIPELINE_STATUSES.map((status) => (
                                  <SelectItem key={status.key} value={status.key}>
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className={`w-2 h-2 rounded-full ${
                                          status.color.includes("blue")
                                            ? "bg-blue-500"
                                            : status.color.includes("yellow")
                                              ? "bg-yellow-500"
                                              : status.color.includes("orange")
                                                ? "bg-orange-500"
                                                : status.color.includes("purple")
                                                  ? "bg-purple-500"
                                                  : status.color.includes("indigo")
                                                    ? "bg-indigo-500"
                                                    : status.color.includes("violet")
                                                      ? "bg-violet-500"
                                                      : status.color.includes("pink")
                                                        ? "bg-pink-500"
                                                        : status.color.includes("cyan")
                                                          ? "bg-cyan-500"
                                                          : status.color.includes("emerald")
                                                            ? "bg-emerald-500"
                                                            : status.color.includes("green")
                                                              ? "bg-green-500"
                                                              : status.color.includes("lime")
                                                                ? "bg-lime-500"
                                                                : status.color.includes("teal")
                                                                  ? "bg-teal-500"
                                                                  : status.color.includes("sky")
                                                                    ? "bg-sky-500"
                                                                    : status.color.includes("red")
                                                                      ? "bg-red-500"
                                                                      : status.color.includes("gray")
                                                                        ? "bg-gray-500"
                                                                        : "bg-amber-500"
                                        }`}
                                      ></div>
                                      <span>{status.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span>{formatDateDDMMMYYYY(candidate.appliedDate)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {/* Quick Source Update Dropdown */}
                            <Select
                              value={candidate.source}
                              onValueChange={(value) => {
                                setCandidates(
                                  candidates.map((c) =>
                                    c.id === candidate.id
                                      ? {
                                          ...c,
                                          source: value as "website" | "referral" | "linkedin" | "recruiter" | "other",
                                          lastUpdated: new Date().toISOString().split("T")[0],
                                        }
                                      : c,
                                  ),
                                )
                              }}
                            >
                              <SelectTrigger className="w-[120px] h-8">
                                <SelectValue>
                                  <Badge variant="outline" className="capitalize text-xs">
                                    {candidate.source}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="website">
                                  <div className="flex items-center space-x-2">
                                    <Globe className="w-3 h-3" />
                                    <span>Website</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="linkedin">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-3 h-3" />
                                    <span>LinkedIn</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="referral">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-3 h-3" />
                                    <span>Referral</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="recruiter">
                                  <div className="flex items-center space-x-2">
                                    <Briefcase className="w-3 h-3" />
                                    <span>Recruiter</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="other">
                                  <div className="flex items-center space-x-2">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>Other</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              {/* Quick Recruiter Assignment Dropdown */}
                              <Select
                                value={candidate.recruiterId}
                                onValueChange={(value) => {
                                  const selectedRecruiter = recruiters.find((r) => r.id === value)
                                  if (selectedRecruiter) {
                                    setCandidates(
                                      candidates.map((c) =>
                                        c.id === candidate.id
                                          ? {
                                              ...c,
                                              recruiterId: value,
                                              recruiterName: selectedRecruiter.name,
                                              lastUpdated: new Date().toISOString().split("T")[0],
                                            }
                                          : c,
                                      ),
                                    )
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[100px] h-8">
                                  <SelectValue>
                                    <span className="text-xs truncate">{candidate.recruiterName}</span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {recruiters.map((recruiter) => (
                                    <SelectItem key={recruiter.id} value={recruiter.id}>
                                      <div className="flex items-center space-x-2">
                                        <User className="w-3 h-3" />
                                        <span>{recruiter.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCandidate(candidate)
                                  setIsEditDialogOpen(true)
                                }}
                                className="text-xs h-8 px-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="date">
              <div className="space-y-6">
                {Object.entries(getCandidatesByDate())
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .map(([date, candidates]) => (
                    <div key={date}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span>
                          {formatDateDDMMMYYYY(date)} ({candidates.length} candidates)
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{candidates.map(renderCandidateCard)}</div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="client">
              <div className="space-y-6">
                {Object.entries(getCandidatesByClient()).map(([clientId, candidates]) => {
                  const client = candidates[0] // Get client info from first candidate
                  return (
                    <div key={clientId}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <span>
                          {client.customerName} - SPOC: {client.internalSPOC} ({candidates.length} candidates)
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{candidates.map(renderCandidateCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="job">
              <div className="space-y-6">
                {Object.entries(getCandidatesByJob()).map(([jobId, candidates]) => {
                  const job = candidates[0] // Get job info from first candidate
                  return (
                    <div key={jobId}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <span>
                          {job.jobTitle} - {job.customerName} ({candidates.length} candidates)
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{candidates.map(renderCandidateCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="recruiter">
              <div className="space-y-6">
                {Object.entries(getCandidatesByRecruiter()).map(([recruiterId, candidates]) => {
                  const recruiter = candidates[0] // Get recruiter info from first candidate
                  return (
                    <div key={recruiterId}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <User className="w-5 h-5 text-green-600" />
                        <span>
                          {recruiter.recruiterName} ({candidates.length} candidates)
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{candidates.map(renderCandidateCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="jobtype">
              <div className="space-y-6">
                {Object.entries(getCandidatesByJobType()).map(([jobType, candidates]) => {
                  const jobTypeInfo = JOB_TYPES.find((type) => type.value === jobType)
                  return (
                    <div key={jobType}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <span>
                          {jobTypeInfo?.label || jobType} ({candidates.length} candidates)
                        </span>
                        <Badge className={getJobTypeColor(jobType)}>{jobTypeInfo?.salaryPeriod}</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{candidates.map(renderCandidateCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* AI Analysis Dialog */}
      {showAiAnalysis && (
        <Dialog open={!!showAiAnalysis} onOpenChange={() => setShowAiAnalysis(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Candidate Analysis</DialogTitle>
              <DialogDescription>Comprehensive AI-powered evaluation and recommendations</DialogDescription>
            </DialogHeader>
            <AICandidateAnalysis
              candidate={candidates.find((c) => c.id === showAiAnalysis)}
              jobPosting={jobPostings.find((j) => j.id === candidates.find((c) => c.id === showAiAnalysis)?.jobId)}
              onAnalysisComplete={(analysis) => handleAiAnalysisComplete(showAiAnalysis, analysis)}
            />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>Edit Candidate Profile</span>
            </DialogTitle>
            <DialogDescription>Update candidate information, pipeline status, and add notes</DialogDescription>
          </DialogHeader>

          {editingCandidate && (
            <div className="space-y-6 py-4">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Personal Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <input
                      type="text"
                      value={editingCandidate.name}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <input
                      type="email"
                      value={editingCandidate.email}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <input
                      type="tel"
                      value={editingCandidate.phone}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  {/* Experience Level Dropdown */}
                  <div className="space-y-2">
                    <Label>Experience Level</Label>
                    <Select
                      value={editingCandidate.experience}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, experience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1 years">0-1 years</SelectItem>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="2-3 years">2-3 years</SelectItem>
                        <SelectItem value="3-5 years">3-5 years</SelectItem>
                        <SelectItem value="5-7 years">5-7 years</SelectItem>
                        <SelectItem value="7-10 years">7-10 years</SelectItem>
                        <SelectItem value="10+ years">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Notice Period Dropdown */}
                  <div className="space-y-2">
                    <Label>Notice Period</Label>
                    <Select
                      value={editingCandidate.noticePeriod}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, noticePeriod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Immediate">Immediate</SelectItem>
                        <SelectItem value="1 week">1 week</SelectItem>
                        <SelectItem value="2 weeks">2 weeks</SelectItem>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="2 months">2 months</SelectItem>
                        <SelectItem value="3 months">3 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Current Location Dropdown */}
                  <div className="space-y-2">
                    <Label>Current Location</Label>
                    <Select
                      value={editingCandidate.currentLocation}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, currentLocation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                        <SelectItem value="New York, NY">New York, NY</SelectItem>
                        <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                        <SelectItem value="Toronto, ON">Toronto, ON</SelectItem>
                        <SelectItem value="Berlin, Germany">Berlin, Germany</SelectItem>
                        <SelectItem value="London, UK">London, UK</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pipeline Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <span>Pipeline Status</span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Current Status</Label>
                    <Select
                      value={editingCandidate.status}
                      onValueChange={(value) => setEditingCandidate({ ...editingCandidate, status: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STATUSES.map((status) => (
                          <SelectItem key={status.key} value={status.key}>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${status.color.includes("blue") ? "bg-blue-500" : status.color.includes("yellow") ? "bg-yellow-500" : status.color.includes("orange") ? "bg-orange-500" : status.color.includes("purple") ? "bg-purple-500" : status.color.includes("indigo") ? "bg-indigo-500" : status.color.includes("violet") ? "bg-violet-500" : status.color.includes("pink") ? "bg-pink-500" : status.color.includes("cyan") ? "bg-cyan-500" : status.color.includes("emerald") ? "bg-emerald-500" : status.color.includes("green") ? "bg-green-500" : status.color.includes("lime") ? "bg-lime-500" : status.color.includes("teal") ? "bg-teal-500" : status.color.includes("sky") ? "bg-sky-500" : status.color.includes("red") ? "bg-red-500" : status.color.includes("gray") ? "bg-gray-500" : "bg-amber-500"}`}
                              ></div>
                              <span>{status.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Salary Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Salary Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Salary</Label>
                    <input
                      type="number"
                      value={editingCandidate.currentSalary}
                      onChange={(e) =>
                        setEditingCandidate({ ...editingCandidate, currentSalary: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Salary</Label>
                    <input
                      type="number"
                      value={editingCandidate.expectedSalary}
                      onChange={(e) =>
                        setEditingCandidate({ ...editingCandidate, expectedSalary: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Application Source Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <span>Application Source</span>
                </h3>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select
                    value={editingCandidate.source}
                    onValueChange={(value) =>
                      setEditingCandidate({
                        ...editingCandidate,
                        source: value as "website" | "referral" | "linkedin" | "recruiter" | "other",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4" />
                          <span>Company Website</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>LinkedIn</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="referral">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Employee Referral</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="recruiter">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Recruiter Sourced</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Other</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Comments & Notes</span>
                </h3>
                <Textarea
                  value={editingCandidate.comments}
                  onChange={(e) => setEditingCandidate({ ...editingCandidate, comments: e.target.value })}
                  placeholder="Add any additional notes or observations about the candidate..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCandidate} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
