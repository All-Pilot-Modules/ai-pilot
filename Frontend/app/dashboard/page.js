'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');
  const [moduleData, setModuleData] = useState({
    accessCode: "5C98E2",
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
    return `${window.location.origin}/${moduleData?.teacher_id}/${moduleName}`;
  };

  const regenerateAccessCode = async () => {
    // Simulate API call
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setModuleData(prev => ({...prev, accessCode: newCode}));
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
        <div className="flex flex-1 flex-col bg-gradient-to-br from-background via-background to-muted/20">
          {/* Professional Header */}
          <div className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {moduleName}
                      </h1>
                      <p className="text-sm text-muted-foreground font-medium">
                        Module Dashboard
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground max-w-2xl leading-relaxed">
                    Comprehensive analytics and management tools for your educational module
                  </p>
                </div>

                {/* Enhanced Module Sharing */}
                <Card className="w-full lg:w-80 shadow-lg border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900/50 dark:via-blue-950/50 dark:to-indigo-950/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-base">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Student Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Access Code
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                          <span className="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                            {moduleData.accessCode}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(moduleData.accessCode, 'code')}
                            className="h-8 w-8 p-0 border-slate-300 dark:border-slate-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                          >
                            {copiedItems.code ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-600" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={regenerateAccessCode}
                            className="h-8 w-8 p-0 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          >
                            <RotateCcw className="w-3 h-3 text-slate-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Join URL
                      </label>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                            {generateModuleUrl()}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(generateModuleUrl(), 'url')}
                              className="h-7 px-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              {copiedItems.url ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(generateModuleUrl(), '_blank')}
                              className="h-7 px-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">

            {/* Professional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 dark:from-blue-950/20 dark:via-blue-900/20 dark:to-blue-950/30 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Total Students</p>
                      <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{moduleData.totalStudents}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">+3 this week</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 via-amber-50 to-orange-100 dark:from-amber-950/20 dark:via-orange-900/20 dark:to-orange-950/30 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Active Tests</p>
                      <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{moduleData.activeTests}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span className="text-amber-600 font-medium">2 ending soon</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 via-emerald-50 to-green-100 dark:from-emerald-950/20 dark:via-green-900/20 dark:to-green-950/30 hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Completed Tests</p>
                      <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{moduleData.completedTests}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Target className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-medium">94% success rate</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                      <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Professional Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Weekly Activity Chart */}
              <Card className="xl:col-span-2 border-0 shadow-sm bg-white dark:bg-slate-900/50">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Weekly Performance
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Student engagement and assessment activity trends
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-medium">Last 7 days</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ChartContainer
                    config={{
                      students: {
                        label: "Active Students",
                        color: "#3b82f6",
                      },
                      tests: {
                        label: "Tests Completed", 
                        color: "#10b981",
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

              {/* Test Results & Quick Stats */}
              <div className="space-y-6">
                {/* Test Results Pie Chart */}
                <Card className="border-0 shadow-sm bg-white dark:bg-slate-900/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-base font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      Assessment Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ChartContainer
                      config={{
                        passed: {
                          label: "Passed",
                          color: "#22c55e",
                        },
                        failed: {
                          label: "Failed",
                          color: "#ef4444",
                        },
                        pending: {
                          label: "Pending",
                          color: "#f59e0b",
                        },
                      }}
                      className="h-48"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moduleData.testResults}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
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
                    <div className="space-y-2 mt-4">
                      {moduleData.testResults.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold text-violet-700 dark:text-violet-300">
                      <Activity className="w-4 h-4" />
                      Quick Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-violet-700 dark:text-violet-300">Avg. Completion Time</span>
                      <span className="font-semibold text-violet-900 dark:text-violet-100">24 min</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-violet-700 dark:text-violet-300">Most Active Day</span>
                      <span className="font-semibold text-violet-900 dark:text-violet-100">Thursday</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-violet-700 dark:text-violet-300">Success Rate</span>
                      <span className="font-semibold text-emerald-600">94.2%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Professional Action Center */}
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-900/50">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <PlusCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      Management Center
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-muted-foreground">
                      Essential tools for module administration
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/mymodules">
                      <Eye className="w-4 h-4 mr-2" />
                      All Modules
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    asChild 
                    className="h-20 p-4 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center gap-2"
                  >
                    <Link href={`/dashboard/students?module=${moduleName}`}>
                      <Users className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Students</div>
                        <div className="text-xs opacity-90">Manage enrollment</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 p-4 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                  >
                    <Link href={`/dashboard/tests?module=${moduleName}`}>
                      <FileText className="w-6 h-6 text-amber-600" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Tests</div>
                        <div className="text-xs text-muted-foreground">Create & manage</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 p-4 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                  >
                    <Link href={`/dashboard/analytics?module=${moduleName}`}>
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Analytics</div>
                        <div className="text-xs text-muted-foreground">Detailed insights</div>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild 
                    variant="outline" 
                    className="h-20 p-4 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                  >
                    <Link href={`/dashboard/settings?module=${moduleName}`}>
                      <Settings className="w-6 h-6 text-slate-600" />
                      <div className="text-center">
                        <div className="font-semibold text-sm">Settings</div>
                        <div className="text-xs text-muted-foreground">Configuration</div>
                      </div>
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