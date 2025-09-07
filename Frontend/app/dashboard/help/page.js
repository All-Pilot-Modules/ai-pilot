'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HelpCircle, Book, MessageCircle, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Quick Help */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Quick Help
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Book className="mr-2 w-4 h-4" />
                        Getting Started Guide
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 w-4 h-4" />
                        Creating Tests
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <MessageCircle className="mr-2 w-4 h-4" />
                        Managing Students
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Documentation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Book className="w-5 h-5" />
                        Documentation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="mr-2 w-4 h-4" />
                        API Documentation
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="mr-2 w-4 h-4" />
                        User Manual
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="mr-2 w-4 h-4" />
                        FAQ
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
                        Navigate to the Tests section and click "Create Test". Fill in the test details, add questions, and set the duration.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">How do I add students to my module?</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Go to the Students section and click "Add Students". You can invite them by email or share a module code.
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
                        Use the "Export Report" button in the Analytics section to download performance data in various formats.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Support */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Need More Help?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <div className="flex gap-2">
                      <Button>Contact Support</Button>
                      <Button variant="outline">Community Forum</Button>
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