"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  CalendarIcon,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Plus,
  Search,
  Filter,
  Star,
  MessageSquare,
  FileText,
  Brain,
  Eye,
  Copy,
  ExternalLink,
  Settings,
  Play,
  Square,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  PhoneCall,
  Download,
  RefreshCw,
  Mail,
} from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"

// Import existing interview components
import AddedInterviews from "./added-interviews"
import InterviewIntegration from "./interview-integration"
import AIInterviewScheduler from "./ai-interview-scheduler"

interface VideoMeeting {
  id: string
  platform: "zoom" | "teams" | "webex" | "meet"
  meetingId: string
  meetingUrl: string
  password?: string
  hostKey?: string
  waitingRoom: boolean
  recording: boolean
  transcription: boolean
  createdAt: string
  status: "active" | "ended" | "scheduled"
}

interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  candidateAvatar?: string
  position: string
  company: string
  interviewType: "phone" | "video" | "in-person" | "panel" | "technical" | "behavioral"
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "rescheduled" | "no-show"
  priority: "low" | "medium" | "high" | "urgent"
  date: string
  time: string
  duration: number
  timezone: string
  location?: string
  videoMeeting?: VideoMeeting
  interviewers: Array<{
    id: string
    name: string
    email: string
    role: string
    avatar?: string
    isLead?: boolean
  }>
  notes?: string
  feedback?: Array<{
    id: string
    interviewer: string
    rating: number
    comments: string
    timestamp: string
    categories: {
      technical: number
      communication: number
      cultural: number
      experience: number
    }
  }>
  documents?: Array<{
    id: string
    name: string
    type: string
    url: string
    uploadedBy: string
    uploadedAt: string
  }>
  recordingUrl?: string
  transcriptUrl?: string
  aiInsights?: {
    overallScore: number
    strengths: string[]
    concerns: string[]
    recommendation: "strong-hire" | "hire" | "no-hire" | "borderline"
    keyMoments: Array<{
      timestamp: string
      description: string
      importance: "high" | "medium" | "low"
    }>
  }
  followUpTasks?: Array<{
    id: string
    task: string
    assignee: string
    dueDate: string
    completed: boolean
  }>
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface VideoPlatformConfig {
  name: "zoom" | "teams" | "webex" | "meet"
  displayName: string
  apiKey?: string
  apiSecret?: string
  enabled: boolean
  features: string[]
  webhookUrl?: string
  settings: {
    autoRecord: boolean
    autoTranscribe: boolean
    waitingRoom: boolean
    muteOnEntry: boolean
    allowScreenShare: boolean
    chatEnabled: boolean
  }
}

