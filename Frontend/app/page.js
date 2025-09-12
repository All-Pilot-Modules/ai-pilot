"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Users, BarChart3, Shield, Zap, Github, Star, BookOpen, TrendingUp, Award, Globe, Lock, Sparkles, ChevronRight, Play, ExternalLink, Plus } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Welcome Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Educational Analytics
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.username}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Transform student learning with intelligent insights and personalized educational experiences.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Modules</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <Brain className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Students</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <Users className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">AI Insights</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Module Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Learning Modules</h2>
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                No modules yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Create your first learning module to start tracking student progress and generating AI insights.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 w-4 h-4" />
                Create Module
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Manage Students</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Settings</span>
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



