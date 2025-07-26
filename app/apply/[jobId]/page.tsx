"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Globe,
  X,
} from "lucide-react"
import { formatSalary, JOB_TYPES, COUNTRIES } from "../../../lib/location-data"
import BASE_API_URL from '../../../BaseUrlApi';
import { useToast } from "@/components/ui/use-toast";

interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  country: string
  city: string
  jobType: string
  salaryMin: number
  salaryMax: number
  description: string
  requirements: string[]
  skills: string[]
  experience: string
  status: string
  priority: string
  postedDate: string
  lastUpdated: string
  applicants: number
  views: number
  internalSPOC: string
  recruiter: string
  department: string
  employmentType: string
  remote: boolean
  benefits: string[]
  customQuestions?: Array<{
    id: string
    question: string
    type: "text" | "select" | "number" | "boolean"
    required: boolean
    options?: string[]
  }>
}

interface ApplicationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentLocation: string
  resumeFile: File | null
  coverLetter: string
  customAnswers: Record<string, any>
  source: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  applicationId?: number
  jobTitle?: string
  company?: string
  resumeFilePath?: string
}

export default function ApplyJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentLocation: "",
    resumeFile: null,
    coverLetter: "",
    customAnswers: {},
    source: "social-media",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    applicationId: undefined,
    jobTitle: "",
    company: "",
    resumeFilePath: "",
  })

  const { toast } = useToast();


  useEffect(() => {
    // Extract UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search)
    const utmSource = urlParams.get("utm_source") || ""
    const utmMedium = urlParams.get("utm_medium") || ""
    const utmCampaign = urlParams.get("utm_campaign") || ""

    setApplicationData((prev) => ({
      ...prev,
      utmSource,
      utmMedium,
      utmCampaign,
    }))

    // Fetch job details from API
    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        
        console.log('Fetching job details for ID:', jobId)
        
        const response = await fetch(`${BASE_API_URL}/jobs/get-jobs`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Fetched jobs from API:', data)
        
        // Find the specific job by ID or by slug
        const jobsArray = data.jobs || data
        let foundJob = jobsArray.find((j: any) => j.id?.toString() === jobId || j._id === jobId)
        
        // If not found by ID, try to match by slug
        if (!foundJob) {
          const slugify = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
          foundJob = jobsArray.find((j: any) => {
            const jobSlug = `job-listings-${slugify(j.title)}-${slugify(j.experienceLevel || j.experience || 'senior')}-${slugify(j.jobType || 'full-time')}-${slugify(j.company)}-${slugify(j.city)}-${j.id}`
            return jobSlug === jobId
          })
        }
        
        if (foundJob) {
          // Transform API data to match our JobPosting interface
          const transformedJob: JobPosting = {
            id: foundJob.id || foundJob._id || jobId,
            title: foundJob.title || "Untitled Job",
            company: foundJob.company || "Unknown Company",
            location: foundJob.fullLocation || foundJob.location || "Unknown Location",
            country: foundJob.country || "Unknown",
            city: foundJob.city || "Unknown",
            jobType: (foundJob.jobType || "full-time").toLowerCase(),
            salaryMin: foundJob.salaryMin || 0,
            salaryMax: foundJob.salaryMax || 0,
            description: foundJob.description || "No description available",
            requirements: Array.isArray(foundJob.requirements) ? foundJob.requirements : 
                         typeof foundJob.requirements === 'string' ? foundJob.requirements.split('\n').filter((r: string) => r.trim()) : [],
            skills: Array.isArray(foundJob.requiredSkills) ? foundJob.requiredSkills : 
                    typeof foundJob.requiredSkills === 'string' ? foundJob.requiredSkills.split(',').map((s: string) => s.trim()) : [],
            experience: foundJob.experienceLevel || "Not specified",
            status: "active",
            priority: (foundJob.priority || "medium").toLowerCase() as "urgent" | "high" | "medium" | "low",
            postedDate: foundJob.createdAt ? new Date(foundJob.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastUpdated: foundJob.updatedAt ? new Date(foundJob.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            applicants: foundJob.applicants || 0,
            views: foundJob.views || 0,
            internalSPOC: foundJob.internalSPOC || "Not specified",
            recruiter: foundJob.recruiter || "Not specified",
            department: foundJob.department || "Not specified",
            employmentType: foundJob.jobType || "Full-time",
            remote: foundJob.workType === "Remote",
            benefits: Array.isArray(foundJob.benefits) ? foundJob.benefits : 
                      typeof foundJob.benefits === 'string' ? foundJob.benefits.split(',').map((b: string) => b.trim()) : [],
            customQuestions: [
              {
                id: "keySkills",
                question: "What are your key skills relevant to this position?",
                type: "text",
                required: true,
              },
              {
                id: "salaryExpectation",
                question: "What is your salary expectation?",
                type: "number",
                required: true,
              },
              {
                id: "noticePeriod",
                question: "What is your notice period?",
                type: "select",
                required: true,
                options: ["Immediate", "2 weeks", "1 month", "2 months", "3 months"],
              },
              {
                id: "yearsOfExperience",
                question: "How many years of experience do you have?",
                type: "select",
                required: true,
                options: ["0-1 years", "2-3 years", "4-5 years", "6-10 years", "10+ years"],
              },
              {
                id: "remoteWork",
                question: "Are you open to remote work?",
                type: "boolean",
                required: false,
              },
              {
                id: "startDate",
                question: "When can you start?",
                type: "select",
                required: true,
                options: ["Immediately", "Within 2 weeks", "Within 1 month", "Within 2 months", "More than 2 months"],
              },
              {
                id: "portfolioUrl",
                question: "Please provide a link to your portfolio or GitHub profile",
                type: "text",
                required: false,
              },
            ]
          }
          
          setJob(transformedJob)
          
          // Initialize custom answers
          const initialAnswers: Record<string, any> = {}
          transformedJob.customQuestions?.forEach((q) => {
            initialAnswers[q.id] = q.type === "boolean" ? false : ""
          })
          setApplicationData((prev) => ({
            ...prev,
            customAnswers: initialAnswers,
          }))
        } else {
          toast({
            title: "Job Not Found",
            description: "The job you're looking for doesn't exist or has been removed.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching job details:', error)
        toast({
          title: "Failed to Load Job Details",
          description: "Failed to load job details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  const handleInputChange = (field: keyof ApplicationData, value: any) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCustomAnswerChange = (questionId: string, value: any) => {
    setApplicationData((prev) => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: value,
      },
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return
      }

      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 5MB.",
          variant: "destructive",
        });
        return
      }

      // Start upload progress simulation
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setIsUploading(false)
            return 100
          }
          return prev + 10
        })
      }, 100)
      
      // Complete upload after 1 second
      setTimeout(() => {
        setUploadProgress(100)
        setIsUploading(false)
        setApplicationData((prev) => ({
          ...prev,
          resumeFile: file,
        }))
        setError("")
        toast({
          title: "Resume Uploaded Successfully",
          description: `${file.name} has been uploaded successfully.`,
        });
      }, 1000)
    }
  }

  const validateForm = () => {
    const missingFields = []
    
    if (!applicationData.firstName.trim()) missingFields.push("First Name")
    if (!applicationData.lastName.trim()) missingFields.push("Last Name")
    if (!applicationData.email.trim()) missingFields.push("Email")
    if (!applicationData.phone.trim()) missingFields.push("Phone Number")
    if (!applicationData.resumeFile) missingFields.push("Resume")
    
    if (missingFields.length > 0) {
      return `Missing required fields: ${missingFields.join(", ")}. Please fill in all required information.`
    }

    // Validate custom questions
    if (job?.customQuestions) {
      for (const question of job.customQuestions) {
        if (question.required) {
          const answer = applicationData.customAnswers[question.id]
          if (!answer || (typeof answer === "string" && !answer.trim())) {
            return `Missing required answer: ${question.question}. Please provide your response.`
          }
        }
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return
    }

    setSubmitting(true)
    setError("")

    try {
      
      // Prepare the application data according to the API format
      const applicationPayload = {
        firstName: applicationData.firstName,
        lastName: applicationData.lastName,
        email: applicationData.email,
        phone: applicationData.phone,
        currentLocation: applicationData.currentLocation,
        coverLetter: applicationData.coverLetter,
        keySkills: applicationData.customAnswers.keySkills || "",
        salaryExpectation: applicationData.customAnswers.salaryExpectation || "",
        noticePeriod: applicationData.customAnswers.noticePeriod || "",
        yearsOfExperience: applicationData.customAnswers.yearsOfExperience || "",
        remoteWork: applicationData.customAnswers.remoteWork || false,
        startDate: applicationData.customAnswers.startDate || "",
        portfolioUrl: applicationData.customAnswers.portfolioUrl || "",
      }

      // Construct the URL properly based on the API format
      const titleSlug = job?.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const experienceSlug = (job?.experience || 'senior').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const jobTypeSlug = (job?.jobType || 'full-time').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const companySlug = job?.company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      const citySlug = job?.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      
      // Try the complex URL format first
      let applyUrl = `${BASE_API_URL}/job-listings/job-listings-${titleSlug}-${experienceSlug}-${jobTypeSlug}-${companySlug}-${citySlug}-${job?.id}/apply`
      
      // If that fails, we'll try a simpler format
      const fallbackUrl = `${BASE_API_URL}/job-listings/${job?.id}/apply`
      
      console.log('Submitting application to:', applyUrl)
      console.log('Application payload:', applicationPayload)
      
      let response
      
      // Check if we have a resume file to upload
      if (applicationData.resumeFile) {
        // Use FormData for file upload
        const formData = new FormData()
        formData.append('resume', applicationData.resumeFile)
        
        // Add other fields to FormData
        Object.entries(applicationPayload).forEach(([key, value]) => {
          formData.append(key, value.toString())
        })
        
        console.log('Using FormData for file upload')
        response = await fetch(applyUrl, {
          method: 'POST',
          body: formData, // Don't set Content-Type header for FormData
        })
      } else {
        // Use JSON for text-only data
        console.log('Using JSON for text-only data')
        response = await fetch(applyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(applicationPayload),
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        // Try fallback URL if the first one failed
        if (response.status === 400 || response.status === 404) {
          console.log('Trying fallback URL:', fallbackUrl)
          
          if (applicationData.resumeFile) {
            const formData = new FormData()
            formData.append('resume', applicationData.resumeFile)
            Object.entries(applicationPayload).forEach(([key, value]) => {
              formData.append(key, value.toString())
            })
            
            response = await fetch(fallbackUrl, {
              method: 'POST',
              body: formData,
            })
          } else {
            response = await fetch(fallbackUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(applicationPayload),
            })
          }
          
          if (!response.ok) {
            const fallbackErrorText = await response.text()
            console.error('Fallback API Error Response:', fallbackErrorText)
            let errorMessage = "Application submission failed. Please try again."
            try {
              const errorData = JSON.parse(fallbackErrorText)
              errorMessage = errorData.message || errorMessage
            } catch (e) {
              // If not JSON, use the text as is
              errorMessage = fallbackErrorText
            }
            toast({
              title: "Application Submission Failed",
              description: errorMessage,
              variant: "destructive",
            });
            throw new Error(errorMessage)
          }
        } else {
          const errorText = await response.text()
          console.error('API Error Response:', errorText)
          let errorMessage = "Application submission failed. Please try again."
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.message || errorMessage
          } catch (e) {
            // If not JSON, use the text as is
            errorMessage = errorText
          }
          toast({
            title: "Application Submission Failed",
            description: errorMessage,
            variant: "destructive",
          });
          throw new Error(errorMessage)
        }
      }

      const result = await response.json()
      console.log("Application submitted successfully:", result)
      
      // Store the application result for display
      setApplicationData((prev) => ({
        ...prev,
        applicationId: result.applicationId,
        jobTitle: result.jobTitle,
        company: result.company,
        resumeFilePath: result.resumeFile,
      }))
      
      setSubmitted(true)
      toast({
        title: "Application Submitted",
        description: `Thank you for applying to ${applicationData.jobTitle || job?.title} at ${applicationData.company || job?.company}. We'll review your application and get back to you soon.`,
      });
    } catch (err) {
      console.error('Error submitting application:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast({
        title: "Application Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
            <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for applying to {applicationData.jobTitle || job?.title} at {applicationData.company || job?.company}. We'll review your application and get back to
              you soon.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Application ID: {applicationData.applicationId || `APP-${Date.now()}`}</p>
              <p>Job Title: {applicationData.jobTitle || job?.title}</p>
              <p>Company: {applicationData.company || job?.company}</p>
              {applicationData.resumeFilePath && (
                <p>Resume: {applicationData.resumeFilePath}</p>
              )}
              <p>Submitted: {new Date().toLocaleDateString()}</p>
            </div>
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700 mt-4">
              View More Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) return null

  const jobTypeInfo = JOB_TYPES.find((type) => type.value === job.jobType)
  const countryInfo = COUNTRIES.find((country) => country.code === job.country)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Job Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{jobTypeInfo?.label}</span>
                  </div>
                  {job.remote && (
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4" />
                      <span>Remote</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      {formatSalary(job.salaryMin, job.jobType, job.country, true, job.salaryMin)} -{" "}
                      {formatSalary(job.salaryMax, job.jobType, job.country)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{job.experience}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Badge className="bg-green-100 text-green-800">{job.status}</Badge>
                <Badge variant="outline">{job.priority} priority</Badge>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">About this role</h3>
              <p className="text-gray-700 text-sm">{job.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {job.benefits.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Apply for this position</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={applicationData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={applicationData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={applicationData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john.smith@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={applicationData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentLocation">Current Location</Label>
                  <Input
                    id="currentLocation"
                    value={applicationData.currentLocation}
                    onChange={(e) => handleInputChange("currentLocation", e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              {/* Resume Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Resume & Cover Letter</h3>
                <div className="space-y-2">
                  <Label htmlFor="resume">Resume *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        {applicationData.resumeFile ? applicationData.resumeFile.name : "Upload your resume"}
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
                      
                      {/* Progress Bar */}
                      {isUploading && (
                        <div className="w-full bg-gray-100 rounded-full h-3 mt-3 overflow-hidden shadow-inner">
                          <div 
                            className="h-3 rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative"
                            style={{ width: `${uploadProgress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Upload Status */}
                      {isUploading && (
                        <p className="text-sm text-blue-600 font-medium animate-pulse">
                          Uploading... {uploadProgress}%
                        </p>
                      )}
                      
                      {uploadProgress === 100 && !isUploading && applicationData.resumeFile && (
                        <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                          <CheckCircle className="w-4 h-4" />
                          <p className="text-sm font-medium">Resume uploaded successfully!</p>
                        </div>
                      )}
                      
                      {/* Remove Resume Button */}
                      {applicationData.resumeFile && !isUploading && (
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setApplicationData(prev => ({ ...prev, resumeFile: null }))
                              setUploadProgress(0)
                              setError("")
                            }}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Remove Resume
                          </Button>
                        </div>
                      )}
                      
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("resume")?.click()}
                        className="mt-2"
                        disabled={isUploading}
                      >
                        {isUploading ? "Uploading..." : applicationData.resumeFile ? "Replace Resume" : "Choose File"}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                  <Textarea
                    id="coverLetter"
                    value={applicationData.coverLetter}
                    onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                    placeholder="Tell us why you're interested in this position..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Custom Questions */}
              {job.customQuestions && job.customQuestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Questions</h3>
                  <div className="space-y-4">
                    {job.customQuestions.map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <Label htmlFor={question.id}>
                          Q{index + 1}. {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>

                        {question.type === "text" && (
                          <Input
                            id={question.id}
                            value={applicationData.customAnswers[question.id] || ""}
                            onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                            placeholder="Your answer..."
                            required={question.required}
                          />
                        )}

                        {question.type === "number" && (
                          <Input
                            id={question.id}
                            type="number"
                            value={applicationData.customAnswers[question.id] || ""}
                            onChange={(e) => handleCustomAnswerChange(question.id, e.target.value)}
                            placeholder="Enter amount..."
                            required={question.required}
                          />
                        )}

                        {question.type === "select" && question.options && (
                          <Select
                            value={applicationData.customAnswers[question.id] || ""}
                            onValueChange={(value) => handleCustomAnswerChange(question.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option..." />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {question.type === "boolean" && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={question.id}
                              checked={applicationData.customAnswers[question.id] || false}
                              onCheckedChange={(checked) => handleCustomAnswerChange(question.id, checked)}
                            />
                            <Label htmlFor={question.id} className="text-sm font-normal">
                              Yes
                            </Label>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-red-800 font-semibold text-sm mb-1">
                        {error.includes("Missing required fields") ? "Missing Required Fields" : "Application Submission Failed"}
                      </h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 min-w-[120px]">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Source Tracking Info */}
        {applicationData.utmSource && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="text-xs text-gray-500">
                <p>Application source: {applicationData.utmSource}</p>
                {applicationData.utmMedium && <p>Medium: {applicationData.utmMedium}</p>}
                {applicationData.utmCampaign && <p>Campaign: {applicationData.utmCampaign}</p>}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
