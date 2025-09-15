'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2, Users, Shield, Home, Plus, Settings, LogOut, Menu, X, ChevronDown, ChevronRight, Edit, Trash2, CheckCircle, XCircle, History } from 'lucide-react';
import BASE_API_URL from '../../BaseUrlApi.js';

interface Superadmin {
  id: number;
  name: string;
  email: string;
  userType: string;
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  userLimit: number;
  currentUsers: number;
  createdAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  number: string;
  userType: string;
  companyId: number;
  company: {
    id: number;
    name: string;
  };
}

interface LoginHistory {
  id: number;
  loggedAt: string;
  user: {
    name: string;
    email: string;
    userType: string;
    company: {
      id: number;
      name: string;
      logo: string | null;
    };
  };
}

export default function AdminPage() {
  const [step, setStep] = useState<'login' | 'dashboard' | 'create-company' | 'manage-users' | 'login-history'>('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [superadmin, setSuperadmin] = useState<Superadmin | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [manageUsersDropdownOpen, setManageUsersDropdownOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{type: 'user' | 'company', id: number, name: string} | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);

  // Check for existing admin session on page load
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('admin_token');
      const savedSuperadmin = localStorage.getItem('admin_superadmin');
      const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
      
      if (savedToken && savedSuperadmin && isAuthenticated) {
        setToken(savedToken);
        setSuperadmin(JSON.parse(savedSuperadmin));
        setStep('dashboard');
        fetchCompanies();
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setManageUsersDropdownOpen(false);
      }
    };

    if (manageUsersDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [manageUsersDropdownOpen]);

  // OTP Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Toast functions
  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
  };

  // Handle logo selection
  const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        showToast('error', 'Please select a PNG or JPG file');
        event.target.value = '';
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File size must be less than 5MB');
        event.target.value = '';
        return;
      }
      
      showToast('success', 'Logo selected successfully!');
    }
  };

  // Send OTP
  const sendOtp = async () => {
    if (!email) {
      setError('Please enter email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setOtpTimer(120); // 2 minutes
        setError('');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and Login
  const verifyOtp = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_API_URL}/auth/superadmin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        // Save to localStorage for persistence (only on client side)
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_superadmin', JSON.stringify(data.superadmin));
          localStorage.setItem('admin_authenticated', 'true');
        }
        
        setToken(data.token);
        setSuperadmin(data.superadmin);
        setStep('dashboard');
        await fetchCompanies();
        setError('');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Companies
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/companies`);
      const data = await response.json();
      if (response.ok) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  // Fetch Users for Company
  const fetchUsers = async (companyId: number) => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/all-users?companyId=${companyId}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch Login History
  const fetchLoginHistory = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/all-login-history`);
      const data = await response.json();
      if (response.ok) {
        setLoginHistory(data.logins);
      }
    } catch (err) {
      console.error('Error fetching login history:', err);
    }
  };

  // Create Company
  const createCompany = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const logo = formData.get('logo') as File;
    const userCount = formData.get('userCount') as string;

    if (!name) {
      setError('Company name is required');
      return;
    }

    setActionLoading('create-company');
    setError('');

    try {
      const form = new FormData();
      form.append('name', name);
      form.append('userCount', userCount || '0');
      if (logo && logo.size > 0) {
        form.append('logo', logo);
      }

      const response = await fetch(`${BASE_API_URL}/auth/create-company`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCompanies();
        setStep('dashboard');
        setError('');
        showToast('success', 'Company created successfully!');
      } else {
        setError(data.error || 'Failed to create company');
        showToast('error', data.error || 'Failed to create company');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      showToast('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Create User
  const createUser = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const number = formData.get('number') as string;
    const userType = formData.get('userType') as string;

    if (!name || !email || !number || !selectedCompany) {
      setError('All fields are required');
      return;
    }

    setActionLoading('create-user');
    setError('');

    try {
      const response = await fetch(`${BASE_API_URL}/auth/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          number,
          userType,
          companyName: selectedCompany.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers(selectedCompany.id);
        await fetchCompanies(); // Refresh companies to update user counts
        setError('');
        showToast('success', 'User created successfully!');
        // Reset form
        (document.getElementById('userForm') as HTMLFormElement)?.reset();
      } else {
        setError(data.error || 'Failed to create user');
        showToast('error', data.error || 'Failed to create user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      showToast('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Update User
  const updateUser = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const number = formData.get('number') as string;
    const userType = formData.get('userType') as string;

    if (!name || !email || !number || !editingUser) {
      setError('All fields are required');
      return;
    }

    setActionLoading('update-user');
    setError('');

    try {
      const response = await fetch(`${BASE_API_URL}/auth/update-user/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          number,
          userType
        })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers(selectedCompany!.id);
        setEditingUser(null);
        setError('');
        showToast('success', 'User updated successfully!');
        // Reset form
        (document.getElementById('userForm') as HTMLFormElement)?.reset();
      } else {
        setError(data.error || 'Failed to update user');
        showToast('error', data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      showToast('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete User
  const deleteUser = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setShowDeleteConfirm({
        type: 'user',
        id: userId,
        name: user.name
      });
    }
  };

  // Confirm Delete User
  const confirmDeleteUser = async () => {
    if (!showDeleteConfirm) return;

    setActionLoading('delete-user');
    setError('');

    try {
      const response = await fetch(`${BASE_API_URL}/auth/delete-user/${showDeleteConfirm.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUsers(selectedCompany!.id);
        await fetchCompanies(); // Refresh companies to update user counts
        setError('');
        setShowDeleteConfirm(null);
        showToast('success', 'User deleted successfully!');
      } else {
        setError(data.error || 'Failed to delete user');
        showToast('error', data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      showToast('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Update Company
  const updateCompany = async (formData: FormData) => {
    const name = formData.get('name') as string;
    const userCount = formData.get('userCount') as string;
    const logo = formData.get('logo') as File;

    if (!name || !editingCompany) {
      setError('Company name is required');
      return;
    }

    setActionLoading('update-company');
    setError('');

    try {
      const form = new FormData();
      form.append('name', name);
      form.append('userCount', userCount || editingCompany.userLimit.toString());
      if (logo && logo.size > 0) {
        form.append('logo', logo);
      }

      const response = await fetch(`${BASE_API_URL}/auth/update-company/${editingCompany.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCompanies();
        setEditingCompany(null);
        setError('');
        showToast('success', 'Company updated successfully!');
      } else {
        setError(data.error || 'Failed to update company');
        showToast('error', data.error || 'Failed to update company');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      showToast('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Company
  const deleteCompany = async (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setShowDeleteConfirm({
        type: 'company',
        id: companyId,
        name: company.name
      });
    }
  };

  // Confirm Delete Company
  const confirmDeleteCompany = async () => {
    if (!showDeleteConfirm) return;

    setActionLoading('delete-company');
    setError('');

    try {
      const response = await fetch(`${BASE_API_URL}/auth/delete-company/${showDeleteConfirm.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        await fetchCompanies();
        setError('');
        setShowDeleteConfirm(null);
        showToast('success', 'Company deleted successfully!');
      } else {
        setError(data.error || 'Failed to delete company');
        if (data.error && data.error.includes('existing users')) {
          showToast('warning', 'Cannot delete company with users. Please delete all users first.');
        } else {
          showToast('error', data.error || 'Failed to delete company');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
      showToast('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, active: step === 'dashboard' },
    { id: 'create-company', label: 'Create Company', icon: Plus, active: step === 'create-company' },
    { id: 'login-history', label: 'Login History', icon: History, active: step === 'login-history' },
  ];

  const handleSidebarClick = (itemId: string) => {
    if (itemId === 'dashboard') {
      setStep('dashboard');
      setManageUsersDropdownOpen(false);
    } else if (itemId === 'create-company') {
      setStep('create-company');
      setManageUsersDropdownOpen(false);
    } else if (itemId === 'login-history') {
      setStep('login-history');
      setManageUsersDropdownOpen(false);
      fetchLoginHistory();
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    fetchUsers(company.id);
    setStep('manage-users');
    setManageUsersDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Login Step */}
      {step === 'login' && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Superadmin Login</p>
            </div>
            
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Enter your email to receive OTP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!otpSent ? (
                  <>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="superadmin@example.com"
                        className="mt-1"
                      />
                    </div>
                    <Button 
                      onClick={sendOtp} 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Send OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="mt-1 text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                      {otpTimer > 0 && (
                        <p className="text-sm text-red-600 mt-1 text-center">
                          OTP expires in: {formatTime(otpTimer)}
                        </p>
                      )}
                    </div>
                    <Button 
                      onClick={verifyOtp} 
                      disabled={loading || otpTimer === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Verify OTP & Login
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setOtpTimer(0);
                      }}
                      className="w-full"
                    >
                      Back to Email
                    </Button>
                  </>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Main Layout with Sidebar */}
      {step !== 'login' && (
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
          <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Panel</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Admin Info */}
            <div className="p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {superadmin?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{superadmin?.name}</h3>
                  <p className="text-sm text-gray-500">Superadmin</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3">
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarClick(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                ))}

                {/* Manage Users Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setManageUsersDropdownOpen(!manageUsersDropdownOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      step === 'manage-users'
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-3" />
                      Manage Users
                    </div>
                    {manageUsersDropdownOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {manageUsersDropdownOpen && (
                    <div className="ml-6 mt-1 space-y-1 max-h-64 overflow-y-auto">
                      {companies.length > 0 ? (
                        companies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => handleCompanySelect(company)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                              selectedCompany?.id === company.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center min-w-0">
                              {company.logo ? (
                                <img 
                                  src={`http://localhost:5000/${company.logo}`} 
                                  alt={company.name}
                                  className="h-6 w-6 rounded object-cover mr-2 flex-shrink-0"
                                />
                              ) : (
                                <Building2 className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="truncate">{company.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {company.currentUsers}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No companies found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </nav>

            {/* Logout Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Button
                variant="outline"
                onClick={() => {
                  // Only run on client side
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_superadmin');
                    localStorage.removeItem('admin_authenticated');
                  }
                  setStep('login');
                  setToken('');
                  setSuperadmin(null);
                  setCompanies([]);
                  setUsers([]);
                  setSelectedCompany(null);
                }}
                className="w-full flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="bg-white shadow-sm border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {step === 'dashboard' && 'Dashboard'}
                    {step === 'create-company' && 'Create Company'}
                    {step === 'manage-users' && `${selectedCompany?.name} - Users`}
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Welcome back, {superadmin?.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* Dashboard Content */}
              {step === 'dashboard' && (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Building2 className="h-8 w-8 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Companies</p>
                            <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="h-8 w-8 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900">
                              {companies.reduce((sum, company) => sum + company.currentUsers, 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                  </div>

                  {/* Companies List */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl">Companies</CardTitle>
                          <CardDescription>Manage your companies and their users</CardDescription>
                        </div>
                        <Button 
                          onClick={() => setStep('create-company')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Company
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {companies.map((company) => (
                          <div key={company.id} className="flex items-center justify-between p-6 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                              {company.logo ? (
                                <img 
                                  src={`http://localhost:5000/${company.logo}`} 
                                  alt={company.name}
                                  className="h-16 w-16 rounded-xl object-cover shadow-md"
                                />
                              ) : (
                                <div className="h-16 w-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-md">
                                  <Building2 className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm text-gray-600">{company.currentUsers} users</p>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-sm text-gray-500">
                                    Limit: {company.userLimit === 0 ? 'Unlimited' : company.userLimit}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  Created {new Date(company.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedCompany(company);
                                  fetchUsers(company.id);
                                  setStep('manage-users');
                                }}
                                className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Manage Users
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingCompany(company)}
                                className="hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteCompany(company.id)}
                                className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                        {companies.length === 0 && (
                          <div className="text-center py-12">
                            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first company</p>
                            <Button 
                              onClick={() => setStep('create-company')}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Company
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Create Company Content */}
              {step === 'create-company' && (
                <div className="max-w-2xl mx-auto">
                  <Card className="shadow-xl">
                    <CardHeader className="text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">Create New Company</CardTitle>
                      <CardDescription>Add a new company to the system with initial user count</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        createCompany(formData);
                      }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Company Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Enter company name"
                              required
                              className="mt-2 h-12 text-lg"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="userCount" className="text-sm font-medium text-gray-700">Initial User Count</Label>
                            <Input
                              id="userCount"
                              name="userCount"
                              type="number"
                              min="0"
                              placeholder="0"
                              className="mt-2 h-12"
                            />
                            <p className="text-xs text-gray-500 mt-1">Number of users this company can have (0 for unlimited)</p>
                          </div>
                          
                          <div>
                            <Label htmlFor="logo" className="text-sm font-medium text-gray-700">Company Logo</Label>
                            <Input
                              id="logo"
                              name="logo"
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleLogoSelect}
                              className="mt-2 h-12"
                            />
                            <p className="text-xs text-gray-500 mt-1">PNG or JPG only, max 5MB</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 pt-4">
                          <Button 
                            type="submit" 
                            disabled={actionLoading === 'create-company'} 
                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {actionLoading === 'create-company' ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Building2 className="h-4 w-4 mr-2" />
                            )}
                            {actionLoading === 'create-company' ? 'Creating...' : 'Create Company'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setStep('dashboard')}
                            disabled={actionLoading === 'create-company'}
                            className="flex-1 h-12"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>

                      {error && (
                        <Alert variant="destructive" className="mt-6">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Manage Users Content */}
              {step === 'manage-users' && selectedCompany && (
                <div className="space-y-8">
                  {/* Company Info Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center space-x-4">
                      {selectedCompany.logo ? (
                        <img 
                          src={`http://localhost:5000/${selectedCompany.logo}`} 
                          alt={selectedCompany.name}
                          className="h-16 w-16 rounded-xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div>
                        <h1 className="text-2xl font-bold">{selectedCompany.name}</h1>
                        <p className="text-blue-100">Manage users for this company</p>
                        <p className="text-sm text-blue-200">{selectedCompany.currentUsers} users</p>
                      </div>
                    </div>
                  </div>

                  {/* User Count Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">User Limit Status</h3>
                        <p className="text-sm text-blue-700">
                          Current: {users.length} users | 
                          Limit: {selectedCompany.userLimit === 0 ? 'Unlimited' : selectedCompany.userLimit} users
                        </p>
                      </div>
                      {selectedCompany.userLimit > 0 && users.length >= selectedCompany.userLimit && (
                        <div className="text-red-600 text-sm font-medium">
                          ⚠️ Limit Reached
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Create/Edit User Form */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {editingUser ? (
                          <>
                            <Edit className="h-5 w-5 mr-2 text-yellow-600" />
                            Edit User
                          </>
                        ) : (
                          <>
                            <Plus className="h-5 w-5 mr-2 text-blue-600" />
                            Add New User
                          </>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {editingUser ? `Edit user: ${editingUser.name}` : `Create a new user for ${selectedCompany.name}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form id="userForm" onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        if (editingUser) {
                          updateUser(formData);
                        } else {
                          createUser(formData);
                        }
                      }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              placeholder="Enter full name"
                              defaultValue={editingUser?.name || ''}
                              required
                              className="mt-2 h-12"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Enter email"
                              defaultValue={editingUser?.email || ''}
                              required
                              className="mt-2 h-12"
                            />
                          </div>
                          <div>
                            <Label htmlFor="number" className="text-sm font-medium text-gray-700">Phone Number *</Label>
                            <Input
                              id="number"
                              name="number"
                              type="tel"
                              placeholder="Enter phone number"
                              defaultValue={editingUser?.number || ''}
                              required
                              className="mt-2 h-12"
                            />
                          </div>
                          <div>
                            <Label htmlFor="userType" className="text-sm font-medium text-gray-700">User Type *</Label>
                            <select
                              id="userType"
                              name="userType"
                              defaultValue={editingUser?.userType || 'USER'}
                              required
                              className="mt-2 w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="USER">User</option>
                              <option value="ADMIN">Admin</option>
                              <option value="MANAGER">Manager</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <Button 
                            type="submit" 
                            disabled={(actionLoading === 'create-user' || actionLoading === 'update-user') || (selectedCompany.userLimit > 0 && users.length >= selectedCompany.userLimit && !editingUser)} 
                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {(actionLoading === 'create-user' || actionLoading === 'update-user') ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : editingUser ? (
                              <Edit className="h-4 w-4 mr-2" />
                            ) : (
                              <Users className="h-4 w-4 mr-2" />
                            )}
                            {editingUser ? (
                              actionLoading === 'update-user' ? 'Updating...' : 'Update User'
                            ) : (
                              actionLoading === 'create-user' ? 'Creating...' : 'Create User'
                            )}
                          </Button>
                          {editingUser && (
                            <Button 
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setEditingUser(null);
                                (document.getElementById('userForm') as HTMLFormElement)?.reset();
                              }}
                              disabled={actionLoading === 'update-user'}
                              className="h-12"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                        {selectedCompany.userLimit > 0 && users.length >= selectedCompany.userLimit && !editingUser && (
                          <div className="text-red-600 text-sm text-center">
                            ⚠️ User limit reached. Cannot create more users.
                          </div>
                        )}
                      </form>

                      {error && (
                        <Alert variant="destructive" className="mt-6">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Users List */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-green-600" />
                        Company Users ({users.length})
                      </CardTitle>
                      <CardDescription>All users in {selectedCompany.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-6 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500">{user.number}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                user.userType === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                user.userType === 'MANAGER' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.userType}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                                className="hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                                className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {users.length === 0 && (
                          <div className="text-center py-12">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">Add your first user to get started</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Company Edit Modal */}
              {editingCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Company</h2>
                        <button
                          onClick={() => setEditingCompany(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateCompany(formData);
                      }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Company Name *</Label>
                            <Input
                              id="edit-name"
                              name="name"
                              type="text"
                              defaultValue={editingCompany.name}
                              required
                              className="mt-2 h-12 text-lg"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-userCount" className="text-sm font-medium text-gray-700">User Limit</Label>
                            <Input
                              id="edit-userCount"
                              name="userCount"
                              type="number"
                              min="0"
                              defaultValue={editingCompany.userLimit}
                              className="mt-2 h-12"
                            />
                            <p className="text-xs text-gray-500 mt-1">0 = Unlimited users</p>
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-logo" className="text-sm font-medium text-gray-700">Company Logo</Label>
                            <Input
                              id="edit-logo"
                              name="logo"
                              type="file"
                              accept="image/png,image/jpeg"
                              onChange={handleLogoSelect}
                              className="mt-2 h-12"
                            />
                            <p className="text-xs text-gray-500 mt-1">PNG or JPG only, max 5MB</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 pt-4">
                          <Button 
                            type="submit" 
                            disabled={actionLoading === 'update-company'} 
                            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {actionLoading === 'update-company' ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Edit className="h-4 w-4 mr-2" />
                            )}
                            {actionLoading === 'update-company' ? 'Updating...' : 'Update Company'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setEditingCompany(null)}
                            disabled={actionLoading === 'update-company'}
                            className="flex-1 h-12"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>

                      {error && (
                        <Alert variant="destructive" className="mt-6">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Login History Content */}
              {step === 'login-history' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Login History</h1>
                      <p className="text-gray-600">View all user login activities across all companies</p>
                    </div>
                    <Button
                      onClick={fetchLoginHistory}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <History className="h-4 w-4" />
                      <span>Refresh</span>
                    </Button>
                  </div>

                  <Card className="shadow-lg">
                    <CardContent className="p-0">
                      {loginHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Login History</h3>
                          <p className="text-gray-500">No users have logged in yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Company
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  User Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Login Time
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {loginHistory.map((login) => (
                                <tr key={login.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                          <span className="text-white font-medium text-sm">
                                            {login.user.name.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {login.user.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {login.user.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {login.user.company.logo ? (
                                        <img
                                          className="h-8 w-8 rounded-lg object-cover mr-3"
                                          src={`http://localhost:5000/${login.user.company.logo}`}
                                          alt={login.user.company.name}
                                        />
                                      ) : (
                                        <div className="h-8 w-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                                          <Building2 className="h-4 w-4 text-gray-500" />
                                        </div>
                                      )}
                                      <div className="text-sm font-medium text-gray-900">
                                        {login.user.company.name}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {login.user.userType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(login.loggedAt).toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                    <div className="p-6">
                      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                        <Trash2 className="h-6 w-6 text-red-600" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                        {showDeleteConfirm.type === 'company' ? 'Delete Company' : 'Delete User'}
                      </h3>
                      
                      <p className="text-gray-600 text-center mb-6">
                        {showDeleteConfirm.type === 'company' 
                          ? `Are you sure you want to delete "${showDeleteConfirm.name}"? This will also delete all users in this company.`
                          : `Are you sure you want to delete "${showDeleteConfirm.name}"? This action cannot be undone.`
                        }
                      </p>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => setShowDeleteConfirm(null)}
                          variant="outline"
                          className="flex-1"
                          disabled={actionLoading === `delete-${showDeleteConfirm.type}`}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={showDeleteConfirm.type === 'company' ? confirmDeleteCompany : confirmDeleteUser}
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          disabled={actionLoading === `delete-${showDeleteConfirm.type}`}
                        >
                          {actionLoading === `delete-${showDeleteConfirm.type}` ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg max-w-sm ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            {toast.type === 'success' && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="h-5 w-5 flex-shrink-0" />}
            {toast.type === 'warning' && <XCircle className="h-5 w-5 flex-shrink-0" />}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
