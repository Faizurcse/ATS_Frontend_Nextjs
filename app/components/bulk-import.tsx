"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import BASE_API_URL from "@/PythonApi"
import { useToast } from "@/hooks/use-toast"

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
  parsed_data: string // JSON string that needs to be parsed
  created_at: string
  updated_at?: string
}

interface ResumeParseResponse {
  total_files: number
  successful_files: number
  failed_files: number
  total_processing_time: number
  results: any[]
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
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Helper function to parse JSON string safely
  const parseResumeData = (jsonString: string): ParsedResumeData | null => {
    try {
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
      setResumeData(data.resumes || data || [])
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
  }, [])

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
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ResumeParseResponse = await response.json()
      setParseResults(data)
      setParsedResumes(data.results)
      setProcessingProgress(100)

      // Refresh the parsed data tab
      await fetchResumes()

    } catch (error) {
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
      setProcessingProgress(100)
    } finally {
      setIsProcessing(false)
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
        const parsedData = parseResumeData(resume.parsed_data)
        return [
          parsedData?.Name || resume.candidate_name || '',
          parsedData?.Email || resume.candidate_email || '',
          parsedData?.Phone || '',
          parsedData?.Address || '',
          parsedData?.TotalExperience || resume.total_experience || '',
          parsedData?.Skills?.join('; ') || '',
          resume.file_type,
          new Date(resume.created_at).toLocaleDateString()
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

  // Filter resumes based on search and filters
  const filteredResumes = resumeData.filter(resume => {
    const matchesSearch = searchTerm === "" || 
      resume.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resume.candidate_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFileType = fileTypeFilter === "all" || resume.file_type === fileTypeFilter
    
    return matchesSearch && matchesFileType
  })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Bulk Resume Import</h2>
        <p className="text-gray-600">Upload and parse multiple resumes with AI-powered extraction</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Bulk Import Files</TabsTrigger>
          <TabsTrigger value="parsed">Parsed Data</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Resume Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drag and drop resume files here, or click to browse</p>
                  <p className="text-sm text-gray-600 mb-4">Supports PDF, DOC, DOCX, TXT, RTF, PNG, JPG, JPEG, WEBP files</p>
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
                    className="bg-transparent"
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
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(file.name.split('.').pop() || '')}
                            <span className="text-sm text-gray-900 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <Button onClick={processResumes} disabled={isProcessing} className="w-full">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Supported Formats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Our AI can parse and extract information from various resume formats.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      PDF
                    </Badge>
                    <span className="text-sm text-gray-600">Most common format</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      DOC/DOCX
                    </Badge>
                    <span className="text-sm text-gray-600">Microsoft Word documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      TXT/RTF
                    </Badge>
                    <span className="text-sm text-gray-600">Plain text formats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Images
                    </Badge>
                    <span className="text-sm text-gray-600">PNG, JPG, JPEG, WEBP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isProcessing && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Processing resumes...</p>
                    <p className="text-sm text-gray-600">AI is extracting candidate information</p>
                    <Progress value={processingProgress} className="mt-2" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{processingProgress}%</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
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
                        <p className="text-2xl font-bold">{parseResults.total_processing_time.toFixed(1)}s</p>
                        <p className="text-sm text-gray-600">Processing Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>

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
                        const parsedData = parseResumeData(resume.parsed_data)
                        return (
                          <TableRow key={resume.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedResumes.includes(resume.id)}
                                onCheckedChange={() => toggleResumeSelection(resume.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getFileIcon(resume.file_type)}
                                <span className="text-sm font-medium">{resume.filename}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{parsedData?.Name || resume.candidate_name || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{parsedData?.Email || resume.candidate_email || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{parsedData?.Phone || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{parsedData?.TotalExperience || resume.total_experience || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {new Date(resume.created_at).toLocaleDateString()}
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
                                        <span>{parsedData?.Name || resume.candidate_name || 'Resume Details'}</span>
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      {/* Contact Information */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-2">
                                          <Mail className="w-4 h-4 text-gray-500" />
                                          <span className="text-sm">{parsedData?.Email || resume.candidate_email || 'N/A'}</span>
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
                                          <span className="text-sm">{parsedData?.TotalExperience || resume.total_experience || 'N/A'}</span>
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
                  <p className="text-gray-600">No resumes found matching your filters.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

