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

  useEffect(() => {
    // Check access
    const accessData = sessionStorage.getItem('student_module_access');
    if (!accessData || JSON.parse(accessData).moduleId !== moduleId) {
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
  }, [moduleId, router, startTime, autoSaveTimeout]);

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
            if (existingAnswer && existingAnswer.answer && existingAnswer.answer.trim()) {
              return {
                questionId: question.id,
                answer: existingAnswer.answer
              };
            }
          } catch (err) {
            // No existing answer for this question
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
      const timeoutId = setTimeout(async () => {
        try {
          const question = questions.find(q => q.id === questionId);
          await apiClient.post(`/api/student/submit-answer`, {
            student_id: moduleAccess.studentId,
            question_id: questionId,
            document_id: question.document_id,
            answer: answer,
            attempt: 1
          });
          console.log(`Auto-saved answer for question ${questionId}`);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000); // Wait 2 seconds after user stops typing

      setAutoSaveTimeout(timeoutId);
    }
  };

  const handleSaveProgress = async () => {
    try {
      const currentQ = questions[currentQuestion];
      const currentAnswer = answers[currentQ.id];
      
      if (!currentAnswer || !currentAnswer.trim()) return;

      await apiClient.post(`/api/student/submit-answer`, {
        student_id: moduleAccess.studentId,
        question_id: currentQ.id,
        document_id: currentQ.document_id,
        answer: currentAnswer,
        attempt: 1
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
          await apiClient.post(`/api/student/submit-answer`, {
            student_id: moduleAccess.studentId,
            question_id: question.id,
            document_id: question.document_id,
            answer: answer,
            attempt: 1
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
        <div className="max-w-6xl mx-auto px-4 py-4">
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                  {questions.map((q, index) => {
                    const hasAnswer = answers[q.id] && answers[q.id].trim();
                    const isActive = index === currentQuestion;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`
                          w-10 h-10 rounded-lg text-sm font-medium border-2 transition-colors relative
                          ${isActive 
                            ? 'border-blue-600 bg-blue-600 text-white' 
                            : hasAnswer 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        {hasAnswer ? (
                          <CheckCircle className="w-5 h-5 mx-auto" />
                        ) : (
                          index + 1
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Question */}
          <div className="lg:col-span-3">
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
                <div className="space-y-6">
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
                      <div className="space-y-3">
                        {currentQ.options && Object.entries(currentQ.options).map(([key, option]) => (
                          <div key={key} className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800">
                            <input
                              type="radio"
                              id={`option-${currentQ.id}-${key}`}
                              name={`question-${currentQ.id}`}
                              value={key}
                              checked={answers[currentQ.id] === key}
                              onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <Label 
                              htmlFor={`option-${currentQ.id}-${key}`} 
                              className="flex-1 cursor-pointer text-base"
                            >
                              <span className="font-medium mr-2">{key}.</span>
                              {option}
                            </Label>
                          </div>
                        ))}
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
            <div className="flex items-center justify-between mt-6">
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
                  variant="outline"
                  onClick={handleSaveProgress}
                  disabled={!answers[currentQ?.id] || !answers[currentQ?.id].trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </Button>
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