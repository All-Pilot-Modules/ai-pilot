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
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { apiClient } from "@/lib/auth";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function DashboardContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const moduleName = searchParams.get('module');
  const [moduleData, setModuleData] = useState({
    accessCode: "",
    totalStudents: 24,
    activeTests: 3,
    completedTests: 12,
    weeklyData: [
      { day: "Mon", students: 18, tests: 2 },
      { day: "Tue", students: 22, tests: 4 },
      { day: "Wed", students: 20, tests: 3 },
      { day: "Thu", students: 24, tests: 5 },
      { day: "Fri", students: 19, tests: 3 },
      { day: "Sat", students: 15, tests: 1 },
      { day: "Sun", students: 12, tests: 1 }
    ],
    testResults: [
      { name: "Passed", value: 85, color: "#22c55e" },
      { name: "Failed", value: 10, color: "#ef4444" },
      { name: "Pending", value: 5, color: "#f59e0b" }
    ]
  });
  
  const [copiedItems, setCopiedItems] = useState({});
  const [moduleId, setModuleId] = useState(null);
  const [rubricSummary, setRubricSummary] = useState(null);

  const loadRubricSummary = useCallback(async (id) => {
    try {
      const data = await apiClient.get(`/api/modules/${id}/rubric`);
      setRubricSummary(data);
    } catch (error) {
      console.error('Failed to load rubric:', error);
    }
  }, []);

  const loadModuleData = useCallback(async () => {
    if (!user) return;

    try {
      const modules = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      const currentModule = modules.find(m => m.name === moduleName);

      if (currentModule) {
        setModuleId(currentModule.id);
        setModuleData(prev => ({
          ...prev,
          accessCode: currentModule.access_code
        }));

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
        <Button asChild>
          <Link href="/mymodules">Go to My Modules</Link>
        </Button>
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
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard - {moduleName}</h1>
              <p className="text-muted-foreground">Manage your module and track student progress</p>
            </div>
            {/* Top Row: Metrics + Student Access */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Metrics Cards */}
              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold text-foreground">{moduleData.totalStudents}</p>
                    </div>
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Tests</p>
                      <p className="text-2xl font-bold text-foreground">{moduleData.activeTests}</p>
                    </div>
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed Tests</p>
                      <p className="text-2xl font-bold text-foreground">{moduleData.completedTests}</p>
                    </div>
                    <Award className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              {/* Student Access - Compact Coupon Style */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Student Access</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-md px-3 py-2 mb-3 border border-blue-200 dark:border-blue-800">
                    <div className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100 tracking-widest">
                      {moduleData.accessCode}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(moduleData.accessCode, 'code')}
                      className="w-full h-7 text-xs border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900"
                    >
                      {copiedItems.code ? (
                        <Check className="w-3 h-3 text-green-600 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      Copy Code
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={regenerateAccessCode}
                        className="flex-1 h-7 text-xs border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        New
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generateModuleUrl(), 'url')}
                        className="flex-1 h-7 text-xs border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900"
                      >
                        {copiedItems.url ? (
                          <Check className="w-3 h-3 text-green-600 mr-1" />
                        ) : (
                          <ExternalLink className="w-3 h-3 mr-1" />
                        )}
                        URL
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics - Full Width */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="lg:col-span-2 border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">Student engagement over the last 7 days</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ChartContainer
                    config={{
                      students: {
                        label: "Active Students",
                        color: "#64748b",
                      },
                      tests: {
                        label: "Tests Completed", 
                        color: "#475569",
                      },
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={moduleData.weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis 
                          dataKey="day" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: 'currentColor' }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar 
                          dataKey="students" 
                          fill="var(--color-students)" 
                          radius={[4, 4, 0, 0]}
                          name="Active Students"
                        />
                        <Bar 
                          dataKey="tests" 
                          fill="var(--color-tests)" 
                          radius={[4, 4, 0, 0]}
                          name="Tests Completed"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                  <p className="text-sm text-muted-foreground">Assessment performance breakdown</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <ChartContainer
                    config={{
                      passed: {
                        label: "Passed",
                        color: "#64748b",
                      },
                      failed: {
                        label: "Failed",
                        color: "#475569",
                      },
                      pending: {
                        label: "Pending",
                        color: "#94a3b8",
                      },
                    }}
                    className="h-80"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={moduleData.testResults}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {moduleData.testResults.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* AI Feedback Rubric Configuration */}
            {moduleId && (
              <Card className="border-border bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        AI Feedback Rubric
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Customize how AI generates feedback for student answers
                      </p>
                    </div>
                    <Button asChild>
                      <Link href={`/dashboard/rubric?moduleId=${moduleId}&moduleName=${encodeURIComponent(moduleName)}`}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Rubric
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {rubricSummary ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Feedback Tone */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Feedback Tone</p>
                          <p className="text-sm font-medium capitalize truncate">
                            {rubricSummary.rubric?.feedback_style?.tone || 'Encouraging'}
                          </p>
                        </div>
                      </div>

                      {/* Detail Level */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900/30">
                          <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Detail Level</p>
                          <p className="text-sm font-medium capitalize truncate">
                            {rubricSummary.rubric?.feedback_style?.detail_level || 'Detailed'}
                          </p>
                        </div>
                      </div>

                      {/* RAG Status */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <div className={`p-2 rounded-md ${
                          rubricSummary.rubric?.rag_settings?.enabled
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <BookOpen className={`w-4 h-4 ${
                            rubricSummary.rubric?.rag_settings?.enabled
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">RAG Retrieval</p>
                          <p className="text-sm font-medium">
                            {rubricSummary.rubric?.rag_settings?.enabled ? (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Enabled
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Disabled
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Custom Instructions */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                        <div className={`p-2 rounded-md ${
                          rubricSummary.rubric?.custom_instructions
                            ? 'bg-orange-100 dark:bg-orange-900/30'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <FileText className={`w-4 h-4 ${
                            rubricSummary.rubric?.custom_instructions
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Instructions</p>
                          <p className="text-sm font-medium">
                            {rubricSummary.rubric?.custom_instructions ? (
                              <Badge variant="default" className="text-xs">Configured</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not set</span>
                            )}
                          </p>
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
            )}

            {/* Quick Actions */}
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Management</CardTitle>
                <p className="text-sm text-muted-foreground">Quick access to module management tools</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                    <Link href={`/dashboard/students?module=${moduleName}`}>
                      <Users className="w-6 h-6" />
                      <span className="text-sm">Students</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                    <Link href={`/dashboard/tests?module=${moduleName}`}>
                      <FileText className="w-6 h-6" />
                      <span className="text-sm">Tests</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                    <Link href={`/dashboard/analytics?module=${moduleName}`}>
                      <BarChart3 className="w-6 h-6" />
                      <span className="text-sm">Analytics</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-20 flex flex-col gap-2">
                    <Link href={`/dashboard/settings?module=${moduleName}`}>
                      <Settings className="w-6 h-6" />
                      <span className="text-sm">Settings</span>
                    </Link>
                  </Button>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}