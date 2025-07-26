"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Eye, MessageSquare, Calendar, Star } from "lucide-react"
import { getCandidatesByRecruiter, formatCandidateStatus, type Candidate } from "../../lib/recruiter-data"

interface PostedCandidatesProps {
  recruiterId: string
}

export default function PostedCandidates({ recruiterId }: PostedCandidatesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")

  // Get candidates for the recruiter with error handling
  let candidates: Candidate[] = []
  try {
    candidates = getCandidatesByRecruiter(recruiterId) || []
  } catch (error) {
    console.error("Error fetching candidates:", error)
  }

  // Filter candidates with null-safe operations
  const filteredCandidates = candidates.filter((candidate) => {
    if (!candidate) return false

    const fullName = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim()
    const searchableText = [
      fullName,
      candidate.name || "",
      candidate.email || "",
      candidate.jobTitle || "",
      candidate.location || "",
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = !searchTerm || searchableText.includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Date not available"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  const getInitials = (candidate: Candidate) => {
    if (candidate.firstName && candidate.lastName) {
      return `${candidate.firstName.charAt(0)}${candidate.lastName.charAt(0)}`
    }
    if (candidate.name) {
      const nameParts = candidate.name.split(" ")
      return nameParts.length > 1
        ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
        : candidate.name.charAt(0)
    }
    return "?"
  }

  const getFullName = (candidate: Candidate) => {
    if (candidate.firstName && candidate.lastName) {
      return `${candidate.firstName} ${candidate.lastName}`
    }
    return candidate.name || "Unknown Candidate"
  }

  const renderStars = (rating: number | undefined) => {
    const validRating = typeof rating === "number" && rating >= 0 && rating <= 5 ? rating : 0
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= validRating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({validRating})</span>
      </div>
    )
  }

  const getSourceColor = (source: string | undefined) => {
    if (!source) return "bg-gray-100 text-gray-800"

    switch (source.toLowerCase()) {
      case "linkedin":
        return "bg-blue-100 text-blue-800"
      case "website":
        return "bg-green-100 text-green-800"
      case "referral":
        return "bg-purple-100 text-purple-800"
      case "job-board":
        return "bg-orange-100 text-orange-800"
      case "direct":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Posted Candidates</h2>
          <p className="text-gray-600">Manage and track candidate applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidates.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {candidates.filter((c) => c?.status === "new").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {candidates.filter((c) => c?.status === "reviewed" || c?.status === "screening").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {candidates.filter((c) => c?.status === "interviewed").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Extended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {candidates.filter((c) => c?.status === "offered").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offered">Offered</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="job-board">Job Board</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Applications ({filteredCandidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No candidates found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => {
                  if (!candidate) return null

                  const statusInfo = formatCandidateStatus(candidate.status || "new")
                  const fullName = getFullName(candidate)

                  return (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=32&width=32&text=${getInitials(candidate)}`} />
                            <AvatarFallback>{getInitials(candidate)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{fullName}</div>
                            <div className="text-sm text-gray-500">{candidate.email || "No email"}</div>
                            <div className="text-sm text-gray-500">
                              {candidate.location || "Location not specified"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{candidate.jobTitle || "No position specified"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSourceColor(candidate.source)}>
                          {candidate.source
                            ? candidate.source.charAt(0).toUpperCase() + candidate.source.slice(1)
                            : "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderStars(candidate.rating)}</TableCell>
                      <TableCell>{candidate.experience || "Not specified"}</TableCell>
                      <TableCell>{formatDate(candidate.applicationDate || candidate.appliedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Calendar className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
