'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  GripVertical
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function SurveyEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const moduleId = searchParams.get('module');
  const moduleName = searchParams.get('name');

  const [module, setModule] = useState(null);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [surveyRequired, setSurveyRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadSurveyConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load module
      const moduleData = await apiClient.get(`/api/modules/${moduleId}`);
      setModule(moduleData);

      // Load survey config
      const surveyConfig = await apiClient.get(`/api/modules/${moduleId}/survey`);
      setSurveyQuestions(surveyConfig.survey_questions || []);
      setSurveyRequired(surveyConfig.survey_required || false);

      console.log('📋 Survey config loaded:', surveyConfig);
    } catch (err) {
      console.error('Failed to load survey config:', err);
      setError('Failed to load survey configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) {
      loadSurveyConfig();
    }
  }, [moduleId, loadSurveyConfig]);

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q${surveyQuestions.length + 1}`,
      question: '',
      type: 'long',
      required: false,
      placeholder: ''
    };
    setSurveyQuestions([...surveyQuestions, newQuestion]);
  };

  const handleRemoveQuestion = (index) => {
    const updated = surveyQuestions.filter((_, i) => i !== index);
    setSurveyQuestions(updated);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...surveyQuestions];
    updated[index][field] = value;
    setSurveyQuestions(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Validate questions
      for (const question of surveyQuestions) {
        if (!question.question.trim()) {
          setError('All questions must have text. Please fill in or remove empty questions.');
          setSaving(false);
          return;
        }
      }

      // Save survey config
      await apiClient.put(`/api/modules/${moduleId}/survey`, {
        survey_questions: surveyQuestions,
        survey_required: surveyRequired
      });

      console.log('✅ Survey config saved');
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save survey config:', err);
      setError(err.message || 'Failed to save survey configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading survey configuration..." />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Module not found'}</p>
              <Button asChild>
                <Link href="/mymodules">Back to Modules</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/dashboard?module=${moduleName}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ClipboardList className="w-8 h-8" />
                Survey Configuration
              </h1>
              <p className="text-muted-foreground">
                Module: <span className="font-semibold">{module.name}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Survey configuration saved successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Survey Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Survey Settings</CardTitle>
            <CardDescription>Configure whether the survey is required for students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="survey-required" className="text-base font-medium">
                  Require Survey Completion
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  When enabled, students must complete the survey
                </p>
              </div>
              <Switch
                id="survey-required"
                checked={surveyRequired}
                onCheckedChange={setSurveyRequired}
              />
            </div>
          </CardContent>
        </Card>

        {/* Survey Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Survey Questions</CardTitle>
                <CardDescription>Add and customize survey questions for student feedback</CardDescription>
              </div>
              <Button onClick={handleAddQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {surveyQuestions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-muted-foreground mb-4">No survey questions yet</p>
                  <Button onClick={handleAddQuestion} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                surveyQuestions.map((question, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Question Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                            <Badge variant="outline">Q{index + 1}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Question Text */}
                        <div>
                          <Label htmlFor={`question-${index}`}>Question Text *</Label>
                          <Textarea
                            id={`question-${index}`}
                            value={question.question}
                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                            placeholder="Enter your survey question..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>

                        {/* Placeholder */}
                        <div>
                          <Label htmlFor={`placeholder-${index}`}>Placeholder Text</Label>
                          <Input
                            id={`placeholder-${index}`}
                            value={question.placeholder || ''}
                            onChange={(e) => handleQuestionChange(index, 'placeholder', e.target.value)}
                            placeholder="Hint text for students..."
                            className="mt-1"
                          />
                        </div>

                        {/* Question Type & Required */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`type-${index}`}>Answer Type</Label>
                            <select
                              id={`type-${index}`}
                              value={question.type}
                              onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-background"
                            >
                              <option value="short">Short Answer (1 line)</option>
                              <option value="long">Long Answer (Multi-line)</option>
                            </select>
                          </div>

                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id={`required-${index}`}
                              checked={question.required}
                              onCheckedChange={(checked) => handleQuestionChange(index, 'required', checked)}
                            />
                            <Label htmlFor={`required-${index}`}>Required Question</Label>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Save Button */}
        {surveyQuestions.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Survey Configuration
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
