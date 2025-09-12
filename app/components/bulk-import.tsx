"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Checkbox } from "../../components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Separator } from "../../components/ui/separator"
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
import BASE_API_URL from "../../PythonApi"
import { useToast } from "../../hooks/use-toast"
import { Switch } from "../../components/ui/switch"

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
  duplicate_files: number
  total_processing_time: number
  results: Array<{
    filename: string
    status: "success" | "failed" | "duplicate"
    error?: string | null
    parsed_data?: ParsedResumeData | null
    file_type?: string | null
    processing_time?: number
    embedding_status?: string
    embedding_generated?: boolean
  }>
}

interface ProcessingResult {
  filename: string
  status: "success" | "failed" | "duplicate"
  error?: string | null
  parsed_data?: ParsedResumeData | null
  file_type?: string | null
  processing_time?: number
  embedding_status?: string
  embedding_generated?: boolean
  resume_id?: string
  failure_reason?: string
  failure_type?: string
}

interface BulkProcessingStatus {
  total_jobs?: number
  active_jobs?: number
  completed_jobs?: number
  failed_jobs?: number
  duplicate_jobs?: number
  total_users?: number
  active_users?: number
  progress_percentage?: number
  file_results?: Array<{
    filename: string
    status: "success" | "failed" | "duplicate"
    error?: string | null
    parsed_data?: ParsedResumeData | null
    file_type?: string | null
    processing_time?: number
    embedding_status?: string
    embedding_generated?: boolean
  }>
  summary?: {
    total_files?: number
    successful_files?: number
    failed_files?: number
    duplicate_files?: number
  }
}