export default function InterviewManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "kanban">("calendar")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [showNewInterviewDialog, setShowNewInterviewDialog] = useState(false)
  const [showVideoSettingsDialog, setShowVideoSettingsDialog] = useState(false)
  const [showLiveInterviewDialog, setShowLiveInterviewDialog] = useState(false)
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [currentMeeting, setCurrentMeeting] = useState<VideoMeeting | null>(null)

  // Video platform configurations
  const [videoPlatforms, setVideoPlatforms] = useState<VideoPlatformConfig[]>([
    {
      name: "zoom",
      displayName: "Zoom",
      apiKey: process.env.ZOOM_API_KEY || "",
      enabled: true,
      features: ["Screen Share", "Recording", "Breakout Rooms", "Waiting Room", "Chat", "Polls"],
      settings: {
        autoRecord: true,
        autoTranscribe: true,
        waitingRoom: true,
        muteOnEntry: true,
        allowScreenShare: true,
        chatEnabled: true,
      },
    },
    {
      name: "teams",
      displayName: "Microsoft Teams",
      apiKey: process.env.TEAMS_API_KEY || "",
      enabled: true,
      features: ["Screen Share", "Recording", "Chat", "File Sharing", "Whiteboard", "Live Captions"],
      settings: {
        autoRecord: true,
        autoTranscribe: true,
        waitingRoom: false,
        muteOnEntry: true,
        allowScreenShare: true,
        chatEnabled: true,
      },
    },
    {
      name: "webex",
      displayName: "Cisco Webex",
      apiKey: process.env.WEBEX_API_KEY || "",
      enabled: true,
      features: ["Screen Share", "Recording", "Whiteboard", "Breakout Sessions", "Polls", "Q&A"],
      settings: {
        autoRecord: true,
        autoTranscribe: true,
        waitingRoom: true,
        muteOnEntry: true,
        allowScreenShare: true,
        chatEnabled: true,
      },
    },
    {
      name: "meet",
      displayName: "Google Meet",
      apiKey: process.env.GOOGLE_MEET_API_KEY || "",
      enabled: true,
      features: ["Screen Share", "Recording", "Live Captions", "Polls", "Q&A", "Jamboard"],
      settings: {
        autoRecord: false,
        autoTranscribe: true,
        waitingRoom: false,
        muteOnEntry: false,
        allowScreenShare: true,
        chatEnabled: true,
      },
    },
  ])

  // Mock data with video meetings
  const mockInterviews: Interview[] = [
    {
      id: "1",
      candidateName: "Sarah Johnson",
      candidateEmail: "sarah.johnson@email.com",
      candidatePhone: "+1 (555) 123-4567",
      candidateAvatar: "/placeholder-user.jpg",
      position: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      interviewType: "video",
      status: "scheduled",
      priority: "high",
      date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
      time: "10:00",
      duration: 60,
      timezone: "EST",
      videoMeeting: {
        id: "zoom-1",
        platform: "zoom",
        meetingId: "123-456-789",
        meetingUrl: "https://zoom.us/j/123456789?pwd=abc123",
        password: "interview123",
        waitingRoom: true,
        recording: true,
        transcription: true,
        createdAt: "2024-01-15T09:00:00Z",
        status: "scheduled",
      },
      interviewers: [
        {
          id: "1",
          name: "John Smith",
          email: "john.smith@company.com",
          role: "Engineering Manager",
          avatar: "/placeholder-user.jpg",
          isLead: true,
        },
        {
          id: "2",
          name: "Emily Davis",
          email: "emily.davis@company.com",
          role: "Senior Developer",
          avatar: "/placeholder-user.jpg",
        },
      ],
      notes: "Technical interview focusing on React and TypeScript. Screen sharing enabled for coding exercise.",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      createdBy: "recruiter1",
    },
    {
      id: "2",
      candidateName: "Michael Chen",
      candidateEmail: "michael.chen@email.com",
      candidatePhone: "+1 (555) 987-6543",
      position: "Product Manager",
      company: "StartupXYZ",
      interviewType: "video",
      status: "in-progress",
      priority: "medium",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "14:00",
      duration: 90,
      timezone: "PST",
      videoMeeting: {
        id: "teams-1",
        platform: "teams",
        meetingId: "teams-meeting-123",
        meetingUrl: "https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc123",
        waitingRoom: false,
        recording: true,
        transcription: true,
        createdAt: "2024-01-15T13:00:00Z",
        status: "active",
      },
      interviewers: [
        {
          id: "3",
          name: "Lisa Wang",
          email: "lisa.wang@company.com",
          role: "VP Product",
          isLead: true,
        },
        {
          id: "4",
          name: "David Brown",
          email: "david.brown@company.com",
          role: "UX Director",
        },
      ],
      feedback: [
        {
          id: "1",
          interviewer: "Lisa Wang",
          rating: 4,
          comments: "Strong product sense and communication skills. Good strategic thinking.",
          timestamp: "2024-01-15T15:30:00Z",
          categories: {
            technical: 4,
            communication: 5,
            cultural: 4,
            experience: 4,
          },
        },
      ],
      aiInsights: {
        overallScore: 85,
        strengths: ["Strategic thinking", "Communication", "Product vision"],
        concerns: ["Limited technical background", "Needs more data analysis experience"],
        recommendation: "hire",
        keyMoments: [
          {
            timestamp: "00:15:30",
            description: "Excellent explanation of product strategy framework",
            importance: "high",
          },
          {
            timestamp: "00:45:20",
            description: "Struggled with technical implementation details",
            importance: "medium",
          },
        ],
      },
      createdAt: "2024-01-14T09:00:00Z",
      updatedAt: "2024-01-15T15:30:00Z",
      createdBy: "recruiter2",
    },
    {
      id: "3",
      candidateName: "Alex Rodriguez",
      candidateEmail: "alex.rodriguez@email.com",
      candidatePhone: "+1 (555) 456-7890",
      position: "Data Scientist",
      company: "DataTech Solutions",
      interviewType: "video",
      status: "completed",
      priority: "urgent",
      date: format(addDays(new Date(), -1), "yyyy-MM-dd"),
      time: "16:00",
      duration: 120,
      timezone: "EST",
      videoMeeting: {
        id: "webex-1",
        platform: "webex",
        meetingId: "webex-123-456-789",
        meetingUrl: "https://company.webex.com/meet/interview123",
        password: "DataSci2024",
        waitingRoom: true,
        recording: true,
        transcription: true,
        createdAt: "2024-01-14T15:00:00Z",
        status: "ended",
      },
      recordingUrl: "https://recordings.webex.com/interview-alex-rodriguez-20240114",
      transcriptUrl: "https://transcripts.webex.com/interview-alex-rodriguez-20240114.txt",
      interviewers: [
        {
          id: "5",
          name: "Dr. Jennifer Lee",
          email: "jennifer.lee@company.com",
          role: "Lead Data Scientist",
          isLead: true,
        },
      ],
      notes: "Technical deep-dive on machine learning algorithms and Python. Whiteboard session included.",
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T16:00:00Z",
      createdBy: "recruiter1",
    },
  ]

  // Statistics
  const interviewStats = {
    total: mockInterviews.length,
    scheduled: mockInterviews.filter((i) => i.status === "scheduled").length,
    completed: mockInterviews.filter((i) => i.status === "completed").length,
    inProgress: mockInterviews.filter((i) => i.status === "in-progress").length,
    cancelled: mockInterviews.filter((i) => i.status === "cancelled").length,
    averageRating: 4.2,
    completionRate: 85,
    noShowRate: 5,
    videoInterviews: mockInterviews.filter((i) => i.interviewType === "video").length,
    recordedInterviews: mockInterviews.filter((i) => i.recordingUrl).length,
  }

  // Filter interviews
  const filteredInterviews = mockInterviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || interview.status === filterStatus
    const matchesType = filterType === "all" || interview.interviewType === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  // Get interviews for selected date
  const selectedDateInterviews = filteredInterviews.filter((interview) =>
    isSameDay(parseISO(interview.date), selectedDate),
  )

  // Calendar view helpers
  const weekStart = startOfWeek(selectedDate)
  const weekEnd = endOfWeek(selectedDate)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getInterviewsForDate = (date: Date) => {
    return filteredInterviews.filter((interview) => isSameDay(parseISO(interview.date), date))
  }

  // Video meeting functions
  const createVideoMeeting = async (platform: string, interviewData: any): Promise<VideoMeeting> => {
    const platformConfig = videoPlatforms.find((p) => p.name === platform)
    if (!platformConfig) throw new Error("Platform not configured")

    // Simulate API call to create meeting
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const meetingUrls = {
      zoom: `https://zoom.us/j/${Math.random().toString().substr(2, 10)}?pwd=${Math.random().toString(36).substr(2, 8)}`,
      teams: `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${Math.random().toString(36).substr(2, 20)}`,
      webex: `https://company.webex.com/meet/${Math.random().toString(36).substr(2, 15)}`,
      meet: `https://meet.google.com/${Math.random().toString(36).substr(2, 10)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 3)}`,
    }

    return {
      id: `${platform}-${Date.now()}`,
      platform: platform as any,
      meetingId: Math.random().toString().substr(2, 10),
      meetingUrl: meetingUrls[platform as keyof typeof meetingUrls],
      password: platform === "zoom" || platform === "webex" ? Math.random().toString(36).substr(2, 8) : undefined,
      waitingRoom: platformConfig.settings.waitingRoom,
      recording: platformConfig.settings.autoRecord,
      transcription: platformConfig.settings.autoTranscribe,
      createdAt: new Date().toISOString(),
      status: "scheduled",
    }
  }

  const joinVideoMeeting = (meeting: VideoMeeting) => {
    window.open(meeting.meetingUrl, "_blank")
    setCurrentMeeting(meeting)
    setShowLiveInterviewDialog(true)
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    // Start recording timer
    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-purple-100 text-purple-800"
      case "no-show":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "phone":
        return <Phone className="w-4 h-4" />
      case "in-person":
        return <MapPin className="w-4 h-4" />
      case "panel":
        return <Users className="w-4 h-4" />
      case "technical":
        return <Brain className="w-4 h-4" />
      case "behavioral":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <CalendarIcon className="w-4 h-4" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "zoom":
        return <Video className="w-4 h-4 text-blue-600" />
      case "teams":
        return <Video className="w-4 h-4 text-purple-600" />
      case "webex":
        return <Video className="w-4 h-4 text-green-600" />
      case "meet":
        return <Video className="w-4 h-4 text-red-600" />
      default:
        return <Video className="w-4 h-4" />
    }
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{interviewStats.total}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Video Interviews</p>
                <p className="text-2xl font-bold text-purple-600">{interviewStats.videoInterviews}</p>
              </div>
              <Video className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recorded</p>
                <p className="text-2xl font-bold text-red-600">{interviewStats.recordedInterviews}</p>
              </div>
              <Play className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{interviewStats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-green-600">{interviewStats.averageRating}</p>
              </div>
              <Star className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Platform Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>Video Platform Status</span>
          </CardTitle>
          <CardDescription>Current status of integrated video platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {videoPlatforms.map((platform) => (
              <div
                key={platform.name}
                className={`p-4 rounded-lg border-2 ${
                  platform.enabled ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(platform.name)}
                    <span className="font-medium">{platform.displayName}</span>
                  </div>
                  <Badge variant={platform.enabled ? "default" : "secondary"}>
                    {platform.enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>API: {platform.apiKey ? "✓ Configured" : "✗ Not configured"}</div>
                  <div>Features: {platform.features.length} available</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 bg-transparent"
                  onClick={() => setShowVideoSettingsDialog(true)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common interview management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => setShowNewInterviewDialog(true)}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Plus className="w-6 h-6" />
              <span>Schedule Interview</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setActiveTab("live")}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Video className="w-6 h-6" />
              <span>Join Live Interview</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setActiveTab("recordings")}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Play className="w-6 h-6" />
              <span>View Recordings</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowVideoSettingsDialog(true)}
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="w-6 h-6" />
              <span>Platform Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span>Active Interviews</span>
          </CardTitle>
          <CardDescription>Currently in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInterviews
              .filter((i) => i.status === "in-progress")
              .map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={interview.candidateAvatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {interview.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{interview.candidateName}</p>
                      <p className="text-sm text-gray-600">
                        {interview.position} • {interview.videoMeeting?.platform.toUpperCase()}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className="bg-yellow-100 text-yellow-800">Live</Badge>
                        {interview.videoMeeting?.recording && (
                          <Badge variant="outline" className="text-red-600">
                            Recording
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => interview.videoMeeting && joinVideoMeeting(interview.videoMeeting)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedInterview(interview)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            {mockInterviews.filter((i) => i.status === "in-progress").length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No active interviews</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderLiveInterviewTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Live Interview Controls</h3>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
            Live
          </Badge>
          {isRecording && (
            <Badge className="bg-red-100 text-red-800">
              <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse" />
              Recording {formatRecordingTime(recordingTime)}
            </Badge>
          )}
        </div>
      </div>

      {/* Live Interview Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Controls</CardTitle>
          <CardDescription>Manage your live interview session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant={isMuted ? "destructive" : "outline"}
              onClick={toggleMute}
              className="h-16 flex flex-col items-center justify-center space-y-2"
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
            </Button>

            <Button
              variant={!isCameraOn ? "destructive" : "outline"}
              onClick={toggleCamera}
              className="h-16 flex flex-col items-center justify-center space-y-2"
            >
              {isCameraOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              <span className="text-xs">{isCameraOn ? "Stop Video" : "Start Video"}</span>
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "outline"}
              onClick={toggleScreenShare}
              className="h-16 flex flex-col items-center justify-center space-y-2"
            >
              <Monitor className="w-6 h-6" />
              <span className="text-xs">{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
            </Button>

            <Button
              variant={isRecording ? "destructive" : "outline"}
              onClick={isRecording ? stopRecording : startRecording}
              className="h-16 flex flex-col items-center justify-center space-y-2"
            >
              {isRecording ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              <span className="text-xs">{isRecording ? "Stop Recording" : "Start Recording"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Interviews for Live Control */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Currently running interview sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInterviews
              .filter((i) => i.status === "in-progress")
              .map((interview) => (
                <div key={interview.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={interview.candidateAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {interview.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-lg">{interview.candidateName}</h4>
                        <p className="text-gray-600">{interview.position}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getPlatformIcon(interview.videoMeeting?.platform || "zoom")}
                          <span className="text-sm text-gray-500">
                            {interview.videoMeeting?.platform.toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {interview.duration} min
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => interview.videoMeeting && joinVideoMeeting(interview.videoMeeting)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Meeting
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Meeting Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            View Notes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Meeting ID:</span>
                      <p className="font-mono">{interview.videoMeeting?.meetingId}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Password:</span>
                      <p className="font-mono">{interview.videoMeeting?.password || "None"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Recording:</span>
                      <p>{interview.videoMeeting?.recording ? "Enabled" : "Disabled"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transcription:</span>
                      <p>{interview.videoMeeting?.transcription ? "Enabled" : "Disabled"}</p>
                    </div>
                  </div>

                  {/* Interviewers */}
                  <div className="mt-4">
                    <span className="text-sm text-gray-600 mb-2 block">Interviewers:</span>
                    <div className="flex items-center space-x-2">
                      {interview.interviewers.map((interviewer) => (
                        <div
                          key={interviewer.id}
                          className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full"
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {interviewer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{interviewer.name}</span>
                          {interviewer.isLead && (
                            <Badge variant="secondary" className="text-xs">
                              Lead
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRecordingsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Interview Recordings</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recorded Interviews</CardTitle>
          <CardDescription>Access recordings and transcripts from completed interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockInterviews
              .filter((i) => i.recordingUrl)
              .map((interview) => (
                <div key={interview.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{interview.candidateName}</h4>
                        <p className="text-sm text-gray-600">
                          {interview.position} • {format(parseISO(interview.date), "MMM dd, yyyy")}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getPlatformIcon(interview.videoMeeting?.platform || "zoom")}
                          <span className="text-xs text-gray-500">
                            {interview.videoMeeting?.platform.toUpperCase()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {interview.duration} min
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </Button>
                      {interview.transcriptUrl && (
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          Transcript
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Share Recording
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Brain className="w-4 h-4 mr-2" />
                            AI Analysis
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* AI Insights Preview */}
                  {interview.aiInsights && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">AI Analysis</span>
                        </div>
                        <Badge
                          className={
                            interview.aiInsights.recommendation === "strong-hire"
                              ? "bg-green-100 text-green-800"
                              : interview.aiInsights.recommendation === "hire"
                                ? "bg-blue-100 text-blue-800"
                                : interview.aiInsights.recommendation === "borderline"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }
                        >
                          {interview.aiInsights.recommendation.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div>
                          <span className="text-gray-600">Overall Score:</span>
                          <span className="font-semibold ml-1">{interview.aiInsights.overallScore}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Key Moments:</span>
                          <span className="font-semibold ml-1">{interview.aiInsights.keyMoments.length}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Management</h2>
          <p className="text-gray-600">Complete video interview platform with Zoom, Teams, and Webex integration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowVideoSettingsDialog(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Platform Settings
          </Button>
          <Button onClick={() => setShowNewInterviewDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search interviews, candidates, positions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                  <SelectItem value="panel">Panel</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="live">Live Control</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="legacy">Legacy Views</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="ai-scheduler">AI Scheduler</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="live" className="mt-6">
          {renderLiveInterviewTab()}
        </TabsContent>

        <TabsContent value="recordings" className="mt-6">
          {renderRecordingsTab()}
        </TabsContent>

        <TabsContent value="legacy" className="mt-6">
          <AddedInterviews />
        </TabsContent>

        <TabsContent value="integration" className="mt-6">
          <InterviewIntegration
            candidates={mockInterviews.map((i) => ({
              id: i.id,
              name: i.candidateName,
              position: i.position,
              stage: i.status,
              aiScore: i.aiInsights?.overallScore || 75,
              aiVerdict:
                i.aiInsights?.recommendation === "strong-hire" || i.aiInsights?.recommendation === "hire"
                  ? "recommended"
                  : i.aiInsights?.recommendation === "borderline"
                    ? "maybe"
                    : "not-recommended",
              skills: ["React", "TypeScript", "Node.js"],
              experience: 5,
            }))}
            onScheduleInterview={(candidateId) => {
              console.log("Schedule interview for candidate:", candidateId)
              setShowNewInterviewDialog(true)
            }}
          />
        </TabsContent>

        <TabsContent value="ai-scheduler" className="mt-6">
          <AIInterviewScheduler />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-blue-600" />
                  <span>Video Platform Configuration</span>
                </CardTitle>
                <CardDescription>Configure video meeting platforms and their settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {videoPlatforms.map((platform) => (
                  <div key={platform.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(platform.name)}
                        <div>
                          <h4 className="font-semibold">{platform.displayName}</h4>
                          <p className="text-sm text-gray-600">{platform.features.length} features available</p>
                        </div>
                      </div>
                      <Switch
                        checked={platform.enabled}
                        onCheckedChange={(enabled) => {
                          setVideoPlatforms(
                            videoPlatforms.map((p) => (p.name === platform.name ? { ...p, enabled } : p)),
                          )
                        }}
                      />
                    </div>

                    {platform.enabled && (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm">API Configuration</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              type="password"
                              placeholder="API Key"
                              value={platform.apiKey}
                              onChange={(e) => {
                                setVideoPlatforms(
                                  videoPlatforms.map((p) =>
                                    p.name === platform.name ? { ...p, apiKey: e.target.value } : p,
                                  ),
                                )
                              }}
                            />
                            <Badge variant={platform.apiKey ? "default" : "secondary"}>
                              {platform.apiKey ? "Configured" : "Not Set"}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Auto Record</Label>
                            <Switch
                              checked={platform.settings.autoRecord}
                              onCheckedChange={(autoRecord) => {
                                setVideoPlatforms(
                                  videoPlatforms.map((p) =>
                                    p.name === platform.name ? { ...p, settings: { ...p.settings, autoRecord } } : p,
                                  ),
                                )
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Auto Transcribe</Label>
                            <Switch
                              checked={platform.settings.autoTranscribe}
                              onCheckedChange={(autoTranscribe) => {
                                setVideoPlatforms(
                                  videoPlatforms.map((p) =>
                                    p.name === platform.name
                                      ? { ...p, settings: { ...p.settings, autoTranscribe } }
                                      : p,
                                  ),
                                )
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Waiting Room</Label>
                            <Switch
                              checked={platform.settings.waitingRoom}
                              onCheckedChange={(waitingRoom) => {
                                setVideoPlatforms(
                                  videoPlatforms.map((p) =>
                                    p.name === platform.name ? { ...p, settings: { ...p.settings, waitingRoom } } : p,
                                  ),
                                )
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Mute on Entry</Label>
                            <Switch
                              checked={platform.settings.muteOnEntry}
                              onCheckedChange={(muteOnEntry) => {
                                setVideoPlatforms(
                                  videoPlatforms.map((p) =>
                                    p.name === platform.name ? { ...p, settings: { ...p.settings, muteOnEntry } } : p,
                                  ),
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm mb-2 block">Available Features</Label>
                          <div className="flex flex-wrap gap-1">
                            {platform.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>General Settings</span>
                </CardTitle>
                <CardDescription>Configure general interview management settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-600 mt-1">Send email reminders for upcoming interviews</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Calendar Integration</Label>
                    <p className="text-sm text-gray-600 mt-1">Sync interviews with external calendars</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">AI Analysis</Label>
                    <p className="text-sm text-gray-600 mt-1">Enable AI-powered interview analysis</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Auto-Archive Recordings</Label>
                    <p className="text-sm text-gray-600 mt-1">Automatically archive recordings after 90 days</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label>Default Interview Duration</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Video Platform</Label>
                  <Select defaultValue="zoom">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zoom">Zoom</SelectItem>
                      <SelectItem value="teams">Microsoft Teams</SelectItem>
                      <SelectItem value="webex">Cisco Webex</SelectItem>
                      <SelectItem value="meet">Google Meet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Settings Dialog */}
      <Dialog open={showVideoSettingsDialog} onOpenChange={setShowVideoSettingsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Platform Settings</DialogTitle>
            <DialogDescription>Configure your video meeting platforms and their settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {videoPlatforms.map((platform) => (
              <Card key={platform.name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(platform.name)}
                      <span>{platform.displayName}</span>
                    </div>
                    <Switch
                      checked={platform.enabled}
                      onCheckedChange={(enabled) => {
                        setVideoPlatforms(videoPlatforms.map((p) => (p.name === platform.name ? { ...p, enabled } : p)))
                      }}
                    />
                  </CardTitle>
                </CardHeader>
                {platform.enabled && (
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          placeholder="Enter API key"
                          value={platform.apiKey}
                          onChange={(e) => {
                            setVideoPlatforms(
                              videoPlatforms.map((p) =>
                                p.name === platform.name ? { ...p, apiKey: e.target.value } : p,
                              ),
                            )
                          }}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={platform.apiKey ? "default" : "secondary"}>
                            {platform.apiKey ? "Configured" : "Not Configured"}
                          </Badge>
                          {platform.apiKey && (
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Test
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Auto Record</Label>
                        <Switch
                          checked={platform.settings.autoRecord}
                          onCheckedChange={(autoRecord) => {
                            setVideoPlatforms(
                              videoPlatforms.map((p) =>
                                p.name === platform.name ? { ...p, settings: { ...p.settings, autoRecord } } : p,
                              ),
                            )
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto Transcribe</Label>
                        <Switch
                          checked={platform.settings.autoTranscribe}
                          onCheckedChange={(autoTranscribe) => {
                            setVideoPlatforms(
                              videoPlatforms.map((p) =>
                                p.name === platform.name ? { ...p, settings: { ...p.settings, autoTranscribe } } : p,
                              ),
                            )
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Waiting Room</Label>
                        <Switch
                          checked={platform.settings.waitingRoom}
                          onCheckedChange={(waitingRoom) => {
                            setVideoPlatforms(
                              videoPlatforms.map((p) =>
                                p.name === platform.name ? { ...p, settings: { ...p.settings, waitingRoom } } : p,
                              ),
                            )
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Mute on Entry</Label>
                        <Switch
                          checked={platform.settings.muteOnEntry}
                          onCheckedChange={(muteOnEntry) => {
                            setVideoPlatforms(
                              videoPlatforms.map((p) =>
                                p.name === platform.name ? { ...p, settings: { ...p.settings, muteOnEntry } } : p,
                              ),
                            )
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Available Features</Label>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVideoSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowVideoSettingsDialog(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Interview Dialog */}
      <Dialog open={showNewInterviewDialog} onOpenChange={setShowNewInterviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Video Interview</DialogTitle>
            <DialogDescription>Create a new video interview with integrated platform support</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidate-name">Candidate Name</Label>
                <Input id="candidate-name" placeholder="Enter candidate name" />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input id="position" placeholder="Enter position" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview-date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="interview-time">Time</Label>
                <Input id="interview-time" type="time" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interview-type">Interview Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In Person</SelectItem>
                    <SelectItem value="panel">Panel Interview</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="video-platform">Video Platform</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {videoPlatforms
                    .filter((p) => p.enabled)
                    .map((platform) => (
                      <SelectItem key={platform.name} value={platform.name}>
                        <div className="flex items-center space-x-2">
                          {getPlatformIcon(platform.name)}
                          <span>{platform.displayName}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-record" />
                <Label htmlFor="auto-record">Auto Record</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-transcribe" />
                <Label htmlFor="auto-transcribe">Auto Transcribe</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Add any additional notes..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewInterviewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowNewInterviewDialog(false)}>
              <Video className="w-4 h-4 mr-2" />
              Schedule Video Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Interview Dialog */}
      <Dialog open={showLiveInterviewDialog} onOpenChange={setShowLiveInterviewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Live Interview Controls</DialogTitle>
            <DialogDescription>Control your active interview session</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {currentMeeting && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {getPlatformIcon(currentMeeting.platform)}
                  <span className="font-medium">{currentMeeting.platform.toUpperCase()}</span>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <p className="text-sm text-gray-600">Meeting ID: {currentMeeting.meetingId}</p>
                {currentMeeting.password && (
                  <p className="text-sm text-gray-600">Password: {currentMeeting.password}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                onClick={toggleMute}
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>

              <Button
                variant={!isCameraOn ? "destructive" : "outline"}
                onClick={toggleCamera}
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                {isCameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                <span className="text-xs">{isCameraOn ? "Stop Video" : "Start Video"}</span>
              </Button>

              <Button
                variant={isScreenSharing ? "default" : "outline"}
                onClick={toggleScreenShare}
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                <Monitor className="w-5 h-5" />
                <span className="text-xs">{isScreenSharing ? "Stop Share" : "Share Screen"}</span>
              </Button>

              <Button
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopRecording : startRecording}
                className="h-16 flex flex-col items-center justify-center space-y-1"
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span className="text-xs">{isRecording ? "Stop Recording" : "Start Recording"}</span>
              </Button>
            </div>

            {isRecording && (
              <div className="flex items-center justify-center space-x-2 p-3 bg-red-50 rounded-lg">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-700">
                  Recording: {formatRecordingTime(recordingTime)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLiveInterviewDialog(false)}>
              Minimize
            </Button>
            <Button variant="destructive">
              <PhoneCall className="w-4 h-4 mr-2" />
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
