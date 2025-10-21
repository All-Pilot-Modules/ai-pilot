'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Users, AlertCircle, X, Calendar, Clock, Award, BookOpen, TrendingUp, User, Edit, Trash2, MoreHorizontal, UserPlus, Mail, Phone, MapPin, Save, CheckCircle, XCircle, HelpCircle, List, ExternalLink, Filter, SortAsc, SortDesc, Download, FileText, FileJson, GraduationCap, Target, BarChart3, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { apiClient } from "@/lib/auth";
import { useRouter } from "next/navigation";

function StudentsPageContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleName = searchParams.get('module');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [progressFilter, setProgressFilter] = useState('all');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState('');
  const [moduleData, setModuleData] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch module data and students when component mounts or module changes
  useEffect(() => {
    if (moduleName && isAuthenticated) {
      fetchModuleData();
    }
  }, [moduleName, isAuthenticated]);

  // Filter and sort students based on search term, progress filter, and sort options
  useEffect(() => {
    let filtered = students;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply progress filter
    if (progressFilter !== 'all') {
      filtered = filtered.filter(student => {
        const progress = student.progress || 0;
        switch (progressFilter) {
          case 'not-started': return progress === 0;
          case 'in-progress': return progress > 0 && progress < 100;
          case 'completed': return progress === 100;
          default: return true;
        }
      });
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      // Convert to string for consistent comparison
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue, undefined, { numeric: true });
      } else {
        return bValue.localeCompare(aValue, undefined, { numeric: true });
      }
    });
    
    setFilteredStudents(filtered);
  }, [students, searchTerm, sortField, sortDirection, progressFilter]);

  const fetchModuleData = async () => {
    try {
      setLoadingStudents(true);
      setError('');

      // Get teacher ID from user data
      const teacherId = user?.id || user?.sub;
      if (!teacherId) {
        setError('Unable to identify teacher. Please sign in again.');
        setLoadingStudents(false);
        return;
      }

      // First, get the module ID from module name
      const modulesResponse = await apiClient.get(`/api/modules?teacher_id=${teacherId}`);
      const modules = modulesResponse.data || modulesResponse;
      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = modules.find(m => m.name.toLowerCase() === moduleName.toLowerCase());
      
      if (!module) {
        setError(`Module "${moduleName}" not found in your modules`);
        setLoadingStudents(false);
        return;
      }

      setModuleData(module);

      // Get questions for this module
      const questionsResponse = await apiClient.get(`/api/student/modules/${module.id}/questions`);
      const questions = questionsResponse.data || questionsResponse;

      // Get all students who have submitted answers for this module using the optimized API
      let realStudents = [];
      let allModuleAnswers = [];
      
      try {
        // Use the dedicated API endpoint to get all student answers for this module
        const moduleAnswersResponse = await apiClient.get(`/api/student-answers?module_id=${module.id}`);
        allModuleAnswers = moduleAnswersResponse.data || moduleAnswersResponse || [];
        
        console.log(`Retrieved ${allModuleAnswers.length} answers for module ${module.name}`);
        
        if (allModuleAnswers.length > 0) {
          const studentMap = new Map();
          
          // Process all answers to extract unique students
          allModuleAnswers.forEach(answer => {
            if (answer.student_id) {
              const studentKey = answer.student_id;
              if (!studentMap.has(studentKey)) {
                studentMap.set(studentKey, {
                  id: answer.student_id,
                  name: answer.student_id, // Use student_id as name for now
                  email: answer.student_id, // Student ID might be email or we'll use it as identifier
                  student_id: answer.student_id,
                  last_access: answer.submitted_at || new Date().toISOString()
                });
              } else {
                // Update last access if this answer is more recent
                const existing = studentMap.get(studentKey);
                if (answer.submitted_at && new Date(answer.submitted_at) > new Date(existing.last_access)) {
                  existing.last_access = answer.submitted_at;
                }
              }
            }
          });
          
          realStudents = Array.from(studentMap.values());
          console.log(`Found ${realStudents.length} unique students who have started tests in module ${module.name}`);
        } else {
          console.log('No student answers found for this module');
        }
      } catch (error) {
        console.error('Error fetching module student answers:', error);
      }

      // Calculate actual performance for each student using the answers we already have
      if (realStudents.length > 0 && questions && questions.length > 0 && allModuleAnswers.length > 0) {
        const studentsWithPerformance = realStudents.map(student => {
          // Filter answers for this specific student
          const studentAnswers = allModuleAnswers.filter(answer => answer.student_id === student.student_id);
          
          // Calculate performance metrics
          const totalQuestions = questions.length;
          const answeredQuestions = studentAnswers.length;
          
          // Calculate correct answers by comparing student answer with correct answer
          const correctAnswers = studentAnswers.filter(answer => {
            if (typeof answer.answer === 'object' && typeof answer.correct_answer === 'object') {
              return JSON.stringify(answer.answer) === JSON.stringify(answer.correct_answer);
            }
            return answer.answer === answer.correct_answer;
          }).length;

          return {
            ...student,
            total_questions: totalQuestions,
            completed_questions: answeredQuestions,
            avg_score: answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0,
            progress: Math.round((answeredQuestions / totalQuestions) * 100)
          };
        });
        
        setStudents(studentsWithPerformance);
      } else {
        // No students found or no questions available
        setStudents(realStudents);
      }

    } catch (error) {
      console.error('Error fetching module data:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to load module data. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.detail) {
        errorMessage = error.detail;
      }
      
      // Handle authentication errors
      if (errorMessage.includes('Authentication required') || errorMessage.includes('401')) {
        errorMessage = 'Please sign in to access this page.';
      }
      
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleStudentClick = async (student) => {
    // Navigate to dedicated student detail page
    router.push(`/dashboard/students/${student.student_id}?module=${encodeURIComponent(moduleName)}`);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getProgressBadgeColor = (progress) => {
    if (progress === 0) return 'bg-gray-100 text-gray-800';
    if (progress < 50) return 'bg-red-100 text-red-800';
    if (progress < 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <SortAsc className="w-4 h-4 opacity-50" />;
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />;
  };

  // Export students data as CSV
  const exportStudentsCSV = () => {
    if (!filteredStudents.length) return;

    const csvHeaders = ['Student ID', 'Progress (%)', 'Average Score (%)', 'Questions Completed', 'Total Questions', 'Last Access'];
    
    const csvData = filteredStudents.map(student => [
      student.student_id,
      student.progress || 0,
      student.avg_score || 0,
      student.completed_questions || 0,
      student.total_questions || 0,
      student.last_access ? new Date(student.last_access).toLocaleString() : 'Never'
    ]);

    const csvContent = [
      `Module: ${moduleData?.name || moduleName}`,
      `Total Students: ${filteredStudents.length}`,
      `Export Date: ${new Date().toLocaleString()}`,
      '',
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students-${moduleData?.name || moduleName}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export students data as JSON
  const exportStudentsJSON = () => {
    if (!filteredStudents.length) return;

    const exportData = {
      module: {
        name: moduleData?.name || moduleName,
        description: moduleData?.description
      },
      exportInfo: {
        totalStudents: filteredStudents.length,
        exportDate: new Date().toISOString(),
        filters: {
          searchTerm,
          progressFilter,
          sortField,
          sortDirection
        }
      },
      students: filteredStudents.map(student => ({
        studentId: student.student_id,
        progress: student.progress || 0,
        averageScore: student.avg_score || 0,
        questionsCompleted: student.completed_questions || 0,
        totalQuestions: student.total_questions || 0,
        lastAccess: student.last_access,
        correctAnswers: student.correct_answers || 0,
        incorrectAnswers: student.incorrect_answers || 0
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students-${moduleData?.name || moduleName}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl mb-4">Access Denied</h1>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  if (!moduleName) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl mb-4">No Module Selected</h1>
        <p className="text-muted-foreground mb-4">Please specify a module using the ?module parameter</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-semibold mb-2">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={fetchModuleData}>Try Again</Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header with Gradient Background */}
            <div className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-foreground">Student Performance</h1>
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {moduleData?.name || moduleName}
                        </div>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Track and analyze student progress, performance, and engagement
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 relative">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={!students.length}
                      className="shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Download className="mr-2 w-4 h-4" />
                      Export Data
                    </Button>
                    {showExportMenu && students.length > 0 && (
                      <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                        <div className="p-2">
                          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Export Format</div>
                          <button
                            onClick={() => {
                              exportStudentsCSV();
                              setShowExportMenu(false);
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
                          >
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="font-medium">CSV File</div>
                              <div className="text-xs text-muted-foreground">For Excel & Sheets</div>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              exportStudentsJSON();
                              setShowExportMenu(false);
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted rounded-lg flex items-center gap-3 transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <FileJson className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium">JSON File</div>
                              <div className="text-xs text-muted-foreground">For APIs & Tools</div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6 border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, or student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={progressFilter}
                    onChange={(e) => setProgressFilter(e.target.value)}
                    className="px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="all">All Progress</option>
                    <option value="not-started">Not Started (0%)</option>
                    <option value="in-progress">In Progress (1-99%)</option>
                    <option value="completed">Completed (100%)</option>
                  </select>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {filteredStudents.length} of {students.length} students
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-blue-200/50 dark:bg-blue-800/50 rounded-full">
                      <TrendingUp className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {loadingStudents ? '...' : students.length}
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Enrolled in module</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-green-200/50 dark:bg-green-800/50 rounded-full">
                      <Zap className="w-3 h-3 text-green-700 dark:text-green-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Active Students</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {loadingStudents ? '...' : students.filter(s => {
                        const lastAccess = new Date(s.last_access);
                        const daysSinceAccess = (Date.now() - lastAccess.getTime()) / (1000 * 60 * 60 * 24);
                        return daysSinceAccess <= 7;
                      }).length}
                    </p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Last 7 days</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className={`px-2 py-1 rounded-full ${
                      !loadingStudents && students.length > 0 &&
                      Math.round(students.reduce((acc, s) => acc + s.avg_score, 0) / students.length) >= 70
                        ? 'bg-green-200/50 dark:bg-green-800/50'
                        : 'bg-purple-200/50 dark:bg-purple-800/50'
                    }`}>
                      <CheckCircle className={`w-3 h-3 ${
                        !loadingStudents && students.length > 0 &&
                        Math.round(students.reduce((acc, s) => acc + s.avg_score, 0) / students.length) >= 70
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-purple-700 dark:text-purple-300'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Avg Score</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {loadingStudents ? '...' : students.length > 0 ?
                        Math.round(students.reduce((acc, s) => acc + s.avg_score, 0) / students.length) + '%' :
                        '-'
                      }
                    </p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Overall performance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-orange-200/50 dark:bg-orange-800/50 rounded-full">
                      <TrendingUp className="w-3 h-3 text-orange-700 dark:text-orange-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Completion Rate</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                      {loadingStudents ? '...' : students.length > 0 ?
                        Math.round(students.filter(s => s.progress === 100).length / students.length * 100) + '%' :
                        '-'
                      }
                    </p>
                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">
                      {!loadingStudents && students.length > 0 && `${students.filter(s => s.progress === 100).length} completed`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            {loadingStudents ? (
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Loading students...</h3>
                  <p className="text-muted-foreground">Please wait while we fetch student data</p>
                </CardContent>
              </Card>
            ) : students.length === 0 ? (
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold mb-2">No students enrolled</h3>
                  <p className="text-muted-foreground mb-4">
                    This module does not have any students yet. Students will appear here automatically when they start taking tests.
                  </p>
                </CardContent>
              </Card>
            ) : filteredStudents.length === 0 ? (
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">No students found</h3>
                  <p className="text-muted-foreground mb-4">
                    No students match your search term &quot;{searchTerm}&quot;. Try adjusting your search.
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <List className="w-5 h-5" />
                      Student Performance Table
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {filteredStudents.length} students
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-gradient-to-r from-muted/40 to-muted/20">
                        <tr>
                          <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
                            <button
                              onClick={() => handleSort('student_id')}
                              className="flex items-center gap-2 hover:text-primary transition-colors group"
                            >
                              <User className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              Student ID
                              {getSortIcon('student_id')}
                            </button>
                          </th>
                          <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
                            <button
                              onClick={() => handleSort('progress')}
                              className="flex items-center gap-2 hover:text-primary transition-colors group"
                            >
                              <BarChart3 className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              Progress
                              {getSortIcon('progress')}
                            </button>
                          </th>
                          <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
                            <button
                              onClick={() => handleSort('avg_score')}
                              className="flex items-center gap-2 hover:text-primary transition-colors group"
                            >
                              <Target className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              Average Score
                              {getSortIcon('avg_score')}
                            </button>
                          </th>
                          <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
                            <button
                              onClick={() => handleSort('last_access')}
                              className="flex items-center gap-2 hover:text-primary transition-colors group"
                            >
                              <Clock className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              Last Access
                              {getSortIcon('last_access')}
                            </button>
                          </th>
                          <th className="text-left p-4 font-semibold text-sm uppercase tracking-wide">
                            <div className="flex items-center gap-2">
                              <Activity className="w-4 h-4 opacity-50" />
                              Actions
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {filteredStudents.map((student, index) => (
                          <tr
                            key={student.id}
                            className="hover:bg-muted/40 transition-all cursor-pointer group relative"
                            onClick={() => handleStudentClick(student)}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
                                    {student.student_id?.charAt(0)?.toUpperCase() || 'S'}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                </div>
                                <div>
                                  <div className="font-mono text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all">
                                    {student.student_id}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {student.completed_questions || 0}/{student.total_questions || 0} questions
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-semibold">{student.progress || 0}%</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getProgressBadgeColor(student.progress || 0)}`}>
                                    {(student.progress || 0) === 0 ? 'NOT STARTED' :
                                     (student.progress || 0) === 100 ? 'COMPLETE' : 'IN PROGRESS'}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden shadow-inner">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                                      (student.progress || 0) === 0 ? 'bg-gray-400' :
                                      (student.progress || 0) < 50 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                                      (student.progress || 0) < 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                      'bg-gradient-to-r from-green-400 to-green-500'
                                    }`}
                                    style={{width: `${student.progress || 0}%`}}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                                    (student.avg_score || 0) >= 80 ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' :
                                    (student.avg_score || 0) >= 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                    'bg-gradient-to-br from-red-400 to-red-600 text-white'
                                  }`}>
                                    {student.avg_score || 0}
                                  </div>
                                  {(student.avg_score || 0) >= 80 && (
                                    <div className="absolute -top-1 -right-1">
                                      <Award className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs space-y-1">
                                  <div className={`font-semibold ${
                                    (student.avg_score || 0) >= 80 ? 'text-green-600 dark:text-green-400' :
                                    (student.avg_score || 0) >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {(student.avg_score || 0) >= 80 ? 'Excellent' :
                                     (student.avg_score || 0) >= 60 ? 'Good' : 'Needs Improvement'}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {student.completed_questions || 0} answered
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <div className="text-sm">
                                  <div className="font-medium">
                                    {student.last_access ? new Date(student.last_access).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    }) : 'Never'}
                                  </div>
                                  {student.last_access && (
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(student.last_access).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStudentClick(student);
                                }}
                              >
                                View Details
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Enhanced Table Footer */}
                  <div className="border-t bg-gradient-to-r from-muted/20 to-muted/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{students.filter(s => s.progress === 100).length}</span> Completed
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{students.filter(s => s.progress > 0 && s.progress < 100).length}</span> In Progress
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span className="text-muted-foreground">
                            <span className="font-semibold text-foreground">{students.filter(s => s.progress === 0).length}</span> Not Started
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        <span>Click any row to view detailed analytics</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>


    </SidebarProvider>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <StudentsPageContent />
    </Suspense>
  );
}