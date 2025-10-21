'use client';

import { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HelpCircle, Book, MessageCircle, FileText, ExternalLink, Github, BookOpen, Lightbulb, Video } from "lucide-react";
import Link from "next/link";

function HelpContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get("module");

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
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold">Help & Support - {moduleName}</h1>
                    <p className="text-muted-foreground">
                      Find answers and get help with your module
                    </p>
                  </div>
                </div>

                {/* GitHub Wiki Banner */}
                <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <Github className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                          Official Documentation Wiki
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full font-semibold">
                            Recommended
                          </span>
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Visit our comprehensive GitHub Wiki for detailed guides, tutorials, API documentation, and troubleshooting tips. Everything you need to know about AI Pilot.
                        </p>
                        <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
                          <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki" target="_blank" rel="noopener noreferrer">
                            <BookOpen className="mr-2 w-5 h-5" />
                            Visit GitHub Wiki
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Quick Help */}
                  <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Quick Start Guides
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/Getting-Started" target="_blank" rel="noopener noreferrer">
                          <Book className="mr-2 w-4 h-4" />
                          Getting Started Guide
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/Creating-Tests" target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 w-4 h-4" />
                          Creating Tests
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/Managing-Students" target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 w-4 h-4" />
                          Managing Students
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/Video-Tutorials" target="_blank" rel="noopener noreferrer">
                          <Video className="mr-2 w-4 h-4" />
                          Video Tutorials
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Documentation */}
                  <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="w-5 h-5 text-primary" />
                        Documentation & Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/API-Documentation" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 w-4 h-4" />
                          API Documentation
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/User-Manual" target="_blank" rel="noopener noreferrer">
                          <BookOpen className="mr-2 w-4 h-4" />
                          Complete User Manual
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/FAQ" target="_blank" rel="noopener noreferrer">
                          <HelpCircle className="mr-2 w-4 h-4" />
                          Frequently Asked Questions
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-500 transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki/Troubleshooting" target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 w-4 h-4" />
                          Troubleshooting Guide
                          <ExternalLink className="ml-auto w-3 h-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* FAQ Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">How do I create a new test?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Navigate to the Tests section and click &quot;Create Test&quot;. Fill in the test details, add questions, and set the duration.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">How do I add students to my module?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Go to the Students section and click &quot;Add Students&quot;. You can invite them by email or share a module code.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Where can I view test results?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Test results are available in the Analytics section, where you can see detailed performance metrics and insights.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">How do I export data?</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the &quot;Export Report&quot; button in the Analytics section to download performance data in various formats.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Need More Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Can&apos;t find what you&apos;re looking for? Check out these additional resources or reach out to the community.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/issues" target="_blank" rel="noopener noreferrer">
                          <Github className="mr-2 w-5 h-5" />
                          Report an Issue
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/discussions" target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="mr-2 w-5 h-5" />
                          Community Discussions
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="https://github.com/All-Pilot-Modules/ai-pilot/wiki" target="_blank" rel="noopener noreferrer">
                          <BookOpen className="mr-2 w-5 h-5" />
                          Browse Wiki
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <HelpContent />
    </Suspense>
  );
}