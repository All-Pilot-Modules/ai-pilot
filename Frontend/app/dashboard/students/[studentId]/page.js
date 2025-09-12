'use client';

import { useAuth } from "@/context/AuthContext";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ArrowLeft, User, Mail, Calendar, Clock, Award, BookOpen, TrendingUp, CheckCircle, XCircle, HelpCircle, List, Download, BarChart3, PieChart, Bot, FileDown, FileText, FileJson } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";

export default function StudentDetailPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const studentId = params.studentId;
  const moduleName = searchParams.get('module');
  
  const [student, setStudent] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [moduleData, setModuleData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  useEffect(() => {
    if (studentId && moduleName && isAuthenticated) {
      fetchStudentDetails();
    }
  }, [studentId, moduleName, isAuthenticated]);

  const fetchStudentDetails = async () => {
    try {
      setLoadingData(true);
      setError('');

      // Get teacher ID
      const teacherId = user?.id || user?.sub;
      if (!teacherId) {
        setError('Unable to identify teacher. Please sign in again.');
        return;
      }

      // Get module by name
      const modulesResponse = await apiClient.get(`/api/modules?teacher_id=${teacherId}`);
      const modules = modulesResponse.data || modulesResponse;
      const module = modules.find(m => m.name.toLowerCase() === moduleName.toLowerCase());
      
      if (!module) {
        setError(`Module "${moduleName}" not found`);
        return;
      }

      setModuleData(module);

      // Get questions for this module
      const questionsResponse = await apiClient.get(`/api/student/modules/${module.id}/questions`);
      const questions = questionsResponse.data || questionsResponse;

      // Get all student answers for this module
      const moduleAnswersResponse = await apiClient.get(`/api/student-answers?module_id=${module.id}`);
      const allModuleAnswers = moduleAnswersResponse.data || moduleAnswersResponse || [];
      
      // Filter answers for this specific student
      const studentModuleAnswers = allModuleAnswers.filter(answer => answer.student_id === studentId);

      if (studentModuleAnswers.length === 0) {
        setError(`No data found for student "${studentId}" in module "${moduleName}"`);
        return;
      }

      // Build student info from first answer
      const firstAnswer = studentModuleAnswers[0];
      const studentInfo = {
        id: studentId,
        name: studentId,
        email: studentId,
        student_id: studentId,
        last_access: studentModuleAnswers.reduce((latest, answer) => {
          return new Date(answer.submitted_at) > new Date(latest) ? answer.submitted_at : latest;
        }, studentModuleAnswers[0].submitted_at)
      };

      // Calculate performance metrics
      const totalQuestions = questions.length;
      const answeredQuestions = studentModuleAnswers.length;
      const correctAnswers = studentModuleAnswers.filter(answer => {
        if (typeof answer.answer === 'object' && typeof answer.correct_answer === 'object') {
          return JSON.stringify(answer.answer) === JSON.stringify(answer.correct_answer);
        }
        return answer.answer === answer.correct_answer;
      }).length;

      const studentWithPerformance = {
        ...studentInfo,
        total_questions: totalQuestions,
        completed_questions: answeredQuestions,
        avg_score: answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0,
        progress: Math.round((answeredQuestions / totalQuestions) * 100),
        correct_answers: correctAnswers,
        incorrect_answers: answeredQuestions - correctAnswers
      };

      setStudent(studentWithPerformance);

      // Create question data with student answers
      const studentQuestionData = questions.map(question => {
        const studentAnswer = studentModuleAnswers.find(answer => answer.question_id === question.id);
        
        // Format answers properly
        const formatAnswer = (answer, options) => {
          if (!answer) return null;
          
          if (typeof answer === 'object') {
            // Handle object answers like {selected_option: "A"}
            if (answer.selected_option && options) {
              try {
                const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
                const selectedOption = parsedOptions[answer.selected_option];
                return `${answer.selected_option} (${selectedOption})`;
              } catch (e) {
                return JSON.stringify(answer);
              }
            }
            return JSON.stringify(answer);
          }
          
          // Handle string answers - check if it's a single letter (A, B, C, D)
          if (typeof answer === 'string' && answer.length === 1 && options) {
            try {
              const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
              const optionText = parsedOptions[answer];
              return optionText ? `${answer} (${optionText})` : answer;
            } catch (e) {
              return answer;
            }
          }
          
          return answer;
        };
        
        const options = studentAnswer ? studentAnswer.question_options : (question.options || null);
        const correctAnswer = studentAnswer ? studentAnswer.correct_answer : question.answer;
        const studentAnswerValue = studentAnswer ? studentAnswer.answer : null;
        
        return {
          question_id: question.id,
          question_text: studentAnswer ? studentAnswer.question_text : question.text,
          question_type: question.type,
          correct_answer: formatAnswer(correctAnswer, options),
          student_answer: formatAnswer(studentAnswerValue, options),
          is_correct: studentAnswer ? (
            typeof studentAnswer.answer === 'object' && typeof studentAnswer.correct_answer === 'object'
              ? JSON.stringify(studentAnswer.answer) === JSON.stringify(studentAnswer.correct_answer)
              : studentAnswer.answer === studentAnswer.correct_answer
          ) : null,
          answered_at: studentAnswer ? studentAnswer.submitted_at : null,
          options: options,
          raw_correct_answer: correctAnswer,
          raw_student_answer: studentAnswerValue
        };
      });

      setStudentAnswers(studentQuestionData);

    } catch (error) {
      console.error('Error fetching student details:', error);
      setError('Failed to load student data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  // Function to generate dummy AI feedback
  const generateAIFeedback = (isCorrect, studentAnswer, correctAnswer) => {
    if (isCorrect === null) return ''; // Not answered
    
    const feedbacks = {
      correct: [
        "Excellent! Your answer demonstrates a clear understanding of the concept.",
        "Great job! You've correctly identified the key points.",
        "Well done! Your reasoning is sound and accurate.",
        "Perfect! This shows strong comprehension of the material.",
        "Outstanding work! You've grasped the concept completely."
      ],
      incorrect: [
        "Consider reviewing the fundamental concepts related to this topic.",
        "Your answer shows partial understanding. Focus on the key principles.",
        "This is a common misconception. Review the material and try to identify the correct approach.",
        "Good attempt, but double-check your reasoning process.",
        "Close, but review the specific details that lead to the correct answer."
      ]
    };
    
    const feedbackArray = isCorrect ? feedbacks.correct : feedbacks.incorrect;
    return feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
  };

  // Function to download student report as CSV
  const downloadStudentReport = () => {
    if (!student || !studentAnswers.length) return;

    const csvHeaders = ['Question No.', 'Question', 'Correct Answer', 'Student Answer', 'Result', 'AI Feedback'];
    
    const csvData = studentAnswers.map((questionData, index) => [
      index + 1,
      `"${questionData.question_text}"`,
      `"${questionData.correct_answer || 'Not specified'}"`,
      `"${questionData.student_answer || 'Not Answered'}"`,
      questionData.student_answer !== null 
        ? (questionData.is_correct ? 'Correct' : 'Wrong')
        : 'Pending',
      `"${generateAIFeedback(questionData.is_correct, questionData.student_answer, questionData.correct_answer) || 'Analysis pending...'}"`
    ]);

    const csvContent = [
      csvHeaders.join(','),
      `Student ID: ${student.student_id}`,
      `Module: ${moduleData?.name || moduleName}`,
      `Overall Progress: ${student.progress}%`,
      `Average Score: ${student.avg_score}%`,
      `Questions Completed: ${student.completed_questions}/${student.total_questions}`,
      `Report Generated: ${new Date().toLocaleString()}`,
      '',
      csvHeaders.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student-${student.student_id}-${moduleData?.name || moduleName}-report.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download student report as JSON
  const downloadStudentReportJSON = () => {
    if (!student || !studentAnswers.length) return;

    const reportData = {
      student: {
        id: student.student_id,
        progress: student.progress,
        averageScore: student.avg_score,
        questionsCompleted: student.completed_questions,
        totalQuestions: student.total_questions,
        lastAccess: student.last_access
      },
      module: {
        name: moduleData?.name || moduleName,
        description: moduleData?.description
      },
      questions: studentAnswers.map((questionData, index) => ({
        questionNumber: index + 1,
        questionText: questionData.question_text,
        correctAnswer: questionData.correct_answer,
        studentAnswer: questionData.student_answer,
        isCorrect: questionData.is_correct,
        result: questionData.student_answer !== null 
          ? (questionData.is_correct ? 'Correct' : 'Wrong')
          : 'Pending',
        aiFeedback: generateAIFeedback(questionData.is_correct, questionData.student_answer, questionData.correct_answer),
        answeredAt: questionData.answered_at
      })),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `student-${student.student_id}-${moduleData?.name || moduleName}-report.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
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

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-xl font-semibold mb-2">Error</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={fetchStudentDetails}>Try Again</Button>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (loadingData) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading student data...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the information</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Breadcrumb Navigation */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                    <span>/</span>
                    <Link 
                      href={`/dashboard/students?module=${moduleName}`} 
                      className="hover:text-foreground"
                    >
                      Students
                    </Link>
                    <span>/</span>
                    <span className="text-foreground">{student?.name || studentId}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="mb-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Students
                  </Button>
                </div>

                {/* Student Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">{student?.name}</h1>
                        <p className="text-muted-foreground">Student ID: {student?.student_id}</p>
                        <p className="text-sm text-muted-foreground">Module: {moduleData?.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </Button>
                        
                        {showDownloadMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10">
                            <div className="py-2">
                              <button
                                onClick={() => {
                                  downloadStudentReport();
                                  setShowDownloadMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4 text-green-600" />
                                Download as CSV
                              </button>
                              <button
                                onClick={() => {
                                  downloadStudentReportJSON();
                                  setShowDownloadMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                              >
                                <FileJson className="w-4 h-4 text-blue-600" />
                                Download as JSON
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                            <p className="text-2xl font-bold">{student?.progress}%</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                            <p className="text-2xl font-bold">{student?.avg_score}%</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Award className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Questions Completed</p>
                            <p className="text-2xl font-bold">{student?.completed_questions}/{student?.total_questions}</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Last Access</p>
                            <p className="text-sm font-bold">
                              {student?.last_access ? new Date(student.last_access).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Performance Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Correct Answers</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{width: `${student?.total_questions > 0 ? (student.correct_answers / student.total_questions) * 100 : 0}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{student?.correct_answers || 0}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Incorrect Answers</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-red-600 h-2 rounded-full" 
                                  style={{width: `${student?.total_questions > 0 ? (student.incorrect_answers / student.total_questions) * 100 : 0}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{student?.incorrect_answers || 0}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Unanswered</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gray-400 h-2 rounded-full" 
                                  style={{width: `${student?.total_questions > 0 ? ((student.total_questions - student.completed_questions) / student.total_questions) * 100 : 0}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{(student?.total_questions || 0) - (student?.completed_questions || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5" />
                          Quick Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{student?.correct_answers || 0}</div>
                            <div className="text-sm text-muted-foreground">Correct</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{student?.incorrect_answers || 0}</div>
                            <div className="text-sm text-muted-foreground">Incorrect</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{student?.completed_questions || 0}</div>
                            <div className="text-sm text-muted-foreground">Answered</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">{(student?.total_questions || 0) - (student?.completed_questions || 0)}</div>
                            <div className="text-sm text-muted-foreground">Remaining</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Question Analysis Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <List className="w-6 h-6" />
                      Question Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {studentAnswers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No questions available for this module</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-separate border-spacing-0">
                          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                            <tr>
                              <th className="text-left p-5 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  SN
                                </div>
                              </th>
                              <th className="text-left p-5 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                  Question
                                </div>
                              </th>
                              <th className="text-left p-5 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  Correct Answer
                                </div>
                              </th>
                              <th className="text-left p-5 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  Student Answer
                                </div>
                              </th>
                              <th className="text-center p-5 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600">
                                <div className="flex items-center justify-center gap-2">
                                  <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  Result
                                </div>
                              </th>
                              <th className="text-left p-5 font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                                <div className="flex items-center gap-2">
                                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  AI Feedback
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentAnswers.map((questionData, index) => (
                              <tr key={questionData.question_id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                                <td className="p-5 border-r border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center justify-center">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                                      <span className="text-sm font-bold text-white">{index + 1}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-5 max-w-md border-r border-slate-100 dark:border-slate-700">
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">{questionData.question_text}</p>
                                    {questionData.answered_at && (
                                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3 h-3" />
                                        <span>Answered: {new Date(questionData.answered_at).toLocaleString()}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-5 border-r border-slate-100 dark:border-slate-700">
                                  <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-4 py-3 rounded-lg text-sm font-semibold border border-emerald-200 dark:border-emerald-700 shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                      {questionData.correct_answer || 'Not specified'}
                                    </div>
                                  </div>
                                </td>
                                <td className="p-5 border-r border-slate-100 dark:border-slate-700">
                                  {questionData.student_answer ? (
                                    <div className={`px-4 py-3 rounded-lg text-sm font-semibold border shadow-sm ${
                                      questionData.is_correct 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' 
                                        : 'bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                          questionData.is_correct ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}></div>
                                        {questionData.student_answer}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-600 shadow-sm">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        Not Answered
                                      </div>
                                    </div>
                                  )}
                                </td>
                                <td className="p-5 border-r border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center justify-center">
                                    {questionData.student_answer !== null ? (
                                      questionData.is_correct ? (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl shadow-sm">
                                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                          </div>
                                          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                                            Correct
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 rounded-xl shadow-sm">
                                          <div className="w-8 h-8 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center">
                                            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                          </div>
                                          <span className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                                            Wrong
                                          </span>
                                        </div>
                                      )
                                    ) : (
                                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm">
                                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                          <HelpCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                          Pending
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-5 max-w-sm">
                                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                                        <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1">
                                          <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                                          AI Analysis
                                        </div>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                          {generateAIFeedback(questionData.is_correct, questionData.student_answer, questionData.correct_answer) || 
                                           <span className="text-slate-600/70 dark:text-slate-400/70 italic">Analysis pending...</span>}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}