"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  User,
  MessageCircle,
  Brain,
  Building2,
  Target,
} from "lucide-react"
import { formatDate } from "../../../../lib/date-utils"
import { formatSalary, COUNTRIES } from "../../../../lib/location-data"
import AICandidateAnalysis from "../../../components/ai-candidate-analysis"

// Mock data - in real app this would come from API
const mockJobPostings = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    country: "US",
    city: "San Francisco",
    jobType: "full-time",
    salaryMin: 120000,
    salaryMax: 180000,
    description: "We are looking for a Senior Software Engineer to join our growing team...",
    requirements: ["Bachelor's degree in Computer Science", "5+ years of experience", "React/Node.js expertise"],
    skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"],
    experience: "5+ years",
    status: "active",
    priority: "high",
  },
]

const mockCandidates = [
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
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "linkedin",
    comments: "Strong technical background, good communication skills.",
    aiScore: 87,
    aiVerdict: "recommended",
    aiAnalysis: {
      overallScore: 87,
      skillsMatch: 92,
      experienceMatch: 85,
      culturalFit: 84,
      verdict: "recommended" as const,
      reasoning: "Strong technical skills with good alignment to role requirements.",
      confidence: 89,
      strengths: ["Excellent React/Node.js skills", "Strong problem-solving abilities", "Good communication"],
      weaknesses: ["Limited AWS experience", "Could benefit from more leadership experience"],
      analysisDate: new Date(),
    },
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
    skills: ["React", "JavaScript", "Python", "SQL"],
    experience: "4 years",
    status: "phone-screen",
    appliedDate: "2024-01-14",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "website",
    comments: "Good technical foundation, eager to learn.",
    aiScore: 73,
    aiVerdict: "consider",
    aiAnalysis: {
      overallScore: 73,
      skillsMatch: 78,
      experienceMatch: 70,
      culturalFit: 81,
      verdict: "consider" as const,
      reasoning: "Good potential but some gaps in senior-level experience.",
      confidence: 82,
      strengths: ["Strong JavaScript fundamentals", "Quick learner", "Good cultural fit"],
      weaknesses: ["Limited senior-level experience", "Needs more TypeScript exposure"],
      analysisDate: new Date(),
    },
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    phone: "+1-416-555-0125",
    currentSalary: 95000,
    expectedSalary: 140000,
    noticePeriod: "2 weeks",
    currentLocation: "Toronto, ON",
    country: "CA",
    city: "Toronto",
    skills: ["React", "Node.js", "TypeScript", "AWS", "Docker", "Kubernetes"],
    experience: "7 years",
    status: "final-interview",
    appliedDate: "2024-01-10",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "referral",
    comments: "Exceptional technical skills, strong leadership potential.",
    aiScore: 94,
    aiVerdict: "highly_recommended",
    aiAnalysis: {
      overallScore: 94,
      skillsMatch: 96,
      experienceMatch: 93,
      culturalFit: 92,
      verdict: "highly_recommended" as const,
      reasoning: "Outstanding candidate with exceptional qualifications and perfect skill alignment.",
      confidence: 95,
      strengths: ["Expert-level technical skills", "Strong leadership experience", "Excellent problem-solving"],
      weaknesses: ["Salary expectations slightly above range"],
      analysisDate: new Date(),
    },
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@email.com",
    phone: "+1-555-0126",
    currentSalary: 80000,
    expectedSalary: 110000,
    noticePeriod: "3 weeks",
    currentLocation: "Austin, TX",
    country: "US",
    city: "Austin",
    skills: ["React", "Vue.js", "Node.js", "MongoDB"],
    experience: "6 years",
    status: "interview-1",
    appliedDate: "2024-01-12",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "indeed",
    comments: "Strong full-stack developer with good team collaboration skills.",
    aiScore: 81,
    aiVerdict: "recommended",
    aiAnalysis: {
      overallScore: 81,
      skillsMatch: 85,
      experienceMatch: 88,
      culturalFit: 86,
      verdict: "recommended" as const,
      reasoning: "Solid technical background with good experience level.",
      confidence: 87,
      strengths: ["Full-stack development", "Team collaboration", "Good experience"],
      weaknesses: ["Limited TypeScript exposure", "Could use more cloud experience"],
      analysisDate: new Date(),
    },
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1-555-0127",
    currentSalary: 90000,
    expectedSalary: 130000,
    noticePeriod: "1 month",
    currentLocation: "Seattle, WA",
    country: "US",
    city: "Seattle",
    skills: ["React", "Angular", "Java", "Spring Boot"],
    experience: "8 years",
    status: "phone-screen",
    appliedDate: "2024-01-13",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "linkedin",
    comments: "Experienced developer with strong Java background.",
    aiScore: 76,
    aiVerdict: "consider",
    aiAnalysis: {
      overallScore: 76,
      skillsMatch: 72,
      experienceMatch: 90,
      culturalFit: 78,
      verdict: "consider" as const,
      reasoning: "Good experience but skills don't fully align with React/Node.js focus.",
      confidence: 80,
      strengths: ["Strong Java experience", "Good senior level", "Solid background"],
      weaknesses: ["Limited React/Node.js experience", "Different tech stack focus"],
      analysisDate: new Date(),
    },
  },
  {
    id: "6",
    name: "Lisa Brown",
    email: "lisa.brown@email.com",
    phone: "+1-555-0128",
    currentSalary: 85000,
    expectedSalary: 115000,
    noticePeriod: "2 weeks",
    currentLocation: "Denver, CO",
    country: "US",
    city: "Denver",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    experience: "5 years",
    status: "new",
    appliedDate: "2024-01-16",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "company-website",
    comments: "Good technical skills, looking for growth opportunities.",
    aiScore: 84,
    aiVerdict: "recommended",
    aiAnalysis: {
      overallScore: 84,
      skillsMatch: 89,
      experienceMatch: 82,
      culturalFit: 85,
      verdict: "recommended" as const,
      reasoning: "Strong technical alignment with good potential for growth.",
      confidence: 86,
      strengths: ["Excellent React/TypeScript skills", "Good database knowledge", "Growth mindset"],
      weaknesses: ["Could use more cloud experience", "Limited leadership experience"],
      analysisDate: new Date(),
    },
  },
  {
    id: "7",
    name: "Robert Taylor",
    email: "robert.taylor@email.com",
    phone: "+1-555-0129",
    currentSalary: 95000,
    expectedSalary: 135000,
    noticePeriod: "1 month",
    currentLocation: "Chicago, IL",
    country: "US",
    city: "Chicago",
    skills: ["React", "Node.js", "AWS", "Docker"],
    experience: "9 years",
    status: "screening",
    appliedDate: "2024-01-11",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "referral",
    comments: "Senior developer with strong cloud and DevOps experience.",
    aiScore: 89,
    aiVerdict: "recommended",
    aiAnalysis: {
      overallScore: 89,
      skillsMatch: 91,
      experienceMatch: 94,
      culturalFit: 83,
      verdict: "recommended" as const,
      reasoning: "Excellent technical skills with strong cloud experience.",
      confidence: 90,
      strengths: ["Strong cloud/DevOps skills", "Excellent experience", "Good technical depth"],
      weaknesses: ["Could improve communication skills", "Salary expectations high"],
      analysisDate: new Date(),
    },
  },
  {
    id: "8",
    name: "Jennifer Lee",
    email: "jennifer.lee@email.com",
    phone: "+1-555-0130",
    currentSalary: 78000,
    expectedSalary: 105000,
    noticePeriod: "2 weeks",
    currentLocation: "Portland, OR",
    country: "US",
    city: "Portland",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    experience: "4 years",
    status: "new",
    appliedDate: "2024-01-17",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "indeed",
    comments: "Frontend focused developer with good UI/UX skills.",
    aiScore: 68,
    aiVerdict: "consider",
    aiAnalysis: {
      overallScore: 68,
      skillsMatch: 75,
      experienceMatch: 65,
      culturalFit: 82,
      verdict: "consider" as const,
      reasoning: "Good frontend skills but needs more backend and senior-level experience.",
      confidence: 75,
      strengths: ["Strong frontend skills", "Good UI/UX focus", "Quick learner"],
      weaknesses: ["Limited backend experience", "Below senior level", "Needs TypeScript"],
      analysisDate: new Date(),
    },
  },
  {
    id: "9",
    name: "Michael Garcia",
    email: "michael.garcia@email.com",
    phone: "+1-555-0131",
    currentSalary: 92000,
    expectedSalary: 125000,
    noticePeriod: "3 weeks",
    currentLocation: "Miami, FL",
    country: "US",
    city: "Miami",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    experience: "6 years",
    status: "phone-screen",
    appliedDate: "2024-01-14",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "linkedin",
    comments: "Full-stack developer with good problem-solving skills.",
    aiScore: 82,
    aiVerdict: "recommended",
    aiAnalysis: {
      overallScore: 82,
      skillsMatch: 87,
      experienceMatch: 84,
      culturalFit: 80,
      verdict: "recommended" as const,
      reasoning: "Good technical alignment with solid full-stack experience.",
      confidence: 84,
      strengths: ["Full-stack development", "Good problem-solving", "Solid experience"],
      weaknesses: ["Could use more cloud experience", "Limited team leadership"],
      analysisDate: new Date(),
    },
  },
  {
    id: "10",
    name: "Amanda Martinez",
    email: "amanda.martinez@email.com",
    phone: "+1-555-0132",
    currentSalary: 88000,
    expectedSalary: 120000,
    noticePeriod: "2 weeks",
    currentLocation: "Phoenix, AZ",
    country: "US",
    city: "Phoenix",
    skills: ["React", "Vue.js", "JavaScript", "Firebase"],
    experience: "5 years",
    status: "new",
    appliedDate: "2024-01-18",
    jobId: "1",
    jobTitle: "Senior Software Engineer",
    jobType: "full-time",
    customerName: "TechCorp Inc.",
    internalSPOC: "Sarah Wilson",
    recruiterName: "Sarah Wilson",
    source: "company-website",
    comments: "Versatile developer with good frontend and backend skills.",
    aiScore: 79,
    aiVerdict: "consider",
    aiAnalysis: {
      overallScore: 79,
      skillsMatch: 83,
      experienceMatch: 78,
      culturalFit: 85,
      verdict: "consider" as const,
      reasoning: "Good technical skills but could benefit from more Node.js experience.",
      confidence: 81,
      strengths: ["Versatile developer", "Good frontend skills", "Quick learner"],
      weaknesses: ["Limited Node.js experience", "Could use more cloud knowledge"],
      analysisDate: new Date(),
    },
  },
]

