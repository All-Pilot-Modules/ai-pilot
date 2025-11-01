'use client';

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// RadioGroup not available - using custom implementation
import { Label } from "@/components/ui/label";
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
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";
import { apiClient } from "@/lib/auth";
import { FullPageLoader } from "@/components/LoadingSpinner";
import PrefillControlPanel from "@/components/PrefillControlPanel";

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

  // Ref to track current answers for race condition prevention
  const answersRef = useRef({});

  // Prefill functionality states
  const [previousAttempts, setPreviousAttempts] = useState([]); // Array of {attemptNumber, answers, feedback}
  const [prefilledQuestions, setPrefilledQuestions] = useState(new Set()); // Track which questions are prefilled
  const [selectedPrefillAttempt, setSelectedPrefillAttempt] = useState(null); // Which attempt to prefill from
  const [showPrefillPanel, setShowPrefillPanel] = useState(false); // Toggle prefill UI
  const [selectedQuestionsForPrefill, setSelectedQuestionsForPrefill] = useState(new Set()); // Individual question selection

  // Confirmation dialog for unanswered questions
  const [showUnansweredDialog, setShowUnansweredDialog] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);

  // Keep answersRef in sync with answers state
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
              } else if (typeof answerRecord.answer === 'string') {
                answerValue = answerRecord.answer;
              }

              // Only include answers with actual content (not empty or whitespace-only)
              if (answerValue && typeof answerValue === 'string' && answerValue.trim()) {
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

      // Load previous attempts data if this is attempt 2+
      if (currentAttemptNumber > 1 && access.studentId) {
        try {
          const prevAttemptsData = [];

          // Fetch answers and feedback for all previous attempts
          for (let attemptNum = 1; attemptNum < currentAttemptNumber; attemptNum++) {
            // Organize answers and feedback by question_id
            let answersMap = {};
            let feedbackMap = {};

            try {
              // Fetch answers for this previous attempt
              const prevAnswersResponse = await apiClient.get(
                `/api/student/modules/${moduleId}/my-answers?student_id=${access.studentId}&attempt=${attemptNum}`
              );
              const prevAnswers = prevAnswersResponse?.data || prevAnswersResponse || [];

              // Fetch feedback for this previous attempt
              const feedbackResponse = await apiClient.get(
                `/api/student/modules/${moduleId}/feedback?student_id=${access.studentId}`
              );
              const allFeedback = feedbackResponse?.data || feedbackResponse || [];

              // Filter feedback for this specific attempt
              const attemptFeedback = allFeedback.filter(fb => {
                // Match feedback to this attempt's answers
                const answerForFeedback = prevAnswers.find(ans => ans.id === fb.answer_id);
                return answerForFeedback !== undefined;
              });

              prevAnswers.forEach(answerRecord => {
                if (answerRecord && answerRecord.question_id) {
                  let answerValue;
                  if (typeof answerRecord.answer === 'object') {
                    answerValue = answerRecord.answer.text_response ||
                                 answerRecord.answer.selected_option_id ||
                                 answerRecord.answer.selected_option;
                  } else if (typeof answerRecord.answer === 'string') {
                    answerValue = answerRecord.answer;
                  }

                  // Only include answers with actual content (not empty or whitespace-only)
                  if (answerValue && typeof answerValue === 'string' && answerValue.trim()) {
                    answersMap[answerRecord.question_id] = {
                      value: answerValue,
                      answerId: answerRecord.id
                    };
                  }
                }
              });

              attemptFeedback.forEach(fb => {
                if (fb && fb.answer_id) {
                  const answer = prevAnswers.find(ans => ans.id === fb.answer_id);
                  if (answer) {
                    feedbackMap[answer.question_id] = fb;
                  }
                }
              });

              console.log(`📚 Loaded ${Object.keys(answersMap).length} answers from attempt ${attemptNum}`);
            } catch (err) {
              console.log(`📝 No data found for attempt ${attemptNum}`);
              // If no data, answersMap will remain empty
            }

            // Only add the attempt if it has at least one answer (for prefilling to be useful)
            if (Object.keys(answersMap).length > 0) {
              prevAttemptsData.push({
                attemptNumber: attemptNum,
                answers: answersMap,
                feedback: feedbackMap
              });
            } else {
              console.log(`⏭️ Skipping attempt ${attemptNum} - no answers to prefill from`);
            }
          }

          if (prevAttemptsData.length > 0) {
            setPreviousAttempts(prevAttemptsData);
            // Auto-select the most recent previous attempt
            setSelectedPrefillAttempt(prevAttemptsData[prevAttemptsData.length - 1].attemptNumber);
            console.log(`✅ Loaded ${prevAttemptsData.length} previous attempt(s)`);
          }
        } catch (err) {
          console.log('📝 Could not load previous attempts:', err);
        }
      }

    } catch (error) {
      console.error('Failed to load test:', error);

      let errorMessage = 'Failed to load test. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Test not found. Please contact your instructor.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please check your access code.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (error.message === 'Network Error' || !error.response) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      setError(errorMessage);
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

    // Update ref synchronously to prevent race conditions
    answersRef.current = {
      ...answersRef.current,
      [questionId]: answer
    };

    // Remove prefill indicator when user manually edits the answer
    if (prefilledQuestions.has(questionId)) {
      setPrefilledQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }

    // Don't auto-save empty answers
    if (!answer || !answer.trim() || !moduleAccess) {
      setSaveStatus(null);

      // RACE CONDITION FIX: Also tell backend to delete any existing answer for this question
      // This handles the case where user typed, auto-save started, then user deleted text
      if (moduleAccess && questionId) {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          const currentAttempt = attempts[questionId] || 1;
          // Send empty answer to trigger backend deletion
          apiClient.post(`/api/student/save-answer`, {
            student_id: moduleAccess.studentId,
            question_id: questionId,
            module_id: moduleId,
            document_id: question.document_id || null,
            answer: { text_response: "" }, // Empty will trigger deletion in backend
            attempt: currentAttempt
          }).catch(err => {
            console.log('Failed to clear answer:', err);
          });
        }
      }

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

          // For immediate MCQ save, use the answer parameter directly
          // (ref won't be updated yet since useEffect runs after render)
          if (!answer || !answer.trim()) {
            console.log(`⏭️ Skipping MCQ save - answer was cleared`);
            setSaveStatus(null);
            return;
          }

          // Simplified format: just store the option ID
          const formattedAnswer = {
            selected_option_id: answer.trim()
          };
          const currentAttempt = attempts[questionId] || 1;

          console.log(`💾 Auto-saving MCQ answer for question ${questionId}: ${answer.trim()}`);

          // Use new save-answer endpoint for draft saves (no feedback generation)
          await apiClient.post(`/api/student/save-answer`, {
            student_id: moduleAccess.studentId,
            question_id: questionId,
            module_id: moduleId,
            document_id: question.document_id || null,
            answer: formattedAnswer,
            attempt: currentAttempt
          });

          console.log(`✅ MCQ answer saved successfully`);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 1000);
        } catch (error) {
          const errorMessage = error.response?.data?.detail || error.message || 'Failed to save answer';
          console.error('❌ MCQ Auto-save failed:', errorMessage);
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

          // RACE CONDITION FIX: Re-check the current answer value, not the old captured value
          // Use ref to get the LATEST answer value, not the captured closure value
          const currentAnswer = answersRef.current[questionId];
          if (!currentAnswer || !currentAnswer.trim()) {
            console.log(`⏭️ Skipping text save for question ${questionId} - answer was cleared`);
            setSaveStatus(null);
            return;
          }

          const formattedAnswer = { text_response: currentAnswer.trim() };
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

  const checkUnansweredQuestions = () => {
    const unanswered = questions.filter(q => {
      const answer = answers[q.id];
      return !answer || !answer.trim();
    });

    if (unanswered.length > 0) {
      setUnansweredQuestions(unanswered);
      setShowUnansweredDialog(true);
      return true;
    }
    return false;
  };

  const handleSubmitTest = async () => {
    if (Object.keys(answers).length === 0) {
      setError("Please answer at least one question before submitting.");
      return;
    }

    // Check for unanswered questions
    if (checkUnansweredQuestions()) {
      return; // Show dialog, don't submit yet
    }

    // If all answered or user confirmed, proceed with submission
    await performSubmit();
  };

  const performSubmit = async () => {
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

        // Check if this was the last attempt
        const isLastAttempt = result.can_retry === false;

        if (isLastAttempt) {
          setSuccess(`Attempt ${currentAttempt} submitted successfully! Redirecting to survey...`);

          // Redirect to survey tab for final attempt
          setTimeout(() => {
            router.push(`/student/module/${moduleId}?tab=survey`);
          }, 2000);
        } else {
          setSuccess(`Attempt ${currentAttempt} submitted successfully! Redirecting to feedback...`);

          // Redirect to feedback tab for non-final attempts
          setTimeout(() => {
            router.push(`/student/module/${moduleId}?tab=feedback`);
          }, 2000);
        }
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

  // Prefill Functions
  const prefillAllAnswers = async (attemptNumber) => {
    const attemptData = previousAttempts.find(a => a.attemptNumber === attemptNumber);
    if (!attemptData) {
      console.error(`No data found for attempt ${attemptNumber}`);
      return;
    }

    const newAnswers = { ...answers };
    const newPrefilledSet = new Set(prefilledQuestions);

    Object.entries(attemptData.answers).forEach(([questionId, answerData]) => {
      newAnswers[questionId] = answerData.value;
      newPrefilledSet.add(questionId);
    });

    setAnswers(newAnswers);
    setPrefilledQuestions(newPrefilledSet);
    setShowPrefillPanel(false);

    const count = Object.keys(attemptData.answers).length;
    setSuccess(`Saving ${count} prefilled answer${count !== 1 ? 's' : ''}...`);

    // Save all prefilled answers to the backend
    try {
      const savePromises = Object.entries(attemptData.answers).map(async ([questionId, answerData]) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const currentAttempt = attempts[questionId] || 1;
        let formattedAnswer;

        if (question.type === 'mcq') {
          formattedAnswer = { selected_option_id: answerData.value.trim() };
        } else {
          formattedAnswer = { text_response: answerData.value.trim() };
        }

        await apiClient.post(`/api/student/save-answer`, {
          student_id: moduleAccess.studentId,
          question_id: questionId,
          module_id: moduleId,
          document_id: question.document_id || null,
          answer: formattedAnswer,
          attempt: currentAttempt
        });
      });

      await Promise.all(savePromises);
      setSuccess(`✓ Prefilled ${count} answer${count !== 1 ? 's' : ''} from Attempt ${attemptNumber}`);
      setTimeout(() => setSuccess(""), 3000);
      console.log(`✅ Prefilled and saved ${count} answers from attempt ${attemptNumber}`);
    } catch (error) {
      console.error('Failed to save prefilled answers:', error);
      setError('Answers were prefilled but some failed to save. Please review and save manually.');
      setTimeout(() => setError(""), 5000);
    }
  };

  const prefillQuestion = async (questionId, attemptNumber) => {
    const attemptData = previousAttempts.find(a => a.attemptNumber === attemptNumber);
    if (!attemptData || !attemptData.answers[questionId]) {
      console.error(`No answer found for question ${questionId} in attempt ${attemptNumber}`);
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: attemptData.answers[questionId].value
    }));

    setPrefilledQuestions(prev => new Set([...prev, questionId]));

    // Save the prefilled answer to the backend
    try {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const currentAttempt = attempts[questionId] || 1;
      const answerData = attemptData.answers[questionId];
      let formattedAnswer;

      if (question.type === 'mcq') {
        formattedAnswer = { selected_option_id: answerData.value.trim() };
      } else {
        formattedAnswer = { text_response: answerData.value.trim() };
      }

      await apiClient.post(`/api/student/save-answer`, {
        student_id: moduleAccess.studentId,
        question_id: questionId,
        module_id: moduleId,
        document_id: question.document_id || null,
        answer: formattedAnswer,
        attempt: currentAttempt
      });

      console.log(`✅ Prefilled and saved question ${questionId} from attempt ${attemptNumber}`);
    } catch (error) {
      console.error('Failed to save prefilled question:', error);
    }
  };

  const prefillSelectedQuestions = async () => {
    if (selectedQuestionsForPrefill.size === 0) {
      setError("Please select at least one question to prefill");
      setTimeout(() => setError(""), 2000);
      return;
    }

    const attemptData = previousAttempts.find(a => a.attemptNumber === selectedPrefillAttempt);
    if (!attemptData) return;

    const newAnswers = { ...answers };
    const newPrefilledSet = new Set(prefilledQuestions);
    let count = 0;
    const questionIdsToSave = [];

    selectedQuestionsForPrefill.forEach(questionId => {
      if (attemptData.answers[questionId]) {
        newAnswers[questionId] = attemptData.answers[questionId].value;
        newPrefilledSet.add(questionId);
        questionIdsToSave.push(questionId);
        count++;
      }
    });

    setAnswers(newAnswers);
    setPrefilledQuestions(newPrefilledSet);
    setSelectedQuestionsForPrefill(new Set());
    setShowPrefillPanel(false);

    setSuccess(`Saving ${count} selected answer${count !== 1 ? 's' : ''}...`);

    // Save all selected prefilled answers to the backend
    try {
      const savePromises = questionIdsToSave.map(async (questionId) => {
        const question = questions.find(q => q.id === questionId);
        if (!question) return;

        const currentAttempt = attempts[questionId] || 1;
        const answerData = attemptData.answers[questionId];
        let formattedAnswer;

        if (question.type === 'mcq') {
          formattedAnswer = { selected_option_id: answerData.value.trim() };
        } else {
          formattedAnswer = { text_response: answerData.value.trim() };
        }

        await apiClient.post(`/api/student/save-answer`, {
          student_id: moduleAccess.studentId,
          question_id: questionId,
          module_id: moduleId,
          document_id: question.document_id || null,
          answer: formattedAnswer,
          attempt: currentAttempt
        });
      });

      await Promise.all(savePromises);
      setSuccess(`✓ Prefilled ${count} selected answer${count !== 1 ? 's' : ''}`);
      setTimeout(() => setSuccess(""), 3000);
      console.log(`✅ Prefilled and saved ${count} selected questions`);
    } catch (error) {
      console.error('Failed to save selected prefilled answers:', error);
      setError('Answers were prefilled but some failed to save. Please review and save manually.');
      setTimeout(() => setError(""), 5000);
    }
  };

  const clearPrefill = (questionId) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });

    setPrefilledQuestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionsForPrefill(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(qId => answers[qId] && answers[qId].trim()).length;
  };

  // Mask student ID to show only last 2 digits
  const maskStudentId = (studentId) => {
    if (!studentId) return '';
    const idStr = String(studentId);
    if (idStr.length <= 2) return idStr;
    const lastTwo = idStr.slice(-2);
    const masked = '*'.repeat(idStr.length - 2);
    return masked + lastTwo;
  };

  if (loading) {
    return <FullPageLoader text="Loading test questions..." />;
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
              {moduleAccess?.studentId && (
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-mono text-sm px-4 py-2 shadow-md border-0">
                  Student ID: {maskStudentId(moduleAccess.studentId)}
                </Badge>
              )}
              {/* Prefill Button - Show only if previous attempts exist */}
              {previousAttempts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrefillPanel(!showPrefillPanel)}
                  className="border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Prefill Answers
                </Button>
              )}
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
        {/* Prefill Control Panel */}
        {showPrefillPanel && previousAttempts.length > 0 && (
          <div className="mb-4">
            <PrefillControlPanel
              previousAttempts={previousAttempts}
              selectedPrefillAttempt={selectedPrefillAttempt}
              setSelectedPrefillAttempt={setSelectedPrefillAttempt}
              selectedQuestionsForPrefill={selectedQuestionsForPrefill}
              toggleQuestionSelection={toggleQuestionSelection}
              prefillAllAnswers={prefillAllAnswers}
              prefillSelectedQuestions={prefillSelectedQuestions}
              onClose={() => setShowPrefillPanel(false)}
              questions={questions}
            />
          </div>
        )}

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
                    const isPrefilled = prefilledQuestions.has(q.id);

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
                        {/* Prefilled indicator badge */}
                        {isPrefilled && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800 rounded-full" title="Prefilled from previous attempt" />
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
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">{currentQ?.text}</p>
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
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <img
                        src={currentQ.image_url}
                        alt="Question illustration"
                        className="w-full max-w-2xl mx-auto rounded-lg shadow-sm object-contain"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Your Answer:</Label>
                      {prefilledQuestions.has(currentQ.id) && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-blue-400 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            From Attempt {previousAttempts.find(a =>
                              a.answers[currentQ.id]?.value === answers[currentQ.id]
                            )?.attemptNumber || selectedPrefillAttempt}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => clearPrefill(currentQ.id)}
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>

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
                                <span className={`whitespace-pre-wrap ${isSelected ? 'text-blue-900 dark:text-blue-100' : ''}`}>{option}</span>
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

      {/* Unanswered Questions Confirmation Dialog */}
      <AlertDialog open={showUnansweredDialog} onOpenChange={setShowUnansweredDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              Unanswered Questions
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              You have <span className="font-bold text-orange-600">{unansweredQuestions.length} unanswered question{unansweredQuestions.length !== 1 ? 's' : ''}</span> out of {questions.length} total questions.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 max-h-64 overflow-y-auto">
            <p className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Unanswered questions:
            </p>
            <div className="space-y-2">
              {unansweredQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="bg-white dark:bg-gray-900 shrink-0">
                      Q{questions.findIndex(qu => qu.id === q.id) + 1}
                    </Badge>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {q.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowUnansweredDialog(false)}>
              Go Back to Answer
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnansweredDialog(false);
                performSubmit();
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}