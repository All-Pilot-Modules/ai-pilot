'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  HelpCircle,
  Plus,
  Search,
  Edit3,
  Trash2,
  BookOpen,
  CheckCircle,
  FileText,
  MessageCircle,
  AlignLeft,
  Target,
  Brain,
  Image
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";

export default function QuestionsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');
  
  const [questions, setQuestions] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleDocument, setModuleDocument] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [questionForm, setQuestionForm] = useState({
    type: "mcq",
    text: "",
    slide_number: "",
    options: ["", "", "", ""],
    correct_answer: "",
    learning_outcome: "",
    bloom_taxonomy: "",
    image_url: "",
    has_text_input: false
  });

  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      fetchModuleAndQuestions();
    }
  }, [isAuthenticated, user, moduleName]);

  const fetchModuleAndQuestions = async () => {
    try {
      // Get module info
      console.log('Fetching modules for teacher:', user.id);
      const moduleData = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      console.log('Module data received:', moduleData);
      const module = moduleData.find(m => m.name === moduleName);
      console.log('Found module:', module, 'for name:', moduleName);
      
      if (module) {
        console.log('Setting current module:', module);
        setCurrentModule(module);
        
        // Get documents for this module to use as question container
        const documentsData = await apiClient.get(`/api/documents?teacher_id=${user.id}&module_id=${module.id}`);
        
        // Use the first document as container, or create a placeholder if none exist
        if (documentsData && documentsData.length > 0) {
          setModuleDocument(documentsData[0]);
        } else {
          // Create a virtual document object for modules without documents
          console.log('No documents found, creating virtual document');
          setModuleDocument({
            id: `virtual-${module.id}`,
            title: `${module.name} - Questions`,
            module_id: module.id
          });
        }
        
        // Fetch questions for this module
        console.log('Fetching questions for module:', module.id);
        const questionsData = await apiClient.get(`/api/questions/by-module?module_id=${module.id}`);
        console.log('Questions data received:', questionsData);
        setQuestions(questionsData || []);
      } else {
        console.log('Module not found for name:', moduleName, 'in modules:', moduleData);
      }
    } catch (error) {
      console.error('Failed to fetch module or questions:', error);
      console.error('Error details:', error.response?.data || error.message);
      setQuestions([]);
    }
  };

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'mcq':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'short':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'long':
        return <AlignLeft className="w-5 h-5 text-purple-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getQuestionTypeBadge = (type) => {
    const colors = {
      mcq: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300",
      short: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300",
      long: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-300"
    };
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || question.type === filterType;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setQuestionForm({
      type: "mcq",
      text: "",
      slide_number: "",
      options: ["", "", "", ""],
      correct_answer: "",
      learning_outcome: "",
      bloom_taxonomy: "",
      image_url: "",
      has_text_input: false
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!questionForm.text || !currentModule) return;

    try {
      // If no real document exists, we need to create one first
      let documentId = moduleDocument?.id;
      
      if (!documentId || documentId.startsWith('virtual-')) {
        // Create a real document for this module
        const createDocData = {
          title: `${currentModule.name} - Question Bank`,
          file_name: 'questions.txt',
          file_hash: `questions-${currentModule.id}`,
          file_type: 'txt',
          teacher_id: user.id,
          module_id: currentModule.id,
          storage_path: `/uploads/${currentModule.id}/questions.txt`,
          index_path: null,
          slide_count: null
        };
        
        const newDoc = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createDocData),
        });
        
        if (newDoc.ok) {
          const docData = await newDoc.json();
          documentId = docData.id;
          setModuleDocument(docData);
        } else {
          console.error('Failed to create document');
          return;
        }
      }

      const payload = {
        ...questionForm,
        document_id: documentId,
        slide_number: questionForm.slide_number ? parseInt(questionForm.slide_number) : null,
        options: questionForm.type === "mcq" ? 
          questionForm.options
            .filter(opt => opt.trim())
            .reduce((acc, opt, index) => ({
              ...acc,
              [String.fromCharCode(65 + index)]: opt
            }), {}) 
          : null
      };

      const response = await apiClient.post('/api/questions', payload);
      setQuestions([response, ...questions]);
      resetForm();
      setShowCreateForm(false);
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedQuestion || !questionForm.text) return;

    try {
      const payload = {
        ...questionForm,
        document_id: selectedQuestion.document_id, // Keep the original document_id
        slide_number: questionForm.slide_number ? parseInt(questionForm.slide_number) : null,
        options: questionForm.type === "mcq" ? 
          questionForm.options
            .filter(opt => opt.trim())
            .reduce((acc, opt, index) => ({
              ...acc,
              [String.fromCharCode(65 + index)]: opt
            }), {}) 
          : null
      };

      const response = await apiClient.put(`/api/questions/${selectedQuestion.id}`, payload);
      setQuestions(questions.map(q => q.id === selectedQuestion.id ? response : q));
      setIsEditOpen(false);
      setSelectedQuestion(null);
      resetForm();
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/questions/${id}`);
      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openEditDialog = (question) => {
    setSelectedQuestion(question);
    
    // Convert options from dict to array for form handling
    let optionsArray = ["", "", "", ""];
    if (question.options && typeof question.options === 'object') {
      optionsArray = Object.values(question.options);
      // Ensure we have 4 slots
      while (optionsArray.length < 4) optionsArray.push("");
    }
    
    setQuestionForm({
      type: question.type,
      text: question.text,
      slide_number: question.slide_number?.toString() || "",
      options: optionsArray,
      correct_answer: question.correct_answer || "",
      learning_outcome: question.learning_outcome || "",
      bloom_taxonomy: question.bloom_taxonomy || "",
      image_url: question.image_url || "",
      has_text_input: question.has_text_input || false
    });
    setIsEditOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({...questionForm, options: newOptions});
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

  if (!moduleName) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl mb-4">No Module Selected</h1>
        <Button asChild>
          <Link href="/mymodules">Go to My Modules</Link>
        </Button>
      </div>
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
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-2">Questions - {moduleName}</h1>
                  <p className="text-muted-foreground">
                    Create and manage questions for your module assessments
                  </p>
                </div>
                <Button onClick={() => setIsCreateMode(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar - Create Question Form */}
              <div className="lg:col-span-4">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create New Question
                    </CardTitle>
                    <CardDescription>Add a new question to your module</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                          <BookOpen className="w-4 h-4" />
                          <span>Module: <strong>{moduleName}</strong></span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="type">Question Type *</Label>
                        <Select value={questionForm.type} onValueChange={(value) => setQuestionForm({...questionForm, type: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice</SelectItem>
                            <SelectItem value="short">Short Answer</SelectItem>
                            <SelectItem value="long">Long Answer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="text">Question Text *</Label>
                        <Textarea
                          id="text"
                          value={questionForm.text}
                          onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                          placeholder="Enter your question..."
                          required
                          rows={3}
                          className="mt-1"
                        />
                      </div>

                      {questionForm.type === "mcq" && (
                        <div>
                          <Label>Answer Options *</Label>
                          <div className="space-y-2 mt-2">
                            {questionForm.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <Input
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="correct_answer">Correct Answer</Label>
                        <Input
                          id="correct_answer"
                          value={questionForm.correct_answer}
                          onChange={(e) => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                          placeholder="Enter correct answer"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="slide_number">Slide Number</Label>
                        <Input
                          id="slide_number"
                          type="number"
                          value={questionForm.slide_number}
                          onChange={(e) => setQuestionForm({...questionForm, slide_number: e.target.value})}
                          placeholder="Optional"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bloom_taxonomy">Bloom's Taxonomy</Label>
                        <Select value={questionForm.bloom_taxonomy} onValueChange={(value) => setQuestionForm({...questionForm, bloom_taxonomy: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remember">Remember</SelectItem>
                            <SelectItem value="understand">Understand</SelectItem>
                            <SelectItem value="apply">Apply</SelectItem>
                            <SelectItem value="analyze">Analyze</SelectItem>
                            <SelectItem value="evaluate">Evaluate</SelectItem>
                            <SelectItem value="create">Create</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Question
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={resetForm}
                        >
                          Clear Form
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Content - Questions List */}
              <div className="lg:col-span-8">
                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="short">Short Answer</SelectItem>
                      <SelectItem value="long">Long Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Questions List */}
                <div className="space-y-4">
                  {filteredQuestions.map((question) => (
                    <Card key={question.id} className="border-0 shadow-sm bg-white dark:bg-slate-900/50 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {getQuestionIcon(question.type)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getQuestionTypeBadge(question.type)}`}>
                              {question.type.toUpperCase()}
                            </Badge>
                            {question.slide_number && (
                              <Badge variant="outline" className="text-xs">
                                Slide {question.slide_number}
                              </Badge>
                            )}
                            {question.bloom_taxonomy && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="w-3 h-3 mr-1" />
                                {question.bloom_taxonomy}
                              </Badge>
                            )}
                          </div>
                          <p className="text-foreground font-medium mb-2 leading-relaxed">
                            {question.text}
                          </p>
                          {question.type === "mcq" && question.options && typeof question.options === 'object' && (
                            <div className="space-y-1 text-sm text-muted-foreground">
                              {Object.entries(question.options).map(([key, option]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                                    {key}
                                  </span>
                                  <span>{option}</span>
                                  {key === question.correct_answer && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {question.learning_outcome && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Target className="w-3 h-3" />
                              <span>{question.learning_outcome}</span>
                            </div>
                          )}
                          {question.image_url && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Image className="w-3 h-3" />
                              <span>Has image attachment</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(question)}
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDelete(question.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  ))}
                </div>

                {filteredQuestions.length === 0 && (
              <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/5">
                <CardContent className="py-16 text-center">
                  <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No questions found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || filterType !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Use the form on the left to create your first question"
                    }
                  </p>
                  <div className="text-xs text-muted-foreground/70 mb-4 p-2 bg-muted/30 rounded">
                    Debug: Total questions: {questions.length}, Filtered: {filteredQuestions.length}<br/>
                    Module: {currentModule?.name} (ID: {currentModule?.id})<br/>
                    Search: "{searchTerm}", Filter: {filterType}
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </div>
        </div>
      </SidebarInset>
      
      {/* Edit Drawer */}
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DrawerContent className="max-h-[90vh] overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Edit Question</DrawerTitle>
              <DrawerDescription>
                Update question information
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 space-y-4 pb-4">
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <BookOpen className="w-4 h-4" />
                    <span>Editing question for module: <strong>{moduleName}</strong></span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-type">Question Type</Label>
                  <Select value={questionForm.type} onValueChange={(value) => setQuestionForm({...questionForm, type: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="short">Short Answer</SelectItem>
                      <SelectItem value="long">Long Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-text">Question Text</Label>
                  <Textarea
                    id="edit-text"
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                    placeholder="Enter your question..."
                    required
                    rows={3}
                  />
                </div>

                {questionForm.type === "mcq" && (
                  <div>
                    <Label>Answer Options</Label>
                    <div className="space-y-2">
                      {questionForm.options.map((option, index) => (
                        <Input
                          key={index}
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-slide_number">Slide Number</Label>
                    <Input
                      id="edit-slide_number"
                      type="number"
                      value={questionForm.slide_number}
                      onChange={(e) => setQuestionForm({...questionForm, slide_number: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-correct_answer">Correct Answer</Label>
                    <Input
                      id="edit-correct_answer"
                      value={questionForm.correct_answer}
                      onChange={(e) => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                      placeholder="Enter correct answer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-learning_outcome">Learning Outcome</Label>
                    <Input
                      id="edit-learning_outcome"
                      value={questionForm.learning_outcome}
                      onChange={(e) => setQuestionForm({...questionForm, learning_outcome: e.target.value})}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-bloom_taxonomy">Bloom's Taxonomy</Label>
                    <Select value={questionForm.bloom_taxonomy} onValueChange={(value) => setQuestionForm({...questionForm, bloom_taxonomy: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remember">Remember</SelectItem>
                        <SelectItem value="understand">Understand</SelectItem>
                        <SelectItem value="apply">Apply</SelectItem>
                        <SelectItem value="analyze">Analyze</SelectItem>
                        <SelectItem value="evaluate">Evaluate</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-image_url">Image URL</Label>
                  <Input
                    id="edit-image_url"
                    value={questionForm.image_url}
                    onChange={(e) => setQuestionForm({...questionForm, image_url: e.target.value})}
                    placeholder="Optional image URL"
                  />
                </div>
              </form>
            </div>
            <DrawerFooter>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleEdit}>
                  Update Question
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
    </SidebarProvider>
  );
}