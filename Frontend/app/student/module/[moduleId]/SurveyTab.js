'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, ClipboardList } from 'lucide-react';
import { apiClient } from '@/lib/auth';

export default function SurveyTab({ moduleId, studentId }) {
  const [surveyData, setSurveyData] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Load survey and existing responses
  useEffect(() => {
    loadSurvey();
  }, [moduleId, studentId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get(
        `/api/student/modules/${moduleId}/survey?student_id=${studentId}`
      );

      console.log('📋 Survey data loaded:', data);
      setSurveyData(data);
      setHasSubmitted(data.has_submitted);

      // Pre-fill responses if already submitted
      if (data.my_response && data.my_response.responses) {
        setResponses(data.my_response.responses);
      }
    } catch (err) {
      console.error('Failed to load survey:', err);
      setError('Failed to load survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required questions
      for (const question of surveyData.survey_questions) {
        if (question.required && !responses[question.id]?.trim()) {
          setError(`Please answer the required question: "${question.question}"`);
          setSubmitting(false);
          return;
        }
      }

      // Submit survey
      await apiClient.post(
        `/api/student/modules/${moduleId}/survey?student_id=${studentId}`,
        { responses }
      );

      console.log('✅ Survey submitted successfully');
      setSuccess(true);
      setHasSubmitted(true);

      // Reload to get updated data
      await loadSurvey();
    } catch (err) {
      console.error('Failed to submit survey:', err);
      setError(err.message || 'Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-muted-foreground">Loading survey...</span>
      </div>
    );
  }

  if (!surveyData || !surveyData.survey_questions || surveyData.survey_questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-muted-foreground">No survey available for this module.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isReadOnly = hasSubmitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Module Feedback Survey
                {surveyData.survey_required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
                {!surveyData.survey_required && (
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {hasSubmitted
                  ? 'Thank you for completing the survey! You can view your responses below.'
                  : 'Please share your feedback about this module to help improve the learning experience.'}
              </CardDescription>
            </div>
            {hasSubmitted && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Submitted
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Success Message */}
      {success && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Survey submitted successfully! Thank you for your feedback.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-red-800 dark:text-red-200">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Survey Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {surveyData.survey_questions.map((question, index) => (
                <div key={question.id} className="space-y-2">
                  <Label htmlFor={question.id} className="text-base font-medium flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">Q{index + 1}.</span>
                    <span className="flex-1">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </Label>

                  {question.type === 'short' ? (
                    <Input
                      id={question.id}
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder={question.placeholder || 'Your answer...'}
                      required={question.required}
                      disabled={isReadOnly}
                      className={isReadOnly ? 'bg-gray-50 dark:bg-gray-900' : ''}
                      maxLength={500}
                    />
                  ) : (
                    <Textarea
                      id={question.id}
                      value={responses[question.id] || ''}
                      onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      placeholder={question.placeholder || 'Your answer...'}
                      required={question.required}
                      disabled={isReadOnly}
                      className={`min-h-[120px] ${isReadOnly ? 'bg-gray-50 dark:bg-gray-900' : ''}`}
                      maxLength={2000}
                    />
                  )}

                  <p className="text-xs text-muted-foreground">
                    {responses[question.id]?.length || 0} / {question.type === 'short' ? '500' : '2000'} characters
                  </p>
                </div>
              ))}
            </div>

            {!isReadOnly && (
              <div className="mt-8 flex items-center justify-between pt-6 border-t">
                <p className="text-sm text-muted-foreground">
                  <span className="text-red-500">*</span> Required fields
                </p>
                <Button type="submit" disabled={submitting} size="lg">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Survey
                    </>
                  )}
                </Button>
              </div>
            )}

            {isReadOnly && surveyData?.my_response?.submitted_at && (
              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Survey submitted on {new Date(surveyData.my_response.submitted_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
