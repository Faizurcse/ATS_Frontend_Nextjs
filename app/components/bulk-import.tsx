"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code,
  Globe,
  Award,
  Search,
  Filter,
  Download,
  Trash2,
  Settings,
} from "lucide-react"
import BASE_API_URL from "@/PythonApi"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"

interface ParsedResumeData {
  Name: string
  Email: string
  Phone: string
  Address: string
  Summary: string
  Experience: Array<{
    Company: string
    Position: string
    Duration: string
    Description: string
  }>
  Education: Array<{
    Institution: string
    Degree: string
    Field: string
    Year: string
  }>
  Skills: string[]
  Languages: string[]
  Projects: Array<{
    Name: string
    Description: string
    Technologies?: string[]
  }>
  TotalExperience: string
  Certifications?: string[]
}

interface ResumeData {
  id: number
  filename: string
  file_type: string
  candidate_name: string
  candidate_email: string
  total_experience: string
  parsed_data?: string | null // JSON string that needs to be parsed, can be undefined
  created_at: string
  updated_at?: string
}

interface ResumeParseResponse {
  total_files: number
  successful_files: number
  failed_files: number
  total_processing_time: number
  results: Array<{
    filename: string
    status: "success" | "failed"
    error?: string | null
    parsed_data?: ParsedResumeData | null
    file_type?: string | null
    processing_time?: number
  }>
}

interface ProcessingResult {
  filename: string
  status: "success" | "failed"
  error?: string | null
  parsed_data?: ParsedResumeData | null
  file_type?: string | null
  processing_time?: number
}

