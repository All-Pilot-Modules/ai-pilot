'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// RadioGroup not available - using custom implementation
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Save,
  Eye,
  Target,
  Brain,
  BookOpen
} from "lucide-react";
import { apiClient } from "@/lib/auth";

export default function StudentTestPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.moduleId;
  
  const [moduleAccess, setModuleAccess] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'saved', 'error'
  const [feedback, setFeedback] = useState({}); // Store feedback for each question
  const [showFeedback, setShowFeedback] = useState({}); // Track which feedback is shown
  const [attempts, setAttempts] = useState({}); // Track attempt numbers for each question

  useEffect(() => {
    // Check access
    const accessData = sessionStorage.getItem('student_module_access');
    if (!accessData || String(JSON.parse(accessData).moduleId) !== String(moduleId)) {
      router.push('/join');
      return;
    }

    const access = JSON.parse(accessData);
    setModuleAccess(access);
    loadTestData(access);
    
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [moduleId, router, startTime]);

  const loadTestData = async (access) => {
    try {
      setLoading(true);

      // Use the new submission-status endpoint to determine current attempt
      let currentAttemptNumber = 1;
      if (access.studentId) {
        try {
          const statusResponse = await apiClient.get(
            `/api/student/modules/${moduleId}/submission-status?student_id=${access.studentId}`
          );
          const statusData = statusResponse?.data || statusResponse || {};

          currentAttemptNumber = statusData.current_attempt || 1;
          console.log(`📊 Submission status: Current attempt is ${currentAttemptNumber}`);

          if (statusData.all_attempts_done) {
            console.log('⛔ All attempts completed - cannot submit again');
          } else if (currentAttemptNumber > 1) {
            console.log('✅ Starting new attempt with empty answers');
          } else {
            console.log('📝 Starting first attempt');
          }
        } catch (err) {
          console.log('📝 No submission status found - Starting Attempt 1');
        }
      }

      // Load questions
      const questionsResponse = await apiClient.get(`/api/student/modules/${moduleId}/questions`);
      const questionsData = questionsResponse?.data || questionsResponse || [];
      setQuestions(questionsData);

      // For new attempts (2+), start with empty answers
      // For attempt 1, load existing draft answers if they exist
      const existingAnswers = {};
      const attemptNumbers = {};

      if (access.studentId) {
        // Load existing draft answers for current attempt (not submitted yet)
        try {
          const answersResponse = await apiClient.get(
            `/api/student/modules/${moduleId}/my-answers?student_id=${access.studentId}&attempt=${currentAttemptNumber}`
          );
          const answersData = answersResponse?.data || answersResponse || [];

          answersData.forEach(answerRecord => {
            if (answerRecord && answerRecord.answer && answerRecord.question_id) {
              let answerValue;

              // Handle different answer formats (old and new)
              if (typeof answerRecord.answer === 'object') {
                // New format: selected_option_id, or old format: selected_option, or text_response
                answerValue = answerRecord.answer.text_response ||
                             answerRecord.answer.selected_option_id ||
                             answerRecord.answer.selected_option;
              } else if (typeof answerRecord.answer === 'string' && answerRecord.answer.trim()) {
                answerValue = answerRecord.answer.trim();
              }

              if (answerValue) {
                existingAnswers[answerRecord.question_id] = answerValue;
              }
            }
          });

          if (Object.keys(existingAnswers).length > 0) {
            console.log(`📝 Loaded ${Object.keys(existingAnswers).length} draft answers for attempt ${currentAttemptNumber}`);
          }
        } catch (err) {
          console.log(`📝 No draft answers found for attempt ${currentAttemptNumber}`);
        }
      }

      // Set all questions to the current attempt number
      questionsData.forEach(q => {
        attemptNumbers[q.id] = currentAttemptNumber;
      });

      setAnswers(existingAnswers);
      setAttempts(attemptNumbers);

    } catch (error) {
      console.error('Failed to load test:', error.message || error);
      setError(error.message || 'Failed to load test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId, answer) => {
    // Check if answer is the same to prevent duplicate API calls
    if (answers[questionId] === answer) return;

    // Update local state immediately for better UX
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Don't auto-save empty answers
    if (!answer || !answer.trim() || !moduleAccess) {
      setSaveStatus(null);
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // For MCQ, save immediately without feedback
    if (question.type === 'mcq') {
      // Immediate save for MCQ selections (no feedback until test submission)
      const saveAnswer = async () => {
        try {
          setSaveStatus('saving');
          // Simplified format: just store the option ID
          const formattedAnswer = {
            selected_option_id: answer.trim()
          };
          const currentAttempt = attempts[questionId] || 1;

          // Use new save-answer endpoint for draft saves (no feedback generation)
          await apiClient.post(`/api/student/save-answer`, {
            student_id: moduleAccess.studentId,
            question_id: questionId,
            module_id: moduleId,
            document_id: question.document_id || null,
            answer: formattedAnswer,
            attempt: currentAttempt
          });

          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 1000);
        } catch (error) {
          const errorMessage = error.response?.data?.detail || error.message || 'Failed to save answer';
          console.error('MCQ Auto-save failed:', errorMessage);
          setSaveStatus('error');
          setError(errorMessage);
          setTimeout(() => {
            setSaveStatus(null);
            setError("");
          }, 3000);
        }
      };
      saveAnswer();
    } else {
      // For text answers, use debounced save without feedback
      const timeoutId = setTimeout(async () => {
        try {
          setSaveStatus('saving');
          const formattedAnswer = { text_response: answer.trim() };
          const currentAttempt = attempts[questionId] || 1;

          // Use new save-answer endpoint for draft saves (no feedback generation)
          await apiClient.post(`/api/student/save-answer`, {
            student_id: moduleAccess.studentId,
            question_id: questionId,
            module_id: moduleId,
            document_id: question.document_id || null,
            answer: formattedAnswer,
            attempt: currentAttempt
          });

          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 1000);
        } catch (error) {
          const errorMessage = error.response?.data?.detail || error.message || 'Failed to save answer';
          console.error('Text Auto-save failed:', errorMessage);
          setSaveStatus('error');
          setError(errorMessage);
          setTimeout(() => {
            setSaveStatus(null);
            setError("");
          }, 3000);
        }
      }, 1200); // Slightly faster debounce

      setAutoSaveTimeout(timeoutId);
    }
  };

  // Second attempts will be handled from the Feedback tab after test submission

  const handleSaveProgress = async () => {
    try {
      const currentQ = questions[currentQuestion];
      const currentAnswer = answers[currentQ.id];

      if (!currentAnswer || !currentAnswer.trim()) return;

      // Format answer based on question type
      let formattedAnswer;
      if (currentQ.type === 'mcq') {
        formattedAnswer = {
          selected_option_id: currentAnswer.trim()
        };
      } else {
        formattedAnswer = {
          text_response: currentAnswer.trim()
        };
      }

      const currentAttempt = attempts[currentQ.id] || 1;
      // Use new save-answer endpoint for draft saves
      await apiClient.post(`/api/student/save-answer`, {
        student_id: moduleAccess.studentId,
        question_id: currentQ.id,
        module_id: moduleId,
        document_id: currentQ.document_id || null,
        answer: formattedAnswer,
        attempt: currentAttempt
      });

      setSuccess("Progress saved!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save progress';
      console.error('Save progress error:', errorMessage);
      setError(errorMessage);
    }
  };

  const handleSubmitTest = async () => {
    if (Object.keys(answers).length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const currentAttempt = attempts[questions[0]?.id] || 1;
      console.log(`🚀 Submitting test - Attempt ${currentAttempt}`);
      console.log(`📝 Total questions: ${questions.length}, Answered: ${Object.keys(answers).length}`);

      // Use the new batch submission endpoint
      const response = await apiClient.post(
        `/api/student/modules/${moduleId}/submit-test?student_id=${moduleAccess.studentId}&attempt=${currentAttempt}`
      );

      const result = response?.data || response || {};
      console.log('✅ Submission result:', result);

      if (result.success) {
        console.log(`💡 Feedback generated for ${result.feedback_generated || 0} questions`);
        console.log(`📊 Submitted ${result.questions_submitted} questions`);

        setSuccess(`Attempt ${currentAttempt} submitted successfully! Redirecting to feedback...`);

        // Redirect to feedback tab after submission
        setTimeout(() => {
          router.push(`/student/module/${moduleId}?tab=feedback`);
        }, 2000);
      } else {
        throw new Error(result.message || "Submission failed");
      }

    } catch (error) {
      console.error('❌ Submit error:', error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to submit test. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(qId => answers[qId] && answers[qId].trim()).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading test questions...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Test Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This module doesn&quot;t have any questions yet.</p>
            <Button onClick={() => router.push(`/student/module/${moduleId}`)}>
              Back to Module
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push(`/student/module/${moduleId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Test
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h1 className="text-lg font-semibold">{moduleAccess?.moduleName} Test</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {formatTime(timeSpent)}
              </div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                Attempt {attempts[questions[0]?.id] || 1}
              </Badge>
              <Badge variant="outline">
                {getAnsweredCount()} / {questions.length} answered
              </Badge>
              {saveStatus && (
                <div className="flex items-center gap-1 text-sm">
                  {saveStatus === 'saving' && (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600">Saving...</span>
                    </>
                  )}
                  {saveStatus === 'saved' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Saved</span>
                    </>
                  )}
                  {saveStatus === 'error' && (
                    <>
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span className="text-red-600">Save failed</span>
                    </>
                  )}
                </div>
              )}
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Submitted
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4">
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
                    const hasAnswer = answers[q.id] && answers[q.id].trim();
                    const isActive = index === currentQuestion;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`
                          w-12 h-12 rounded-lg text-sm font-bold border-2 transition-colors relative flex items-center justify-center
                          ${isActive
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                            : hasAnswer
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        {hasAnswer ? (
                          <div className="flex flex-col items-center justify-center">
                            <Eye className="w-4 h-4" />
                            <span className="text-xs font-medium mt-0.5">{index + 1}</span>
                          </div>
                        ) : (
                          <span className="text-base font-bold">{index + 1}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Question */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">
                      Question {currentQuestion + 1} of {questions.length}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <Badge variant="outline">
                        {currentQ?.type === 'mcq' ? 'Multiple Choice' : 
                         currentQ?.type === 'short' ? 'Short Answer' : 'Essay Question'}
                      </Badge>
                      {currentQ?.slide_number && (
                        <span>Slide {currentQ.slide_number}</span>
                      )}
                      {currentQ?.bloom_taxonomy && (
                        <div className="flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          {currentQ.bloom_taxonomy}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Question Text */}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">{currentQ?.text}</p>
                  </div>

                  {/* Learning Outcome */}
                  {currentQ?.learning_outcome && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Learning Outcome</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{currentQ.learning_outcome}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Question Image */}
                  {currentQ?.image_url && (
                    <div className="border rounded-lg overflow-hidden">
                      <img 
                        src={currentQ.image_url} 
                        alt="Question illustration" 
                        className="w-full max-w-md mx-auto"
                      />
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Your Answer:</Label>
                    
                    {currentQ?.type === 'mcq' ? (
                      <div className="space-y-2">
                        {currentQ.options && Object.entries(currentQ.options).map(([key, option]) => {
                          const isSelected = answers[currentQ.id] === key;
                          return (
                            <div
                              key={key}
                              className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => updateAnswer(currentQ.id, key)}
                            >
                              <input
                                type="radio"
                                id={`option-${currentQ.id}-${key}`}
                                name={`question-${currentQ.id}`}
                                value={key}
                                checked={isSelected}
                                onChange={() => {}}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                              />
                              <Label
                                htmlFor={`option-${currentQ.id}-${key}`}
                                className="flex-1 cursor-pointer text-base leading-relaxed"
                              >
                                <span className="font-semibold mr-3 text-blue-600">{key}.</span>
                                <span className={isSelected ? 'text-blue-900 dark:text-blue-100' : ''}>{option}</span>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    ) : currentQ?.type === 'short' ? (
                      <Input
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                        placeholder="Enter your short answer..."
                        className="text-base"
                      />
                    ) : (
                      <Textarea
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                        placeholder="Write your detailed response here..."
                        rows={8}
                        className="text-base"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation and Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSubmitTest}
                  disabled={submitting || getAnsweredCount() === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Attempt {attempts[questions[0]?.id] || 1}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{success}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}