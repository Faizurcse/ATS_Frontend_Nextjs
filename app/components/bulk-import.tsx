"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Eye,
  Link,
  RefreshCw,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface ParsedJob {
  id: string
  fileName: string
  title: string
  company: string
  location: string
  salary: string
  type: string
  skills: string[]
  requirements: string[]
  description: string
  status: "validated" | "error" | "pending"
  confidence: number
  linkedJobId?: string
  linkedJobTitle?: string
}

interface ImportSession {
  id: string
  date: string
  filesCount: number
  successCount: number
  errorCount: number
  status: "completed" | "processing" | "failed"
}

const mockExistingJobs = [
  { id: "1", title: "Senior Software Engineer", company: "TechCorp" },
  { id: "2", title: "Marketing Manager", company: "StartupInc" },
  { id: "3", title: "Data Scientist", company: "DataCorp" },
  { id: "4", title: "Product Manager", company: "InnovateLtd" },
  { id: "5", title: "UX Designer", company: "DesignStudio" },
]

const mockImportHistory: ImportSession[] = [
  {
    id: "1",
    date: "2024-01-15 14:30",
    filesCount: 25,
    successCount: 23,
    errorCount: 2,
    status: "completed",
  },
  {
    id: "2",
    date: "2024-01-14 09:15",
    filesCount: 12,
    successCount: 12,
    errorCount: 0,
    status: "completed",
  },
  {
    id: "3",
    date: "2024-01-13 16:45",
    filesCount: 8,
    successCount: 6,
    errorCount: 2,
    status: "completed",
  },
]