const PIPELINE_STATUSES = [
  { key: "new", label: "New Application", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { key: "screening", label: "Initial Screening", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { key: "phone-screen", label: "Phone Screening", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { key: "interview-1", label: "First Interview", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { key: "final-interview", label: "Final Interview", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { key: "offer-sent", label: "Offer Sent", color: "bg-green-100 text-green-800 border-green-200" },
  { key: "hired", label: "Hired", color: "bg-green-200 text-green-900 border-green-300" },
  { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-800 border-red-200" },
]

export default function JobApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string
  const [showAiAnalysis, setShowAiAnalysis] = useState<string | null>(null)

  const jobPosting = mockJobPostings.find((job) => job.id === jobId) || mockJobPostings[0] // Fallback to first job if not found
  // Show all candidates regardless of job ID to ensure they display
  const candidates = mockCandidates

  const getStatusInfo = (status: string) => {
    return PIPELINE_STATUSES.find((s) => s.key === status) || PIPELINE_STATUSES[0]
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "highly_recommended":
        return "text-green-600 bg-green-100 border-green-200"
      case "recommended":
        return "text-blue-600 bg-blue-100 border-blue-200"
      case "consider":
        return "text-yellow-600 bg-yellow-100 border-yellow-200"
      case "not_recommended":
        return "text-red-600 bg-red-100 border-red-200"
      default:
        return "text-gray-600 bg-gray-100 border-gray-200"
    }
  }

  const getWhatsAppUrl = (phone: string, candidateName: string, jobTitle: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, "")
    const message = encodeURIComponent(
      `Hi ${candidateName}, I'm reaching out regarding your application for the ${jobTitle} position. Would you be available for a quick chat?`,
    )
    return `https://wa.me/${cleanPhone}?text=${message}`
  }

  if (!jobPosting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/?tab=jobs')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Postings
          </Button>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-blue-900">{jobPosting.title}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2 text-blue-700">
                    <Building2 className="w-4 h-4" />
                    <span>{jobPosting.company}</span>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    <span>{jobPosting.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 text-blue-600">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {formatSalary(jobPosting.salaryMin, jobPosting.jobType as any, jobPosting.country, true)} -{" "}
                      {formatSalary(jobPosting.salaryMax, jobPosting.jobType as any, jobPosting.country)}
                    </span>
                  </div>
                  
                  {/* Status Badges Row */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 cursor-pointer">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Contract
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 cursor-pointer">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Active
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 cursor-pointer">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      On-site
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 cursor-pointer">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      High Priority
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  {/* Beautiful Status Dropdown with Applicant Counts */}
                  <div className="relative group">
                    <div className="bg-white rounded-lg border-2 border-blue-200 p-3 cursor-pointer hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-blue-700">Active</span>
                        <svg className="w-4 h-4 text-blue-500 transform group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {/* Dropdown Content */}
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="p-4 space-y-3">
                          {/* Status Options */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Active</span>
                              </div>
                              <span className="text-xs text-gray-500">Current</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Paused</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-700">Closed</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Divider */}
                          <div className="border-t border-gray-200 my-3"></div>
                          
                          {/* Applicant Counts - Beautiful Design */}
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Applicant Summary</div>
                            
                            {/* Internal Applicants */}
                            <div className="flex items-center justify-between p-2 bg-purple-50 rounded-md border border-purple-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-sm font-medium text-purple-700">Internal</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-lg font-bold text-purple-600">4</span>
                                <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* External Applicants */}
                            <div className="flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-700">External</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-lg font-bold text-green-600">10</span>
                                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* Total Applicants */}
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-sm font-medium text-blue-700">Total</span>
                              </div>
                              <span className="text-xl font-bold text-blue-600">{candidates.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {candidates.map((candidate) => {
            const statusInfo = getStatusInfo(candidate.status)
            const countryInfo = COUNTRIES.find((country) => country.code === candidate.country)

            return (
              <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-sm text-gray-600">{candidate.experience} experience</p>
                      </div>
                    </div>
                    <Badge className={statusInfo.color} variant="outline">
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {/* AI Score Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">AI Analysis</span>
                      </div>
                      <Badge className={`${getVerdictColor(candidate.aiVerdict)} border text-xs`}>
                        {candidate.aiVerdict.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{candidate.aiScore}</div>
                          <div className="text-xs text-gray-600">Overall</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{candidate.aiAnalysis.skillsMatch}%</div>
                          <div className="text-xs text-gray-600">Skills</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {candidate.aiAnalysis.experienceMatch}%
                          </div>
                          <div className="text-xs text-gray-600">Experience</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAiAnalysis(candidate.id)}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{candidate.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{candidate.phone}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(getWhatsAppUrl(candidate.phone, candidate.name, jobPosting.title), "_blank")
                        }
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{candidate.currentLocation}</span>
                      {countryInfo && (
                        <Badge variant="outline" className="text-xs">
                          {countryInfo.name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Salary & Experience */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600 mb-1">
                        <DollarSign className="w-3 h-3" />
                        <span>Current</span>
                      </div>
                      <div className="font-medium">
                        {formatSalary(candidate.currentSalary, candidate.jobType as any, candidate.country)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 text-gray-600 mb-1">
                        <Target className="w-3 h-3" />
                        <span>Expected</span>
                      </div>
                      <div className="font-medium text-green-600">
                        {formatSalary(candidate.expectedSalary, candidate.jobType as any, candidate.country)}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Applied {formatDate(candidate.appliedDate)}</span>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {candidate.source}
                    </Badge>
                  </div>

                  {/* Comments */}
                  {candidate.comments && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-xs text-gray-600 mb-1">Notes</div>
                      <p className="text-xs text-gray-700">{candidate.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* AI Analysis Dialog */}
        {showAiAnalysis && (
          <Dialog open={!!showAiAnalysis} onOpenChange={() => setShowAiAnalysis(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Candidate Analysis</DialogTitle>
                <DialogDescription>
                  Comprehensive AI-powered evaluation comparing candidate profile with job requirements
                </DialogDescription>
              </DialogHeader>
              <AICandidateAnalysis
                candidate={candidates.find((c) => c.id === showAiAnalysis)}
                jobPosting={jobPosting}
                onAnalysisComplete={(analysis: any) => {
                  // Handle analysis completion if needed
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Empty State */}
        {candidates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applicants Yet</h3>
              <p className="text-gray-500">
                This job posting hasn't received any applications yet. Check back later or consider promoting the
                position.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
