'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Play
} from "lucide-react";
import { apiClient } from "@/lib/auth";

export default function StudentModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params?.moduleId;
  
  const [moduleAccess, setModuleAccess] = useState(null);
  const [moduleData, setModuleData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setModuleData(moduleResponse.data || moduleResponse);
      setDocuments(documentsResponse.data || documentsResponse);
      
      const questionsData = questionsResponse.data || questionsResponse;
      setQuestions(questionsData);

      // Load progress using the working individual question approach but faster
      if (access.studentId && questionsData.length > 0) {
        const progressData = {};
        
        // Use Promise.all to load all answers in parallel (but still individual calls)
        const answerPromises = questionsData.map(async (question) => {
          try {
            const answerResponse = await apiClient.get(`/api/student/questions/${question.id}/my-answer?student_id=${access.studentId}&attempt=1`);
            const existingAnswer = answerResponse.data || answerResponse;
            if (existingAnswer && existingAnswer.answer) {
              // Handle different answer formats
              let answerValue;
              if (typeof existingAnswer.answer === 'object') {
                // JSONB format: {selected_option: "A", text_response: "..."}
                if (existingAnswer.answer.selected_option) {
                  answerValue = existingAnswer.answer.selected_option;
                } else if (existingAnswer.answer.text_response && existingAnswer.answer.text_response.trim()) {
                  answerValue = existingAnswer.answer.text_response.trim();
                }
              } else if (typeof existingAnswer.answer === 'string' && existingAnswer.answer.trim()) {
                // String format (legacy)
                answerValue = existingAnswer.answer.trim();
              }
              
              if (answerValue) {
                return {
                  questionId: question.id,
                  answer: answerValue,
                  submitted_at: existingAnswer.submitted_at
                };
              }
            }
          } catch (err) {
            // No answer for this question
          }
          return null;
        });

        const answerResults = await Promise.all(answerPromises);
        answerResults.forEach(result => {
          if (result) {
            progressData[result.questionId] = {
              status: 'completed',
              answer: result.answer,
              submitted_at: result.submitted_at
            };
          }
        });
        
        setUserProgress(progressData);
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

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading module content...</p>
        </div>
      </div>
    );
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {moduleAccess?.moduleName || 'Module'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {moduleAccess?.teacherName || 'Instructor'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Accessed {new Date(moduleAccess?.accessTime || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Active Student
              </Badge>
              <Button 
                variant="outline" 
                onClick={() => {
                  sessionStorage.removeItem('student_module_access');
                  router.push('/join');
                }}
              >
                Exit Module
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Test
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Materials
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Test Tab */}
          <TabsContent value="assignments" className="space-y-6">
            {questions.length > 0 ? (
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
                        {Object.values(userProgress).filter(p => p.status === 'completed').length} / {questions.length} completed
                      </Badge>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{
                            width: `${questions.length ? (Object.values(userProgress).filter(p => p.status === 'completed').length / questions.length) * 100 : 0}%`
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
                        {Object.values(userProgress).filter(p => p.status === 'completed').length === questions.length 
                          ? "Test completed! You can review your answers."
                          : Object.values(userProgress).some(p => p.status === 'in_progress') 
                          ? "Test in progress. Continue where you left off."
                          : "Ready to start the test."
                        }
                      </div>
                      <Button 
                        onClick={() => handleStartTest()}
                        className="bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {Object.values(userProgress).filter(p => p.status === 'completed').length === questions.length 
                          ? 'Review Test'
                          : Object.values(userProgress).some(p => p.status === 'in_progress')
                          ? 'Continue Test'
                          : 'Start Test'
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Test Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your instructor hasn't posted the test yet. Check back later!
                  </p>
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
                    <Button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
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
                    Your instructor hasn't uploaded any course materials yet.
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
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Assignments Completed</span>
                        <span>
                          {Object.values(userProgress).filter(p => p.status === 'completed').length} / {questions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{
                            width: `${questions.length ? (Object.values(userProgress).filter(p => p.status === 'completed').length / questions.length) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(userProgress).slice(0, 5).map(([questionId, progress]) => {
                      const question = questions.find(q => q.id === questionId);
                      if (!question) return null;
                      
                      return (
                        <div key={questionId} className="flex items-center gap-3 text-sm">
                          {progress.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="flex-1">{question.text.substring(0, 50)}...</span>
                          {progress.score && (
                            <Badge variant={progress.score >= 70 ? 'default' : 'destructive'}>
                              {progress.score}%
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}