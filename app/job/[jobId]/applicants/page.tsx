"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
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
  CheckCircle,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
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
  const jobId = params.jobId as string
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [showAiAnalysis, setShowAiAnalysis] = useState<string | null>(null)

  const jobPosting = mockJobPostings.find((job) => job.id === jobId)
  const candidates = mockCandidates.filter((candidate) => candidate.jobId === jobId)

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

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "highly_recommended":
        return <ThumbsUp className="w-4 h-4 text-green-600" />
      case "recommended":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "consider":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case "not_recommended":
        return <ThumbsDown className="w-4 h-4 text-red-600" />
      default:
        return <Brain className="w-4 h-4 text-gray-600" />
    }
  }

  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^\d]/g, "")
  }

  const getWhatsAppUrl = (phone: string, candidateName: string, jobTitle: string) => {
    const cleanPhone = formatPhoneForWhatsApp(phone)
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
          <Button variant="outline" onClick={() => window.history.back()} className="mb-4">
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
                      {formatSalary(jobPosting.salaryMin, jobPosting.jobType as any, jobPosting.country, true)} -
                      {formatSalary(jobPosting.salaryMax, jobPosting.jobType as any, jobPosting.country)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">{candidates.length}</div>
                  <div className="text-sm text-blue-600">Total Applicants</div>
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
                onAnalysisComplete={(analysis) => {
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
