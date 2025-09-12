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
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, User, Shield, Bell } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";
import AssignmentFeaturesSelector from "@/components/AssignmentFeaturesSelector";

export default function SettingsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');
  const [moduleData, setModuleData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignment_config: {
      features: {
        multiple_attempts: {
          enabled: true,
          max_attempts: 2,
          show_feedback_after_each: true
        },
        chatbot_feedback: {
          enabled: true,
          conversation_mode: "guided",
          ai_model: "gpt-4"
        },
        mastery_learning: {
          enabled: false,
          streak_required: 3,
          queue_randomization: true,
          reset_on_wrong: false
        }
      },
      display_settings: {
        show_progress_bar: true,
        show_streak_counter: true,
        show_attempt_counter: true
      }
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      fetchModuleData();
    }
  }, [isAuthenticated, user, moduleName]);

  const fetchModuleData = async () => {
    try {
      setIsLoading(true);
      const modules = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      const currentModule = modules.find(m => m.name === moduleName);
      if (currentModule) {
        setModuleData(currentModule);
        setFormData({
          name: currentModule.name,
          description: currentModule.description || '',
          assignment_config: currentModule.assignment_config || formData.assignment_config
        });
      }
    } catch (error) {
      console.error('Failed to fetch module:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModule = async () => {
    if (!moduleData) return;
    
    try {
      setIsSaving(true);
      await apiClient.put(`/api/modules/${moduleData.id}`, {
        name: formData.name,
        description: formData.description,
        assignment_config: formData.assignment_config
      });
      
      // Update local data
      setModuleData(prev => ({
        ...prev,
        name: formData.name,
        description: formData.description,
        assignment_config: formData.assignment_config
      }));
      
      alert('Module settings updated successfully!');
    } catch (error) {
      console.error('Failed to update module:', error);
      alert('Failed to update module settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-bold">Settings - {moduleName}</h1>
                    <p className="text-muted-foreground">
                      Manage your module and account settings
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Combined Module Settings & Assignment Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Module Settings
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Configure your module details and assignment features
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Module Information */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="moduleName">Module Name</Label>
                          <Input 
                            id="moduleName" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="moduleDesc">Description</Label>
                          <Textarea 
                            id="moduleDesc" 
                            placeholder="Module description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            disabled={isLoading}
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Assignment Features */}
                      <div className="border-t pt-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium">Assignment Features</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure how students interact with assignments
                          </p>
                        </div>
                        {isLoading ? (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">Loading module settings...</p>
                          </div>
                        ) : (
                          <AssignmentFeaturesSelector
                            value={formData.assignment_config}
                            onChange={(config) => setFormData({...formData, assignment_config: config})}
                          />
                        )}
                      </div>

                      {/* Save Button */}
                      <div className="border-t pt-6">
                        <Button onClick={handleSaveModule} disabled={isSaving || isLoading} className="w-full">
                          <Save className="mr-2 w-4 h-4" />
                          {isSaving ? 'Saving Module Settings...' : 'Save All Changes'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Other Settings Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Account Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Account Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={user?.username} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue={user?.email} type="email" />
                      </div>
                      <Button>
                        <Save className="mr-2 w-4 h-4" />
                        Update Account
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Notification Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="emailNotifs">Email Notifications</Label>
                        <input type="checkbox" id="emailNotifs" className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="testAlerts">Test Completion Alerts</Label>
                        <input type="checkbox" id="testAlerts" className="h-4 w-4" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weeklyReports">Weekly Reports</Label>
                        <input type="checkbox" id="weeklyReports" className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <Button variant="outline">
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}