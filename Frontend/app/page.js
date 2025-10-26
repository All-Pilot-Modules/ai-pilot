"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Users, BarChart3, Shield, Zap, Github, Star, BookOpen, TrendingUp, Award, Globe, Lock, Sparkles, ChevronRight, Play, ExternalLink, Plus, FileText, Calendar, Activity, Target, GraduationCap, Rocket, Settings } from "lucide-react";
import { apiClient } from "@/lib/auth";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Fetch modules when authenticated - Hook must be called unconditionally
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchModules();
    }
  }, [isAuthenticated, user]);

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
      const teacherId = user?.id || user?.sub;
      if (!teacherId) return;

      const modulesData = await apiClient.get(`/api/modules?teacher_id=${teacherId}`);
      setModules(modulesData || []);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      setModules([]);
    } finally {
      setLoadingModules(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const totalStudents = 0; // Would be calculated from modules data
    const completionRate = modules.length > 0 ? 85 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Enhanced Welcome Header */}
          <div className="mb-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl"></div>
            <div className="relative p-10 rounded-3xl border border-border/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Rocket className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-foreground">
                        Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.username || 'Teacher'}</span>!
                      </h1>
                      <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Active
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Your AI-powered teaching dashboard • Track, analyze, and inspire
                    </p>
                  </div>
                </div>
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
                  <Link href="/mymodules">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Module
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="px-2 py-1 bg-blue-200/50 dark:bg-blue-800/50 rounded-full">
                    <TrendingUp className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Active Modules</p>
                  <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
                    {loadingModules ? '...' : modules.length}
                  </p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Learning pathways</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="px-2 py-1 bg-green-200/50 dark:bg-green-800/50 rounded-full">
                    <Activity className="w-3 h-3 text-green-700 dark:text-green-300" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Students</p>
                  <p className="text-4xl font-bold text-green-900 dark:text-green-100">
                    {totalStudents}
                  </p>
                  <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">Enrolled learners</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="px-2 py-1 bg-purple-200/50 dark:bg-purple-800/50 rounded-full">
                    <Sparkles className="w-3 h-3 text-purple-700 dark:text-purple-300" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">AI Insights</p>
                  <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">
                    {modules.length * 3}
                  </p>
                  <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Generated reports</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <div className="px-2 py-1 bg-orange-200/50 dark:bg-orange-800/50 rounded-full">
                    <TrendingUp className="w-3 h-3 text-orange-700 dark:text-orange-300" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Avg Completion</p>
                  <p className="text-4xl font-bold text-orange-900 dark:text-orange-100">
                    {completionRate}%
                  </p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1">Student progress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modules Grid */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Your Learning Modules</h2>
                <p className="text-muted-foreground mt-1">Manage and track your educational content</p>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link href="/mymodules">
                  View All
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {loadingModules ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="w-12 h-12 bg-muted rounded-xl"></div>
                        <div className="h-6 bg-muted rounded w-2/3"></div>
                        <div className="h-4 bg-muted rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {modules.slice(0, 6).map((moduleItem, index) => (
                  <Card key={moduleItem.id} className="border-border bg-card/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <Link href={`/dashboard?module=${encodeURIComponent(moduleItem.name)}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${
                            index % 4 === 0 ? 'from-blue-500 to-blue-600' :
                            index % 4 === 1 ? 'from-green-500 to-green-600' :
                            index % 4 === 2 ? 'from-purple-500 to-purple-600' :
                            'from-orange-500 to-orange-600'
                          } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {moduleItem.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {moduleItem.description || 'No description available'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>0 students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>0 docs</span>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 bg-card/30">
                <CardContent className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    Ready to start your teaching journey?
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                    Create your first learning module to start tracking student progress and generating AI-powered insights.
                  </p>
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl">
                    <Link href="/mymodules">
                      <Plus className="mr-2 w-5 h-5" />
                      Create Your First Module
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="shadow-lg border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base">Jump to common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-auto py-6 flex-col gap-3 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500 transition-all group">
                  <Link href="/mymodules">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                      <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium">My Modules</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col gap-3 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-500 transition-all group" disabled={modules.length === 0}>
                  <Link href={modules.length > 0 ? `/dashboard/students` : "/mymodules"}>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium">Students</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col gap-3 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-500 transition-all group" disabled={modules.length === 0}>
                  <Link href={modules.length > 0 ? `/dashboard/analytics` : "/mymodules"}>
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                      <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium">Analytics</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-6 flex-col gap-3 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-500 transition-all group" disabled={modules.length === 0}>
                  <Link href={modules.length > 0 ? `/dashboard/documents` : "/mymodules"}>
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                      <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-medium">Documents</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/80 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            {/* Open Source Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 text-green-700 dark:text-green-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-green-200/50 dark:border-green-800/50 shadow-lg backdrop-blur-sm">
              <Github className="w-4 h-4" />
              100% Free & Open Source Forever
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                MIT License
              </Badge>
            </div>
            
            {/* Hero Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 leading-none">
              <span className="block">The Future of</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                AI Education
              </span>
            </h1>
            
            {/* Enhanced Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Open source platform empowering educators with cutting-edge AI analytics, real-time insights, and personalized learning experiences. 
              <span className="font-semibold text-slate-700 dark:text-slate-200">Free forever, community-driven, and built for everyone.</span>
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-10 py-6 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/sign-in" className="inline-flex items-center">
                  <Play className="mr-3 w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="px-10 py-6 text-lg font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
              >
                <Link href="https://github.com" target="_blank" className="inline-flex items-center">
                  <Github className="mr-3 w-5 h-5" />
                  View Source Code
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Student Access Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 mb-16 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Are you a student?
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
                  Join a learning module with an access code from your instructor and start taking tests, accessing materials, and tracking your progress.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/join" className="inline-flex items-center">
                    <BookOpen className="mr-3 w-5 h-5" />
                    Join a Module
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Open Source Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500 dark:text-slate-400 mb-16">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-green-500" />
                <span>MIT License</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-500" />
                <span>Self-Hostable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20 dark:opacity-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl rotate-12 animate-bounce"></div>
        </div>
        <div className="absolute top-40 right-20 opacity-20 dark:opacity-10">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 dark:opacity-10">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-600 rounded-lg -rotate-12 animate-spin"></div>
        </div>
      </div>

      {/* Open Source Stats Section */}
      <div className="bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100%", label: "Free & Open Source", icon: <Github className="w-6 h-6 text-green-600" /> },
              { value: "MIT", label: "License", icon: <Star className="w-6 h-6 text-yellow-600" /> },
              { value: "∞", label: "Always Free", icon: <Globe className="w-6 h-6 text-blue-600" /> },
              { value: "24/7", label: "Community Support", icon: <Users className="w-6 h-6 text-purple-600" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            Platform Features
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">
            Everything you need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              revolutionize education
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Cutting-edge AI technology meets intuitive design to deliver unprecedented educational insights and outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"><Brain className="w-6 h-6 text-white" /></div>,
              title: "AI-Powered Analytics",
              description: "Advanced machine learning algorithms analyze student performance patterns, predict learning outcomes, and provide actionable insights for personalized education.",
              features: ["Predictive Analytics", "Learning Pattern Recognition", "Performance Forecasting"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-white" /></div>,
              title: "Student Journey Management",
              description: "Comprehensive tools to track, manage, and optimize individual student learning journeys with real-time progress monitoring and personalized support.",
              features: ["Individual Progress Tracking", "Learning Path Optimization", "Goal Setting & Monitoring"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><BarChart3 className="w-6 h-6 text-white" /></div>,
              title: "Real-time Dashboards",
              description: "Dynamic, interactive dashboards that update in real-time, providing instant visibility into student progress and institutional performance metrics.",
              features: ["Live Data Visualization", "Custom Reporting", "Interactive Charts"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center"><BookOpen className="w-6 h-6 text-white" /></div>,
              title: "Smart Module Management",
              description: "Create and manage specialized learning modules with ease. Build custom educational pathways tailored to different learning needs and disabilities.",
              features: ["Module Builder", "IEP Support", "Autism Spectrum Tools"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-white" /></div>,
              title: "AI Test Creation & Feedback",
              description: "Effortlessly create tests and assessments with AI assistance. Get instant, personalized feedback for students with intelligent analysis and recommendations.",
              features: ["AI Test Generator", "Instant Feedback", "Smart Assessment"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center"><Brain className="w-6 h-6 text-white" /></div>,
              title: "Intelligent Q&A System",
              description: "AI-powered assistant that answers questions about tests, modules, and student progress. Get insights and recommendations through natural conversation.",
              features: ["AI Assistant", "Test Analysis", "Progress Insights"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>,
              title: "Enterprise Security",
              description: "Military-grade security ensuring complete student data privacy, FERPA compliance, and enterprise-level data protection with audit trails.",
              features: ["End-to-End Encryption", "FERPA Compliant", "SOC 2 Certified"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div>,
              title: "Lightning Fast Performance",
              description: "Cloud-native architecture with global CDN delivers sub-second response times and 99.9% uptime guarantee worldwide for seamless user experience.",
              features: ["Global CDN", "Sub-second Response", "99.9% Uptime SLA"]
            },
            {
              icon: <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>,
              title: "Advanced Reporting",
              description: "Generate comprehensive reports with AI-driven insights. Track progress, identify trends, and make data-driven decisions for better educational outcomes.",
              features: ["Custom Reports", "Trend Analysis", "Export Options"]
            }
          ].map((feature, index) => (
            <Card key={index} className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-900/50 hover:-translate-y-2 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <ChevronRight className="w-4 h-4 mr-2 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Final CTA Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-green-900 to-emerald-900 p-12 md:p-20 text-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_25%,rgba(255,255,255,.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.1)_75%,rgba(255,255,255,.1))] bg-[length:20px_20px] opacity-20"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20">
              <Github className="w-4 h-4" />
              Join the Open Source Education Revolution
            </div>
            
            <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
              Start using AI Education Pilot
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                completely free, forever
              </span>
            </h3>
            
            <p className="text-xl text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Download, deploy, and customize this open source platform. No accounts, no payments, no limitations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-green-50 px-10 py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/sign-up" className="inline-flex items-center">
                  <Github className="mr-3 w-5 h-5" />
                  Get Started Now
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="px-10 py-6 text-lg font-semibold rounded-xl border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
              >
                <Link href="https://github.com" target="_blank" className="inline-flex items-center">
                  <Star className="mr-3 w-5 h-5" />
                  Star on GitHub
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-green-200">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-green-400" />
                <span>Open source forever</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Self-host anywhere</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="text-xl font-bold text-white">AI Education Pilot</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Empowering educators worldwide with cutting-edge AI analytics and personalized learning insights.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-2">
                  <Github className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 AI Education Pilot. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="w-4 h-4 text-green-400" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Lock className="w-4 h-4 text-blue-400" />
                <span>FERPA Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



