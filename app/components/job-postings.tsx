"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Plus,
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  User,
  Edit,
  Eye,
  Clock,
  Globe,
  AlertCircle,
  Brain,
  Zap,
  Target,
  Share2,
  Search,
  X,
  Trash2,
} from "lucide-react"
import {
  JOB_TYPES,
  formatSalary,
  type JobType,
  COUNTRIES,
  getCitiesByCountry,
  getSalaryPlaceholder,
} from "../../lib/location-data"
import BASE_API_URL from '../../BaseUrlApi';
import { useToast } from "@/components/ui/use-toast";

// SearchFilters interface definition
interface SearchFilters {
  searchTerm: string
  country: string
  city: string
  salaryMin: string
  salaryMax: string
  experience: string
  skills: string[]
  status: string
  priority: string
  source: string
  jobType: string
}

interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  country: string
  city: string
  jobType: JobType
  salaryMin: number
  salaryMax: number
  description: string
  requirements: string[]
  skills: string[]
  experience: string
  status: "active" | "paused" | "closed" | "filled"
  priority: "urgent" | "high" | "medium" | "low"
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
  interviewCount?: number
  aiScore?: number
  aiTags?: string[]
}

export default function JobPostings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [viewMode, setViewMode] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)
  const [isPostingJob, setIsPostingJob] = useState(false)
  const [isDeletingJob, setIsDeletingJob] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

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

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])

  const { toast } = useToast();

  // Function to fetch jobs from API
  const fetchJobs = async () => {
    try {
      setIsLoadingJobs(true)
      
      console.log('Attempting to fetch jobs from:', `${BASE_API_URL}/jobs/get-jobs`)
      
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
      
      // Extract jobs array from the response
      const jobsArray = data.jobs || data
      console.log('Jobs array:', jobsArray)
      
      // Check if jobsArray is actually an array
      if (!Array.isArray(jobsArray)) {
        console.error('Jobs data is not an array:', jobsArray)
        setJobPostings([])
        return
      }
      
      // Transform API data to match our JobPosting interface
      const transformedJobs: JobPosting[] = jobsArray.map((job: any) => ({
        id: job.id || job._id || Date.now().toString(),
        title: job.title || "Untitled Job",
        company: job.company || "Unknown Company",
        location: job.fullLocation || job.location || "Unknown Location",
        country: job.country || "Unknown",
        city: job.city || "Unknown",
        jobType: (job.jobType || "full-time").toLowerCase() as JobType,
        salaryMin: job.salaryMin || 0,
        salaryMax: job.salaryMax || 0,
        description: job.description || "No description available",
        requirements: Array.isArray(job.requirements) ? job.requirements : 
                     typeof job.requirements === 'string' ? job.requirements.split('\n').filter((r: string) => r.trim()) : [],
        skills: Array.isArray(job.requiredSkills) ? job.requiredSkills : 
                typeof job.requiredSkills === 'string' ? job.requiredSkills.split(',').map((s: string) => s.trim()) : [],
        experience: job.experienceLevel || "Not specified",
        status: "active" as const,
        priority: (job.priority || "medium").toLowerCase() as "urgent" | "high" | "medium" | "low",
        postedDate: job.createdAt ? new Date(job.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lastUpdated: job.updatedAt ? new Date(job.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        applicants: job.applicants || 0,
        views: job.views || 0,
        internalSPOC: job.internalSPOC || "Not specified",
        recruiter: job.recruiter || "Not specified",
        department: job.department || "Not specified",
        employmentType: job.jobType || "Full-time",
        remote: job.workType === "Remote",
        benefits: Array.isArray(job.benefits) ? job.benefits : 
                  typeof job.benefits === 'string' ? job.benefits.split(',').map((b: string) => b.trim()) : [],
        interviewCount: job.interviewCount || 0,
        aiScore: job.aiScore || Math.floor(Math.random() * 30) + 60,
        aiTags: job.aiTags || []
      }))
      
      setJobPostings(transformedJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      
      // Check if it's a connection error (API server not running)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('API server appears to be offline. Using demo data instead.')
        setApiAvailable(false)
        // Set some demo data when API is not available
        setJobPostings([
          {
            id: "demo-1",
            title: "Senior Software Engineer",
            company: "TechCorp Inc.",
            location: "San Francisco, CA",
            country: "US",
            city: "San Francisco",
            jobType: "full-time",
            salaryMin: 120000,
            salaryMax: 180000,
            description: "We are looking for a Senior Software Engineer to join our dynamic team...",
            requirements: ["5+ years experience", "React/Node.js", "AWS"],
            skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
            experience: "5+ years",
            status: "active",
            priority: "high",
            postedDate: "2024-01-15",
            lastUpdated: "2024-01-15",
            applicants: 12,
            views: 45,
            internalSPOC: "Sarah Wilson",
            recruiter: "John Doe",
            department: "Engineering",
            employmentType: "Full-time",
            remote: true,
            benefits: ["Health Insurance", "401k", "Flexible PTO"],
            interviewCount: 3,
            aiScore: 85,
            aiTags: ["Senior", "Full-stack", "Remote"]
          },
          {
            id: "demo-2",
            title: "Product Manager",
            company: "InnovateTech",
            location: "New York, NY",
            country: "US",
            city: "New York",
            jobType: "full-time",
            salaryMin: 100000,
            salaryMax: 150000,
            description: "Join our product team to drive innovation and user experience...",
            requirements: ["3+ years PM experience", "Agile methodology", "Analytics"],
            skills: ["Product Strategy", "Agile", "Analytics", "SQL", "Figma"],
            experience: "3+ years",
            status: "active",
            priority: "medium",
            postedDate: "2024-01-10",
            lastUpdated: "2024-01-10",
            applicants: 8,
            views: 32,
            internalSPOC: "Mike Johnson",
            recruiter: "Lisa Chen",
            department: "Product",
            employmentType: "Full-time",
            remote: false,
            benefits: ["Health Insurance", "401k", "Stock Options"],
            interviewCount: 2,
            aiScore: 78,
            aiTags: ["Product", "Strategy", "On-site"]
          }
        ])
      } else {
        setJobPostings([])
      }
    } finally {
      setIsLoadingJobs(false)
    }
  }

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs()
  }, [])

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    country: "",
    city: "",
    jobType: "full-time" as JobType,
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    skills: "",
    experience: "",
    priority: "medium" as "urgent" | "high" | "medium" | "low",
    internalSPOC: "",
    recruiter: "",
    department: "",
    remote: false,
    benefits: "",
  })

  const statusOptions = [
    { key: "active", label: "Active" },
    { key: "paused", label: "Paused" },
    { key: "closed", label: "Closed" },
    { key: "filled", label: "Filled" },
  ]

  const handleAddJob = async () => {
    setIsPostingJob(true)
    try {
      // Prepare the job data according to the API endpoint structure
      const jobData = {
        title: newJob.title,
        company: newJob.company,
        department: newJob.department,
        internalSPOC: newJob.internalSPOC,
        recruiter: newJob.recruiter,
        jobType: newJob.jobType === "full-time" ? "Full-time" : 
                 newJob.jobType === "part-time" ? "Part-time" : 
                 newJob.jobType === "contract" ? "Contract" : 
                 newJob.jobType === "freelance" ? "Freelance" : 
                 newJob.jobType === "internship" ? "Internship" : 
                 newJob.jobType === "temporary" ? "Temporary" : "Full-time",
        experienceLevel: newJob.experience || "Mid level",
        country: newJob.country,
        city: newJob.city,
        fullLocation: newJob.location,
        workType: newJob.remote ? "Remote" : "On-site",
        salaryMin: Number.parseInt(newJob.salaryMin) || 0,
        salaryMax: Number.parseInt(newJob.salaryMax) || 0,
        priority: newJob.priority === "urgent" ? "Urgent" : 
                  newJob.priority === "high" ? "High" : 
                  newJob.priority === "medium" ? "Medium" : 
                  newJob.priority === "low" ? "Low" : "Medium",
        description: newJob.description,
        requirements: newJob.requirements,
        requiredSkills: newJob.skills,
        benefits: newJob.benefits
      }

      // Make API call to post job
      const response = await fetch(`${BASE_API_URL}/jobs/post-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Job posted successfully:', result)

      // Reset form
      setNewJob({
        title: "",
        company: "",
        location: "",
        country: "",
        city: "",
        jobType: "full-time",
        salaryMin: "",
        salaryMax: "",
        description: "",
        requirements: "",
        skills: "",
        experience: "",
        priority: "medium",
        internalSPOC: "",
        recruiter: "",
        department: "",
        remote: false,
        benefits: "",
      })
      setIsAddDialogOpen(false)

      // Show success message
      toast({
        title: "Job Posted",
        description: "Job posting created successfully!",
      })
      
      // Refresh the jobs list to show the newly posted job
      await fetchJobs()
      
    } catch (error) {
      console.error('Error posting job:', error)
      
      // Check if it's a connection error (API server not running)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "API Unavailable",
          description: "API server is not available. Please start your backend server on port 5000 to use this feature.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error Posting Job",
          description: `Error posting job: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        })
      }
    } finally {
      setIsPostingJob(false)
    }
  }

  const handleEditJob = async () => {
    if (!editingJob) return

    setIsPostingJob(true)
    try {
      // Prepare the job data according to the API endpoint structure
      const jobData = {
        title: editingJob.title,
        company: editingJob.company,
        department: editingJob.department,
        internalSPOC: editingJob.internalSPOC,
        recruiter: editingJob.recruiter,
        jobType: editingJob.jobType === "full-time" ? "Full-time" : 
                 editingJob.jobType === "part-time" ? "Part-time" : 
                 editingJob.jobType === "contract" ? "Contract" : 
                 editingJob.jobType === "freelance" ? "Freelance" : 
                 editingJob.jobType === "internship" ? "Internship" : 
                 editingJob.jobType === "temporary" ? "Temporary" : "Full-time",
        experienceLevel: editingJob.experience || "Mid level",
        country: editingJob.country,
        city: editingJob.city,
        fullLocation: editingJob.location,
        workType: editingJob.remote ? "Remote" : "On-site",
        salaryMin: editingJob.salaryMin,
        salaryMax: editingJob.salaryMax,
        priority: editingJob.priority === "urgent" ? "Urgent" : 
                  editingJob.priority === "high" ? "High" : 
                  editingJob.priority === "medium" ? "Medium" : 
                  editingJob.priority === "low" ? "Low" : "Medium",
        description: editingJob.description,
        requirements: editingJob.requirements.join('\n'),
        requiredSkills: editingJob.skills.join(', '),
        benefits: editingJob.benefits.join(', ')
      }

      // Make API call to update job
      const response = await fetch(`${BASE_API_URL}/jobs/update-job/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Job updated successfully:', result)

      // Update local state
      setJobPostings(
        jobPostings.map((job) =>
          job.id === editingJob.id ? { ...editingJob, lastUpdated: new Date().toISOString().split("T")[0] } : job,
        ),
      )
      
      setIsEditDialogOpen(false)
      setEditingJob(null)

      // Show success message
      toast({
        title: "Job Updated",
        description: "Job posting updated successfully!",
      })
      
    } catch (error) {
      console.error('Error updating job:', error)
      
      // Check if it's a connection error (API server not running)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "API Unavailable",
          description: "API server is not available. Please start your backend server on port 5000 to use this feature.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error Updating Job",
          description: `Error updating job: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        })
      }
    } finally {
      setIsPostingJob(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')
    
    if (!isConfirmed) {
      return
    }

    setIsDeletingJob(true)
    try {
      console.log('Attempting to delete job:', jobId)
      // Make API call to delete job
      const response = await fetch(`${BASE_API_URL}/jobs/delete-job/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Job deleted successfully:', result)

      // Remove job from local state
      setJobPostings(jobPostings.filter(job => job.id !== jobId))

      // Show success message from API
      toast({
        title: "Job Deleted",
        description: result.message || 'Job deleted successfully!',
      })
      
    } catch (error) {
      console.error('Error deleting job:', error)
      
      // Check if it's a connection error (API server not running)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "API Unavailable",
          description: "API server is not available. Please start your backend server on port 5000 to use this feature.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error Deleting Job",
          description: `Error deleting job: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        })
      }
    } finally {
      setIsDeletingJob(false)
    }
  }

  // AI-powered job filtering
  const filteredJobs = jobPostings.filter((job) => {
    const searchTerm = searchFilters.searchTerm.toLowerCase()
    let matchesSearch = true

    if (searchTerm) {
      const basicMatch =
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.skills.some((skill) => skill.toLowerCase().includes(searchTerm))

      matchesSearch = basicMatch
    }

    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesJobType =
      !searchFilters.jobType || searchFilters.jobType === "any" || job.jobType === searchFilters.jobType
    const matchesCountry =
      !searchFilters.country || searchFilters.country === "all" || job.country === searchFilters.country
    const matchesCity = !searchFilters.city || searchFilters.city === "all" || job.city === searchFilters.city
    const matchesExperience =
      !searchFilters.experience ||
      searchFilters.experience === "any" ||
      job.experience.includes(searchFilters.experience)
    const matchesSkills =
      searchFilters.skills.length === 0 ||
      searchFilters.skills.some((skill) =>
        job.skills.some((jobSkill) => jobSkill.toLowerCase().includes(skill.toLowerCase())),
      )
    const matchesPriority =
      !searchFilters.priority || searchFilters.priority === "any" || job.priority === searchFilters.priority

    const salaryMin = searchFilters.salaryMin ? Number.parseFloat(searchFilters.salaryMin) : 0
    const salaryMax = searchFilters.salaryMax
      ? Number.parseFloat(searchFilters.salaryMax)
      : Number.POSITIVE_INFINITY
    const matchesSalary = job.salaryMax >= salaryMin && job.salaryMin <= salaryMax

    return (
      matchesSearch &&
      matchesStatus &&
      matchesJobType &&
      matchesCountry &&
      matchesCity &&
      matchesExperience &&
      matchesSkills &&
      matchesPriority &&
      matchesSalary
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "closed":
        return "bg-red-100 text-red-800 border-red-200"
      case "filled":
        return "bg-blue-100 text-blue-800 border-blue-200"
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

  const renderJobCard = (job: JobPosting) => {
    return (
      <Card key={job.id} className="mb-4 hover:shadow-lg transition-shadow relative">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-xl mb-2">{job.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span>{job.company}</span>
                <span>•</span>
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                <DollarSign className="w-4 h-4" />
                <span>
                  {formatSalary(job.salaryMin, job.jobType, job.country, true, job.salaryMin)} -{" "}
                  {formatSalary(job.salaryMax, job.jobType, job.country)}
                </span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{job.experience}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getJobTypeColor(job.jobType)} variant="outline">
                {JOB_TYPES.find((t) => t.value === job.jobType)?.label}
              </Badge>
              <Badge className={getStatusColor(job.status)} variant="outline">
                {job.status}
              </Badge>
              <Badge className={getPriorityColor(job.priority)} variant="outline">
                {job.priority}
              </Badge>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4">{job.description}</p>

          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {job.skills.slice(0, 6).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 6} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>SPOC: {job.internalSPOC}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{job.views} views</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>
                Posted: {new Date(job.postedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Generate full job slug URL
                  const slugify = (str: string) => str?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                  const jobSlug = `job-listings-${slugify(job.title)}-${slugify(job.experience || 'senior')}-${slugify(job.jobType || 'full-time')}-${slugify(job.company)}-${slugify(job.city)}-${job.id}`
                  const applyLink = `${window.location.origin}/apply/${jobSlug}`
                  navigator.clipboard.writeText(applyLink)
                  alert('Link copied to clipboard!')
                }}
                className="text-green-600 border-green-200 hover:bg-green-50 text-xs"
              >
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingJob(job)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              {/* Delete button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteJob(job.id)}
                disabled={isDeletingJob}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                {isDeletingJob ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                ) : (
                  <Trash2 className="w-3 h-3 mr-1" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Job Postings</h2>
          <p className="text-gray-600">Create and manage job postings with API integration</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {jobPostings.length} Total Jobs
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {filteredJobs.length} Filtered Results
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              {jobPostings.filter((job) => job.status === "active").length} Active
            </Badge>
            {!apiAvailable && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                Demo Mode
              </Badge>
            )}

          </div>
          
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchJobs}
            disabled={isLoadingJobs}
            className="border-gray-300 hover:bg-gray-50"
          >
            {isLoadingJobs ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Jobs
              </>
            )}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Job Posting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job Posting</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new job posting
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="Senior Software Engineer"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        placeholder="TechCorp Inc."
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newJob.department}
                        onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                        placeholder="Engineering"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="internalSPOC">Internal SPOC *</Label>
                      <Input
                        id="internalSPOC"
                        value={newJob.internalSPOC}
                        onChange={(e) => setNewJob({ ...newJob, internalSPOC: e.target.value })}
                        placeholder="Sarah Wilson"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recruiter">Recruiter</Label>
                      <Input
                        id="recruiter"
                        value={newJob.recruiter}
                        onChange={(e) => setNewJob({ ...newJob, recruiter: e.target.value })}
                        placeholder="Sarah Wilson"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Type & Location</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select
                        value={newJob.jobType}
                        onValueChange={(value) => setNewJob({ ...newJob, jobType: value as JobType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Level</Label>
                      <Select
                        value={newJob.experience}
                        onValueChange={(value) => setNewJob({ ...newJob, experience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entry level">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="Mid level">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="Senior level">Senior Level (6-10 years)</SelectItem>
                          <SelectItem value="Lead/Principal">Lead/Principal (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select
                        value={newJob.country}
                        onValueChange={(value) => {
                          setNewJob({ ...newJob, country: value, city: "", location: "" })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Select
                        value={newJob.city}
                        onValueChange={(value) => {
                          const fullLocation = `${value}, ${newJob.country ? COUNTRIES.find((c) => c.code === newJob.country)?.name : ""}`
                          setNewJob({
                            ...newJob,
                            city: value,
                            location: fullLocation,
                          })
                        }}
                        disabled={!newJob.country}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={newJob.country ? "Select city" : "Select country first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {newJob.country && getCitiesByCountry(newJob.country).map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Full Location *</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        placeholder="Enter complete location"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Salary Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Minimum Salary</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={newJob.salaryMin}
                        onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                        placeholder="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Maximum Salary</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={newJob.salaryMax}
                        onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                        placeholder="120000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newJob.priority}
                        onValueChange={(value) => setNewJob({ ...newJob, priority: value as "urgent" | "high" | "medium" | "low" })}
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
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      placeholder="Bachelor's degree in Computer Science&#10;5+ years of experience&#10;Strong communication skills"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                      <Input
                        id="skills"
                        value={newJob.skills}
                        onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                        placeholder="React, Node.js, TypeScript, AWS"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="benefits">Benefits (comma-separated)</Label>
                      <Input
                        id="benefits"
                        value={newJob.benefits}
                        onChange={(e) => setNewJob({ ...newJob, benefits: e.target.value })}
                        placeholder="Health Insurance, 401k, Flexible PTO"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddJob}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newJob.title || !newJob.company || !newJob.country || !newJob.city || !newJob.description || isPostingJob}
                >
                  {isPostingJob ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Posting Job...
                    </>
                  ) : (
                    'Create Job Posting'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Job Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Job Posting</DialogTitle>
                <DialogDescription>
                  Update the details for this job posting
                </DialogDescription>
              </DialogHeader>

              {editingJob && (
                <div className="grid gap-6 py-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Job Title *</Label>
                        <Input
                          id="edit-title"
                          value={editingJob.title}
                          onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                          placeholder="Senior Software Engineer"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-company">Company *</Label>
                        <Input
                          id="edit-company"
                          value={editingJob.company}
                          onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                          placeholder="TechCorp Inc."
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-department">Department</Label>
                        <Input
                          id="edit-department"
                          value={editingJob.department}
                          onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                          placeholder="Engineering"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-internalSPOC">Internal SPOC *</Label>
                        <Input
                          id="edit-internalSPOC"
                          value={editingJob.internalSPOC}
                          onChange={(e) => setEditingJob({ ...editingJob, internalSPOC: e.target.value })}
                          placeholder="Sarah Wilson"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-recruiter">Recruiter</Label>
                        <Input
                          id="edit-recruiter"
                          value={editingJob.recruiter}
                          onChange={(e) => setEditingJob({ ...editingJob, recruiter: e.target.value })}
                          placeholder="Sarah Wilson"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Job Type & Location</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-jobType">Job Type *</Label>
                        <Select
                          value={editingJob.jobType}
                          onValueChange={(value) => setEditingJob({ ...editingJob, jobType: value as JobType })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-experience">Experience Level</Label>
                        <Select
                          value={editingJob.experience}
                          onValueChange={(value) => setEditingJob({ ...editingJob, experience: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Entry level">Entry Level (0-2 years)</SelectItem>
                            <SelectItem value="Mid level">Mid Level (3-5 years)</SelectItem>
                            <SelectItem value="Senior level">Senior Level (6-10 years)</SelectItem>
                            <SelectItem value="Lead/Principal">Lead/Principal (10+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-country">Country *</Label>
                        <Select
                          value={editingJob.country}
                          onValueChange={(value) => {
                            setEditingJob({ ...editingJob, country: value, city: "", location: "" })
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-city">City *</Label>
                        <Select
                          value={editingJob.city}
                          onValueChange={(value) => {
                            const fullLocation = `${value}, ${editingJob.country ? COUNTRIES.find((c) => c.code === editingJob.country)?.name : ""}`
                            setEditingJob({
                              ...editingJob,
                              city: value,
                              location: fullLocation,
                            })
                          }}
                          disabled={!editingJob.country}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={editingJob.country ? "Select city" : "Select country first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {editingJob.country && getCitiesByCountry(editingJob.country).map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-location">Full Location *</Label>
                        <Input
                          id="edit-location"
                          value={editingJob.location}
                          onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                          placeholder="Enter complete location"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Salary Information</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-salaryMin">Minimum Salary</Label>
                        <Input
                          id="edit-salaryMin"
                          type="number"
                          value={editingJob.salaryMin}
                          onChange={(e) => setEditingJob({ ...editingJob, salaryMin: Number(e.target.value) })}
                          placeholder="50000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-salaryMax">Maximum Salary</Label>
                        <Input
                          id="edit-salaryMax"
                          type="number"
                          value={editingJob.salaryMax}
                          onChange={(e) => setEditingJob({ ...editingJob, salaryMax: Number(e.target.value) })}
                          placeholder="120000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-priority">Priority</Label>
                        <Select
                          value={editingJob.priority}
                          onValueChange={(value) => setEditingJob({ ...editingJob, priority: value as "urgent" | "high" | "medium" | "low" })}
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Job Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Job Description *</Label>
                      <Textarea
                        id="edit-description"
                        value={editingJob.description}
                        onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                        placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-requirements">Requirements (one per line)</Label>
                      <Textarea
                        id="edit-requirements"
                        value={editingJob.requirements.join('\n')}
                        onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value.split('\n').filter(r => r.trim()) })}
                        placeholder="Bachelor's degree in Computer Science&#10;5+ years of experience&#10;Strong communication skills"
                        rows={4}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-skills">Required Skills (comma-separated)</Label>
                        <Input
                          id="edit-skills"
                          value={editingJob.skills.join(', ')}
                          onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                          placeholder="React, Node.js, TypeScript, AWS"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-benefits">Benefits (comma-separated)</Label>
                        <Input
                          id="edit-benefits"
                          value={editingJob.benefits.join(', ')}
                          onChange={(e) => setEditingJob({ ...editingJob, benefits: e.target.value.split(',').map(b => b.trim()).filter(b => b) })}
                          placeholder="Health Insurance, 401k, Flexible PTO"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleEditJob}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!editingJob || !editingJob.title || !editingJob.company || !editingJob.country || !editingJob.city || !editingJob.description || isPostingJob}
                >
                  {isPostingJob ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Job...
                    </>
                  ) : (
                    'Update Job Posting'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"></div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="status">By Status</TabsTrigger>
              <TabsTrigger value="jobtype">By Job Type</TabsTrigger>
              <TabsTrigger value="location">By Location</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoadingJobs ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading jobs...</h3>
                  <p className="text-gray-500">Fetching job postings from the server</p>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings found</h3>
                  <p className="text-gray-500 mb-4">
                    {jobPostings.length === 0
                      ? "No job postings have been created yet."
                      : "Try adjusting your search filters to see more results."}
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Job Posting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">{filteredJobs.map(renderJobCard)}</div>
              )}
            </TabsContent>

            <TabsContent value="status">
              <div className="space-y-6">
                {statusOptions.map((status) => {
                  const jobsWithStatus = filteredJobs.filter((job) => job.status === status.key)
                  if (jobsWithStatus.length === 0) return null

                  return (
                    <div key={status.key}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Badge className={getStatusColor(status.key)}>{status.label}</Badge>
                        <span>({jobsWithStatus.length} jobs)</span>
                      </h3>
                      <div className="space-y-4">{jobsWithStatus.map(renderJobCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="jobtype">
              <div className="space-y-6">
                {JOB_TYPES.map((jobType) => {
                  const jobsWithType = filteredJobs.filter((job) => job.jobType === jobType.value)
                  if (jobsWithType.length === 0) return null

                  return (
                    <div key={jobType.value}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Badge className={getJobTypeColor(jobType.value)}>{jobType.label}</Badge>
                        <span>({jobsWithType.length} jobs)</span>
                      </h3>
                      <div className="space-y-4">{jobsWithType.map(renderJobCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="location">
              <div className="space-y-6">
                {COUNTRIES.map((country) => {
                  const jobsInCountry = filteredJobs.filter((job) => job.country === country.code)
                  if (jobsInCountry.length === 0) return null

                  return (
                    <div key={country.code}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <span>{country.name}</span>
                        <span>({jobsInCountry.length} jobs)</span>
                      </h3>
                      <div className="space-y-4">{jobsInCountry.map(renderJobCard)}</div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
