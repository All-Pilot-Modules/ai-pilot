'use client';

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  HelpCircle,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Play,
  Brain,
  Target,
  MessageSquare,
  Eye,
  ArrowLeft,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { apiClient } from "@/lib/auth";
import ChatTab from './ChatTab';
import SurveyTab from './SurveyTab';
import ModuleConsentModal from '@/components/ModuleConsentModal';
import { FullPageLoader } from '@/components/LoadingSpinner';

function StudentModuleContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = params?.moduleId;

  // Get tab from URL parameter, default to "assignments"
  const initialTab = searchParams.get('tab') || 'assignments';
  const [activeTab, setActiveTab] = useState(initialTab);

  // State declarations - MUST come before useEffect hooks
  const [moduleAccess, setModuleAccess] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [feedbackData, setFeedbackData] = useState({});
  const [feedbackByAttempt, setFeedbackByAttempt] = useState({}); // Group feedback by attempt number
  const [selectedAttempt, setSelectedAttempt] = useState(1); // Currently selected attempt to view
  const [submissionStatus, setSubmissionStatus] = useState(null); // Track submission status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null); // Track real-time feedback generation status
  const [isPolling, setIsPolling] = useState(false); // Track if we're actively polling
  const [pollCount, setPollCount] = useState(0); // Track number of polling attempts
  const [answeredQuestions, setAnsweredQuestions] = useState({}); // Track which questions were answered

  // Consent modal state
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Survey status state
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveyRequired, setSurveyRequired] = useState(false);

  // Check if chatbot is enabled based on module settings
  const isChatbotEnabled = moduleData?.assignment_config?.features?.chatbot_feedback?.enabled ?? true;

  // Main effect to load module on mount
  useEffect(() => {
    // Check if student has valid access
    const accessData = sessionStorage.getItem('student_module_access');
    if (!accessData) {
      router.push('/join');
      return;
    }

    const access = JSON.parse(accessData);
    if (String(access.moduleId) !== String(moduleId)) {
      router.push('/join');
      return;
    }

    setModuleAccess(access);
    loadModuleContent(access);
  }, [moduleId, router]);

  // Check consent after module data is loaded
  useEffect(() => {
    if (moduleAccess && moduleData && !consentChecked) {
      // If module doesn't require consent, skip the check entirely
      if (moduleData.consent_required === false) {
        console.log('Module does not require consent, skipping check');
        setConsentChecked(true);
        return;
      }

      // If consent was already submitted, skip the check
      if (moduleAccess.consentSubmitted) {
        console.log('Consent already submitted during enrollment, skipping check');
        setConsentChecked(true);
        return;
      }

      // Otherwise, check consent status
      checkConsentStatus(moduleAccess);
    }
  }, [moduleAccess, moduleData, consentChecked]);

  // Check if student has submitted consent for this module
  const checkConsentStatus = async (access) => {
    try {
      const response = await apiClient.get(
        `/api/modules/${moduleId}/consent/${access.studentId}`
      );

      const { has_consented, is_enrolled } = response;

      // If module requires consent and student hasn't consented
      if (is_enrolled && !has_consented) {
        setShowConsentModal(true);
      }

      setConsentChecked(true);
    } catch (error) {
      console.error('Failed to check consent status:', error);
      setConsentChecked(true); // Allow access if check fails
    }
  };

  const handleConsentSubmitted = (consentStatus) => {
    console.log('Consent submitted:', consentStatus);

    // Update sessionStorage to mark consent as submitted
    if (moduleAccess) {
      const accessData = { ...moduleAccess, consentSubmitted: true, consentStatus };
      sessionStorage.setItem('student_module_access', JSON.stringify(accessData));
      setModuleAccess(accessData);
    }

    setShowConsentModal(false);
    setConsentChecked(true);
  };

  // Effect to update feedbackData when selectedAttempt changes
  useEffect(() => {
    const currentFeedback = feedbackByAttempt[selectedAttempt] || {};
    setFeedbackData(currentFeedback);
  }, [selectedAttempt, feedbackByAttempt]);

  // Effect to start polling when tab changes to feedback
  useEffect(() => {
    const startPollingIfNeeded = async () => {
      if (activeTab === 'feedback' && moduleAccess && submissionStatus && !isPolling) {
        const currentAttempt = submissionStatus.current_attempt || 1;

        // Only poll if we have a submission (current_attempt > 1 means attempt 1 is done)
        if (currentAttempt > 1) {
          console.log('🔍 Checking if feedback is complete...');

          // Check current feedback status
          try {
            const response = await apiClient.get(
              `/api/student/modules/${moduleId}/feedback-status?student_id=${moduleAccess.studentId}&attempt=${currentAttempt - 1}`
            );
            const status = response?.data || response || {};

            setFeedbackStatus(status);

            if (!status.all_complete) {
              console.log('🚀 Feedback incomplete - starting polling');
              setIsPolling(true);
            } else {
              console.log('✅ All feedback already complete');
            }
          } catch (error) {
            console.error('Failed to check feedback status:', error);
          }
        }
      }
    };

    startPollingIfNeeded();
  }, [activeTab, moduleAccess, submissionStatus, isPolling, moduleId]);

  const loadFeedbackForAnswers = async (access) => {
    try {
      // Use the new API endpoint to fetch all feedback from database
      const response = await apiClient.get(
        `/api/student/modules/${moduleId}/feedback?student_id=${access.studentId}`
      );

      // Group feedback by attempt
      const byAttempt = {};
      const answeredMap = {};

      if (response && Array.isArray(response)) {
        response.forEach(feedbackItem => {
          const attempt = feedbackItem.attempt || 1;

          // Initialize attempt group if needed
          if (!byAttempt[attempt]) {
            byAttempt[attempt] = {};
          }

          // Add feedback to the attempt group
          byAttempt[attempt][feedbackItem.question_id] = feedbackItem;

          // Track answered questions across all attempts
          answeredMap[feedbackItem.question_id] = true;
        });
      }

      // Also fetch submitted answers to track which questions were answered
      // (even if feedback hasn't been generated yet)
      try {
        const answersResponse = await apiClient.get(
          `/api/student/modules/${moduleId}/my-answers?student_id=${access.studentId}`
        );
        const submittedAnswers = answersResponse?.data || answersResponse || [];

        submittedAnswers.forEach(answer => {
          if (answer && answer.question_id) {
            answeredMap[answer.question_id] = true;
          }
        });

        console.log(`📝 Found ${submittedAnswers.length} submitted answers`);
      } catch (err) {
        console.log('No submitted answers found or error fetching answers');
      }

      setFeedbackByAttempt(byAttempt);
      setAnsweredQuestions(answeredMap);

      // Note: feedbackData will be set by the useEffect when selectedAttempt is determined
      // Don't set it here as selectedAttempt might still be the default value (1)

      const totalFeedback = Object.values(byAttempt).reduce((sum, attempt) => sum + Object.keys(attempt).length, 0);

      // Only log on first load or when count changes (reduce console spam)
      if (!window._lastFeedbackCount || window._lastFeedbackCount !== totalFeedback) {
        console.log(`✅ Loaded ${totalFeedback} feedback items from database (${Object.keys(byAttempt).length} attempts)`);
        window._lastFeedbackCount = totalFeedback;
      }

      return byAttempt;
    } catch (error) {
      console.error('Failed to load feedback:', error);
      // Don't fail the whole page if feedback loading fails
      return {};
    }
  };

  // Scroll to specific question
  const scrollToQuestion = (questionId) => {
    const element = document.getElementById(`feedback-question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Poll for feedback generation status
  const checkFeedbackStatus = async (access, attempt) => {
    try {
      const response = await apiClient.get(
        `/api/student/modules/${moduleId}/feedback-status?student_id=${access.studentId}&attempt=${attempt}`
      );
      const status = response?.data || response || {};

      // Only log when status changes (reduce console spam)
      const statusKey = `${status.feedback_ready}/${status.total_questions}`;
      if (!window._lastFeedbackStatus || window._lastFeedbackStatus !== statusKey) {
        console.log(`🔄 Feedback status: ${status.feedback_ready}/${status.total_questions} ready (${status.progress_percentage}%)`);
        window._lastFeedbackStatus = statusKey;
      }

      setFeedbackStatus(status);

      // Load feedback data on every poll to show them as they're generated
      await loadFeedbackForAnswers(access);

      // If all feedback is complete, stop polling
      if (status.all_complete) {
        console.log('✅ All feedback generated!');
        setIsPolling(false);
        return true; // All complete
      }

      return false; // Still generating
    } catch (error) {
      console.error('Failed to check feedback status:', error);
      return false;
    }
  };

  // Effect to handle polling when feedback is being generated
  useEffect(() => {
    if (!isPolling || !moduleAccess) return;

    const MAX_POLLS = 40; // Stop after 40 polls (2 minutes)
    const currentAttempt = submissionStatus?.current_attempt || 1;
    let currentPollCount = 0;

    const pollInterval = setInterval(async () => {
      currentPollCount++;
      setPollCount(currentPollCount);

      // Stop polling after max attempts
      if (currentPollCount >= MAX_POLLS) {
        console.log('⏱️ Polling timeout - stopping after 2 minutes');
        setIsPolling(false);
        clearInterval(pollInterval);
        return;
      }

      const allComplete = await checkFeedbackStatus(moduleAccess, currentAttempt - 1); // Poll for previous attempt

      if (allComplete) {
        clearInterval(pollInterval);
        setPollCount(0);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(pollInterval);
      setPollCount(0);
    };
  }, [isPolling, moduleAccess, submissionStatus]);

  const loadModuleContent = async (access) => {
    try {
      setLoading(true);

      // Load core data first
      const [moduleResponse, documentsResponse, questionsResponse] = await Promise.all([
        apiClient.get(`/api/modules/${moduleId}`),
        apiClient.get(`/api/student/modules/${moduleId}/documents`),
        apiClient.get(`/api/student/modules/${moduleId}/questions`)
      ]);

      // Set data
      const moduleInfo = moduleResponse.data || moduleResponse;

      // Fetch teacher information if available
      if (moduleInfo.teacher_id) {
        try {
          const teacherResponse = await apiClient.get(`/api/users/${moduleInfo.teacher_id}`);
          const teacherData = teacherResponse.data || teacherResponse;
          moduleInfo.teacher_name = teacherData.name || teacherData.email || 'Instructor';
        } catch (err) {
          console.log('Could not fetch teacher info:', err);
          moduleInfo.teacher_name = 'Instructor';
        }
      }

      setModuleData(moduleInfo);
      setDocuments(documentsResponse.data || documentsResponse);

      const questionsData = questionsResponse.data || questionsResponse;
      setQuestions(questionsData);

      // Check survey status
      if (access.studentId) {
        try {
          const surveyStatusResponse = await apiClient.get(
            `/api/student/modules/${moduleId}/survey/status?student_id=${access.studentId}`
          );
          setSurveySubmitted(surveyStatusResponse.has_submitted || false);
          setSurveyRequired(moduleInfo.survey_required || false);
          console.log('📋 Survey status:', surveyStatusResponse);
        } catch (err) {
          console.log('No survey status found');
          setSurveySubmitted(false);
          setSurveyRequired(moduleInfo.survey_required || false);
        }
      }

      if (access.studentId && questionsData.length > 0) {
        // Use the new submission-status endpoint to get submission state
        let status = null;
        try {
          const statusResponse = await apiClient.get(
            `/api/student/modules/${moduleId}/submission-status?student_id=${access.studentId}`
          );
          status = statusResponse?.data || statusResponse || {};
          setSubmissionStatus(status);
          console.log(`📊 Submission status loaded:`, status);
        } catch (err) {
          console.log('No submission status found - student hasn\'t submitted yet');
          status = { current_attempt: 1, submissions: [], can_submit_again: true, all_attempts_done: false };
          setSubmissionStatus(status);
        }

        // Load feedback from database
        const feedbackMap = await loadFeedbackForAnswers(access);

        // Determine which attempt to show by default
        // Priority: Use the most recently completed submission (even if feedback is still generating)
        let attemptToShow = 1;

        if (status && status.current_attempt && status.current_attempt > 1) {
          // If current_attempt is 2, that means attempt 1 is complete
          // If current_attempt is 3, that means attempt 2 is complete, etc.
          attemptToShow = status.current_attempt - 1;
          console.log(`📍 Using submission status: showing attempt ${attemptToShow} (most recently completed)`);
        } else if (feedbackMap && Object.keys(feedbackMap).length > 0) {
          // Fallback: use the highest attempt number that has feedback
          const attemptNumbers = Object.keys(feedbackMap).map(Number).sort((a, b) => b - a);
          attemptToShow = attemptNumbers[0];
          console.log(`📍 Using feedback availability: showing attempt ${attemptToShow}`);
        }

        setSelectedAttempt(attemptToShow);

        // Set the feedback data for the selected attempt (may be empty if still generating)
        const selectedFeedback = feedbackMap[attemptToShow] || {};
        setFeedbackData(selectedFeedback);

        console.log(`✅ Showing attempt ${attemptToShow} with ${Object.keys(selectedFeedback).length} feedback items`);
        if (Object.keys(selectedFeedback).length === 0) {
          console.log('⏳ Feedback for this attempt is still being generated');
        }

        // Check if we should start polling (when on feedback tab after submission)
        if (initialTab === 'feedback') {
          const currentAttempt = status?.current_attempt || 1;
          if (currentAttempt > 1) {
            // Check feedback status to see if we need to poll
            const feedbackStatusCheck = await checkFeedbackStatus(access, currentAttempt - 1);
            if (!feedbackStatusCheck) {
              // Start polling if not all complete
              console.log('🚀 Starting polling for feedback generation');
              setIsPolling(true);
            }
          }
        }
      }

    } catch (error) {
      console.error('Failed to load module content:', error);
      setError('Failed to load module content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    router.push(`/student/test/${moduleId}`);
  };

  const handleViewDocument = (doc) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${API_BASE_URL}/api/documents/${doc.id}/download`;

    // Simply open in new tab - works for PDFs and most file types
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (doc) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${API_BASE_URL}/api/documents/${doc.id}/download`;

    // Create invisible link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file_name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return <FullPageLoader text="Loading module content..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/join')}>
              Enter Access Code Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {moduleAccess?.moduleName || 'Module'}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{moduleData?.teacher_name || moduleAccess?.teacherName || 'Instructor'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">Accessed {new Date(moduleAccess?.accessTime || '').toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                Active Student
              </Badge>
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.removeItem('student_module_access');
                  router.push('/join');
                }}
                className="whitespace-nowrap"
              >
                Exit Module
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile: Horizontal scrollable tabs */}
          <TabsList className="w-full flex md:grid md:grid-cols-6 overflow-x-auto scrollbar-hide">
            <TabsTrigger value="assignments" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
              {Object.keys(feedbackData).length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {Object.keys(feedbackData).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="survey" className="flex items-center gap-2 whitespace-nowrap flex-shrink-0">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Survey</span>
            </TabsTrigger>
          </TabsList>

          {/* Test Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {questions.length > 0 ? (
              <>
                {/* Survey Completion Prompt - Show if student hasn't submitted survey */}
                {!surveySubmitted && (submissionStatus?.submission_count > 0) && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                            Share Your Feedback
                            {surveyRequired && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Help us improve! Take a moment to complete the feedback survey about your learning experience.
                          </p>
                        </div>
                        <Button
                          onClick={() => setActiveTab('survey')}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex-shrink-0 w-full sm:w-auto"
                        >
                          <ClipboardList className="w-4 h-4 mr-2" />
                          Complete Survey
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* If test is completed, show appropriate banner */}
                {(() => {
                  const hasFeedback = Object.keys(feedbackData).length > 0;
                  const allAttemptsDone = submissionStatus?.all_attempts_done || false;

                  if (!hasFeedback) return null;

                  // If all attempts are done (attempt 2 completed)
                  if (allAttemptsDone) {
                    return (
                      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Attempts Complete!</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                You have successfully completed all your attempts. You can review and learn from the feedback in the Feedback tab.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  // Otherwise show first attempt completion banner
                  return (
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Test Submitted!</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Your AI feedback is ready. Review it and see if you want to improve your score.
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              const feedbackTab = document.querySelector('[value="feedback"]');
                              if (feedbackTab) feedbackTab.click();
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="lg"
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            View Feedback
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                          <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">
                            {moduleAccess?.moduleName} Test
                          </CardTitle>
                          <CardDescription>
                            {questions.length} question{questions.length > 1 ? 's' : ''} • Mixed question types
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          {submissionStatus?.submission_count || 0} / {submissionStatus?.max_attempts || 2} attempts used
                        </Badge>
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${submissionStatus ? ((submissionStatus.submission_count || 0) / (submissionStatus.max_attempts || 2)) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{questions.filter(q => q.type === 'mcq').length} Multiple Choice</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>{questions.filter(q => q.type === 'short').length} Short Answer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>{questions.filter(q => q.type === 'essay').length} Essay</span>
                        </div>
                      </div>

                      {moduleData?.instructions && (
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Instructions</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{moduleData.instructions}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {(() => {
                            const hasFeedback = Object.keys(feedbackData).length > 0;
                            const allAttemptsDone = submissionStatus?.all_attempts_done || false;
                            const currentAttempt = submissionStatus?.current_attempt || 1;

                            if (allAttemptsDone) {
                              return "All attempts completed. Review your feedback to learn and improve.";
                            } else if (currentAttempt > 1) {
                              // If current attempt is 2+, Attempt 1 is complete
                              return `Attempt ${currentAttempt - 1} complete! Review feedback and start Attempt ${currentAttempt}.`;
                            } else {
                              return "Ready to start the test.";
                            }
                          })()}
                        </div>
                        {(() => {
                          const allAttemptsDone = submissionStatus?.all_attempts_done || false;

                          // Don't show button if all attempts are done
                          if (allAttemptsDone) {
                            return null;
                          }

                          // Don't show button if feedback is being generated
                          if (isPolling) {
                            return (
                              <div className="flex items-center gap-2 text-sm text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                <span>Feedback is being generated...</span>
                              </div>
                            );
                          }

                          return (
                            <Button
                              onClick={() => handleStartTest()}
                              className={(() => {
                                const currentAttempt = submissionStatus?.current_attempt || 1;

                                return currentAttempt > 1
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "bg-blue-600 hover:bg-blue-700";
                              })()}
                              size="lg"
                            >
                              {(() => {
                                const currentAttempt = submissionStatus?.current_attempt || 1;

                                if (currentAttempt > 1) {
                                  // If current attempt is 2+, button should start that attempt
                                  return (
                                    <>
                                      <Target className="w-4 h-4 mr-2" />
                                      Start Attempt {currentAttempt}
                                    </>
                                  );
                                } else {
                                  return (
                                    <>
                                      <Play className="w-4 h-4 mr-2" />
                                      Start Test
                                    </>
                                  );
                                }
                              })()}
                            </Button>
                          );
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Test Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your instructor has not posted the test yet. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            {/* Show loading banner if feedback is being generated */}
            {isPolling && feedbackStatus && (
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Generating Your Feedback...
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {feedbackStatus.feedback_ready} of {feedbackStatus.total_questions} feedback generated ({feedbackStatus.progress_percentage}%)
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${feedbackStatus.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isPolling && Object.keys(feedbackData).length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-6"></div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Generating Your Feedback...
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Please wait while we analyze your answers. This may take a few moments.
                  </p>
                  {feedbackStatus && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {feedbackStatus.feedback_ready} of {feedbackStatus.total_questions} feedback generated
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : Object.keys(feedbackData).length > 0 ? (
              <>
                {/* Attempt Selector */}
                {Object.keys(feedbackByAttempt).length > 1 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Attempt:</span>
                    <div className="flex gap-2">
                      {Object.keys(feedbackByAttempt).sort((a, b) => Number(a) - Number(b)).map(attemptNum => (
                        <Button
                          key={attemptNum}
                          onClick={() => setSelectedAttempt(Number(attemptNum))}
                          variant={selectedAttempt === Number(attemptNum) ? "default" : "outline"}
                          size="sm"
                          className={selectedAttempt === Number(attemptNum) ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          Attempt {attemptNum}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Feedback for Attempt {selectedAttempt}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {Object.values(feedbackData).filter(f => f.is_correct).length} out of {Object.keys(feedbackData).length} correct
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-blue-600">
                          {Math.round((Object.values(feedbackData).filter(f => f.is_correct).length / Object.keys(feedbackData).length) * 100)}%
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Score on Attempt {selectedAttempt}</p>
                      </div>
                    </div>

                    {/* Show retry button if there are incorrect answers and not all attempts done */}
                    {(() => {
                      const hasIncorrect = Object.values(feedbackData).some(f => !f.is_correct);
                      const allAttemptsDone = submissionStatus?.all_attempts_done || false;
                      const currentAttempt = submissionStatus?.current_attempt || 1;
                      const maxAttempts = submissionStatus?.max_attempts || 2;
                      const latestAttemptWithFeedback = Math.max(...Object.keys(feedbackByAttempt).map(Number));

                      // Only show button if:
                      // 1. There are incorrect answers
                      // 2. Not all attempts are done
                      // 3. User is viewing the most recent attempt's feedback
                      if (!hasIncorrect || allAttemptsDone || selectedAttempt !== latestAttemptWithFeedback) {
                        return null;
                      }

                      const nextAttemptNumber = currentAttempt;

                      return (
                        <div className="mt-6 pt-6 border-t border-blue-300 dark:border-blue-700">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-lg">
                                Ready for attempt {nextAttemptNumber}?
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Review the feedback below, then start fresh with empty answers to improve your score
                              </p>
                            </div>
                            <Button
                              onClick={() => router.push(`/student/test/${moduleId}`)}
                              className="bg-orange-600 hover:bg-orange-700 text-white px-6"
                              size="lg"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              Start Attempt {nextAttemptNumber}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Perfect score celebration */}
                    {Object.values(feedbackData).every(f => f.is_correct) && (
                      <div className="mt-6 pt-6 border-t border-blue-300 dark:border-blue-700">
                        <div className="text-center">
                          <div className="text-6xl mb-2">🎉</div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">Perfect Score!</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Great job! You got all questions correct on attempt {selectedAttempt}.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Individual Question Feedback with Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {/* Question Navigation Sidebar */}
                  <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                          {questions.map((q, index) => {
                            const feedback = feedbackData[q.id];
                            const isAnswered = answeredQuestions[q.id];

                            return (
                              <button
                                key={q.id}
                                onClick={() => scrollToQuestion(q.id)}
                                className={`
                                  w-12 h-12 rounded-lg text-sm font-bold border-2 transition-colors relative flex items-center justify-center
                                  ${isPolling && !feedback
                                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : !isAnswered
                                    ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                    : feedback
                                    ? feedback.is_correct
                                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                                      : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                    : 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                  }
                                `}
                              >
                                {isPolling && !feedback ? (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                  </div>
                                ) : !isAnswered ? (
                                  <span className="text-base font-bold">{index + 1}</span>
                                ) : feedback ? (
                                  <div className="relative w-full h-full flex items-center justify-center">
                                    <span className="absolute text-xs font-bold">{index + 1}</span>
                                    {feedback.is_correct ? (
                                      <CheckCircle className="w-4 h-4 opacity-60" />
                                    ) : (
                                      <XCircle className="w-4 h-4 opacity-60" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* All Questions Feedback (Scrollable) */}
                  <div className="lg:col-span-4 space-y-6">
                    {questions.map((question, index) => {
                      const feedback = feedbackData[question.id];
                      const isAnswered = answeredQuestions[question.id];

                      return (
                        <Card
                          key={question.id}
                          id={`feedback-question-${question.id}`}
                          className="hover:shadow-lg transition-shadow scroll-mt-6"
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {isPolling && !feedback && isAnswered ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                      <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                        Generating feedback...
                                      </div>
                                    </Badge>
                                  ) : !isAnswered ? (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                      Not Answered
                                    </Badge>
                                  ) : feedback ? (
                                    <>
                                      {feedback.is_correct ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                      ) : (
                                        <XCircle className="w-5 h-5 text-orange-600" />
                                      )}
                                      <Badge variant={feedback.is_correct ? "default" : "secondary"} className={
                                        feedback.is_correct
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                          : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                      }>
                                        Score: {Math.round(feedback.score > 1 ? feedback.score : feedback.score * 100)}%
                                      </Badge>
                                    </>
                                  ) : isAnswered ? (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                      <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                        Loading feedback...
                                      </div>
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                      Not Answered
                                    </Badge>
                                  )}
                                  <Badge variant="outline">
                                    Question {index + 1} of {questions.length}
                                  </Badge>
                                </div>
                                <p className="text-base text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                                  {question.text}
                                </p>
                                {question.image_url && (
                                  <div className="mt-3">
                                    <img
                                      src={question.image_url}
                                      alt="Question illustration"
                                      className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {isPolling && !feedback && isAnswered ? (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                  🤖 AI is analyzing your answer...
                                </p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  Generating personalized feedback for you. This may take a moment.
                                </p>
                                {pollCount > 10 && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-3 animate-pulse">
                                    Still working on it... Complex answers take a bit longer
                                  </p>
                                )}
                              </div>
                            ) : !isAnswered ? (
                              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                  No answer provided for this question
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  You did not submit an answer for this question in your attempt.
                                </p>
                              </div>
                            ) : feedback ? (
                              <>
                                {/* Your Answer */}
                                {question.type === 'mcq' && feedback.selected_option && (
                                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your answer:</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                      {feedback.selected_option}. {feedback.available_options?.[feedback.selected_option]}
                                    </p>
                                  </div>
                                )}

                                {/* Feedback */}
                                <div className="space-y-3">
                                  {/* Explanation */}
                                  {feedback.explanation && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        Feedback
                                      </p>
                                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                        {feedback.explanation}
                                      </p>
                                    </div>
                                  )}

                                  {/* Strengths (for text answers) */}
                                  {feedback.strengths && feedback.strengths.length > 0 && (
                                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                                        What you did well
                                      </p>
                                      <ul className="space-y-1">
                                        {feedback.strengths.map((strength, idx) => (
                                          <li key={idx} className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>{strength}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Weaknesses (for text answers) */}
                                  {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                                    <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                                        Areas to improve
                                      </p>
                                      <ul className="space-y-1">
                                        {feedback.weaknesses.map((weakness, idx) => (
                                          <li key={idx} className="text-sm text-orange-800 dark:text-orange-200 flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>{weakness}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Improvement Hint */}
                                  {feedback.improvement_hint && (
                                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                                        Suggestion
                                      </p>
                                      <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                                        {feedback.improvement_hint}
                                      </p>
                                    </div>
                                  )}

                                  {/* Concept Explanation */}
                                  {feedback.concept_explanation && (
                                    <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                                        Key concept
                                      </p>
                                      <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                                        {feedback.concept_explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : isAnswered ? (
                              <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                  {pollCount >= 40 ? (
                                    <>
                                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                      <p className="text-gray-600 dark:text-gray-400 mb-2">Feedback generation is taking longer than expected</p>
                                      <p className="text-sm text-gray-500 dark:text-gray-500">Please refresh the page or check back later</p>
                                    </>
                                  ) : (
                                    <>
                                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                      <p className="text-gray-600 dark:text-gray-400">Generating feedback for this question...</p>
                                      {pollCount > 10 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a minute...</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                  No answer provided for this question
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                  You did not submit an answer for this question in your attempt.
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Feedback Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Complete the test to receive AI feedback on your answers.
                  </p>
                  <Button onClick={() => handleStartTest()} className="bg-blue-600 hover:bg-blue-700">
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            {isChatbotEnabled ? (
              <ChatTab moduleId={moduleId} moduleAccess={moduleAccess} />
            ) : (
              <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      AI Chatbot Not Available
                    </h3>
                    <p className="text-amber-700 dark:text-amber-300 mb-4">
                      Your instructor has not enabled the AI chatbot for this module.
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Please use the other tabs to access your assignments, feedback, and materials.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents
                .filter((doc) => !doc.file_name.toLowerCase().includes('testbank'))
                .map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      {doc.title}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-4 text-xs">
                        <span>{doc.file_type.toUpperCase()}</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        {doc.slide_count && <span>{doc.slide_count} slides</span>}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDocument(doc)}
                        className="flex-1"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDownloadDocument(doc)}
                        className="flex-1"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {documents.filter((doc) => !doc.file_name.toLowerCase().includes('testbank')).length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Materials Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your instructor has not uploaded any course materials yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Attempts Completed</span>
                        <span>
                          {submissionStatus?.submission_count || 0} / {submissionStatus?.max_attempts || 2}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${submissionStatus ? ((submissionStatus.submission_count || 0) / (submissionStatus.max_attempts || 2)) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {submissionStatus?.submissions && submissionStatus.submissions.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Submission History</h4>
                        <div className="space-y-2">
                          {submissionStatus.submissions.map((submission, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Attempt {submission.attempt}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {submission.questions_submitted} questions
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.keys(feedbackData).length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Questions with feedback:</span>
                          <Badge>{Object.keys(feedbackData).length}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Correct answers:</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {Object.values(feedbackData).filter(f => f.is_correct).length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">To review:</span>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {Object.values(feedbackData).filter(f => !f.is_correct).length}
                          </Badge>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Score:</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {Math.round((Object.values(feedbackData).filter(f => f.is_correct).length / Object.keys(feedbackData).length) * 100)}%
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No feedback available yet. Complete the test to receive feedback.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Survey Tab */}
          <TabsContent value="survey">
            <SurveyTab moduleId={moduleId} studentId={moduleAccess?.studentId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Consent Modal */}
      {showConsentModal && moduleData && moduleAccess && (
        <ModuleConsentModal
          isOpen={showConsentModal}
          moduleId={moduleId}
          moduleName={moduleData.name || moduleAccess?.moduleName}
          consentFormText={moduleData.consent_form_text}
          studentId={moduleAccess.studentId}
          onConsentSubmitted={handleConsentSubmitted}
        />
      )}
    </div>
  );
}

export default function StudentModulePage() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <StudentModuleContent />
    </Suspense>
  );
}