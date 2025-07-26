"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Building,
  FileText,
  Send,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { getWeekRange, addWeeks, formatDateRange, formatDate } from "../../lib/date-utils"
import {
  type TimesheetEntry,
  MOCK_CUSTOMERS,
  MOCK_JOBS,
  MOCK_CANDIDATES,
  getTimesheetByWeek,
  calculateWeeklyHours,
  getTimesheetStatus,
} from "../../lib/timesheet-data"

interface RecruiterTimesheetProps {
  recruiterId?: string
}

export default function RecruiterTimesheet({ recruiterId = "2" }: RecruiterTimesheetProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimesheetEntry | null>(null)
  const [newEntry, setNewEntry] = useState({
    date: formatDate(new Date()),
    hours: "",
    entityType: "customer" as "customer" | "job" | "candidate",
    entityId: "",
    taskType: "",
    comments: "",
  })

  const weekRange = getWeekRange(currentWeek)
  const weeklyTimesheet = getTimesheetByWeek(recruiterId, weekRange.start, weekRange.end)
  const totalHours = calculateWeeklyHours(weeklyTimesheet.entries)
  const weekStatus = getTimesheetStatus(weeklyTimesheet)

  const taskTypes = [
    "Candidate Sourcing",
    "Client Meeting",
    "Interview Coordination",
    "Screening Call",
    "Job Posting",
    "Pipeline Management",
    "Administrative",
    "Follow-up",
    "Research",
    "Other",
  ]

  const getEntityOptions = () => {
    switch (newEntry.entityType) {
      case "customer":
        return MOCK_CUSTOMERS.map((c) => ({ id: c.id, name: c.companyName }))
      case "job":
        return MOCK_JOBS.map((j) => ({ id: j.id, name: j.title }))
      case "candidate":
        return MOCK_CANDIDATES.map((c) => ({ id: c.id, name: c.name }))
      default:
        return []
    }
  }

  const getEntityName = (entry: TimesheetEntry) => {
    switch (entry.entityType) {
      case "customer":
        return MOCK_CUSTOMERS.find((c) => c.id === entry.entityId)?.companyName || "Unknown Customer"
      case "job":
        return MOCK_JOBS.find((j) => j.id === entry.entityId)?.title || "Unknown Job"
      case "candidate":
        return MOCK_CANDIDATES.find((c) => c.id === entry.entityId)?.name || "Unknown Candidate"
      default:
        return "Unknown"
    }
  }

  const handleAddEntry = () => {
    if (!newEntry.hours || !newEntry.entityId || !newEntry.taskType) return

    const entry: TimesheetEntry = {
      id: `entry_${Date.now()}`,
      recruiterId,
      date: newEntry.date,
      hours: Number.parseFloat(newEntry.hours),
      entityType: newEntry.entityType,
      entityId: newEntry.entityId,
      taskType: newEntry.taskType,
      comments: newEntry.comments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In a real app, this would be an API call
    console.log("Adding timesheet entry:", entry)

    // Reset form
    setNewEntry({
      date: formatDate(new Date()),
      hours: "",
      entityType: "customer",
      entityId: "",
      taskType: "",
      comments: "",
    })
    setIsAddingEntry(false)
  }

  const handleEditEntry = (entry: TimesheetEntry) => {
    setEditingEntry(entry)
    setNewEntry({
      date: entry.date,
      hours: entry.hours.toString(),
      entityType: entry.entityType,
      entityId: entry.entityId,
      taskType: entry.taskType,
      comments: entry.comments,
    })
    setIsAddingEntry(true)
  }

  const handleDeleteEntry = (entryId: string) => {
    // In a real app, this would be an API call
    console.log("Deleting timesheet entry:", entryId)
  }

  const handleSubmitWeek = () => {
    // In a real app, this would be an API call
    console.log("Submitting timesheet for week:", formatDateRange(weekRange.start, weekRange.end))
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const weeks = direction === "prev" ? -1 : 1
    setCurrentWeek(addWeeks(currentWeek, weeks))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
      submitted: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "customer":
        return <Building className="w-4 h-4 text-blue-600" />
      case "job":
        return <FileText className="w-4 h-4 text-green-600" />
      case "candidate":
        return <User className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Timesheet</h2>
          <p className="text-gray-600">Track time spent on recruitment activities</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigateWeek("prev")} variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded">
            {formatDateRange(weekRange.start, weekRange.end)}
          </div>
          <Button onClick={() => navigateWeek("next")} variant="outline" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-gray-600">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{weeklyTimesheet.entries.length}</div>
            <p className="text-xs text-gray-600">Time entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {weekStatus === "approved" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : weekStatus === "rejected" ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Calendar className="h-4 w-4 text-gray-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">{getStatusBadge(weekStatus)}</div>
            <p className="text-xs text-gray-600 mt-1">Week status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Plus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Time
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingEntry ? "Edit Time Entry" : "Log Time Entry"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newEntry.date}
                          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="hours">Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          step="0.25"
                          min="0"
                          max="24"
                          value={newEntry.hours}
                          onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                          placeholder="0.0"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="entityType">Related To</Label>
                      <Select
                        value={newEntry.entityType}
                        onValueChange={(value: "customer" | "job" | "candidate") =>
                          setNewEntry({ ...newEntry, entityType: value, entityId: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="job">Job Posting</SelectItem>
                          <SelectItem value="candidate">Candidate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="entityId">
                        {newEntry.entityType === "customer"
                          ? "Customer"
                          : newEntry.entityType === "job"
                            ? "Job"
                            : "Candidate"}
                      </Label>
                      <Select
                        value={newEntry.entityId}
                        onValueChange={(value) => setNewEntry({ ...newEntry, entityId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${newEntry.entityType}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getEntityOptions().map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="taskType">Task Type</Label>
                      <Select
                        value={newEntry.taskType}
                        onValueChange={(value) => setNewEntry({ ...newEntry, taskType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskTypes.map((task) => (
                            <SelectItem key={task} value={task}>
                              {task}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="comments">Comments</Label>
                      <Textarea
                        id="comments"
                        value={newEntry.comments}
                        onChange={(e) => setNewEntry({ ...newEntry, comments: e.target.value })}
                        placeholder="Add details about the work performed..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingEntry(false)
                          setEditingEntry(null)
                          setNewEntry({
                            date: formatDate(new Date()),
                            hours: "",
                            entityType: "customer",
                            entityId: "",
                            taskType: "",
                            comments: "",
                          })
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddEntry}>{editingEntry ? "Update Entry" : "Add Entry"}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {weekStatus === "draft" && weeklyTimesheet.entries.length > 0 && (
                <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={handleSubmitWeek}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Week
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <p className="text-sm text-gray-600">Week of {formatDateRange(weekRange.start, weekRange.end)}</p>
        </CardHeader>
        <CardContent>
          {weeklyTimesheet.entries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Task Type</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyTimesheet.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.hours}h</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getEntityIcon(entry.entityType)}
                        <div>
                          <div className="font-medium">{getEntityName(entry)}</div>
                          <div className="text-xs text-gray-500 capitalize">{entry.entityType}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{entry.taskType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={entry.comments}>
                        {entry.comments || "No comments"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {weekStatus === "draft" && (
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditEntry(entry)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Time Entries</h3>
              <p className="text-gray-600 mb-4">Start logging your time for this week</p>
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      {weeklyTimesheet.entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-3">By Entity Type</h4>
                <div className="space-y-2">
                  {["customer", "job", "candidate"].map((type) => {
                    const hours = weeklyTimesheet.entries
                      .filter((e) => e.entityType === type)
                      .reduce((sum, e) => sum + e.hours, 0)
                    if (hours === 0) return null
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          {getEntityIcon(type)}
                          <span className="capitalize">{type}s</span>
                        </div>
                        <Badge variant="outline">{hours.toFixed(1)}h</Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">By Task Type</h4>
                <div className="space-y-2">
                  {taskTypes.map((task) => {
                    const hours = weeklyTimesheet.entries
                      .filter((e) => e.taskType === task)
                      .reduce((sum, e) => sum + e.hours, 0)
                    if (hours === 0) return null
                    return (
                      <div key={task} className="flex justify-between items-center">
                        <span className="text-sm">{task}</span>
                        <Badge variant="outline">{hours.toFixed(1)}h</Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Daily Breakdown</h4>
                <div className="space-y-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(weekRange.start)
                    date.setDate(date.getDate() + i)
                    const dateStr = formatDate(date)
                    const hours = weeklyTimesheet.entries
                      .filter((e) => e.date === dateStr)
                      .reduce((sum, e) => sum + e.hours, 0)
                    return (
                      <div key={dateStr} className="flex justify-between items-center">
                        <span className="text-sm">{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                        <Badge variant={hours > 0 ? "default" : "outline"}>{hours.toFixed(1)}h</Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