interface FailedResume {
  resume_id: string
  filename: string
  file_size: number
  file_type: string
  created_at: number
  file_path: string
  failure_reason: string
  failure_type: string
  can_reupload: boolean
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
      const response = await fetch('http://158.220.127.100:8000/api/v1/download/resumes/with-files')
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
      const response = await fetch(`http://158.220.127.100:8000${downloadUrl}`)
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
  
  
  // Add state for bulk processing and failed resumes
  const [bulkProcessingStatus, setBulkProcessingStatus] = useState<BulkProcessingStatus | null>(null)
  const [failedResumes, setFailedResumes] = useState<FailedResume[]>([])
  const [selectedFailedResumes, setSelectedFailedResumes] = useState<Set<string>>(new Set())
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  
  // Add state for drag & drop
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Add AbortController for API cancellation
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Add state for progress tracking and cancellation
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [processingStatus, setProcessingStatus] = useState<string>("idle") // idle, processing, completed, cancelled
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressMessage, setProgressMessage] = useState("")
  const [userClosedModal, setUserClosedModal] = useState(false) // Track if user manually closed modal
  
  // Add state for confirmation dialogs
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showCancelAllConfirm, setShowCancelAllConfirm] = useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false)
  const [showDeleteSingleConfirm, setShowDeleteSingleConfirm] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState<string | null>(null)
  const [showDeleteParsedConfirm, setShowDeleteParsedConfirm] = useState(false)
  const [parsedDataToDelete, setParsedDataToDelete] = useState<number | null>(null)
  const [showDeleteAllSuccessfulConfirm, setShowDeleteAllSuccessfulConfirm] = useState(false)
  const [showReuploadConfirm, setShowReuploadConfirm] = useState(false)
  const [resumeToReupload, setResumeToReupload] = useState<string | null>(null)
  
  // Add state for results modal
  const [showResultsModal, setShowResultsModal] = useState(false)
  
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
    fetchBulkProcessingStatus()
    fetchFailedResumes()
  }, [])

  // Add global drag & drop prevention
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault()
    }
    
    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault()
    }

    document.addEventListener('dragover', handleGlobalDragOver)
    document.addEventListener('drop', handleGlobalDrop)

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver)
      document.removeEventListener('drop', handleGlobalDrop)
    }
  }, [])

  // Fetch bulk processing status
  const fetchBulkProcessingStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const response = await fetch(`${BASE_API_URL}/bulk-processing-status`)
      if (response.ok) {
        const data = await response.json()
        setBulkProcessingStatus(data)
      }
    } catch (error) {
      console.error('Error fetching bulk processing status:', error)
    } finally {
      setIsCheckingStatus(false)
    }
  }

  // Fetch failed resumes
  const fetchFailedResumes = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/failed-resumes`)
      if (response.ok) {
        const data = await response.json()
        setFailedResumes(data.failed_resumes || [])
      }
    } catch (error) {
      console.error('Error fetching failed resumes:', error)
    }
  }

  // Delete specific failed resume
  const deleteFailedResume = async (resumeId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/failed-resumes/${resumeId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setFailedResumes(prev => prev.filter(resume => resume.resume_id !== resumeId))
        setSelectedFailedResumes(prev => {
          const newSet = new Set(prev)
          newSet.delete(resumeId)
          return newSet
        })
        toast({
          title: "Failed Resume Deleted",
          description: "Failed resume has been deleted successfully.",
        })
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete the resume. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting failed resume:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to connect to the server. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete all failed resumes
  const deleteAllFailedResumes = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/failed-resumes`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setFailedResumes([])
        setSelectedFailedResumes(new Set())
        toast({
          title: "All Failed Resumes Deleted",
          description: "All failed resumes have been deleted successfully.",
        })
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete all resumes. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting all failed resumes:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to connect to the server. Please try again.",
        variant: "destructive",
      })
    }
  }


  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    // No file limit - allow unlimited resume uploads

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
  }, [toast])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      
      console.log('Files dropped:', e.dataTransfer.files.length)
      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        handleFileUpload(files)
      }
    },
    [handleFileUpload],
  )

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const processResumes = async () => {
    if (uploadedFiles.length === 0) return

    // Reset modal state for new processing
    resetModalState()
    
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStatus("processing")
    setProgressMessage(`Starting processing of ${uploadedFiles.length} resumes...`)
    
    // Show modal for new processing
    setShowProgressModal(true)
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      const formData = new FormData()
      uploadedFiles.forEach((file) => {
        formData.append('files', file)
      })

      setProgressMessage(`Uploading ${uploadedFiles.length} files to server...`)
      setProcessingProgress(20)

      const response = await fetch(`${BASE_API_URL}/bulk-parse-resumes`, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal, // Add abort signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setProgressMessage(`Processing ${uploadedFiles.length} resumes...`)
      setProcessingProgress(60)

      const data: ResumeParseResponse = await response.json()
      setParseResults(data)
      setParsedResumes(data.results)
      setProcessingResults(data.results)
      
      // Clear uploaded files after processing
      setUploadedFiles([])
      
      setProcessingProgress(100)
      setProgressMessage(`Successfully processed ${data.successful_files || 0} resumes!`)
      setProcessingStatus("completed")
      
      // Switch to results tab
      setActiveTab("upload")

      // Refresh the parsed data tab
      await fetchResumes()

      // Immediately close progress modal and show results modal
      setShowProgressModal(false)
      setShowResultsModal(true)

    } catch (error) {
      // Check if it's an abort error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('API request was cancelled')
        setProgressMessage(`Processing of ${uploadedFiles.length} resumes cancelled by user`)
        setProcessingStatus("cancelled")
        toast({
          title: "Processing Cancelled",
          description: "Resume processing has been cancelled.",
        })
        return
      }
      
      console.error('Error processing resumes:', error)
      
      // Show the actual error instead of mock data
      setProcessingStatus("error")
      setProgressMessage(`Error processing resumes: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      toast({
        title: "Processing Failed",
        description: `Failed to process resumes: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
      
      // Don't fall back to mock data - show the real error
      return
    } finally {
      setIsProcessing(false)
      // Clear the AbortController reference
      abortControllerRef.current = null
    }
  }

  const cancelProcessing = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Also try to cancel backend jobs if we have a job ID
    if (currentJobId) {
      try {
        await fetch(`${BASE_API_URL}/cancel-job/${currentJobId}`, {
          method: 'POST',
        })
      } catch (error) {
        console.error('Error cancelling backend job:', error)
      }
    }
    
    setProcessingStatus("cancelled")
    setProgressMessage("Cancelling processing...")
    setShowCancelConfirm(false) // Close confirmation dialog
    setShowProgressModal(false) // Close progress modal
    setUserClosedModal(true) // Mark that user manually closed the modal
  }

  const confirmCancelProcessing = () => {
    setShowCancelConfirm(true)
  }

  const confirmCancelAllProcessing = () => {
    setShowCancelAllConfirm(true)
  }

  const closeProgressModal = () => {
    setShowProgressModal(false)
    setUserClosedModal(true) // Mark that user manually closed the modal
    // Don't cancel processing when just closing the modal
  }

  const resetModalState = () => {
    setUserClosedModal(false) // Reset modal state for new uploads
    setProcessingStatus("idle")
    setShowProgressModal(false)
  }

  // Confirmation functions for delete operations
  const confirmDeleteAllFailedResumes = () => {
    setShowDeleteAllConfirm(true)
  }

  const confirmDeleteSingleFailedResume = (resumeId: string) => {
    setResumeToDelete(resumeId)
    setShowDeleteSingleConfirm(true)
  }

  const confirmDeleteParsedData = (resumeId: number) => {
    setParsedDataToDelete(resumeId)
    setShowDeleteParsedConfirm(true)
  }

  const confirmDeleteAllSuccessfulResumes = () => {
    setShowDeleteAllSuccessfulConfirm(true)
  }

  const downloadResume = async (resumeId: number) => {
    try {
      const response = await fetch(`${BASE_API_URL}/resumes/${resumeId}/download`, {
        method: 'GET',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Get filename from response headers or use default
        const contentDisposition = response.headers.get('content-disposition')
        let filename = 'resume.pdf'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          title: "Download Started",
          description: "Resume file download has started.",
        })
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error downloading resume:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download the resume file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteAllSuccessfulResumes = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/resumes`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setResumeData([])
        setSelectedResumes([])
        toast({
          title: "All Resumes Deleted",
          description: "All successful resumes have been deleted successfully.",
        })
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting all resumes:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete all resumes. Please try again.",
        variant: "destructive",
      })
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



  // Function to re-upload failed resumes from the database
  const reUploadFailedResumes = async () => {
    if (selectedFailedResumes.size === 0) {
      toast({
        title: "No Resumes Selected",
        description: "Please select at least one failed resume to re-upload.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProcessingProgress(0)
    
    try {
      // Get the selected failed resume IDs
      const failedResumeIds = Array.from(selectedFailedResumes)
      console.log('Failed resume IDs to re-upload:', failedResumeIds)

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

      // Use the dedicated re-upload API
      const response = await fetch(`${BASE_API_URL}/re-upload-failed-resumes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          failed_resume_ids: failedResumeIds
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      
      setProcessingProgress(100)
      
      // Show result toast with detailed information
      const successful = data.successful_files || 0
      const failed = data.failed_files || 0
      const duplicates = data.duplicate_files || 0
      
      if (successful > 0) {
        toast({
          title: "Re-upload Complete",
          description: `Successfully processed ${successful} resume(s). ${failed > 0 ? `${failed} failed, ` : ''}${duplicates > 0 ? `${duplicates} duplicates.` : ''}`,
        })
      } else {
        toast({
          title: "Re-upload Complete",
          description: `No resumes were successfully processed. ${failed > 0 ? `${failed} failed, ` : ''}${duplicates > 0 ? `${duplicates} duplicates.` : ''}`,
          variant: "destructive",
        })
      }

      // Clear selection
      setSelectedFailedResumes(new Set())
      
      // Refresh the failed resumes list
      await fetchFailedResumes()
      
      // Refresh the parsed data tab
      await fetchResumes()

    } catch (error) {
      console.error('Error re-processing failed resumes:', error)
      toast({
        title: "Re-upload Failed",
        description: "Failed to re-process the selected resumes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  // Function to re-upload a single failed resume (for individual reupload button)
  const reUploadSingleFailedResume = async (resumeId: string) => {
    // First select the resume
    setSelectedFailedResumes(new Set([resumeId]))
    
    // Show confirmation dialog
    setResumeToReupload(resumeId)
    setShowReuploadConfirm(true)
  }

  // Function to confirm and execute reupload
  const confirmReupload = async () => {
    setShowReuploadConfirm(false)
    
    // Then call the bulk reupload function
    await reUploadFailedResumes()
  }

  // Function to cancel all processing jobs
  const cancelAllProcessing = async () => {
    try {
      // First, cancel any ongoing API requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      // Reset processing state
      setIsProcessing(false)
      setProcessingProgress(0)
      setProcessingStatus("cancelled")
      setProgressMessage("Processing cancelled by user")
      setShowProgressModal(false)
      setUserClosedModal(false)

      // Call backend to cancel jobs
      const response = await fetch(`${BASE_API_URL}/cancel-all-jobs`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Processing Cancelled",
          description: `Successfully cancelled ${data.cancelled_count || 0} processing jobs.`,
        })
        
        // Refresh the bulk status
        await fetchBulkProcessingStatus()
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error cancelling all jobs:', error)
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel processing jobs. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to cancel individual processing job
  const cancelIndividualProcessing = async (jobId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/cancel-job/${jobId}`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Job Cancelled",
          description: `Successfully cancelled job ${jobId}.`,
        })
        
        // Refresh the bulk status
        await fetchBulkProcessingStatus()
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error cancelling job:', error)
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel the processing job. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <RefreshCw className={`w-5 h-5 ${processingStatus === "processing" ? "animate-spin" : ""}`} />
                <span>Processing Resumes</span>
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Progress Bar with Resume Counts */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{processingProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Processing resumes...</span>
                  <span>{processingProgress}% complete</span>
                </div>
              </div>
              
              {/* Status Message */}
              <div className="text-center">
                <p className="text-sm text-gray-600">{progressMessage}</p>
                {parseResults && processingStatus === "completed" && (
                  <div className="mt-2 text-xs text-gray-500">
                    <div>Successful: {parseResults.successful_files || 0} | Failed: {parseResults.failed_files || 0} | Total: {parseResults.total_files || 0}</div>
                    <div>Processing time: {parseResults.total_processing_time?.toFixed(2)}s</div>
                    <div>Duplicates: {parseResults.duplicate_files || 0}</div>
                  </div>
                )}
              </div>
              
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-3">
                {processingStatus === "processing" && (
                  <Button
                    variant="outline"
                    onClick={confirmCancelProcessing}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={closeProgressModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button - Top of Page */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await fetchResumes()
            await fetchBulkProcessingStatus()
            await fetchFailedResumes()
          }}
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
          <TabsTrigger value="bulk-status">Bulk Status</TabsTrigger>
          <TabsTrigger value="failed">Failed Resumes</TabsTrigger>
          <TabsTrigger value="successful">Successful Resumes</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Status Cards - Moved to top */}
          {parseResults && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">{parseResults.duplicate_files || 0}</p>
                        <p className="text-sm text-gray-600">Duplicate</p>
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


          {/* Upload Section - Always show */}
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
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                      isDragOver 
                        ? 'border-green-400 bg-green-50 scale-105 shadow-lg' 
                        : 'border-blue-300 hover:border-blue-400 bg-white/50 hover:bg-white/70'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-green-500' : 'text-blue-400'}`} />
                    <p className={`text-base font-medium mb-1 ${isDragOver ? 'text-green-800' : 'text-blue-900'}`}>
                      {isDragOver ? 'Drop files here to upload' : 'Drag and drop resume files here, or click to browse'}
                    </p>
                    <p className="text-xs text-blue-600 mb-3">Supports PDF, DOC, DOCX, TXT, RTF, PNG, JPG, JPEG, WEBP files</p>
                    <p className="text-xs text-green-600 mb-3 font-medium">Unlimited file uploads supported - Individual files or ZIP folders</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.webp,.zip"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button 
                      variant="outline" 
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
                      }}
                    >
                      Browse Files
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-blue-900 mb-2 text-center">
                        Files Ready for Processing ({uploadedFiles.length} files)
                      </h4>
                      
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
                    <div className="mt-4 text-center space-y-2">
                      <Button onClick={processResumes} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2">
                        {isProcessing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing Resumes...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Parse Resumes ({uploadedFiles.length} files)
                          </>
                        )}
                      </Button>
                      
                      {/* Show progress button if processing and modal is closed */}
                      {isProcessing && userClosedModal && (
                        <div>
                          <Button 
                            onClick={() => setShowProgressModal(true)} 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Show Progress
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>


        </TabsContent>


        <TabsContent value="bulk-status" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bulk Processing Status</CardTitle>
                <div className="flex items-center space-x-2">
                  {(bulkProcessingStatus?.active_jobs || 0) > 0 && (
                    <Button
                      variant="destructive"
                      onClick={confirmCancelAllProcessing}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel All Processing
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={fetchBulkProcessingStatus}
                    disabled={isCheckingStatus}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bulkProcessingStatus ? (
                <div className="space-y-6">
                  {/* Essential Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-2xl font-bold text-blue-900">{bulkProcessingStatus.summary?.total_files || 0}</p>
                            <p className="text-sm text-blue-700">Total Files</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-2xl font-bold text-green-900">{bulkProcessingStatus.summary?.successful_files || 0}</p>
                            <p className="text-sm text-green-700">Successful</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="text-2xl font-bold text-red-900">{bulkProcessingStatus.summary?.failed_files || 0}</p>
                            <p className="text-sm text-red-700">Failed</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="text-2xl font-bold text-yellow-900">{bulkProcessingStatus.summary?.duplicate_files || 0}</p>
                            <p className="text-sm text-yellow-700">Duplicates</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-2xl font-bold text-purple-900">{bulkProcessingStatus.progress_percentage || 0}%</p>
                            <p className="text-sm text-purple-700">Progress</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="text-2xl font-bold text-indigo-900">{bulkProcessingStatus.total_users || 0}</p>
                            <p className="text-sm text-indigo-700">Total Users</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-blue-600">{(bulkProcessingStatus.progress_percentage || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={bulkProcessingStatus.progress_percentage || 0} className="w-full" />
                  </div>

                  {/* File Results Table */}
                  {bulkProcessingStatus.file_results && bulkProcessingStatus.file_results.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">File Processing Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Details</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bulkProcessingStatus.file_results.map((result, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-6 w-6 mr-2">
                                        {getFileIcon(result.file_type || '')}
                                      </div>
                                      <div className="truncate max-w-48" title={result.filename}>
                                        {result.filename}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {result.status === 'success' ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Success
                                      </span>
                                    ) : result.status === 'duplicate' ? (
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Duplicate
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Failed
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-gray-900">
                                    {result.file_type?.toUpperCase() || 'Unknown'}
                                  </TableCell>
                                  <TableCell className="text-gray-900">
                                    {result.processing_time ? `${result.processing_time.toFixed(2)}s` : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {result.status === 'success' ? (
                                      <div>
                                        <div className="font-medium text-green-700 text-xs">
                                          {result.parsed_data?.Name || 'Name extracted'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {result.parsed_data?.Email || 'Email extracted'}
                                        </div>
                                        <div className="mt-1">
                                          <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                                            result.embedding_status === 'completed' 
                                              ? 'bg-green-100 text-green-800' 
                                              : 'bg-red-100 text-red-800'
                                          }`}>
                                            {result.embedding_status === 'completed' ? '✅' : '❌'}
                                          </span>
                                        </div>
                                      </div>
                                    ) : result.status === 'duplicate' ? (
                                      <div className="text-yellow-600 text-xs">
                                        <div className="font-medium">Duplicate Found</div>
                                        <div className="text-gray-500">
                                          {result.error || 'Resume already exists'}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-red-600 text-xs">
                                        <div className="font-medium">Processing Failed</div>
                                        <div className="text-gray-500">
                                          {result.error || 'Failed to process'}
                                        </div>
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">File Processing Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <RefreshCw className="w-8 h-8 text-blue-400 mx-auto mb-4 animate-spin" />
                          <p className="text-gray-600">
                            {(bulkProcessingStatus.active_jobs || 0) > 0 
                              ? `Processing ${bulkProcessingStatus.summary?.total_files || 0} files... Please wait for files to be processed.`
                              : 'No file processing data available'
                            }
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Progress: {(bulkProcessingStatus.progress_percentage || 0).toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bulk processing data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Failed Resumes Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={fetchFailedResumes}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  {failedResumes.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={confirmDeleteAllFailedResumes}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {failedResumes.length > 0 ? (
                <div className="space-y-4">
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="select-all-failed-resumes"
                        checked={selectedFailedResumes.size === failedResumes.length && failedResumes.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFailedResumes(new Set(failedResumes.map(r => r.resume_id)))
                          } else {
                            setSelectedFailedResumes(new Set())
                          }
                        }}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                      <Label htmlFor="select-all-failed-resumes" className="text-sm font-medium text-red-700">
                        Select All ({selectedFailedResumes.size} of {failedResumes.length})
                      </Label>
                    </div>
                    {selectedFailedResumes.size > 0 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={reUploadFailedResumes}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Re-upload Selected ({selectedFailedResumes.size})
                        </Button>
                      </div>
                    )}
                    {(bulkProcessingStatus?.active_jobs || 0) > 0 && (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={confirmCancelAllProcessing}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel All Processing
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Failed Resumes List */}
                  <div className="space-y-2">
                    {failedResumes.map((resume) => (
                      <div key={resume.resume_id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`failed-resume-${resume.resume_id}`}
                            checked={selectedFailedResumes.has(resume.resume_id)}
                            onCheckedChange={(checked) => {
                              const newSet = new Set(selectedFailedResumes)
                              if (checked) {
                                newSet.add(resume.resume_id)
                              } else {
                                newSet.delete(resume.resume_id)
                              }
                              setSelectedFailedResumes(newSet)
                            }}
                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                          />
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            {getFileIcon(resume.file_type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-red-900">{resume.filename}</h4>
                            <p className="text-sm text-red-600">
                              <strong>Reason:</strong> {resume.failure_reason}
                            </p>
                            <p className="text-xs text-red-500">
                              <strong>Type:</strong> {resume.failure_type} | 
                              <strong> Size:</strong> {(resume.file_size / 1024).toFixed(1)} KB | 
                              <strong> Date:</strong> {new Date(resume.created_at * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => reUploadSingleFailedResume(resume.resume_id)}
                            className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Re-upload
                          </Button>
                          {(bulkProcessingStatus?.active_jobs || 0) > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={confirmCancelAllProcessing}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel Processing
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => confirmDeleteSingleFailedResume(resume.resume_id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Failed Resumes</h3>
                  <p className="text-gray-600">All resumes have been processed successfully!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="successful" className="space-y-6">
          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Successful Resumes</CardTitle>
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
                  {filteredResumes.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={confirmDeleteAllSuccessfulResumes}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* File Type Statistics */}
              {filteredResumes.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Total Count */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{filteredResumes.length}</div>
                      <div className="text-sm text-blue-700">Total</div>
                    </div>
                    
                    {/* PDF Count */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {filteredResumes.filter(r => r.file_type?.toLowerCase() === 'pdf').length}
                      </div>
                      <div className="text-sm text-red-700">PDF</div>
                    </div>
                    
                    {/* DOCX Count */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredResumes.filter(r => r.file_type?.toLowerCase() === 'docx').length}
                      </div>
                      <div className="text-sm text-blue-700">DOCX</div>
                    </div>
                    
                    {/* DOC Count */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredResumes.filter(r => r.file_type?.toLowerCase() === 'doc').length}
                      </div>
                      <div className="text-sm text-green-700">DOC</div>
                    </div>
                    
                    {/* Image Count (JPG, PNG, etc.) */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {filteredResumes.filter(r => ['jpg', 'jpeg', 'png', 'webp'].includes(r.file_type?.toLowerCase())).length}
                      </div>
                      <div className="text-sm text-purple-700">Images</div>
                    </div>
                    
                    {/* Other Count */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-gray-600">
                        {filteredResumes.filter(r => !['pdf', 'docx', 'doc', 'jpg', 'jpeg', 'png', 'webp'].includes(r.file_type?.toLowerCase())).length}
                      </div>
                      <div className="text-sm text-gray-700">Other</div>
                    </div>
                  </div>
                </div>
              )}

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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadResume(resume.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Download Resume"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
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
                                  onClick={() => confirmDeleteParsedData(resume.id)}
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



      </Tabs>

      {/* Confirmation Dialogs */}
      
      {/* Cancel Processing Confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Processing</h3>
                <p className="text-sm text-gray-600">Are you sure you want to cancel the resume processing?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Processing
              </Button>
              <Button
                variant="destructive"
                onClick={cancelProcessing}
              >
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel All Processing Confirmation */}
      {showCancelAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel All Processing</h3>
                <p className="text-sm text-gray-600">Are you sure you want to cancel all processing jobs? This will stop all resume processing activities.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelAllConfirm(false)}
              >
                Keep Processing
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  cancelAllProcessing()
                  setShowCancelAllConfirm(false)
                }}
              >
                Yes, Cancel All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Failed Resumes Confirmation */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete All Failed Resumes</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete all {failedResumes.length} failed resumes? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAllConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteAllFailedResumes()
                  setShowDeleteAllConfirm(false)
                }}
              >
                Yes, Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Failed Resume Confirmation */}
      {showDeleteSingleConfirm && resumeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Failed Resume</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete this failed resume? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteSingleConfirm(false)
                  setResumeToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteFailedResume(resumeToDelete)
                  setShowDeleteSingleConfirm(false)
                  setResumeToDelete(null)
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Parsed Data Confirmation */}
      {showDeleteParsedConfirm && parsedDataToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Resume Data</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete this parsed resume data? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteParsedConfirm(false)
                  setParsedDataToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteResume(parsedDataToDelete)
                  setShowDeleteParsedConfirm(false)
                  setParsedDataToDelete(null)
                }}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Successful Resumes Confirmation */}
      {showDeleteAllSuccessfulConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete All Successful Resumes</h3>
                <p className="text-sm text-gray-600">Are you sure you want to delete all {filteredResumes.length} successful resumes? This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAllSuccessfulConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteAllSuccessfulResumes()
                  setShowDeleteAllSuccessfulConfirm(false)
                }}
              >
                Yes, Delete All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reupload Confirmation */}
      {showReuploadConfirm && resumeToReupload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Re-upload Failed Resume</h3>
                <p className="text-sm text-gray-600">Are you sure you want to re-upload this failed resume? You can check the processing status in the Bulk Status tab.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReuploadConfirm(false)
                  setResumeToReupload(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  confirmReupload()
                  setResumeToReupload(null)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Yes, Re-upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && parseResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span>Processing Results</span>
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResultsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Simple Summary Text */}
            <div className="text-center mb-4 text-sm text-gray-600">
              <div>Successful: <span className="font-semibold text-green-600">{parseResults.successful_files || 0}</span> | 
                   Failed: <span className="font-semibold text-red-600">{parseResults.failed_files || 0}</span> | 
                   Total: <span className="font-semibold text-blue-600">{parseResults.total_files || 0}</span>
              </div>
              <div>Processing time: <span className="font-semibold">{parseResults.total_processing_time?.toFixed(2)}s</span></div>
              <div>Duplicates: <span className="font-semibold text-orange-600">{parseResults.duplicate_files || 0}</span></div>
            </div>

            {/* Detailed Results Table */}
            {parseResults.results && parseResults.results.length > 0 && (
              <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="text-sm font-semibold text-gray-900">Detailed Results</h4>
                </div>
                <div className="overflow-auto flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">File Name</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parseResults.results.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-6 w-6">
                                {getFileIcon(result.file_type || '')}
                              </div>
                              <div className="ml-2">
                                <div className="font-medium text-gray-900 truncate max-w-32">{result.filename}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            {result.status === 'success' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Success
                              </span>
                            ) : result.status === 'duplicate' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Duplicate
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-900">
                            {result.file_type?.toUpperCase() || 'Unknown'}
                          </td>
                          <td className="px-3 py-2 text-gray-900">
                            {result.processing_time ? `${result.processing_time.toFixed(2)}s` : 'N/A'}
                          </td>
                          <td className="px-3 py-2">
                            {result.status === 'success' ? (
                              <div>
                                <div className="font-medium text-green-700 text-xs">
                                  {result.parsed_data?.Name || 'Name extracted'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {result.parsed_data?.Email || 'Email extracted'}
                                </div>
                                <div className="mt-1">
                                  <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${
                                    result.embedding_status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {result.embedding_status === 'completed' ? '✅' : '❌'}
                                  </span>
                                </div>
                              </div>
                            ) : result.status === 'duplicate' ? (
                              <div className="text-yellow-600 text-xs">
                                <div className="font-medium">Duplicate Found</div>
                                <div className="text-gray-500">
                                  {result.error || 'Resume already exists'}
                                </div>
                              </div>
                            ) : (
                              <div className="text-red-600 text-xs">
                                <div className="font-medium">Processing Failed</div>
                                <div className="text-gray-500">
                                  {result.error || 'Failed to process'}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-4 text-center">
              <Button
                onClick={() => setShowResultsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

