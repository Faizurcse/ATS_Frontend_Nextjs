"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  Users,
  DollarSign,
  Briefcase,
  User,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Globe,
  Star,
  TrendingUp,
} from "lucide-react"
import { formatDate } from "../../lib/date-utils"
import { DateFilter } from "@/components/date-filter"

interface Customer {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  industry: string
  companySize: string
  website: string
  internalSPOC: string
  status: "active" | "inactive" | "prospect" | "churned"
  priority: "high" | "medium" | "low"
  contractValue: number
  startDate: string
  lastActivity: string
  notes: string
  jobPostings: number
  activeCandidates: number
  hiredCandidates: number
  tags: string[]
}

interface FormErrors {
  companyName?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  internalSPOC?: string
  website?: string
  contractValue?: string
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      companyName: "TechCorp Inc.",
      contactPerson: "John Smith",
      email: "john.smith@techcorp.com",
      phone: "+1-555-0123",
      address: "123 Tech Street",
      city: "San Francisco",
      country: "United States",
      industry: "Technology",
      companySize: "1000-5000",
      website: "https://techcorp.com",
      internalSPOC: "Sarah Wilson",
      status: "active",
      priority: "high",
      contractValue: 250000,
      startDate: "2024-01-15",
      lastActivity: "2024-01-20T10:30:00Z",
      notes: "Key client with multiple ongoing projects. Excellent relationship.",
      jobPostings: 12,
      activeCandidates: 45,
      hiredCandidates: 8,
      tags: ["Enterprise", "Long-term", "High-value"],
    },
    {
      id: "2",
      companyName: "StartupXYZ",
      contactPerson: "Jane Doe",
      email: "jane.doe@startupxyz.com",
      phone: "+1-555-0124",
      address: "456 Innovation Ave",
      city: "Austin",
      country: "United States",
      industry: "Fintech",
      companySize: "50-200",
      website: "https://startupxyz.com",
      internalSPOC: "Mike Johnson",
      status: "active",
      priority: "medium",
      contractValue: 75000,
      startDate: "2024-02-01",
      lastActivity: "2024-01-19T14:15:00Z",
      notes: "Fast-growing startup with aggressive hiring plans.",
      jobPostings: 6,
      activeCandidates: 23,
      hiredCandidates: 3,
      tags: ["Startup", "Growth", "Agile"],
    },
    {
      id: "3",
      companyName: "DataFlow Solutions",
      contactPerson: "Mike Wilson",
      email: "mike.wilson@dataflow.com",
      phone: "+1-555-0125",
      address: "789 Data Drive",
      city: "Seattle",
      country: "United States",
      industry: "Analytics",
      companySize: "200-1000",
      website: "https://dataflow.com",
      internalSPOC: "Emily Chen",
      status: "prospect",
      priority: "medium",
      contractValue: 120000,
      startDate: "2024-03-01",
      lastActivity: "2024-01-18T09:45:00Z",
      notes: "Potential client interested in data science roles.",
      jobPostings: 4,
      activeCandidates: 15,
      hiredCandidates: 1,
      tags: ["Data", "Analytics", "Potential"],
    },
    {
      id: "4",
      companyName: "Global Enterprises",
      contactPerson: "Sarah Johnson",
      email: "sarah.johnson@global.com",
      phone: "+1-555-0126",
      address: "321 Corporate Blvd",
      city: "New York",
      country: "United States",
      industry: "Consulting",
      companySize: "5000+",
      website: "https://globalenterprises.com",
      internalSPOC: "David Brown",
      status: "active",
      priority: "high",
      contractValue: 500000,
      startDate: "2023-12-01",
      lastActivity: "2024-01-21T16:20:00Z",
      notes: "Major enterprise client with global presence.",
      jobPostings: 25,
      activeCandidates: 78,
      hiredCandidates: 15,
      tags: ["Enterprise", "Global", "Strategic"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Debug state for troubleshooting
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${info}`])
  }

  const [newCustomer, setNewCustomer] = useState<Omit<Customer, "id">>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    industry: "",
    companySize: "",
    website: "",
    internalSPOC: "",
    status: "prospect",
    priority: "medium",
    contractValue: 0,
    startDate: new Date().toISOString().split("T")[0],
    lastActivity: new Date().toISOString(),
    notes: "",
    jobPostings: 0,
    activeCandidates: 0,
    hiredCandidates: 0,
    tags: [],
  })

  // Get unique values for filters
  const industries = [...new Set(customers.map((c) => c.industry))].filter(Boolean)
  const statuses = ["active", "inactive", "prospect", "churned"]
  const priorities = ["high", "medium", "low"]

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        !searchTerm ||
        customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.internalSPOC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.industry.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      const matchesPriority = priorityFilter === "all" || customer.priority === priorityFilter
      const matchesIndustry = industryFilter === "all" || customer.industry === industryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesIndustry
    })
  }, [customers, searchTerm, statusFilter, priorityFilter, industryFilter])

  // Form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!newCustomer.companyName.trim()) {
      errors.companyName = "Company name is required"
    }

    if (!newCustomer.contactPerson.trim()) {
      errors.contactPerson = "Contact person is required"
    }

    if (!newCustomer.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!newCustomer.phone.trim()) {
      errors.phone = "Phone number is required"
    }

    if (!newCustomer.address.trim()) {
      errors.address = "Address is required"
    }

    if (!newCustomer.internalSPOC.trim()) {
      errors.internalSPOC = "Internal SPOC is required"
    } else if (newCustomer.internalSPOC.length < 2) {
      errors.internalSPOC = "Internal SPOC must be at least 2 characters"
    } else if (!/^[a-zA-Z\s.'-]+$/.test(newCustomer.internalSPOC)) {
      errors.internalSPOC = "Internal SPOC can only contain letters, spaces, periods, apostrophes, and hyphens"
    }

    if (newCustomer.website && !/^https?:\/\/.+/.test(newCustomer.website)) {
      errors.website = "Please enter a valid website URL (starting with http:// or https://)"
    }

    if (newCustomer.contractValue < 0) {
      errors.contractValue = "Contract value cannot be negative"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Dialog handlers with comprehensive error handling
  const handleDialogOpen = () => {
    try {
      addDebugInfo("Attempting to open dialog")
      setFormErrors({})
      setIsAddDialogOpen(true)
      addDebugInfo("Dialog open state set to true")
    } catch (error) {
      addDebugInfo(`Error opening dialog: ${error}`)
      console.error("Error opening dialog:", error)
    }
  }

  const handleDialogClose = () => {
    try {
      addDebugInfo("Closing dialog")
      setIsAddDialogOpen(false)
      setFormErrors({})
      setNewCustomer({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        industry: "",
        companySize: "",
        website: "",
        internalSPOC: "",
        status: "prospect",
        priority: "medium",
        contractValue: 0,
        startDate: new Date().toISOString().split("T")[0],
        lastActivity: new Date().toISOString(),
        notes: "",
        jobPostings: 0,
        activeCandidates: 0,
        hiredCandidates: 0,
        tags: [],
      })
      addDebugInfo("Dialog closed and form reset")
    } catch (error) {
      addDebugInfo(`Error closing dialog: ${error}`)
      console.error("Error closing dialog:", error)
    }
  }

  const handleSubmit = async () => {
    try {
      addDebugInfo("Starting form submission")

      if (!validateForm()) {
        addDebugInfo("Form validation failed")
        return
      }

      setIsLoading(true)
      addDebugInfo("Form validation passed, creating customer")

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const customer: Customer = {
        ...newCustomer,
        id: Date.now().toString(),
        lastActivity: new Date().toISOString(),
      }

      setCustomers((prev) => [...prev, customer])
      addDebugInfo("Customer added successfully")
      handleDialogClose()
    } catch (error) {
      addDebugInfo(`Error submitting form: ${error}`)
      console.error("Error adding customer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "prospect":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "churned":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityStatus = (lastActivity: string) => {
    const now = new Date()
    const activity = new Date(lastActivity)
    const diffInHours = (now.getTime() - activity.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) return { text: "Active today", color: "text-green-600" }
    if (diffInHours < 168) return { text: "Active this week", color: "text-blue-600" }
    if (diffInHours < 720) return { text: "Active this month", color: "text-yellow-600" }
    return { text: "Inactive", color: "text-red-600" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">Manage your client relationships and track business opportunities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          {/* Primary Add Customer Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleDialogOpen}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer profile with complete business information and internal contact details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter company name"
                        value={newCustomer.companyName}
                        onChange={(e) => {
                          setNewCustomer((prev) => ({ ...prev, companyName: e.target.value }))
                          if (formErrors.companyName) {
                            setFormErrors((prev) => ({ ...prev, companyName: undefined }))
                          }
                        }}
                        className={formErrors.companyName ? "border-red-500" : ""}
                      />
                      {formErrors.companyName && (
                        <div className="flex items-center space-x-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.companyName}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter contact person name"
                        value={newCustomer.contactPerson}
                        onChange={(e) => {
                          setNewCustomer((prev) => ({ ...prev, contactPerson: e.target.value }))
                          if (formErrors.contactPerson) {
                            setFormErrors((prev) => ({ ...prev, contactPerson: undefined }))
                          }
                        }}
                        className={formErrors.contactPerson ? "border-red-500" : ""}
                      />
                      {formErrors.contactPerson && (
                        <div className="flex items-center space-x-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.contactPerson}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Internal SPOC <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter internal Single Point of Contact"
                      value={newCustomer.internalSPOC}
                      onChange={(e) => {
                        setNewCustomer((prev) => ({ ...prev, internalSPOC: e.target.value }))
                        if (formErrors.internalSPOC) {
                          setFormErrors((prev) => ({ ...prev, internalSPOC: undefined }))
                        }
                      }}
                      className={formErrors.internalSPOC ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-gray-500">
                      The internal team member responsible for this customer relationship
                    </p>
                    {formErrors.internalSPOC && (
                      <div className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.internalSPOC}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={newCustomer.email}
                        onChange={(e) => {
                          setNewCustomer((prev) => ({ ...prev, email: e.target.value }))
                          if (formErrors.email) {
                            setFormErrors((prev) => ({ ...prev, email: undefined }))
                          }
                        }}
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                      {formErrors.email && (
                        <div className="flex items-center space-x-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Enter phone number"
                        value={newCustomer.phone}
                        onChange={(e) => {
                          setNewCustomer((prev) => ({ ...prev, phone: e.target.value }))
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: undefined }))
                          }
                        }}
                        className={formErrors.phone ? "border-red-500" : ""}
                      />
                      {formErrors.phone && (
                        <div className="flex items-center space-x-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter company address"
                      value={newCustomer.address}
                      onChange={(e) => {
                        setNewCustomer((prev) => ({ ...prev, address: e.target.value }))
                        if (formErrors.address) {
                          setFormErrors((prev) => ({ ...prev, address: undefined }))
                        }
                      }}
                      className={formErrors.address ? "border-red-500" : ""}
                    />
                    {formErrors.address && (
                      <div className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">City</label>
                      <Input
                        placeholder="Enter city"
                        value={newCustomer.city}
                        onChange={(e) => setNewCustomer((prev) => ({ ...prev, city: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Country</label>
                      <Input
                        placeholder="Enter country"
                        value={newCustomer.country}
                        onChange={(e) => setNewCustomer((prev) => ({ ...prev, country: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Website</label>
                    <Input
                      placeholder="https://company.com"
                      value={newCustomer.website}
                      onChange={(e) => {
                        setNewCustomer((prev) => ({ ...prev, website: e.target.value }))
                        if (formErrors.website) {
                          setFormErrors((prev) => ({ ...prev, website: undefined }))
                        }
                      }}
                      className={formErrors.website ? "border-red-500" : ""}
                    />
                    {formErrors.website && (
                      <div className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{formErrors.website}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Industry</label>
                      <Select
                        value={newCustomer.industry}
                        onValueChange={(value) => setNewCustomer((prev) => ({ ...prev, industry: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Consulting">Consulting</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Company Size</label>
                      <Select
                        value={newCustomer.companySize}
                        onValueChange={(value) => setNewCustomer((prev) => ({ ...prev, companySize: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-1000">201-1000 employees</SelectItem>
                          <SelectItem value="1001-5000">1001-5000 employees</SelectItem>
                          <SelectItem value="5000+">5000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <Select
                        value={newCustomer.status}
                        onValueChange={(value: any) => setNewCustomer((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <Select
                        value={newCustomer.priority}
                        onValueChange={(value: any) => setNewCustomer((prev) => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Contract Value ($)</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newCustomer.contractValue}
                        onChange={(e) => {
                          setNewCustomer((prev) => ({ ...prev, contractValue: Number.parseFloat(e.target.value) || 0 }))
                          if (formErrors.contractValue) {
                            setFormErrors((prev) => ({ ...prev, contractValue: undefined }))
                          }
                        }}
                        className={formErrors.contractValue ? "border-red-500" : ""}
                      />
                      {formErrors.contractValue && (
                        <div className="flex items-center space-x-1 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{formErrors.contractValue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <Textarea
                      placeholder="Add any additional notes about this customer..."
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {/* Fallback button for testing */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      addDebugInfo("Fallback button clicked")
                      setIsAddDialogOpen(true)
                    }}
                  >
                    🔧 Fallback Open
                  </Button>

                  {/* Debug info (only show in development) */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="text-xs text-gray-500">
                      <div>Dialog: {isAddDialogOpen ? "OPEN" : "CLOSED"}</div>
                      <div>Loading: {isLoading ? "YES" : "NO"}</div>
                      <div>Errors: {Object.keys(formErrors).length}</div>
                      {debugInfo.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {debugInfo.map((info, i) => (
                            <div key={i} className="text-xs">
                              {info}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleDialogClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Add Customer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Alternative button for empty state */}
          {customers.length === 0 && (
            <Button variant="outline" onClick={handleDialogOpen}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Customer
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search & Filter</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setPriorityFilter("all")
                setIndustryFilter("all")
                setDateFilter("all")
              }}
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers, contacts, SPOC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DateFilter value={dateFilter} onValueChange={setDateFilter} />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredCustomers.length}</p>
              <p className="text-sm text-gray-600">Total Customers</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredCustomers.filter((c) => c.status === "active").length}
              </p>
              <p className="text-sm text-gray-600">Active Customers</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {filteredCustomers.filter((c) => c.status === "prospect").length}
              </p>
              <p className="text-sm text-gray-600">Prospects</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(filteredCustomers.reduce((sum, c) => sum + c.contractValue, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Contract Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Directory</span>
            <Badge variant="outline">{filteredCustomers.length} customers</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Internal SPOC</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Contract Value</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const activityStatus = getActivityStatus(customer.lastActivity)
                  return (
                    <TableRow key={customer.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
                              {getInitials(customer.companyName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{customer.companyName}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Mail className="w-3 h-3" />
                              <span>{customer.email}</span>
                            </div>
                            {customer.website && (
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Globe className="w-3 h-3" />
                                <a
                                  href={customer.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-blue-600"
                                >
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{customer.contactPerson}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {customer.city}, {customer.country}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-purple-100 rounded">
                            <User className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="font-medium text-purple-700">{customer.internalSPOC}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{customer.industry}</p>
                          <p className="text-sm text-gray-500">{customer.companySize} employees</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(customer.status)}>
                          {customer.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(customer.priority)}>
                          {customer.priority}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(customer.contractValue)}</p>
                          <p className="text-sm text-gray-500">Since {formatDate(customer.startDate)}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className={`text-sm font-medium ${activityStatus.color}`}>{activityStatus.text}</p>
                          <p className="text-xs text-gray-500">{formatDate(customer.lastActivity.split("T")[0])}</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Briefcase className="w-3 h-3 text-gray-400" />
                            <span>{customer.jobPostings} jobs</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Users className="w-3 h-3 text-blue-500" />
                            <span>{customer.activeCandidates} active</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Star className="w-3 h-3 text-green-500" />
                            <span>{customer.hiredCandidates} hired</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 mb-4">
                {customers.length === 0
                  ? "Get started by adding your first customer."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {customers.length === 0 && (
                <Button onClick={handleDialogOpen}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Customer
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
