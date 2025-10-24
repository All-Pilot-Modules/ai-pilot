'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Users,
  FileText,
  BarChart3,
  Settings,
  TrendingUp,
  Clock,
  BookOpen,
  Target,
  Award,
  Activity,
  Copy,
  RotateCcw,
  ExternalLink,
  Check,
  Share2,
  Eye,
  PlusCircle,
  Calendar,
  ChevronUp,
  Download,
  Bell,
  Zap,
  Shield,
  Globe,
  Star,
  Sparkles,
  CheckCircle,
  XCircle,
  Brain,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { apiClient } from "@/lib/auth";
import { FullPageLoader } from "@/components/LoadingSpinner";

function DashboardContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const moduleName = searchParams.get('module');
  const [moduleData, setModuleData] = useState({
    accessCode: "",
    totalStudents: 0,
    totalQuestions: 0,
    totalDocuments: 0
  });
  
  const [copiedItems, setCopiedItems] = useState({});
  const [moduleId, setModuleId] = useState(null);
  const [rubricSummary, setRubricSummary] = useState(null);

  const loadRubricSummary = useCallback(async (id) => {
    try {
      const data = await apiClient.get(`/api/modules/${id}/rubric`);
      console.log('📊 Rubric data loaded:', data);
      setRubricSummary(data);
    } catch (error) {
      console.error('Failed to load rubric:', error);
      // Set default values if rubric doesn't exist
      setRubricSummary({
        rubric: {
          feedback_style: {
            tone: 'encouraging',
            detail_level: 'detailed'
          },
          rag_settings: {
            enabled: true
          },
          custom_instructions: null
        }
      });
    }
  }, []);

  const loadModuleData = useCallback(async () => {
    if (!user) return;

    try {
      const modules = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      const currentModule = modules.find(m => m.name === moduleName);

      if (currentModule) {
        setModuleId(currentModule.id);

        // Load real data
        try {
          // Get students count (from student-answers endpoint - count unique students)
          let studentsCount = 0;
          try {
            const answersData = await apiClient.get(`/api/student-answers/?module_id=${currentModule.id}`);
            if (Array.isArray(answersData)) {
              const uniqueStudents = new Set(answersData.map(a => a.student_id));
              studentsCount = uniqueStudents.size;
            }
          } catch (err) {
            console.log('No student answers yet');
          }

          // Get questions count
          const questionsData = await apiClient.get(`/api/questions/by-module?module_id=${currentModule.id}`);
          const questionsCount = Array.isArray(questionsData) ? questionsData.length : 0;

          // Get documents count (need teacher_id parameter)
          const documentsData = await apiClient.get(`/api/documents?teacher_id=${user.id}&module_id=${currentModule.id}`);
          const documentsCount = Array.isArray(documentsData) ? documentsData.length : 0;

          setModuleData({
            accessCode: currentModule.access_code,
            totalStudents: studentsCount,
            totalQuestions: questionsCount,
            totalDocuments: documentsCount
          });
        } catch (error) {
          console.error('Failed to load module stats:', error);
          setModuleData(prev => ({
            ...prev,
            accessCode: currentModule.access_code
          }));
        }

        // Load rubric summary
        loadRubricSummary(currentModule.id);
      }
    } catch (error) {
      console.error('Failed to load module data:', error);
    }
  }, [user, moduleName, loadRubricSummary]);

  // Load real module data from database
  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      loadModuleData();
    }
  }, [isAuthenticated, user, moduleName, loadModuleData]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems({...copiedItems, [type]: true});
      setTimeout(() => {
        setCopiedItems(prev => ({...prev, [type]: false}));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateModuleUrl = () => {
    const teacherId = user?.id || user?.sub || user?.email || 'teacher';
    return `${window.location.origin}/${teacherId}/${moduleName}`;
  };

  const regenerateAccessCode = async () => {
    try {
      // Get the current module
      const modules = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      const currentModule = modules.find(m => m.name === moduleName);
      
      if (currentModule) {
        // Call the real regenerate API
        const updatedModule = await apiClient.post(`/api/modules/${currentModule.id}/regenerate-code`);
        setModuleData(prev => ({...prev, accessCode: updatedModule.access_code}));
      }
    } catch (error) {
      console.error('Failed to regenerate access code:', error);
    }
  };

  // Function to check if a navigation item is active
  const isActiveSection = (section) => {
    return pathname.includes(`/dashboard/${section}`);
  };

  // Check if we're on the main dashboard
  const isMainDashboard = pathname === '/dashboard' || (!pathname.includes('/dashboard/') && pathname.includes('/dashboard'));

  if (loading) {
    return <FullPageLoader text="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-lg">
          <CardContent className="pt-12 pb-8 px-8 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              You need to be signed in to access the dashboard.
            </p>
            <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/sign-in">
                Sign In to Continue
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!moduleName) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-lg">
          <CardContent className="pt-12 pb-8 px-8 text-center">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Module Selected</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Please select a module from your modules list to view the dashboard.
            </p>
            <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/mymodules">
                <BookOpen className="w-4 h-4 mr-2" />
                Go to My Modules
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Clean Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {moduleName}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <Activity className="w-3 h-3" />
                        Module Dashboard
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-4 py-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            {/* Professional Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Students Card */}
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{moduleData.totalStudents}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Enrolled in module</p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Questions Card */}
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Questions</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{moduleData.totalQuestions}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">In test bank</p>
                  </div>
                </CardContent>
              </Card>

              {/* Total Documents Card */}
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Documents</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{moduleData.totalDocuments}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Course materials</p>
                  </div>
                </CardContent>
              </Card>

              {/* Student Access Card - Premium Design */}
              <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 relative">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Access Code</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-lg px-4 py-3 mb-4 border-2 border-blue-200 dark:border-blue-800 shadow-inner">
                    <div className="font-mono text-2xl font-bold text-blue-900 dark:text-blue-100 tracking-[0.3em] text-center">
                      {moduleData.accessCode || 'ABC123'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(moduleData.accessCode, 'code')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md h-8"
                    >
                      {copiedItems.code ? (
                        <>
                          <Check className="w-3 h-3 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={regenerateAccessCode}
                        className="flex-1 h-8 text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generateModuleUrl(), 'url')}
                        className="flex-1 h-8 text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {copiedItems.url ? (
                          <Check className="w-3 h-3 mr-1 text-blue-600" />
                        ) : (
                          <Globe className="w-3 h-3 mr-1" />
                        )}
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Configuration Cards Row */}
            {moduleId && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* AI Feedback Rubric Configuration */}
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100">
                          <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          AI Feedback Rubric
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 ml-9 sm:ml-[52px]">
                          Customize AI feedback generation
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                        <Link href={`/dashboard/rubric?moduleId=${moduleId}&moduleName=${encodeURIComponent(moduleName)}`}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                <CardContent className="relative pt-6">
                  {rubricSummary ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                      {/* Feedback Tone */}
                      <div className="group relative overflow-hidden lg:overflow-visible rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Feedback Tone</p>
                            <p className="text-base font-bold capitalize text-gray-900 dark:text-white mt-1">
                              {rubricSummary.rubric?.feedback_style?.tone || 'Encouraging'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Detail Level */}
                      <div className="group relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Detail Level</p>
                            <p className="text-base font-bold capitalize text-gray-900 dark:text-white mt-1">
                              {rubricSummary.rubric?.feedback_style?.detail_level || 'Detailed'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* RAG Status */}
                      <div className="group relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">RAG Retrieval</p>
                            <div className="mt-1">
                              {rubricSummary.rubric?.rag_settings?.enabled ? (
                                <Badge className="bg-blue-600 text-white border-0">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Enabled
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Disabled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Custom Instructions */}
                      <div className="group relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Custom Instructions</p>
                            <div className="mt-1">
                              {rubricSummary.rubric?.custom_instructions ? (
                                <Badge className="bg-blue-600 text-white border-0">Configured</Badge>
                              ) : (
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Not set</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm">Loading rubric configuration...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

                {/* Consent Form Configuration */}
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100">
                          <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          Research Consent Form
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 ml-9 sm:ml-[52px]">
                          Manage student consent & waiver
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                        <Link href={`/module/${moduleId}/consent`}>
                          <FileText className="w-4 h-4 mr-2" />
                          Edit Form
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Consent Required</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Students must complete the consent form before accessing module content
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-500/20 dark:bg-blue-500/30 rounded-lg">
                          <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Customizable Content</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Edit form text, toggle consent requirement, and preview changes in real-time
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Track Responses</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Monitor student consent status and view response analytics
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Survey Configuration Card */}
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100">
                          <div className="p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          Student Survey
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 ml-9 sm:ml-[52px]">
                          Collect student feedback
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-initial">
                          <Link href={`/dashboard/survey?module=${moduleId}&name=${moduleName}`}>
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Survey
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 flex-1 sm:flex-initial">
                          <Link href={`/dashboard/survey/responses?module=${moduleId}&name=${moduleName}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Responses
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Custom Questions</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create and customize survey questions to gather student feedback about the module
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-purple-500/20 dark:bg-purple-500/30 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Text Responses</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Students provide detailed written feedback in their own words
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">View Responses</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Access and analyze all student survey responses in one place
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Chatbot Settings Card */}
                <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 lg:col-span-2">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 sm:gap-3 text-gray-900 dark:text-gray-100">
                          <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          AI Chatbot Settings
                        </CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 ml-9 sm:ml-[52px]">
                          Customize how the AI tutor responds to students
                        </p>
                      </div>
                      <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                        <Link href={`/dashboard/chatbot-settings?module=${moduleId}`}>
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="relative pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Chatbot Status */}
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Response Style</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Define chatbot tone, teaching approach, and conversation style
                          </p>
                        </div>
                      </div>

                      {/* Custom Instructions */}
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Custom Instructions</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Add specific guidelines for how the chatbot should interact with students
                          </p>
                        </div>
                      </div>

                      {/* RAG Integration */}
                      <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="p-2.5 bg-blue-500/20 dark:bg-blue-500/30 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Course Material Based</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Chatbot uses your uploaded documents to answer student questions
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions - Management Grid */}
            <Card className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div>
                  <CardTitle className="text-xl font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
                    <div className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    Management Center
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-[52px]">Quick access to module management tools</p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href={`/dashboard/students?module=${moduleName}`} className="group">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Students</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Manage enrollments</span>
                      </div>
                    </div>
                  </Link>

                  <Link href={`/dashboard/tests?module=${moduleName}`} className="group">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tests</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Create & manage</span>
                      </div>
                    </div>
                  </Link>

                  <Link href={`/dashboard/analytics?module=${moduleName}`} className="group">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Analytics</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">View insights</span>
                      </div>
                    </div>
                  </Link>

                  <Link href={`/dashboard/settings?module=${moduleName}`} className="group">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Configure module</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<FullPageLoader text="Loading dashboard..." />}>
      <DashboardContent />
    </Suspense>
  );
}