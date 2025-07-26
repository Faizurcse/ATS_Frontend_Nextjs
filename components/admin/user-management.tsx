"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  UserCheck,
  UserX,
  Activity,
} from "lucide-react"
import { formatDate } from "../../lib/date-utils"
import {
  type User as UserType,
  type Permission,
  type AuditLog,
  DEFAULT_PERMISSIONS,
  ROLE_PERMISSIONS,
  validatePassword,
  generateSecurePassword,
  logAuditAction,
  getCurrentUser,
  hasPermission,
} from "../../lib/auth-utils"

// Add these imports at the top
import UserProfile from "./user-profile"
import OrgChart from "./org-chart"
import { DEPARTMENTS, POSITIONS } from "../../lib/industry-data"

// Safely return the permission id list for a given role or an empty array
const safeRolePermissions = (role: "admin" | "recruiter" | "user") => (ROLE_PERMISSIONS?.[role] ?? []) as string[]

export default function UserManagement() {
  const currentUser = getCurrentUser()
  const [activeTab, setActiveTab] = useState("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false) // Declare setIsEditDialogOpen

  // Add a new state for the selected user
  // Add this after the other useState declarations
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  // Add a new state for the organization view
  // Add this after the other useState declarations
  const [viewMode, setViewMode] = useState<"list" | "org">("list")

  // Update the newUser state to include hierarchical data
  // Find the newUser useState declaration and replace it with:
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "user" as "admin" | "recruiter" | "user",
    department: "none",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    permissions: [] as string[],
    position: "none",
    level: 2,
    managerId: "none",
    teams: [] as string[],
  })

  // Update the mock data to include hierarchical relationships
  // Find the [users, setUsers] useState declaration and replace the users array with this:
  const [users, setUsers] = useState<UserType[]>([
    {
      id: "1",
      username: "admin",
      email: "admin@company.com",
      firstName: "System",
      lastName: "Administrator",
      role: "admin",
      status: "active",
      createdDate: "2023-01-01",
      lastLogin: "2024-01-20",
      permissions: DEFAULT_PERMISSIONS,
      department: "IT",
      phoneNumber: "+1-555-0001",
      position: "Chief Technology Officer",
      level: 0,
      subordinates: ["2", "3"],
      teams: ["Executive", "IT Management"],
    },
    {
      id: "2",
      username: "swilson",
      email: "sarah.wilson@company.com",
      firstName: "Sarah",
      lastName: "Wilson",
      role: "recruiter",
      status: "active",
      createdDate: "2023-06-15",
      lastLogin: "2024-01-19",
      permissions: DEFAULT_PERMISSIONS.filter((p) => safeRolePermissions("recruiter").includes(p.id)),
      recruiterId: "1",
      department: "HR",
      phoneNumber: "+1-555-0002",
      position: "HR Director",
      level: 1,
      managerId: "1",
      subordinates: ["4", "5"],
      teams: ["HR Team", "Recruitment"],
    },
    {
      id: "3",
      username: "mjohnson",
      email: "mike.johnson@company.com",
      firstName: "Mike",
      lastName: "Johnson",
      role: "recruiter",
      status: "active",
      createdDate: "2023-08-20",
      lastLogin: "2024-01-18",
      permissions: DEFAULT_PERMISSIONS.filter((p) => safeRolePermissions("recruiter").includes(p.id)),
      recruiterId: "2",
      department: "HR",
      phoneNumber: "+1-555-0003",
      position: "Senior Recruiter",
      level: 2,
      managerId: "1",
      teams: ["Recruitment"],
    },
    {
      id: "4",
      username: "echen",
      email: "emily.chen@company.com",
      firstName: "Emily",
      lastName: "Chen",
      role: "recruiter",
      status: "active",
      createdDate: "2023-04-10",
      lastLogin: "2024-01-17",
      permissions: DEFAULT_PERMISSIONS.filter((p) => safeRolePermissions("recruiter").includes(p.id)),
      recruiterId: "3",
      department: "HR",
      phoneNumber: "+1-555-0004",
      position: "Technical Recruiter",
      level: 2,
      managerId: "2",
      teams: ["Technical Recruitment"],
    },
    {
      id: "5",
      username: "dbrown",
      email: "david.brown@company.com",
      firstName: "David",
      lastName: "Brown",
      role: "user",
      status: "inactive",
      createdDate: "2023-11-05",
      lastLogin: "2024-01-10",
      permissions: DEFAULT_PERMISSIONS.filter((p) => safeRolePermissions("user").includes(p.id)),
      department: "Operations",
      phoneNumber: "+1-555-0005",
      position: "Operations Analyst",
      level: 3,
      managerId: "2",
    },
  ])

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      userId: "1",
      userName: "System Administrator",
      action: "User Created",
      targetType: "user",
      targetId: "2",
      targetName: "Sarah Wilson",
      details: "Created new recruiter account with standard permissions",
      timestamp: "2024-01-20T10:30:00Z",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      id: "2",
      userId: "1",
      userName: "System Administrator",
      action: "Role Updated",
      targetType: "user",
      targetId: "3",
      targetName: "Mike Johnson",
      details: "Updated role from user to recruiter",
      timestamp: "2024-01-19T14:15:00Z",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      id: "3",
      userId: "1",
      userName: "System Administrator",
      action: "User Suspended",
      targetType: "user",
      targetId: "5",
      targetName: "David Brown",
      details: "Account suspended due to inactivity",
      timestamp: "2024-01-18T09:45:00Z",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  ])

  // Update the handleRoleChange function to include hierarchical data
  // Replace the existing handleRoleChange function with this:
  const handleRoleChange = (role: "admin" | "recruiter" | "user") => {
    const rolePermissions = safeRolePermissions(role)
    setNewUser({
      ...newUser,
      role,
      permissions: rolePermissions,
      level: role === "admin" ? 0 : role === "recruiter" ? 1 : 2, // Set default level based on role
    })
  }

  // Check if current user has admin permissions
  const canManageUsers = hasPermission(currentUser, "admin-users")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "recruiter":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "user":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "inactive":
        return <Clock className="w-4 h-4 text-gray-600" />
      case "suspended":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const handleGeneratePassword = () => {
    const password = generateSecurePassword()
    setNewUser({ ...newUser, password, confirmPassword: password })
  }

  // Update the handleAddUser function to include hierarchical data
  // Find the handleAddUser function and replace the user object creation with:
  const handleAddUser = () => {
    const passwordValidation = validatePassword(newUser.password)

    if (!passwordValidation.isValid) {
      alert("Password validation failed: " + passwordValidation.errors.join(", "))
      return
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match")
      return
    }

    const user: UserType = {
      id: Date.now().toString(),
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      status: "active",
      createdDate: new Date().toISOString().split("T")[0],
      lastLogin: "Never",
      permissions: DEFAULT_PERMISSIONS.filter((p) => newUser.permissions.includes(p.id)),
      department: newUser.department,
      phoneNumber: newUser.phoneNumber,
      recruiterId: newUser.role === "recruiter" ? Date.now().toString() : undefined,
      position: newUser.position,
      level: newUser.level,
      managerId: newUser.managerId === "none" ? undefined : newUser.managerId,
      teams: newUser.teams,
    }

    setUsers([...users, user])

    // Log audit action
    logAuditAction(
      "User Created",
      "user",
      user.id,
      `${user.firstName} ${user.lastName}`,
      `Created new ${user.role} account with ${user.permissions.length} permissions`,
    )

    setNewUser({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "user",
      department: "none",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      permissions: [],
      position: "none",
      level: 2,
      managerId: "none",
      teams: [] as string[],
    })
    setIsAddUserDialogOpen(false)
  }

  const handleEditUser = () => {
    if (!editingUser) return

    setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)))

    // Log audit action
    logAuditAction(
      "User Updated",
      "user",
      editingUser.id,
      `${editingUser.firstName} ${editingUser.lastName}`,
      `Updated user profile and permissions`,
    )

    setIsEditUserDialogOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = (user: UserType) => {
    setUsers(users.filter((u) => u.id !== user.id))

    // Log audit action
    logAuditAction("User Deleted", "user", user.id, `${user.firstName} ${user.lastName}`, `Deleted user account`)
  }

  const handleToggleUserStatus = (user: UserType) => {
    const newStatus = user.status === "active" ? "inactive" : "active"
    const updatedUser = { ...user, status: newStatus }

    setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)))

    // Log audit action
    logAuditAction(
      `User ${newStatus === "active" ? "Activated" : "Deactivated"}`,
      "user",
      user.id,
      `${user.firstName} ${user.lastName}`,
      `Changed user status to ${newStatus}`,
    )
  }

  const exportUserData = () => {
    const csvContent = [
      ["Username", "Email", "Name", "Role", "Status", "Department", "Created Date", "Last Login"],
      ...filteredUsers.map((user) => [
        user.username,
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.role,
        user.status,
        user.department || "",
        user.createdDate,
        user.lastLogin,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "users-export.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Add these functions to handle user selection and back navigation
  // Add these before the return statement
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
  }

  const handleBackToList = () => {
    setSelectedUserId(null)
  }

  // Update the return statement to include the user profile view and org chart
  // Replace the entire return statement with:
  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Shield className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-semibold">Access Denied</h3>
            <p className="text-gray-600 text-center">You don't have permission to access the user management panel.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If a user is selected, show their profile
  if (selectedUserId) {
    return (
      <UserProfile
        userId={selectedUserId}
        users={users}
        auditLogs={auditLogs}
        onBack={handleBackToList}
        onEdit={(user) => {
          setEditingUser(user)
          setIsEditUserDialogOpen(true)
        }}
        onToggleStatus={handleToggleUserStatus}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={exportUserData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User Account</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with appropriate roles and permissions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      placeholder="john.doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={newUser.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={newUser.department || "none"}
                      onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Department</SelectItem>
                        {DEPARTMENTS.filter(Boolean).map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select
                      value={newUser.position || "none"}
                      onValueChange={(value) => setNewUser({ ...newUser, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Position</SelectItem>
                        {POSITIONS.filter(Boolean).map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Organizational Level</Label>
                    <Select
                      value={newUser.level.toString()}
                      onValueChange={(value) => setNewUser({ ...newUser, level: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Level 0 (Top Level)</SelectItem>
                        <SelectItem value="1">Level 1 (Executive)</SelectItem>
                        <SelectItem value="2">Level 2 (Management)</SelectItem>
                        <SelectItem value="3">Level 3 (Team Lead)</SelectItem>
                        <SelectItem value="4">Level 4 (Staff)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Manager</Label>
                  <Select
                    value={newUser.managerId || "none"}
                    onValueChange={(value) => setNewUser({ ...newUser, managerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                    placeholder="+1-555-0123"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Password *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword}>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newUser.confirmPassword}
                        onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                    {DEFAULT_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={newUser.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewUser({
                                ...newUser,
                                permissions: [...newUser.permissions, permission.id],
                              })
                            } else {
                              setNewUser({
                                ...newUser,
                                permissions: newUser.permissions.filter((p) => p !== permission.id),
                              })
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={permission.id} className="text-sm font-medium">
                            {permission.name}
                          </Label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {permission.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={
                    !newUser.username || !newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password
                  }
                >
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <p className="text-xs text-gray-600">{users.filter((u) => u.status === "active").length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{users.filter((u) => u.role === "admin").length}</div>
            <p className="text-xs text-gray-600">System admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recruiters</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.filter((u) => u.role === "recruiter").length}</div>
            <p className="text-xs text-gray-600">Active recruiters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{users.filter((u) => u.status !== "active").length}</div>
            <p className="text-xs text-gray-600">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Accounts</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    List View
                  </Button>
                  <Button
                    variant={viewMode === "org" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("org")}
                  >
                    Org Chart
                  </Button>
                </div>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectUser(user.id)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <Mail className="w-3 h-3" />
                              <span>{user.email}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <User className="w-3 h-3" />
                              <span>@{user.username}</span>
                            </div>
                            {user.phoneNumber && (
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <Phone className="w-3 h-3" />
                                <span>{user.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                          {user.recruiterId && (
                            <Badge variant="outline" className="ml-1 text-xs">
                              ID: {user.recruiterId}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.status)}
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.department || "Not assigned"}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>{user.lastLogin === "Never" ? "Never" : formatDate(user.lastLogin)}</span>
                            </div>
                            <div className="text-xs text-gray-500">Created: {formatDate(user.createdDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Key className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{user.permissions.length}</span>
                            <span className="text-xs text-gray-500">permissions</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingUser(user)
                                setIsEditUserDialogOpen(true)
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleUserStatus(user)
                              }}
                              className={user.status === "active" ? "text-red-600" : "text-green-600"}
                            >
                              {user.status === "active" ? (
                                <UserX className="w-3 h-3" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 bg-transparent"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {user.firstName} {user.lastName}'s account? This
                                    action cannot be undone and will remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <OrgChart users={users} onSelectUser={handleSelectUser} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <p className="text-gray-600">Manage system permissions and role assignments</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(
                  DEFAULT_PERMISSIONS.reduce(
                    (acc, permission) => {
                      if (!acc[permission.category]) {
                        acc[permission.category] = []
                      }
                      acc[permission.category].push(permission)
                      return acc
                    },
                    {} as Record<string, Permission[]>,
                  ),
                ).map(([category, permissions]) => (
                  <div key={category} className="space-y-3">
                    <h3 className="text-lg font-semibold capitalize">{category} Permissions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map((permission) => (
                        <Card key={permission.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{permission.name}</h4>
                              <Badge variant="outline">{permission.category}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {permission.actions.map((action) => (
                                <Badge key={action} variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <p className="text-gray-600">Track all administrative actions and user activities</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(log.timestamp)}</div>
                          <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{log.userName}</div>
                          <div className="text-xs text-gray-500">ID: {log.userId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Activity className="w-3 h-3" />
                          <span>{log.action}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{log.targetName}</div>
                          <div className="text-xs text-gray-500">
                            {log.targetType}: {log.targetId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 max-w-xs truncate">{log.details}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{log.ipAddress}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
            <DialogDescription>Update user information, role, and permissions</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={editingUser.firstName}
                    onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={editingUser.lastName}
                    onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                  <Input
                    id="edit-phoneNumber"
                    value={editingUser.phoneNumber || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) =>
                      setEditingUser({
                        ...editingUser,
                        role: value as "admin" | "recruiter" | "user",
                        permissions: DEFAULT_PERMISSIONS.filter((p) =>
                          safeRolePermissions(value as "admin" | "recruiter" | "user").includes(p.id),
                        ),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value) =>
                      setEditingUser({
                        ...editingUser,
                        status: value as "active" | "inactive" | "suspended",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select
                    value={editingUser.department || "none"}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, department: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Department</SelectItem>
                      {DEPARTMENTS.filter(Boolean).map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Position</Label>
                  <Select
                    value={editingUser.position || "none"}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, position: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Position</SelectItem>
                      {POSITIONS.filter(Boolean).map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-level">Organizational Level</Label>
                  <Select
                    value={editingUser.level?.toString() || ""}
                    onValueChange={(value) =>
                      setEditingUser({
                        ...editingUser,
                        level: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Level 0 (Top Level)</SelectItem>
                      <SelectItem value="1">Level 1 (Executive)</SelectItem>
                      <SelectItem value="2">Level 2 (Management)</SelectItem>
                      <SelectItem value="3">Level 3 (Team Lead)</SelectItem>
                      <SelectItem value="4">Level 4 (Staff)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-manager">Manager</Label>
                  <Select
                    value={editingUser.managerId ?? "none"}
                    onValueChange={(value) =>
                      setEditingUser({
                        ...editingUser,
                        managerId: value === "none" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {users
                        .filter((u) => u.id !== editingUser.id) // Can't be own manager
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                  {DEFAULT_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={editingUser.permissions.some((p) => p.id === permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditingUser({
                              ...editingUser,
                              permissions: [...editingUser.permissions, permission],
                            })
                          } else {
                            setEditingUser({
                              ...editingUser,
                              permissions: editingUser.permissions.filter((p) => p.id !== permission.id),
                            })
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {permission.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-purple-600 hover:bg-purple-700">
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