// Resume Files List Component
function ResumeFilesList() {
  const { toast } = useToast()
  const [resumeFiles, setResumeFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFileTypeTab, setActiveFileTypeTab] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set())

  const fetchResumeFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://pyats.workisy.in/api/v1/download/resumes/with-files')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setResumeFiles(data.resumes || [])
    } catch (error) {
      console.error('Error fetching resume files:', error)
      toast({
        title: "Error",
        description: "Failed to fetch resume files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (downloadUrl: string, filename: string) => {
    try {
      const response = await fetch(`https://pyats.workisy.in${downloadUrl}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: `${filename} is being downloaded.`,
      })
    } catch (error) {
      console.error('Error downloading file:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileSelection = (fileId: number, checked: boolean) => {
    const newSelectedFiles = new Set(selectedFiles)
    if (checked) {
      newSelectedFiles.add(fileId)
    } else {
      newSelectedFiles.delete(fileId)
    }
    setSelectedFiles(newSelectedFiles)
  }

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      // If all are selected, deselect all
      setSelectedFiles(new Set())
    } else {
      // Select all filtered files
      const allFileIds = new Set(filteredFiles.map(file => file.id))
      setSelectedFiles(allFileIds)
    }
  }

  const handleBulkDownload = async () => {
    if (selectedFiles.size === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to download.",
        variant: "destructive",
      })
      return
    }

    const selectedFileData = filteredFiles.filter(file => selectedFiles.has(file.id))
    
    try {
      // Download each selected file
      for (const file of selectedFileData) {
        await handleDownload(file.download_url, file.filename)
        // Add a small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      toast({
        title: "Bulk Download Complete",
        description: `Successfully downloaded ${selectedFiles.size} file(s).`,
      })
      
      // Clear selection after successful download
      setSelectedFiles(new Set())
    } catch (error) {
      console.error('Error during bulk download:', error)
      toast({
        title: "Bulk Download Failed",
        description: "Some files failed to download. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Clear selection when filters change
  useEffect(() => {
    setSelectedFiles(new Set())
  }, [searchTerm, activeFileTypeTab, dateFilter, startDate, endDate])

  useEffect(() => {
    fetchResumeFiles()
  }, [])

  // Filter files by search term, file type, and date
  const filteredFiles = resumeFiles.filter(file => {
    const matchesSearch = file.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.filename.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFileType = activeFileTypeTab === "all" || file.file_type.toLowerCase() === activeFileTypeTab.toLowerCase()
    
    // Date filtering logic
    let matchesDate = true
    if (dateFilter !== "all") {
      const fileDate = new Date(file.upload_date)
      const today = new Date()
      
      switch (dateFilter) {
        case "today":
          matchesDate = fileDate.toDateString() === today.toDateString()
          break
        case "yesterday":
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          matchesDate = fileDate.toDateString() === yesterday.toDateString()
          break
        case "this_week":
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          matchesDate = fileDate >= startOfWeek
          break
        case "this_month":
          matchesDate = fileDate.getMonth() === today.getMonth() && fileDate.getFullYear() === today.getFullYear()
          break
        case "last_month":
          const lastMonth = new Date(today)
          lastMonth.setMonth(lastMonth.getMonth() - 1)
          matchesDate = fileDate.getMonth() === lastMonth.getMonth() && fileDate.getFullYear() === lastMonth.getFullYear()
          break
        case "custom":
          if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999) // Include end date
            matchesDate = fileDate >= start && fileDate <= end
          }
          break
      }
    }
    
    return matchesSearch && matchesFileType && matchesDate
  })

  // Get unique file types for tabs
  const fileTypes = ["all", ...Array.from(new Set(resumeFiles.map(file => file.file_type.toLowerCase())))]

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'docx':
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />
      case 'rtf':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return <FileText className="w-4 h-4 text-purple-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  // Get file type count
  const getFileTypeCount = (fileType: string) => {
    if (fileType === "all") {
      return resumeFiles.length
    }
    return resumeFiles.filter(file => file.file_type.toLowerCase() === fileType.toLowerCase()).length
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Button 
          onClick={() => {
            fetchResumeFiles()
            setSelectedFiles(new Set())
          }} 
          disabled={loading} 
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Date Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Date Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDateFilter("all")
              setStartDate("")
              setEndDate("")
              setSelectedFiles(new Set())
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear Filters
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Date Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Quick:</span>
            <div className="flex space-x-1">
              {[
                { value: "all", label: "All" },
                { value: "today", label: "Today" },
                { value: "yesterday", label: "Yesterday" },
                { value: "this_week", label: "This Week" },
                { value: "this_month", label: "This Month" },
                { value: "last_month", label: "Last Month" }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    setDateFilter(filter.value)
                    setSelectedFiles(new Set())
                  }}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    dateFilter === filter.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Custom:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setDateFilter("custom")
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setDateFilter("custom")
              }}
              className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => setDateFilter("custom")}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                dateFilter === "custom" && (startDate || endDate)
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Active Filter Display */}
        {dateFilter !== "all" && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Active filter:</span>
              <Badge variant="outline" className="text-xs">
                {dateFilter === "custom" 
                  ? `Custom: ${startDate} to ${endDate}`
                  : dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                }
              </Badge>
              <span className="text-xs text-gray-500">
                ({filteredFiles.length} of {resumeFiles.length} files)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* File Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {fileTypes.map((fileType) => (
            <button
              key={fileType}
              onClick={() => {
                setActiveFileTypeTab(fileType)
                setSelectedFiles(new Set())
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeFileTypeTab === fileType
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {getFileTypeIcon(fileType)}
              <span className="capitalize">{fileType === "all" ? "All Files" : fileType}</span>
              <Badge variant="secondary" className="text-xs">
                {getFileTypeCount(fileType)}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Selection Controls */}
      {filteredFiles.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                Select All ({selectedFiles.size} of {filteredFiles.length})
              </Label>
            </div>
          </div>
          {selectedFiles.size > 0 && (
            <Button
              onClick={handleBulkDownload}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Selected ({selectedFiles.size})
            </Button>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading resume files...</p>
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="space-y-3">
          {/* Active Filters Summary */}
          {(searchTerm || activeFileTypeTab !== "all" || dateFilter !== "all") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                </div>
                <span className="text-sm text-blue-600">
                  Showing {filteredFiles.length} of {resumeFiles.length} files
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {activeFileTypeTab !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    File Type: {activeFileTypeTab.toUpperCase()}
                  </Badge>
                )}
                {dateFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    Date: {dateFilter === "custom" 
                      ? `Custom (${startDate} to ${endDate})`
                      : dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                    }
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {filteredFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={`file-${file.id}`}
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={(checked) => handleFileSelection(file.id, checked as boolean)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {getFileTypeIcon(file.file_type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{file.candidate_name}</h4>
                  <p className="text-sm text-gray-600">{file.candidate_email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {file.file_type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">{file.filename}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {new Date(file.upload_date).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => handleDownload(file.download_url, file.filename)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {(() => {
              const filters = []
              if (searchTerm) filters.push('search term')
              if (activeFileTypeTab !== "all") filters.push(`${activeFileTypeTab.toUpperCase()} file type`)
              if (dateFilter !== "all") {
                if (dateFilter === "custom") {
                  filters.push(`date range (${startDate} to ${endDate})`)
                } else {
                  filters.push(dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
                }
              }
              
              if (filters.length > 0) {
                return `No files found matching your ${filters.join(', ')} criteria.`
              }
              return 'No resume files available for download.'
            })()}
          </p>
          {(searchTerm || activeFileTypeTab !== "all" || dateFilter !== "all") && (
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your filters or search terms.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function BulkImport() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [parsedResumes, setParsedResumes] = useState<any[]>([])
  const [resumeData, setResumeData] = useState<ResumeData[]>([])
  const [selectedResumes, setSelectedResumes] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [parseResults, setParseResults] = useState<ResumeParseResponse | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [loading, setLoading] = useState(false)
  const [processingResults, setProcessingResults] = useState<ProcessingResult[]>([])
  
  // Add state for failed files management
  const [failedFiles, setFailedFiles] = useState<ProcessingResult[]>([])
  const [selectedFailedFiles, setSelectedFailedFiles] = useState<Set<string>>(new Set())
  const [failedFileObjects, setFailedFileObjects] = useState<Map<string, File>>(new Map())
  
  // Add AbortController for API cancellation
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  // Helper function to parse JSON string safely
  const parseResumeData = (jsonString: string | undefined | null): ParsedResumeData | null => {
    try {
      // Handle undefined, null, or empty string cases
      if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
        return null
      }
      
      // If it's already an object, return it directly
      if (typeof jsonString === 'object') {
        return jsonString as ParsedResumeData
      }
      
      // Parse JSON string
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Error parsing resume data:', error)
      return null
    }
  }

  // Fetch resumes from API
  const fetchResumes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_API_URL}/resumes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      // Ensure we have valid data and handle potential undefined parsed_data
      const resumes = data.resumes || data || []
      const validatedResumes = resumes.map((resume: any) => ({
        ...resume,
        parsed_data: resume.parsed_data || null, // Ensure parsed_data is never undefined
        candidate_name: resume.candidate_name || 'N/A',
        candidate_email: resume.candidate_email || 'N/A',
        total_experience: resume.total_experience || 'N/A'
      }))
      
      console.log('Validated Resumes:', validatedResumes)
      setResumeData(validatedResumes)
    } catch (error) {
      console.error('Error fetching resumes:', error)
      // Fallback to mock data
      const mockData: ResumeData[] = [
        {
          id: 1,
          filename: "john_doe_resume.pdf",
          file_type: "pdf",
          candidate_name: "John Doe",
          candidate_email: "john.doe@example.com",
          total_experience: "5 years",
          parsed_data: JSON.stringify({
            Name: "John Doe",
            Email: "john.doe@example.com",
            Phone: "+1-555-0123",
            Address: "San Francisco, CA",
            Summary: "Experienced software engineer with 5+ years in full-stack development.",
            Experience: [
              {
                Company: "Tech Corp",
                Position: "Senior Software Engineer",
                Duration: "2022-01 - Present",
                Description: "Led development of web applications using React and Node.js"
              }
            ],
            Education: [
              {
                Institution: "University of Technology",
                Degree: "Bachelor's",
                Field: "Computer Science",
                Year: "2019"
              }
            ],
            Skills: ["React", "Node.js", "TypeScript", "Python"],
            Languages: ["English", "Spanish"],
            Projects: [
              {
                Name: "E-commerce Platform",
                Description: "Built a full-stack e-commerce solution",
                Technologies: ["React", "Node.js"]
              }
            ],
            TotalExperience: "5 years"
          }),
          created_at: "2024-01-15T10:30:00Z"
        }
      ]
      setResumeData(mockData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    // Check if adding these files would exceed the 10 file limit
    const currentFileCount = uploadedFiles.length
    const newFileCount = files.length
    const totalFileCount = currentFileCount + newFileCount
    
    if (totalFileCount > 10) {
      toast({
        title: "File Limit Exceeded",
        description: `You can only upload a maximum of 10 files at a time. You currently have ${currentFileCount} files and trying to add ${newFileCount} more.`,
        variant: "destructive",
      })
      return
    }

    const newFiles = Array.from(files).filter(
      (file) => {
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/rtf',
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp'
        ]
        return validTypes.includes(file.type) || 
               file.name.toLowerCase().endsWith('.pdf') ||
               file.name.toLowerCase().endsWith('.doc') ||
               file.name.toLowerCase().endsWith('.docx') ||
               file.name.toLowerCase().endsWith('.txt') ||
               file.name.toLowerCase().endsWith('.rtf') ||
               file.name.toLowerCase().endsWith('.png') ||
               file.name.toLowerCase().endsWith('.jpg') ||
               file.name.toLowerCase().endsWith('.jpeg') ||
               file.name.toLowerCase().endsWith('.webp')
      }
    )

    setUploadedFiles((prev) => [...prev, ...newFiles])
  }, [uploadedFiles.length, toast])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFileUpload(e.dataTransfer.files)
    },
    [handleFileUpload],
  )

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processResumes = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      const formData = new FormData()
      uploadedFiles.forEach((file) => {
        formData.append('files', file)
      })

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`${BASE_API_URL}/parse-resume`, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal, // Add abort signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ResumeParseResponse = await response.json()
      setParseResults(data)
      setParsedResumes(data.results)
      setProcessingResults(data.results)
      
      // Extract failed files for re-upload functionality
      const failed = data.results.filter(result => result.status === 'failed')
      setFailedFiles(failed)
      
      // Store original files for failed results so they can be re-uploaded
      const failedFileMap = new Map<string, File>()
      failed.forEach(failedResult => {
        const originalFile = uploadedFiles.find(file => file.name === failedResult.filename)
        if (originalFile) {
          failedFileMap.set(failedResult.filename, originalFile)
        }
      })
      setFailedFileObjects(failedFileMap)
      
      // Remove successfully parsed files from uploaded files
      const successfulFiles = data.results.filter(result => result.status === 'success')
      const successfulFileNames = successfulFiles.map(result => result.filename)
      setUploadedFiles(prev => prev.filter(file => !successfulFileNames.includes(file.name)))
      
      setProcessingProgress(100)
      
      // Switch to results tab
      setActiveTab("results")

      // Refresh the parsed data tab
      await fetchResumes()

    } catch (error) {
      // Check if it's an abort error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('API request was cancelled')
        toast({
          title: "Processing Cancelled",
          description: "Resume processing has been cancelled.",
        })
        return
      }
      
      console.error('Error processing resumes:', error)
      // Fallback to mock data for demonstration
      const mockData: ResumeParseResponse = {
        total_files: uploadedFiles.length,
        successful_files: Math.floor(uploadedFiles.length * 0.8),
        failed_files: Math.ceil(uploadedFiles.length * 0.2),
        total_processing_time: 5.2,
        results: uploadedFiles.map((file, index) => ({
          filename: file.name,
          status: Math.random() > 0.2 ? "success" : "failed",
          error: Math.random() > 0.2 ? null : "Unsupported file format",
          parsed_data: Math.random() > 0.2 ? {
            Name: "John Doe",
            Email: "john.doe@example.com",
            Phone: "+1-555-0123",
            Address: "San Francisco, CA",
            Summary: "Experienced software engineer with 5+ years in full-stack development.",
            Experience: [
              {
                Company: "Tech Corp",
                Position: "Senior Software Engineer",
                Duration: "2022-01 - Present",
                Description: "Led development of web applications using React and Node.js"
              }
            ],
            Education: [
              {
                Institution: "University of Technology",
                Degree: "Bachelor's",
                Field: "Computer Science",
                Year: "2019"
              }
            ],
            Skills: ["React", "Node.js", "TypeScript", "Python"],
            Languages: ["English", "Spanish"],
            Projects: [
              {
                Name: "E-commerce Platform",
                Description: "Built a full-stack e-commerce solution",
                Technologies: ["React", "Node.js"]
              }
            ],
            TotalExperience: "5 years"
          } : null,
          file_type: file.name.split('.').pop() || 'unknown',
          processing_time: Math.random() * 3 + 1
        }))
      }
      setParseResults(mockData)
      setParsedResumes(mockData.results)
      setProcessingResults(mockData.results)
      
      // Extract failed files for re-upload functionality
      const failed = mockData.results.filter(result => result.status === 'failed')
      setFailedFiles(failed)
      
      // Store original files for failed results so they can be re-uploaded
      const failedFileMap = new Map<string, File>()
      failed.forEach(failedResult => {
        const originalFile = uploadedFiles.find(file => file.name === failedResult.filename)
        if (originalFile) {
          failedFileMap.set(failedResult.filename, originalFile)
        }
      })
      setFailedFileObjects(failedFileMap)
      
      // Remove successfully parsed files from uploaded files
      const successfulFiles = mockData.results.filter(result => result.status === 'success')
      const successfulFileNames = successfulFiles.map(result => result.filename)
      setUploadedFiles(prev => prev.filter(file => !successfulFileNames.includes(file.name)))
      
      setProcessingProgress(100)
      
      // Switch to results tab
      setActiveTab("results")
    } finally {
      setIsProcessing(false)
      // Clear the AbortController reference
      abortControllerRef.current = null
    }
  }

  const toggleResumeSelection = (id: number) => {
    setSelectedResumes((prev) => 
      prev.includes(id) 
        ? prev.filter((resumeId) => resumeId !== id) 
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const allResumeIds = resumeData.map(resume => resume.id)
    
    if (selectedResumes.length === allResumeIds.length) {
      setSelectedResumes([])
    } else {
      setSelectedResumes(allResumeIds)
    }
  }

  const importSelectedResumes = () => {
    console.log("Importing resumes:", selectedResumes)
    setSelectedResumes([])
    setParsedResumes([])
    setUploadedFiles([])
    setParseResults(null)
  }

  const exportToExcel = () => {
    const selectedData = resumeData.filter(resume => selectedResumes.includes(resume.id))
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Address', 'Total Experience', 'Skills', 'File Type', 'Created Date']
    const csvContent = [
      headers.join(','),
      ...selectedData.map(resume => {
          // Ensure resume has all required fields with fallbacks
          const safeResume = {
            id: resume.id || 0,
            filename: resume.filename || 'Unknown',
            file_type: resume.file_type || 'unknown',
            candidate_name: resume.candidate_name || 'N/A',
            candidate_email: resume.candidate_email || 'N/A',
            total_experience: resume.total_experience || 'N/A',
            created_at: resume.created_at || new Date().toISOString(),
            parsed_data: resume.parsed_data || null
          }
          
          const parsedData = parseResumeData(safeResume.parsed_data)
        return [
            parsedData?.Name || safeResume.candidate_name || '',
            parsedData?.Email || safeResume.candidate_email || '',
          parsedData?.Phone || '',
          parsedData?.Address || '',
            parsedData?.TotalExperience || safeResume.total_experience || '',
          parsedData?.Skills?.join('; ') || '',
            safeResume.file_type,
            new Date(safeResume.created_at).toLocaleDateString()
        ].join(',')
      })
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `resume_data_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteResume = async (id: number) => {
    try {
      console.log('Attempting to delete resume with ID:', id)
      const response = await fetch(`${BASE_API_URL}/resumes/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setResumeData(prev => prev.filter(resume => resume.id !== id))
        setSelectedResumes(prev => prev.filter(resumeId => resumeId !== id))
        // Show success message
        console.log('Resume deleted successfully, showing toast')
        toast({
          title: "Resume Deleted",
          description: "Resume has been deleted successfully.",
        })
      } else {
        // Handle API error response
        const errorData = await response.json().catch(() => ({}))
        console.log('API error response:', errorData)
        toast({
          title: "Error Deleting Resume",
          description: errorData.message || `Failed to delete resume. Status: ${response.status}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast({
        title: "Error Deleting Resume",
        description: "Failed to connect to the server. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'txt':
        return <FileText className="w-4 h-4 text-gray-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return <FileText className="w-4 h-4 text-green-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  // Filter resumes based on search, file type, and date
  const filteredResumes = resumeData.filter(resume => {
    const matchesSearch = searchTerm === "" || 
      resume.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFileType = fileTypeFilter === "all" || resume.file_type === fileTypeFilter
    
    // Date filtering logic
    let matchesDate = true
    if (dateFilter !== "all") {
      const fileDate = new Date(resume.created_at)
      const today = new Date()
      
      switch (dateFilter) {
        case "today":
          matchesDate = fileDate.toDateString() === today.toDateString()
          break
        case "yesterday":
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          matchesDate = fileDate.toDateString() === yesterday.toDateString()
          break
        case "this_week":
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          startOfWeek.setHours(0, 0, 0, 0)
          matchesDate = fileDate >= startOfWeek
          break
        case "this_month":
          matchesDate = fileDate.getMonth() === today.getMonth() && fileDate.getFullYear() === today.getFullYear()
          break
        case "last_month":
          const lastMonth = new Date(today)
          lastMonth.setMonth(lastMonth.getMonth() - 1)
          matchesDate = fileDate.getMonth() === lastMonth.getMonth() && fileDate.getFullYear() === lastMonth.getFullYear()
          break
        case "custom":
          if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999) // Include end date
            matchesDate = fileDate >= start && fileDate <= end
          }
          break
      }
    }
    
    return matchesSearch && matchesFileType && matchesDate
  })

  // Add functions for failed files management
  const handleFailedFileSelection = (filename: string, checked: boolean) => {
    const newSelectedFailedFiles = new Set(selectedFailedFiles)
    if (checked) {
      newSelectedFailedFiles.add(filename)
    } else {
      newSelectedFailedFiles.delete(filename)
    }
    setSelectedFailedFiles(newSelectedFailedFiles)
  }

  const handleSelectAllFailed = () => {
    if (selectedFailedFiles.size === failedFiles.length) {
      // If all are selected, deselect all
      setSelectedFailedFiles(new Set())
    } else {
      // Select all failed files
      const allFailedFileNames = new Set(failedFiles.map(file => file.filename))
      setSelectedFailedFiles(allFailedFileNames)
    }
  }

  const reUploadFailedFiles = async () => {
    if (selectedFailedFiles.size === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one failed file to re-upload.",
        variant: "destructive",
      })
      return
    }

    // Find the actual File objects for the selected failed files
    let filesToReUpload: File[] = []
    
    // First try to get files from uploadedFiles (in case they're still there)
    filesToReUpload = uploadedFiles.filter(file => selectedFailedFiles.has(file.name))
    
    // If not found in uploadedFiles, get them from the stored failed file objects
    if (filesToReUpload.length === 0) {
      const failedFileNames = Array.from(selectedFailedFiles)
      filesToReUpload = failedFileNames
        .map(filename => failedFileObjects.get(filename))
        .filter((file): file is File => file !== undefined)
    }
    
    // If still no files found, show error
    if (filesToReUpload.length === 0) {
      toast({
        title: "Files Not Found",
        description: "Selected failed files are no longer available for re-upload. Please upload them manually.",
        variant: "destructive",
      })
      return
    }
    
    // Add these files to uploadedFiles for processing if they're not already there
    const newFiles = filesToReUpload.filter(file => !uploadedFiles.some(uploaded => uploaded.name === file.name))
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles])
    }

    // Process the selected failed files
    setIsProcessing(true)
    setProcessingProgress(0)
    
    try {
      const formData = new FormData()
      filesToReUpload.forEach((file) => {
        formData.append('files', file)
      })

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(`${BASE_API_URL}/parse-resume`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ResumeParseResponse = await response.json()
      
      // Update the overall results
      const updatedResults = [...processingResults]
      filesToReUpload.forEach(file => {
        const result = data.results.find(r => r.filename === file.name)
        if (result) {
          const existingIndex = updatedResults.findIndex(r => r.filename === file.name)
          if (existingIndex !== -1) {
            updatedResults[existingIndex] = result
          } else {
            updatedResults.push(result)
          }
        }
      })
      
      setProcessingResults(updatedResults)
      
      // Update failed files list
      const newFailed = updatedResults.filter(result => result.status === 'failed')
      setFailedFiles(newFailed)
      
      // Remove successfully re-processed files from uploaded files
      const successfulFiles = updatedResults.filter(result => result.status === 'success')
      const successfulFileNames = successfulFiles.map(result => result.filename)
      setUploadedFiles(prev => prev.filter(file => !successfulFileNames.includes(file.name)))
      
      // Clear selection
      setSelectedFailedFiles(new Set())
      
      setProcessingProgress(100)
      
      toast({
        title: "Re-upload Complete",
        description: `Successfully re-processed ${filesToReUpload.length} file(s).`,
      })

      // Refresh the parsed data tab
      await fetchResumes()

    } catch (error) {
      console.error('Error re-processing failed files:', error)
      toast({
        title: "Re-upload Failed",
        description: "Failed to re-process the selected files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Overlay - Centered */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Resumes</h3>
                <p className="text-gray-600 mb-4">AI is extracting candidate information</p>
                <Progress value={processingProgress} className="w-full mb-4" />
                <p className="text-sm font-medium text-blue-600">{processingProgress}%</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort() // Abort the API call
                  }
                  setIsProcessing(false)
                  setProcessingProgress(0)
                }}
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                Cancel Processing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button - Top of Page */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchResumes}
          className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Bulk Import Files</TabsTrigger>
          <TabsTrigger value="results">Processing Results</TabsTrigger>
          <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
          <TabsTrigger value="download">Download Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Status Cards - Moved to top */}
          {parseResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{parseResults.total_files}</p>
                        <p className="text-sm text-gray-600">Total Files</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{parseResults.successful_files}</p>
                        <p className="text-sm text-gray-600">Successful</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-2xl font-bold">{parseResults.failed_files}</p>
                        <p className="text-sm text-gray-600">Failed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-3xl font-bold">{parseResults.total_processing_time.toFixed(1)}s</p>
                        <p className="text-sm text-gray-600">Processing Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Failed Files Section - Show only failed files */}
          {failedFiles.length > 0 && (
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardHeader>
                <CardTitle className="text-red-900 flex items-center space-x-2">
                  <XCircle className="w-5 h-5" />
                  <span>Failed Files - Re-upload Required</span>
                </CardTitle>
                <CardDescription>
                  These files failed to process. Select them and click re-upload to try again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Failed Files Selection Controls */}
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-failed"
                        checked={selectedFailedFiles.size === failedFiles.length && failedFiles.length > 0}
                        onCheckedChange={handleSelectAllFailed}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Label htmlFor="select-all-failed" className="text-sm font-medium text-red-700">
                        Select All Failed ({selectedFailedFiles.size} of {failedFiles.length})
                      </Label>
                    </div>
                  </div>
                  {selectedFailedFiles.size > 0 && (
                    <Button
                      onClick={reUploadFailedFiles}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Re-upload Selected ({selectedFailedFiles.size})
                    </Button>
                  )}
                </div>

                {/* Failed Files List */}
                <div className="space-y-2">
                  {failedFiles.map((failedFile, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`failed-${index}`}
                          checked={selectedFailedFiles.has(failedFile.filename)}
                          onCheckedChange={(checked) => handleFailedFileSelection(failedFile.filename, checked as boolean)}
                          className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          {getFileIcon(failedFile.file_type || '')}
                        </div>
                        <div>
                          <h4 className="font-medium text-red-900">{failedFile.filename}</h4>
                          <p className="text-sm text-red-600">
                            Error: {failedFile.error || 'Processing failed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Select just this file and re-upload
                            setSelectedFailedFiles(new Set([failedFile.filename]))
                            setTimeout(() => reUploadFailedFiles(), 100)
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-upload
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section - Only show if there are files to upload or no failed files */}
          {(uploadedFiles.length > 0 || failedFiles.length === 0) && (
            <div className="w-full">
              <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="flex items-center justify-center space-x-2 text-xl text-blue-800">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>Resume Upload</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div
                    className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-white/50 hover:bg-white/70"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-base font-medium text-blue-900 mb-1">Drag and drop resume files here, or click to browse</p>
                    <p className="text-xs text-blue-600 mb-3">Supports PDF, DOC, DOCX, TXT, RTF, PNG, JPG, JPEG, WEBP files</p>
                    <p className="text-xs text-orange-600 mb-3 font-medium">Maximum 10 files per batch</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.webp"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      className={`px-6 py-2 ${
                        uploadedFiles.length >= 10 
                          ? 'bg-gray-400 text-gray-600 border-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700'
                      }`}
                      onClick={() => {
                        if (fileInputRef.current && uploadedFiles.length < 10) {
                          fileInputRef.current.click();
                        }
                      }}
                      disabled={uploadedFiles.length >= 10}
                    >
                      {uploadedFiles.length >= 10 ? 'Limit Reached' : 'Browse Files'}
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-blue-900 mb-2 text-center">
                        Files Ready for Processing ({uploadedFiles.length}/10)
                      </h4>
                      
                      {/* File limit progress indicator */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-blue-600 mb-1">
                          <span>Files used</span>
                          <span>{uploadedFiles.length}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              uploadedFiles.length >= 10 ? 'bg-red-500' : 
                              uploadedFiles.length >= 8 ? 'bg-orange-500' : 
                              uploadedFiles.length >= 5 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${(uploadedFiles.length / 10) * 100}%` }}
                          ></div>
                        </div>
                        
                        {/* Warning messages */}
                        {uploadedFiles.length >= 10 && (
                          <p className="text-xs text-red-600 mt-1 text-center font-medium">
                            Maximum file limit reached! Remove some files to add more.
                          </p>
                        )}
                        {uploadedFiles.length >= 8 && uploadedFiles.length < 10 && (
                          <p className="text-xs text-orange-600 mt-1 text-center">
                            Almost at the limit! You can add {10 - uploadedFiles.length} more file(s).
                          </p>
                        )}
                        
                        {/* File reduction slider for when approaching or at limit */}
                        {(uploadedFiles.length >= 8) && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-orange-800">Reduce files to:</span>
                              <span className="text-xs text-orange-600">{Math.max(1, uploadedFiles.length - 3)} files</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input
                                type="range"
                                min="1"
                                max={uploadedFiles.length}
                                value={Math.max(1, uploadedFiles.length - 3)}
                                onChange={(e) => {
                                  const targetCount = parseInt(e.target.value)
                                  if (targetCount < uploadedFiles.length) {
                                    // Remove files from the end to reach target count
                                    const filesToRemove = uploadedFiles.length - targetCount
                                    setUploadedFiles(prev => prev.slice(0, targetCount))
                                    toast({
                                      title: "Files Reduced",
                                      description: `Removed ${filesToRemove} file(s) to reach ${targetCount} files.`,
                                    })
                                  }
                                }}
                                className="flex-1 h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer slider-orange"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const targetCount = Math.max(1, uploadedFiles.length - 3)
                                  const filesToRemove = uploadedFiles.length - targetCount
                                  setUploadedFiles(prev => prev.slice(0, targetCount))
                                  toast({
                                    title: "Files Reduced",
                                    description: `Removed ${filesToRemove} file(s) to reach ${targetCount} files.`,
                                  })
                                }}
                                className="text-xs px-2 py-1 h-6 bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
                              >
                                Apply
                              </Button>
                            </div>
                            <p className="text-xs text-orange-600 mt-1 text-center">
                              Drag slider to reduce files or click Apply to remove 3 files
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center space-x-2">
                              {getFileIcon(file.name.split('.').pop() || '')}
                              <span className="text-xs text-blue-900 truncate">{file.name}</span>
                              <span className="text-xs text-blue-600">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 text-center">
                      <Button onClick={processResumes} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing Resumes...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Parse Resumes ({uploadedFiles.length})
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* No Files Message */}
          {uploadedFiles.length === 0 && failedFiles.length === 0 && (
            <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <CardContent className="p-12 text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Files to Process</h3>
                <p className="text-gray-600 mb-4">
                  Upload resume files to get started with bulk processing.
                </p>
                <p className="text-sm text-gray-500">
                  All previously uploaded files have been successfully processed or are being re-uploaded.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {parseResults ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-blue-900">{parseResults.total_files}</p>
                        <p className="text-sm text-blue-700 font-medium">Total Files</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center shadow-inner">
                        <FileText className="w-6 h-6 text-blue-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-green-900">{parseResults.successful_files}</p>
                        <p className="text-sm text-green-700 font-medium">Successful</p>
                      </div>
                      <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center shadow-inner">
                        <CheckCircle className="w-6 h-6 text-green-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-red-900">{parseResults.failed_files}</p>
                        <p className="text-sm text-red-700 font-medium">Failed</p>
                      </div>
                      <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center shadow-inner">
                        <XCircle className="w-6 h-6 text-red-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold text-orange-900">{parseResults.total_processing_time.toFixed(1)}s</p>
                        <p className="text-sm text-orange-700 font-medium">Processing Time</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center shadow-inner">
                        <Clock className="w-6 h-6 text-orange-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results Table */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <span>Processing Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold text-gray-700">File Name</TableHead>
                          <TableHead className="font-semibold text-gray-700">Status</TableHead>
                          <TableHead className="font-semibold text-gray-700">File Type</TableHead>
                          <TableHead className="font-semibold text-gray-700">Processing Time</TableHead>
                          <TableHead className="font-semibold text-gray-700">Details</TableHead>
                          <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parseResults.results.map((result, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {getFileIcon(result.file_type || '')}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 truncate">{result.filename}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {result.status === 'success' ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100 px-3 py-1">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Success
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100 px-3 py-1">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge variant="outline" className="text-xs font-medium">
                                {result.file_type?.toUpperCase() || 'Unknown'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {result.processing_time ? `${result.processing_time.toFixed(2)}s` : 'N/A'}
                                </span>
                                {result.processing_time && (
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${Math.min((result.processing_time / 10) * 100, 100)}%` 
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              {result.status === 'success' ? (
                                <div className="text-sm">
                                  <div className="font-medium text-green-700">
                                    {result.parsed_data?.Name || 'Name extracted'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {result.parsed_data?.Email || 'Email extracted'}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-red-600 max-w-xs">
                                  <div className="font-medium">Error:</div>
                                  <div className="text-xs">{result.error || 'Processing failed'}</div>
                                </div>
                              )}
                            </TableCell>
                                                         <TableCell className="py-4">
                               {result.status === 'failed' && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => {
                                     // Go to upload tab and select this failed file for re-upload
                                     setActiveTab("upload")
                                     // Select this failed file for re-upload
                                     setSelectedFailedFiles(new Set([result.filename]))
                                     
                                     // Check if we need to add the file back to uploadedFiles
                                     const fileExists = uploadedFiles.some(file => file.name === result.filename)
                                     if (!fileExists) {
                                       // Get the original file from stored failed file objects
                                       const originalFile = failedFileObjects.get(result.filename)
                                       if (originalFile) {
                                         setUploadedFiles(prev => [...prev, originalFile])
                                         toast({
                                           title: "File Added for Re-upload",
                                           description: `${result.filename} has been added to the upload queue for re-processing.`,
                                         })
                                       } else {
                                         toast({
                                           title: "Original File Not Found",
                                           description: "Please re-upload the file manually as the original file is no longer available.",
                                           variant: "destructive",
                                         })
                                       }
                                     }
                                   }}
                                   className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                 >
                                   <RefreshCw className="w-4 h-4 mr-2" />
                                   Re-upload
                                 </Button>
                               )}
                             </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Processing Results</h3>
                <p className="text-gray-600 mb-4">
                  Upload and process files to see the results here.
                </p>
                <Button 
                  onClick={() => setActiveTab("upload")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="parsed" className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parsed Resume Data</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={toggleSelectAll}
                    disabled={filteredResumes.length === 0}
                  >
                    {selectedResumes.length === filteredResumes.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                  <Button
                    onClick={exportToExcel}
                    disabled={selectedResumes.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel ({selectedResumes.length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="space-y-4 mb-6">
                {/* Search and File Type Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="docx">DOCX</SelectItem>
                    <SelectItem value="doc">DOC</SelectItem>
                    <SelectItem value="txt">TXT</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFileTypeFilter("all")
                      setDateFilter("all")
                      setStartDate("")
                      setEndDate("")
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>

                {/* Date Filters */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Date Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDateFilter("all")
                        setStartDate("")
                        setEndDate("")
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear Date Filters
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Quick Date Filters */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Quick:</span>
                      <div className="flex space-x-1">
                        {[
                          { value: "all", label: "All" },
                          { value: "today", label: "Today" },
                          { value: "yesterday", label: "Yesterday" },
                          { value: "this_week", label: "This Week" },
                          { value: "this_month", label: "This Month" },
                          { value: "last_month", label: "Last Month" }
                        ].map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setDateFilter(filter.value)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${
                              dateFilter === filter.value
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Date Range */}
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Custom:</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value)
                          setDateFilter("custom")
                        }}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value)
                          setDateFilter("custom")
                        }}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setDateFilter("custom")}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          dateFilter === "custom" && (startDate || endDate)
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Active Filter Display */}
                  {dateFilter !== "all" && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Active filter:</span>
                        <Badge variant="outline" className="text-xs">
                          {dateFilter === "custom" 
                            ? `Custom: ${startDate} to ${endDate}`
                            : dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                          }
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ({filteredResumes.length} of {resumeData.length} resumes)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchTerm || fileTypeFilter !== "all" || dateFilter !== "all") && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                    </div>
                    <span className="text-sm text-blue-600">
                      Showing {filteredResumes.length} of {resumeData.length} resumes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="text-xs">
                        Search: "{searchTerm}"
                      </Badge>
                    )}
                    {fileTypeFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        File Type: {fileTypeFilter.toUpperCase()}
                      </Badge>
                    )}
                    {dateFilter !== "all" && (
                      <Badge variant="secondary" className="text-xs">
                        Date: {dateFilter === "custom" 
                          ? `Custom (${startDate} to ${endDate})`
                          : dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Results Table */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading resumes...</span>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedResumes.length === filteredResumes.length && filteredResumes.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResumes.map((resume) => {
                        // Ensure resume has all required fields with fallbacks
                        const safeResume = {
                          id: resume.id || 0,
                          filename: resume.filename || 'Unknown',
                          file_type: resume.file_type || 'unknown',
                          candidate_name: resume.candidate_name || 'N/A',
                          candidate_email: resume.candidate_email || 'N/A',
                          total_experience: resume.total_experience || 'N/A',
                          created_at: resume.created_at || new Date().toISOString(),
                          parsed_data: resume.parsed_data || null
                        }
                        
                        const parsedData = parseResumeData(safeResume.parsed_data)
                        return (
                          <TableRow key={resume.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedResumes.includes(safeResume.id)}
                                onCheckedChange={() => toggleResumeSelection(safeResume.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getFileIcon(safeResume.file_type)}
                                <span className="text-sm font-medium">{safeResume.filename}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{parsedData?.Name || safeResume.candidate_name || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{parsedData?.Email || safeResume.candidate_email || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{parsedData?.Phone || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{parsedData?.TotalExperience || safeResume.total_experience || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {new Date(safeResume.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center space-x-2">
                                        <User className="w-5 h-5" />
                                        <span>{parsedData?.Name || safeResume.candidate_name || 'Resume Details'}</span>
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      {/* Contact Information */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                          <Mail className="w-4 h-4 text-gray-500" />
                                          <span className="text-sm">{parsedData?.Email || safeResume.candidate_email || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Phone className="w-4 h-4 text-gray-500" />
                                          <span className="text-sm">{parsedData?.Phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <MapPin className="w-4 h-4 text-gray-500" />
                                          <span className="text-sm">{parsedData?.Address || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Briefcase className="w-4 h-4 text-gray-500" />
                                          <span className="text-sm">{parsedData?.TotalExperience || safeResume.total_experience || 'N/A'}</span>
                                        </div>
                                      </div>

                                      <Separator />

                                      {/* Summary */}
                                      {parsedData?.Summary && (
                                        <div>
                                          <h4 className="font-medium mb-2">Professional Summary</h4>
                                          <p className="text-sm text-gray-700">{parsedData.Summary}</p>
                                        </div>
                                      )}

                                      {/* Experience */}
                                      {parsedData?.Experience && parsedData.Experience.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                                            <Briefcase className="w-4 h-4" />
                                            <span>Work Experience</span>
                                          </h4>
                                          <div className="space-y-3">
                                            {parsedData.Experience.map((exp, idx) => (
                                              <div key={idx} className="border-l-2 border-blue-200 pl-4">
                                                <div className="flex items-center justify-between mb-1">
                                                  <h5 className="font-medium">{exp.Position}</h5>
                                                  <Badge variant="outline" className="text-xs">
                                                    {exp.Duration}
                                                  </Badge>
                                                </div>
                                                <p className="text-sm text-blue-600 mb-1">{exp.Company}</p>
                                                <p className="text-sm text-gray-600">{exp.Description}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Education */}
                                      {parsedData?.Education && parsedData.Education.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                                            <GraduationCap className="w-4 h-4" />
                                            <span>Education</span>
                                          </h4>
                                          <div className="space-y-3">
                                            {parsedData.Education.map((edu, idx) => (
                                              <div key={idx} className="border-l-2 border-green-200 pl-4">
                                                <div className="flex items-center justify-between mb-1">
                                                  <h5 className="font-medium">{edu.Degree} in {edu.Field}</h5>
                                                  <Badge variant="outline" className="text-xs">
                                                    {edu.Year}
                                                  </Badge>
                                                </div>
                                                <p className="text-sm text-green-600">{edu.Institution}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Skills */}
                                      {parsedData?.Skills && parsedData.Skills.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                                            <Code className="w-4 h-4" />
                                            <span>Skills</span>
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {parsedData.Skills.map((skill, idx) => (
                                              <Badge key={idx} variant="secondary">
                                                {skill}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Languages */}
                                      {parsedData?.Languages && parsedData.Languages.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                                            <Globe className="w-4 h-4" />
                                            <span>Languages</span>
                                          </h4>
                                          <div className="flex flex-wrap gap-2">
                                            {parsedData.Languages.map((lang, idx) => (
                                              <Badge key={idx} variant="outline">
                                                {lang}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Projects */}
                                      {parsedData?.Projects && parsedData.Projects.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                                            <Award className="w-4 h-4" />
                                            <span>Projects</span>
                                          </h4>
                                          <div className="space-y-3">
                                            {parsedData.Projects.map((project, idx) => (
                                              <div key={idx} className="border-l-2 border-purple-200 pl-4">
                                                <h5 className="font-medium mb-1">{project.Name}</h5>
                                                <p className="text-sm text-gray-600 mb-2">{project.Description}</p>
                                                {project.Technologies && project.Technologies.length > 0 && (
                                                  <div className="flex flex-wrap gap-1">
                                                    {project.Technologies.map((tech, techIdx) => (
                                                      <Badge key={techIdx} variant="outline" className="text-xs">
                                                        {tech}
                                                      </Badge>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Certifications */}
                                      {parsedData?.Certifications && parsedData.Certifications.length > 0 && (
                                        <div>
                                          <h4 className="font-medium mb-3 flex items-center space-x-2">
                                            <Award className="w-4 h-4" />
                                            <span>Certifications</span>
                                          </h4>
                                          <div className="space-y-2">
                                            {parsedData.Certifications.map((cert, idx) => (
                                              <div key={idx} className="border-l-2 border-orange-200 pl-4">
                                                <p className="text-sm text-gray-700">{cert}</p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteResume(resume.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredResumes.length === 0 && !loading && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {(() => {
                      const filters = []
                      if (searchTerm) filters.push('search term')
                      if (fileTypeFilter !== "all") filters.push(`${fileTypeFilter.toUpperCase()} file type`)
                      if (dateFilter !== "all") {
                        if (dateFilter === "custom") {
                          filters.push(`date range (${startDate} to ${endDate})`)
                        } else {
                          filters.push(dateFilter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
                        }
                      }
                      
                      if (filters.length > 0) {
                        return `No resumes found matching your ${filters.join(', ')} criteria.`
                      }
                      return 'No resumes found matching your filters.'
                    })()}
                  </p>
                  {(searchTerm || fileTypeFilter !== "all" || dateFilter !== "all") && (
                    <p className="text-sm text-gray-500 mt-2">
                      Try adjusting your filters or search terms.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          {/* Download Resume Tab */}
          <Card>
            <CardContent>
              <div className="space-y-6">

                {/* Resume Files List */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Available Resume Files</CardTitle>
                    <CardDescription>Download individual resume files or view file information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResumeFilesList />
                  </CardContent>
                </Card>
                
                
               
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
  )
}

