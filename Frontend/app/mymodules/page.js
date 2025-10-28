'use client';

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Copy, RotateCcw, ExternalLink, Check, Trash2, Settings, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";
import AssignmentFeaturesSelector from "@/components/AssignmentFeaturesSelector";
import RubricQuickSelector from "@/components/rubric/RubricQuickSelector";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function MyModules() {
  const { user, loading, isAuthenticated } = useAuth();
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rubric_template: 'default',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});
  const [deletingModules, setDeletingModules] = useState({});
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [moduleToRegenerate, setModuleToRegenerate] = useState(null);

  const fetchModules = async () => {
    try {
      const data = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      setModules(data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchModules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      // Create module first
      const moduleData = {
        teacher_id: user.id,
        name: formData.name,
        description: formData.description,
        is_active: true,
        visibility: 'class-only',
        assignment_config: formData.assignment_config
      };

      const createdModule = await apiClient.post('/api/modules', moduleData);

      // Apply rubric template if not default
      if (formData.rubric_template && formData.rubric_template !== 'default') {
        try {
          await apiClient.post(
            `/api/modules/${createdModule.id}/rubric/apply-template`,
            null,
            { params: { template_name: formData.rubric_template, preserve_custom_instructions: false } }
          );
        } catch (error) {
          console.error('Failed to apply rubric template:', error);
        }
      }

      setFormData({
        name: '',
        description: '',
        rubric_template: 'default',
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
      fetchModules(); // Refresh the list
    } catch (error) {
      console.error('Failed to create module:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateModuleUrl = (module) => {
    return `${window.location.origin}/${module.teacher_id}/${module.name}`;
  };

  const copyToClipboard = async (text, type, moduleId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems({...copiedItems, [`${moduleId}-${type}`]: true});
      setTimeout(() => {
        setCopiedItems(prev => ({...prev, [`${moduleId}-${type}`]: false}));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerateAccessCode = async () => {
    if (!moduleToRegenerate) return;

    try {
      await apiClient.post(`/api/modules/${moduleToRegenerate}/regenerate-code`);
      fetchModules(); // Refresh to get new access code
      setShowRegenerateDialog(false);
      setModuleToRegenerate(null);
    } catch (error) {
      console.error('Failed to regenerate access code:', error);
      setShowRegenerateDialog(false);
      setModuleToRegenerate(null);
    }
  };

  const deleteModule = async (moduleId, moduleName) => {
    const confirmMessage = `Are you sure you want to delete "${moduleName}"?\n\n⚠️ WARNING: This will permanently delete:\n• All questions in this module\n• All student answers and progress\n• All uploaded documents\n• All student enrollments\n\nThis action cannot be undone!`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingModules(prev => ({ ...prev, [moduleId]: true }));

    try {
      await apiClient.delete(`/api/modules/${moduleId}`);
      fetchModules(); // Refresh the list

      // Show success message
      alert(`Module "${moduleName}" has been successfully deleted.`);
    } catch (error) {
      console.error('Failed to delete module:', error);
      alert(`Failed to delete module "${moduleName}". Please try again.`);
    } finally {
      setDeletingModules(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading modules..." />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-foreground mb-2">My Modules</h1>
          <p className="text-muted-foreground">Create and manage your modules</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Module Form - Left Side */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">Create New Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Module Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '');
                          setFormData({...formData, name: value});
                        }}
                        placeholder="Enter module name (no spaces)"
                        required
                        pattern="[^\s]+"
                        title="Module name cannot contain spaces"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">No spaces allowed. Use hyphens or underscores instead.</p>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter module description"
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Rubric Template Selector */}
                    <div className="pt-2 border-t">
                      <RubricQuickSelector
                        value={formData.rubric_template}
                        onChange={(template) => setFormData({...formData, rubric_template: template})}
                      />
                    </div>

                    {/* Assignment Features Section */}
                    <div className="space-y-4 pt-2 border-t">
                      <div>
                        <Label className="text-sm font-medium">Assignment Features</Label>
                        <p className="text-xs text-muted-foreground">Configure how students interact with assignments</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-muted-foreground">Active:</span>
                          {formData.assignment_config.features.multiple_attempts.enabled && (
                            <Badge variant="secondary" className="text-xs">Multiple Attempts</Badge>
                          )}
                          {formData.assignment_config.features.chatbot_feedback.enabled && (
                            <Badge variant="secondary" className="text-xs">AI Chatbot</Badge>
                          )}
                          {formData.assignment_config.features.mastery_learning.enabled && (
                            <Badge variant="secondary" className="text-xs">Mastery Learning</Badge>
                          )}
                        </div>
                      </div>
                      <AssignmentFeaturesSelector
                        value={formData.assignment_config}
                        onChange={(config) => setFormData({...formData, assignment_config: config})}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Creating...' : 'Create Module'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Modules Grid - Right Side */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Modules</h2>
              <p className="text-muted-foreground">Manage and share your created modules</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="group hover:shadow-lg transition-all duration-200 border-border bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="text-center border-b border-border pb-4">
                        <h3 className="font-bold text-xl text-foreground mb-1">{module.name}</h3>
                        {module.description && (
                          <p className="text-muted-foreground text-sm">{module.description}</p>
                        )}
                      </div>
                      
                      {/* Access Code Section */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Code</Label>
                        <div className="flex items-center gap-2">
                          <span className="flex-1 font-mono bg-muted/80 px-3 py-2 rounded-md text-center text-lg font-bold text-foreground border-2 border-dashed border-border">
                            {module.access_code}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(module.access_code, 'code', module.id)}
                              className="h-9 w-9 p-0"
                              title="Copy access code"
                            >
                              {copiedItems[`${module.id}-code`] ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setModuleToRegenerate(module.id);
                                setShowRegenerateDialog(true);
                              }}
                              className="h-9 w-9 p-0"
                              title="Regenerate access code"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Join URL Section */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Join URL</Label>
                        <div className="relative">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-mono break-all">
                              {generateModuleUrl(module)}
                            </p>
                          </div>
                          <div className="flex justify-center gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generateModuleUrl(module), 'url', module.id)}
                              className="flex-1 h-8"
                            >
                              {copiedItems[`${module.id}-url`] ? (
                                <>
                                  <Check className="w-3 h-3 mr-1 text-green-600" />
                                  <span className="text-xs">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  <span className="text-xs">Copy</span>
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(generateModuleUrl(module), '_blank')}
                              className="h-8 px-3"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-border">
                        <div className="space-y-2">
                          <Button asChild size="lg" className="w-full group-hover:shadow-md transition-shadow font-semibold">
                            <Link href={`/dashboard?module=${encodeURIComponent(module.name)}`}>
                              🚀 Manage
                            </Link>
                          </Button>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Link href={`/dashboard/rubric?moduleId=${module.id}&moduleName=${encodeURIComponent(module.name)}`}>
                                <Settings className="w-3 h-3 mr-1" />
                                Rubric
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Link href={`/module/${module.id}/consent`}>
                                <FileText className="w-3 h-3 mr-1" />
                                Consent
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteModule(module.id, module.name)}
                              disabled={deletingModules[module.id]}
                              className="w-full"
                            >
                              {deletingModules[module.id] ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {modules.length === 0 && (
              <Card className="border-border max-w-md mx-auto">
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-muted-foreground mb-2 font-medium">No modules yet</p>
                  <p className="text-sm text-muted-foreground">Create your first module using the form above to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Regenerating Access Code */}
      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Access Code?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <div>
                  Are you sure you want to regenerate the access code for this module?
                </div>
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  ⚠️ Warning: The current access code will immediately become invalid.
                </div>
                <div className="text-sm">
                  Students with the old code will no longer be able to access the module.
                  You will need to share the new code with all students.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={regenerateAccessCode}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              Yes, Regenerate Code
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}