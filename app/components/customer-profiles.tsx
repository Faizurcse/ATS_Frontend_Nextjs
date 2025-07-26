"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Building2, User, Calendar, Briefcase, UsersIcon, AlertCircle } from "lucide-react"
import { formatDate } from "../../lib/date-utils"

interface CustomerProfile {
  id: string
  customerName: string
  internalSPOC: string
  createdDate: string
  jobsCount: number
  candidatesCount: number
  hiresCount: number
}

export default function CustomerProfiles() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [customers, setCustomers] = useState<CustomerProfile[]>([
    {
      id: "1",
      customerName: "TechCorp Inc.",
      internalSPOC: "Sarah Wilson",
      createdDate: "2024-01-15",
      jobsCount: 3,
      candidatesCount: 24,
      hiresCount: 12,
    },
    {
      id: "2",
      customerName: "StartupXYZ",
      internalSPOC: "Mike Johnson",
      createdDate: "2024-01-12",
      jobsCount: 2,
      candidatesCount: 18,
      hiresCount: 5,
    },
    {
      id: "3",
      customerName: "DataFlow Solutions",
      internalSPOC: "Emily Chen",
      createdDate: "2024-01-10",
      jobsCount: 1,
      candidatesCount: 12,
      hiresCount: 0,
    },
    {
      id: "4",
      customerName: "GlobalTech Ltd",
      internalSPOC: "James Smith",
      createdDate: "2024-01-18",
      jobsCount: 1,
      candidatesCount: 15,
      hiresCount: 3,
    },
  ])

  const [newCustomer, setNewCustomer] = useState({
    customerName: "",
    internalSPOC: "",
  })

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.internalSPOC.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateCustomer = () => {
    if (!newCustomer.customerName.trim() || !newCustomer.internalSPOC.trim()) return

    const customer: CustomerProfile = {
      id: Date.now().toString(),
      customerName: newCustomer.customerName.trim(),
      internalSPOC: newCustomer.internalSPOC.trim(),
      createdDate: new Date().toISOString().split("T")[0],
      jobsCount: 0,
      candidatesCount: 0,
      hiresCount: 0,
    }

    setCustomers([...customers, customer])
    setNewCustomer({
      customerName: "",
      internalSPOC: "",
    })
    setIsCreateDialogOpen(false)
  }

  const getTotalStats = () => {
    return filteredCustomers.reduce(
      (acc, customer) => ({
        totalJobs: acc.totalJobs + customer.jobsCount,
        totalCandidates: acc.totalCandidates + customer.candidatesCount,
        totalHires: acc.totalHires + customer.hiresCount,
      }),
      { totalJobs: 0, totalCandidates: 0, totalHires: 0 },
    )
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Step 1: Customer Profiles</h2>
          <p className="text-gray-600">Streamlined customer management with essential information only</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Create a streamlined customer profile with essential information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={newCustomer.customerName}
                  onChange={(e) => setNewCustomer({ ...newCustomer, customerName: e.target.value })}
                  placeholder="e.g. TechCorp Inc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalSPOC">Internal SPOC *</Label>
                <Input
                  id="internalSPOC"
                  value={newCustomer.internalSPOC}
                  onChange={(e) => setNewCustomer({ ...newCustomer, internalSPOC: e.target.value })}
                  placeholder="e.g. Sarah Wilson"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateCustomer}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={!newCustomer.customerName.trim() || !newCustomer.internalSPOC.trim()}
              >
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-purple-600">{filteredCustomers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UsersIcon className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hires</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalHires}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {filteredCustomers.length} of {customers.length} customers
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-gray-500 mb-4">
                {customers.length === 0
                  ? "No customer profiles have been created yet."
                  : "Try adjusting your search to find customers."}
              </p>
              {customers.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Internal SPOC</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Candidates</TableHead>
                  <TableHead>Hires</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>{customer.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{customer.internalSPOC}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(customer.createdDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {customer.jobsCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {customer.candidatesCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {customer.hiresCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${customer.candidatesCount > 0 ? (customer.hiresCount / customer.candidatesCount) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {customer.candidatesCount > 0
                            ? `${Math.round((customer.hiresCount / customer.candidatesCount) * 100)}%`
                            : "0%"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Streamlined Workflow Benefits</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Essential Information Only</h4>
                <p className="text-sm text-gray-600">
                  Customer profiles now contain only Customer Name and Internal SPOC, reducing complexity and setup
                  time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Integrated Data Flow</h4>
                <p className="text-sm text-gray-600">
                  Customer information automatically flows to job postings, candidate profiles, and pipeline views.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Quick Setup</h4>
                <p className="text-sm text-gray-600">
                  Faster customer onboarding with minimal required fields while maintaining data integrity.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium">Comprehensive Tracking</h4>
                <p className="text-sm text-gray-600">
                  Monitor job postings, candidates, and hire success rates per customer automatically.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