export default function BulkImport() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [parsedJobs, setParsedJobs] = useState<ParsedJob[]>([])
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")
  const [linkingJobId, setLinkingJobId] = useState<string | null>(null)

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "text/plain" ||
        file.type === "text/csv",
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

  const simulateProcessing = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setActiveTab("review")

    const mockParsedJobs: ParsedJob[] = uploadedFiles.map((file, index) => ({
      id: `job-${index}`,
      fileName: file.name,
      title: [
        "Senior Software Engineer",
        "Marketing Manager",
        "Data Scientist",
        "Product Manager",
        "UX Designer",
        "DevOps Engineer",
        "Sales Representative",
        "HR Specialist",
      ][index % 8],
      company: [
        "TechCorp",
        "StartupInc",
        "DataCorp",
        "InnovateLtd",
        "DesignStudio",
        "CloudSystems",
        "SalesForce",
        "PeopleFirst",
      ][index % 8],
      location: ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA"][index % 5],
      salary: ["$120,000 - $150,000", "$80,000 - $100,000", "$100,000 - $130,000", "$90,000 - $120,000"][index % 4],
      type: ["Full-time", "Part-time", "Contract"][index % 3],
      skills: [
        ["React", "Node.js", "TypeScript"],
        ["Marketing", "Analytics", "SEO"],
        ["Python", "Machine Learning", "SQL"],
        ["Product Strategy", "Agile", "Analytics"],
        ["Figma", "Sketch", "User Research"],
      ][index % 5],
      requirements: [
        ["5+ years experience", "Bachelor's degree", "Strong communication skills"],
        ["3+ years marketing experience", "Digital marketing expertise", "Analytics tools"],
        ["PhD in related field", "Python proficiency", "Statistical analysis"],
      ][index % 3],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      status: Math.random() > 0.8 ? "error" : Math.random() > 0.9 ? "pending" : "validated",
      confidence: Math.floor(Math.random() * 30) + 70,
    }))

    // Simulate processing progress
    for (let i = 0; i <= 100; i += 10) {
      setProcessingProgress(i)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    setParsedJobs(mockParsedJobs)
    setIsProcessing(false)
  }

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]))
  }

  const toggleSelectAll = () => {
    const validatedJobs = parsedJobs.filter((job) => job.status === "validated")
    if (selectedJobs.length === validatedJobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(validatedJobs.map((job) => job.id))
    }
  }

  const linkJobToExisting = (jobId: string, existingJobId: string, existingJobTitle: string) => {
    setParsedJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, linkedJobId: existingJobId, linkedJobTitle: existingJobTitle } : job,
      ),
    )
    setLinkingJobId(null)
  }

  const importSelectedJobs = () => {
    // Simulate import process
    console.log("Importing jobs:", selectedJobs)
    setSelectedJobs([])
    setParsedJobs([])
    setUploadedFiles([])
    setActiveTab("upload")
  }

  const downloadCSVTemplate = () => {
    const csvContent = `Title,Company,Location,Salary,Type,Skills,Requirements,Description
Senior Software Engineer,TechCorp,"San Francisco, CA","$120,000 - $150,000",Full-time,"React,Node.js,TypeScript","5+ years experience,Bachelor's degree","Job description here"
Marketing Manager,StartupInc,"New York, NY","$80,000 - $100,000",Full-time,"Marketing,Analytics,SEO","3+ years experience,Digital marketing","Job description here"`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "job_import_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Bulk Import</h2>
        <p className="text-gray-600">Import job postings and resumes in bulk with AI-powered parsing</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="review">Review & Validate</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>File Upload</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drag and drop files here, or click to browse</p>
                  <p className="text-sm text-gray-600 mb-4">Supports PDF, DOC, DOCX, TXT, and CSV files</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.csv"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent">
                      Browse Files
                    </Button>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Uploaded Files ({uploadedFiles.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
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
                    <Button onClick={simulateProcessing} disabled={isProcessing} className="w-full">
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing Files...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Process Files ({uploadedFiles.length})
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
                  <span>CSV Template</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  For structured imports, download our CSV template with the required format and columns.
                </p>
                <Button variant="outline" onClick={downloadCSVTemplate} className="w-full bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Supported Formats:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• PDF documents (job descriptions, resumes)</li>
                    <li>• Word documents (.doc, .docx)</li>
                    <li>• Plain text files (.txt)</li>
                    <li>• CSV files (structured data)</li>
                  </ul>
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
                    <p className="font-medium text-gray-900">Processing files...</p>
                    <p className="text-sm text-gray-600">AI is parsing and extracting job information</p>
                    <Progress value={processingProgress} className="mt-2" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{processingProgress}%</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {parsedJobs.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Parsed Jobs ({parsedJobs.length})</h3>
                  <p className="text-sm text-gray-600">Review and validate the extracted job information</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={toggleSelectAll}
                    disabled={parsedJobs.filter((job) => job.status === "validated").length === 0}
                  >
                    {selectedJobs.length === parsedJobs.filter((job) => job.status === "validated").length
                      ? "Deselect All"
                      : "Select All Validated"}
                  </Button>
                  <Button
                    onClick={importSelectedJobs}
                    disabled={selectedJobs.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Import Selected ({selectedJobs.length})
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedJobs.length === parsedJobs.filter((job) => job.status === "validated").length &&
                              parsedJobs.filter((job) => job.status === "validated").length > 0
                            }
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Linked Job</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedJobs.includes(job.id)}
                              onCheckedChange={() => toggleJobSelection(job.id)}
                              disabled={job.status !== "validated"}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                job.status === "validated"
                                  ? "default"
                                  : job.status === "error"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="flex items-center space-x-1"
                            >
                              {job.status === "validated" && <CheckCircle className="w-3 h-3" />}
                              {job.status === "error" && <AlertCircle className="w-3 h-3" />}
                              {job.status === "pending" && <Clock className="w-3 h-3" />}
                              <span className="capitalize">{job.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    job.confidence >= 80
                                      ? "bg-green-500"
                                      : job.confidence >= 60
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${job.confidence}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{job.confidence}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {job.linkedJobTitle ? (
                              <Badge variant="outline" className="text-blue-600">
                                <Link className="w-3 h-3 mr-1" />
                                {job.linkedJobTitle}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Not linked</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Job Details - {job.title}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Company</Label>
                                        <p className="text-sm text-gray-900">{job.company}</p>
                                      </div>
                                      <div>
                                        <Label>Location</Label>
                                        <p className="text-sm text-gray-900">{job.location}</p>
                                      </div>
                                      <div>
                                        <Label>Salary</Label>
                                        <p className="text-sm text-gray-900">{job.salary}</p>
                                      </div>
                                      <div>
                                        <Label>Type</Label>
                                        <p className="text-sm text-gray-900">{job.type}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Skills</Label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {job.skills.map((skill, index) => (
                                          <Badge key={index} variant="secondary">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Requirements</Label>
                                      <ul className="text-sm text-gray-900 mt-1 space-y-1">
                                        {job.requirements.map((req, index) => (
                                          <li key={index}>• {req}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <Label>Description</Label>
                                      <p className="text-sm text-gray-900 mt-1">{job.description}</p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog
                                open={linkingJobId === job.id}
                                onOpenChange={(open) => setLinkingJobId(open ? job.id : null)}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Link className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Link to Existing Job</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                      Link "{job.title}" to an existing job posting in the system.
                                    </p>
                                    <div className="space-y-2">
                                      {mockExistingJobs.map((existingJob) => (
                                        <div
                                          key={existingJob.id}
                                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                          <div>
                                            <p className="font-medium">{existingJob.title}</p>
                                            <p className="text-sm text-gray-600">{existingJob.company}</p>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={() => linkJobToExisting(job.id, existingJob.id, existingJob.title)}
                                          >
                                            Link
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {parsedJobs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs to Review</h3>
                <p className="text-gray-600 mb-4">Upload and process files to see parsed job information here.</p>
                <Button onClick={() => setActiveTab("upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Import History</h3>
            <p className="text-sm text-gray-600">View previous import sessions and their results</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Files Processed</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockImportHistory.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.date}</TableCell>
                      <TableCell>{session.filesCount} files</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">{session.successCount}</span>
                          </div>
                          {session.errorCount > 0 && (
                            <div className="flex items-center space-x-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-600">{session.errorCount}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "default"
                              : session.status === "processing"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
