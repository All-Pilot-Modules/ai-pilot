'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/auth";
import SimpleRubricEditor from "@/components/rubric/SimpleRubricEditor";

export default function RubricSettings() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('moduleId');
  const moduleName = searchParams.get('moduleName');

  const [rubric, setRubric] = useState(null);
  const [originalRubric, setOriginalRubric] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingRubric, setLoadingRubric] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    if (moduleId) {
      fetchRubric();
      fetchTemplates();
    }
  }, [moduleId]);

  useEffect(() => {
    if (rubric && originalRubric) {
      setHasChanges(JSON.stringify(rubric) !== JSON.stringify(originalRubric));
    }
  }, [rubric, originalRubric]);

  const fetchRubric = async () => {
    try {
      setLoadingRubric(true);
      const data = await apiClient.get(`/api/modules/${moduleId}/rubric`);
      setRubric(data.rubric);
      setOriginalRubric(data.rubric);
    } catch (error) {
      console.error('Failed to fetch rubric:', error);
    } finally {
      setLoadingRubric(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get('/api/rubric-templates');
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleSave = async () => {
    if (!moduleId || !rubric) return;

    setIsSaving(true);
    try {
      await apiClient.put(`/api/modules/${moduleId}/rubric`, rubric);
      setOriginalRubric(rubric);
      setHasChanges(false);
      alert('Rubric settings saved successfully!');
    } catch (error) {
      console.error('Failed to save rubric:', error);
      alert('Failed to save rubric settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyTemplate = async (templateName) => {
    if (!moduleId) return;

    try {
      const response = await apiClient.post(
        `/api/modules/${moduleId}/rubric/apply-template`,
        null,
        { params: { template_name: templateName, preserve_custom_instructions: true } }
      );
      setRubric(response.rubric);
      setOriginalRubric(response.rubric);
      alert(`Template "${templateName}" applied successfully!`);
    } catch (error) {
      console.error('Failed to apply template:', error);
      alert('Failed to apply template. Please try again.');
    }
  };

  const updateRubric = (newRubric) => {
    setRubric(newRubric);
  };

  if (loading || loadingRubric) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rubric settings...</p>
        </div>
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

  if (!moduleId) {
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/dashboard?module=${encodeURIComponent(moduleName)}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Feedback Settings
              </h1>
              <p className="text-muted-foreground">
                {moduleName && <span className="font-medium">{moduleName}</span>}
                {moduleName && ' - '}
                Customize how AI gives feedback to your students
              </p>
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setRubric(originalRubric);
                    setHasChanges(false);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          {hasChanges && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                💡 You have unsaved changes
              </p>
            </div>
          )}
        </div>

        {/* Simplified Editor */}
        <SimpleRubricEditor
          value={rubric}
          onChange={updateRubric}
          templates={templates}
          onApplyTemplate={handleApplyTemplate}
        />
      </div>
    </div>
  );
}
