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
      
      // Load questions first
      const questionsResponse = await apiClient.get(`/api/student/modules/${moduleId}/questions`);
      const questionsData = questionsResponse.data || questionsResponse;
      setQuestions(questionsData);

      // Load existing answers in parallel
      const existingAnswers = {};
      if (access.studentId && questionsData.length > 0) {
        const answerPromises = questionsData.map(async (question) => {
          try {
            const answerResponse = await apiClient.get(`/api/student/questions/${question.id}/my-answer?student_id=${access.studentId}&attempt=1`);
            const existingAnswer = answerResponse.data || answerResponse;
            if (existingAnswer && existingAnswer.answer) {
              // Handle different answer formats
              let answerValue;
              if (typeof existingAnswer.answer === 'object' && existingAnswer.answer.selected_option) {
                // JSONB format: {selected_option: "A", text_response: "..."}
                answerValue = existingAnswer.answer.selected_option;
                if (existingAnswer.answer.text_response) {
                  answerValue = existingAnswer.answer.text_response;
                }
              } else if (typeof existingAnswer.answer === 'string' && existingAnswer.answer.trim()) {
                // String format
                answerValue = existingAnswer.answer.trim();
              }
              
              if (answerValue) {
                return {
                  questionId: question.id,
                  answer: answerValue
                };
              }
            }
          } catch (err) {
            // No existing answer for this question
            console.log(`No existing answer for question ${question.id}`);
          }
          return null;
        });

        const answerResults = await Promise.all(answerPromises);
        answerResults.forEach(result => {
          if (result) {
            existingAnswers[result.questionId] = result.answer;
          }
        });
      }
      setAnswers(existingAnswers);

    } catch (error) {
      console.error('Failed to load test:', error);
      setError('Failed to load test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId, answer) => {
    // Check if answer is the same to prevent duplicate API calls
    if (answers[questionId] === answer) return;
    
    // Update local state immediately
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new auto-save timeout (debounce for 2 seconds)
    if (answer && answer.trim() && moduleAccess) {
      const question = questions.find(q => q.id === questionId);
      
      // For MCQ, save immediately and handle feedback
      if (question?.type === 'mcq') {
        // Immediate save for MCQ selections with feedback handling
        const saveAnswer = async () => {
          try {
            const formattedAnswer = {
              selected_option: answer.trim()
            };
            
            const currentAttempt = attempts[questionId] || 1;
            const response = await apiClient.post(`/api/student/submit-answer`, {
              student_id: moduleAccess.studentId,
              question_id: questionId,
              document_id: question.document_id,
              answer: formattedAnswer,
              attempt: currentAttempt
            });
            
            // Handle feedback for first attempt
            if (currentAttempt === 1 && response.data?.feedback) {
              setFeedback(prev => ({
                ...prev,
                [questionId]: response.data.feedback
              }));
              setShowFeedback(prev => ({
                ...prev,
                [questionId]: true
              }));
            }
            
            console.log(`Auto-saved MCQ answer for question ${questionId}`);
          } catch (error) {
            console.error('MCQ Auto-save failed:', error);
          }
        };
        // Save with feedback handling
        saveAnswer();
      } else {
        // For text answers, use debounced save with feedback handling
        const timeoutId = setTimeout(async () => {
          setSaveStatus('saving');
          try {
            const formattedAnswer = {
              text_response: answer.trim()
            };
            
            const currentAttempt = attempts[questionId] || 1;
            const response = await apiClient.post(`/api/student/submit-answer`, {
              student_id: moduleAccess.studentId,
              question_id: questionId,
              document_id: question.document_id,
              answer: formattedAnswer,
              attempt: currentAttempt
            });
            
            // Handle feedback for first attempt
            if (currentAttempt === 1 && response.data?.feedback) {
              setFeedback(prev => ({
                ...prev,
                [questionId]: response.data.feedback
              }));
              setShowFeedback(prev => ({
                ...prev,
                [questionId]: true
              }));
            }
            
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(null), 1000);
            console.log(`Auto-saved text answer for question ${questionId}`);
          } catch (error) {
            console.error('Text Auto-save failed:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 2000);
          }
        }, 1500); // Reduced from 2 seconds to 1.5 seconds

        setAutoSaveTimeout(timeoutId);
      }
    } else {
      setSaveStatus(null);
    }
  };

  const handleSecondAttempt = async (questionId) => {
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      // Set attempt to 2 for this question
      setAttempts(prev => ({
        ...prev,
        [questionId]: 2
      }));

      // Clear the feedback display to allow new answer
      setShowFeedback(prev => ({
        ...prev,
        [questionId]: false
      }));

      // Clear current answer to allow fresh input
      setAnswers(prev => ({
        ...prev,
        [questionId]: ""
      }));

      setSuccess("You can now try again! Enter your second attempt.");
      setTimeout(() => setSuccess(""), 3000);

    } catch (error) {
      console.error('Error setting up second attempt:', error);
      setError("Failed to set up second attempt. Please try again.");
    }
  };

  const dismissFeedback = (questionId) => {
    setShowFeedback(prev => ({
      ...prev,
      [questionId]: false
    }));
  };

  const handleSaveProgress = async () => {
    try {
      const currentQ = questions[currentQuestion];
      const currentAnswer = answers[currentQ.id];
      
      if (!currentAnswer || !currentAnswer.trim()) return;

      // Format answer based on question type
      let formattedAnswer;
      if (currentQ.type === 'mcq') {
        formattedAnswer = {
          selected_option: currentAnswer.trim()
        };
      } else {
        formattedAnswer = {
          text_response: currentAnswer.trim()
        };
      }

      const currentAttempt = attempts[currentQ.id] || 1;
      await apiClient.post(`/api/student/submit-answer`, {
        student_id: moduleAccess.studentId,
        question_id: currentQ.id,
        document_id: currentQ.document_id,
        answer: formattedAnswer,
        attempt: currentAttempt
      });
      
      setSuccess("Progress saved!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (error) {
      console.error('Save progress error:', error);
      setError("Failed to save progress. Please try again.");
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
      // Submit all answers
      for (const question of questions) {
        const answer = answers[question.id];
        if (answer && answer.trim()) {
          // Format answer based on question type
          let formattedAnswer;
          if (question.type === 'mcq') {
            formattedAnswer = {
              selected_option: answer.trim()
            };
          } else {
            formattedAnswer = {
              text_response: answer.trim()
            };
          }

          const currentAttempt = attempts[question.id] || 1;
          await apiClient.post(`/api/student/submit-answer`, {
            student_id: moduleAccess.studentId,
            question_id: question.id,
            document_id: question.document_id,
            answer: formattedAnswer,
            attempt: currentAttempt
          });
        }
      }

      setIsCompleted(true);
      setSuccess("Test submitted successfully!");
      
      // Redirect back to module after 3 seconds
      setTimeout(() => {
        router.push(`/student/module/${moduleId}`);
      }, 3000);

    } catch (error) {
      console.error('Submit error:', error);
      setError("Failed to submit test. Please try again.");
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
          <p className="text-gray-600 dark:text-gray-400">Loading test...</p>
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">This module doesn't have any questions yet.</p>
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
                    const questionAttempt = attempts[q.id] || 1;
                    const hasFeedback = feedback[q.id];
                    const isCorrect = hasFeedback?.is_correct;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`
                          w-12 h-12 rounded-lg text-sm font-bold border-2 transition-colors relative flex items-center justify-center
                          ${isActive 
                            ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                            : hasAnswer && isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : hasAnswer && hasFeedback && !isCorrect
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                            : hasAnswer 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        {hasAnswer ? (
                          <div className="flex flex-col items-center justify-center">
                            {isCorrect ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : hasFeedback && !isCorrect ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            <span className="text-xs font-medium mt-0.5">{index + 1}</span>
                            {questionAttempt > 1 && (
                              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {questionAttempt}
                              </span>
                            )}
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
                                onChange={() => {}} // Remove duplicate handler - onClick handles the selection
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

            {/* AI Feedback Display */}
            {showFeedback[currentQ?.id] && feedback[currentQ?.id] && (
              <Card className="mt-4 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-blue-600" />
                      AI Feedback - Attempt {attempts[currentQ?.id] || 1}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {feedback[currentQ?.id]?.is_correct ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                          <XCircle className="w-3 h-3 mr-1" />
                          Incorrect
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissFeedback(currentQ?.id)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Correctness Score */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Score:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${feedback[currentQ?.id]?.correctness_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {feedback[currentQ?.id]?.correctness_score || 0}%
                      </span>
                    </div>

                    {/* Explanation */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation:</h4>
                      <p className="text-blue-800 dark:text-blue-200">
                        {feedback[currentQ?.id]?.explanation}
                      </p>
                    </div>

                    {/* Improvement Hint */}
                    {feedback[currentQ?.id]?.improvement_hint && (
                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Improvement Suggestion:
                        </h4>
                        <p className="text-yellow-800 dark:text-yellow-200">
                          {feedback[currentQ?.id]?.improvement_hint}
                        </p>
                      </div>
                    )}

                    {/* Second Attempt Button */}
                    {!feedback[currentQ?.id]?.is_correct && (attempts[currentQ?.id] || 1) === 1 && (
                      <div className="flex justify-center pt-2">
                        <Button
                          onClick={() => handleSecondAttempt(currentQ?.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Try Second Attempt
                        </Button>
                      </div>
                    )}

                    {/* Second Attempt Result */}
                    {(attempts[currentQ?.id] || 1) === 2 && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-center font-medium">
                          Second attempt completed. Final answer submitted.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

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
                      Submit Test
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