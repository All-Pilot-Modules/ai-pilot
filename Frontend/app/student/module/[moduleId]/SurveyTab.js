'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, ClipboardList, Send } from 'lucide-react';
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
      // Map responses by index to avoid duplicate ID issues
      if (data.my_response && data.my_response.responses) {
        const indexedResponses = {};
        data.survey_questions.forEach((q, idx) => {
          const uniqueKey = `q-${idx}`;
          if (data.my_response.responses[q.id]) {
            indexedResponses[uniqueKey] = data.my_response.responses[q.id];
          }
        });
        setResponses(indexedResponses);
      }
    } catch (err) {
      console.error('Failed to load survey:', err);
      setError('Failed to load survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (uniqueKey, value) => {
    setResponses(prev => ({
      ...prev,
      [uniqueKey]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required questions
      for (let i = 0; i < surveyData.survey_questions.length; i++) {
        const question = surveyData.survey_questions[i];
        const uniqueKey = `q-${i}`;
        if (question.required && !responses[uniqueKey]?.trim()) {
          setError(`Please answer the required question: "${question.question}"`);
          setSubmitting(false);
          return;
        }
      }

      // Convert indexed responses back to question ID based responses for backend
      const backendResponses = {};
      surveyData.survey_questions.forEach((q, idx) => {
        const uniqueKey = `q-${idx}`;
        if (responses[uniqueKey]) {
          backendResponses[q.id] = responses[uniqueKey];
        }
      });

      // Submit survey
      await apiClient.post(
        `/api/student/modules/${moduleId}/survey?student_id=${studentId}`,
        { responses: backendResponses }
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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading survey...</p>
      </div>
    );
  }

  if (!surveyData || !surveyData.survey_questions || surveyData.survey_questions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
        <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Survey Available</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">There's no survey for this module yet.</p>
      </div>
    );
  }

  const isReadOnly = hasSubmitted;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 opacity-50"></div>
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Module Feedback Survey</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed ml-4 pl-3">
                {hasSubmitted
                  ? 'Thank you for completing the survey. You can review your responses below.'
                  : 'Your feedback helps us create better learning experiences. Please take a moment to share your thoughts.'}
              </p>
            </div>
            {hasSubmitted && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Submitted</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Survey submitted successfully</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">Thank you for your valuable feedback.</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">Error submitting survey</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {surveyData.survey_questions.map((question, index) => {
          const uniqueKey = `q-${index}`;

          return (
            <div
              key={uniqueKey}
              className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="p-6">
                <div className="mb-4">
                  <Label htmlFor={`survey-${index}`} className="text-base font-medium text-gray-900 dark:text-white flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{index + 1}</span>
                    </div>
                    <span className="flex-1 leading-relaxed pt-0.5">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </Label>
                </div>

                {question.type === 'short' ? (
                  <Input
                    id={`survey-${index}`}
                    value={responses[uniqueKey] || ''}
                    onChange={(e) => handleResponseChange(uniqueKey, e.target.value)}
                    placeholder={question.placeholder || 'Type your answer...'}
                    required={question.required}
                    disabled={isReadOnly}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 ${
                      isReadOnly
                        ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                    maxLength={500}
                  />
                ) : (
                  <Textarea
                    id={`survey-${index}`}
                    value={responses[uniqueKey] || ''}
                    onChange={(e) => handleResponseChange(uniqueKey, e.target.value)}
                    placeholder={question.placeholder || 'Type your answer...'}
                    required={question.required}
                    disabled={isReadOnly}
                    className={`min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 resize-none ${
                      isReadOnly
                        ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600'
                    }`}
                    maxLength={2000}
                  />
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {responses[uniqueKey]?.length || 0} / {question.type === 'short' ? '500' : '2000'} characters
                  </p>
                  {responses[uniqueKey]?.length > 0 && !isReadOnly && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></div>
                      <span>Saved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {!isReadOnly && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 opacity-50"></div>
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required fields
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 dark:from-white dark:to-gray-50 dark:hover:from-gray-50 dark:hover:to-white dark:text-gray-900 shadow-md hover:shadow-lg transition-all duration-200 px-8"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Survey
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {isReadOnly && surveyData?.my_response?.submitted_at && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/10 dark:to-teal-950/10"></div>
            <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm p-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
                    Survey Submitted
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {new Date(surveyData.my_response.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
