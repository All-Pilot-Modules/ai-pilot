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
  // Add custom animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }
      @keyframes pulse-glow {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      @keyframes gradient-shift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-purple-950/10 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" style={{animation: 'float 6s ease-in-out infinite'}}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" style={{animation: 'float 8s ease-in-out infinite 1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl" style={{animation: 'float 10s ease-in-out infinite 2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          {/* Beautiful Header */}
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                  Welcome back,
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]" style={{animation: 'gradient-shift 3s ease infinite'}}>
                    {user?.username}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                  ✨ Manage your modules and track student progress
                </p>
              </div>
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 text-lg px-8 py-6 font-bold bg-[length:200%_auto]" style={{animation: 'gradient-shift 3s ease infinite'}}>
                <Link href="/mymodules">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Create Module
                </Link>
              </Button>
            </div>
          </div>

          {/* Beautiful Stats Grid */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Stat */}
              <div className="md:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 hover:shadow-purple-500/20 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Total Modules
                      </p>
                      <p className="text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        {loadingModules ? '...' : modules.length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active learning modules</p>
                    </div>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl transform" style={{animation: 'float 3s ease-in-out infinite'}}>
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-6 text-white hover:shadow-blue-500/50 transition-all duration-500 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold mb-1">{modules.length > 0 ? '100%' : '0%'}</p>
                    <p className="text-sm opacity-90 font-medium">Active Rate</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-6 text-white hover:shadow-pink-500/50 transition-all duration-500 hover:scale-105 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <Sparkles className="w-8 h-8 mb-3 opacity-80" />
                    <p className="text-3xl font-bold mb-1">{modules.length * 5}</p>
                    <p className="text-sm opacity-90 font-medium">AI Insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Your Modules</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">Manage and explore your learning modules</p>
              </div>
              {modules.length > 0 && (
                <Link href="/mymodules" className="px-6 py-3 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {loadingModules ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-xl w-2/3"></div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-lg w-full"></div>
                      <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-lg w-4/5"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.slice(0, 6).map((moduleItem, index) => (
                  <Link
                    key={moduleItem.id}
                    href={`/dashboard?module=${encodeURIComponent(moduleItem.name)}`}
                    className="group"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`
                    }}
                  >
                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 h-full hover:shadow-purple-500/30 hover:shadow-3xl hover:scale-105 transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden group">
                      {/* Decorative gradient overlay */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${
                        index % 4 === 0 ? 'from-blue-500/10 to-purple-500/10' :
                        index % 4 === 1 ? 'from-purple-500/10 to-pink-500/10' :
                        index % 4 === 2 ? 'from-pink-500/10 to-orange-500/10' :
                        'from-indigo-500/10 to-cyan-500/10'
                      } rounded-3xl`}></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className={`w-16 h-16 ${
                            index % 4 === 0 ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600' :
                            index % 4 === 1 ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600' :
                            index % 4 === 2 ? 'bg-gradient-to-br from-pink-500 via-pink-600 to-orange-600' :
                            'bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-600'
                          } rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                            <BookOpen className="w-8 h-8 text-white" />
                          </div>
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg px-3 py-1 font-bold">
                            ✨ Active
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {moduleItem.name}
                        </h3>
                        <p className="text-base text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {moduleItem.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl" style={{animation: 'float 4s ease-in-out infinite'}}>
                    <Rocket className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                    Create your first module
                  </h3>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Get started by creating a learning module to track student progress and generate AI insights.
                  </p>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-110 text-lg px-10 py-7 font-bold">
                    <Link href="/mymodules">
                      <Sparkles className="mr-3 w-6 h-6" />
                      Create Your First Module
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {modules.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <div className="mb-8">
                <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Quick Actions</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">Jump to frequently used sections</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Link href="/mymodules" className="group">
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 hover:shadow-blue-500/30 hover:shadow-3xl hover:scale-110 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Modules</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/students" className="group">
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 hover:shadow-purple-500/30 hover:shadow-3xl hover:scale-110 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Students</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/analytics" className="group">
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 hover:shadow-pink-500/30 hover:shadow-3xl hover:scale-110 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <BarChart3 className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-orange-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Analytics</p>
                    </div>
                  </div>
                </Link>
                <Link href="/dashboard/documents" className="group">
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800/50 p-8 hover:shadow-indigo-500/30 hover:shadow-3xl hover:scale-110 transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-xl font-black text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-cyan-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Documents</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
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
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white mb-8 leading-tight tracking-tight">
              <span className="block">The Future of</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                AI Education
              </span>
            </h1>

            {/* Enhanced Subtitle */}
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed font-normal">
              Open source platform empowering educators with cutting-edge AI analytics, real-time insights, and personalized learning experiences.
              <span className="font-medium text-slate-700 dark:text-slate-200"> Free forever, community-driven, and built for everyone.</span>
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
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
                  Are you a student?
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto font-normal leading-relaxed">
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
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Everything you need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              revolutionize education
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
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
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed font-normal">
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

            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Start using AI Education Pilot
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                completely free, forever
              </span>
            </h3>

            <p className="text-lg text-green-100 mb-10 max-w-3xl mx-auto leading-relaxed font-normal">
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
