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
  Image,
  Sparkles,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { apiClient } from "@/lib/auth";

function QuestionsPageContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');
  
  const [questions, setQuestions] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleDocument, setModuleDocument] = useState(null);
  const [unreviewedCount, setUnreviewedCount] = useState(0);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    type: "mcq",
    text: "",
    slide_number: "",
    options: ["", "", "", ""],
    correct_answer: "",
    correct_option_id: "",
    learning_outcome: "",
    bloom_taxonomy: "",
    image_url: "",
    has_text_input: false
  });

  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      fetchModuleAndQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, moduleName]);

  const fetchModuleAndQuestions = async () => {
    try {
      // Get module info
      console.log('Fetching modules for teacher:', user.id);
      const moduleData = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      console.log('Module data received:', moduleData);
      const foundModule = moduleData.find(m => m.name === moduleName);
      console.log('Found module:', foundModule, 'for name:', moduleName);

      if (foundModule) {
        console.log('Setting current module:', foundModule);
        setCurrentModule(foundModule);
        
        // Get documents for this module to use as question container
        const documentsData = await apiClient.get(`/api/documents?teacher_id=${user.id}&module_id=${foundModule.id}`);
        
        // Use the first document as container, or create a placeholder if none exist
        if (documentsData && documentsData.length > 0) {
          setModuleDocument(documentsData[0]);
        } else {
          // Create a virtual document object for modules without documents
          console.log('No documents found, creating virtual document');
          setModuleDocument({
            id: `virtual-${foundModule.id}`,
            title: `${foundModule.name} - Questions`,
            module_id: foundModule.id
          });
        }

        // Fetch questions for this module (only active questions, not unreviewed)
        console.log('Fetching questions for module:', foundModule.id);
        const questionsData = await apiClient.get(`/api/questions/by-module?module_id=${foundModule.id}&status=active`);
        console.log('Questions data received:', questionsData);
        setQuestions(questionsData || []);

        // Fetch unreviewed questions count
        try {
          const unreviewedData = await apiClient.get(`/api/questions/by-module?module_id=${foundModule.id}&status=unreviewed`);
          setUnreviewedCount(unreviewedData?.length || 0);
        } catch (error) {
          console.error('Failed to fetch unreviewed count:', error);
          setUnreviewedCount(0);
        }
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
        return <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'short':
        return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'long':
        return <AlignLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getQuestionTypeBadge = (type) => {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-0";
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
      correct_option_id: "",
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
      // Use existing document_id if available, or null if creating standalone questions
      const documentId = (moduleDocument?.id && !moduleDocument.id.startsWith('virtual-'))
        ? moduleDocument.id
        : null;

      const payload = {
        ...questionForm,
        module_id: currentModule.id,  // ✅ Add module_id - REQUIRED!
        document_id: documentId,  // Can be null for manually created questions
        slide_number: questionForm.slide_number ? parseInt(questionForm.slide_number) : null,
        options: questionForm.type === "mcq" ?
          questionForm.options
            .filter(opt => opt.trim())
            .reduce((acc, opt, index) => ({
              ...acc,
              [String.fromCharCode(65 + index)]: opt
            }), {})
          : null,
        correct_option_id: questionForm.type === "mcq" ? questionForm.correct_option_id : null,
        correct_answer: questionForm.type !== "mcq" ? questionForm.correct_answer : null,
        status: 'active',  // Manually created questions are immediately active
        is_ai_generated: false  // Mark as manually created
      };

      console.log('📝 Creating question with payload:', payload);
      const response = await apiClient.post('/api/questions', payload);
      console.log('✅ Question created with ID:', response.id);

      // Upload image if one was selected
      if (selectedImageFile) {
        console.log('📷 Question created, now uploading image...');
        const imageUrl = await handleImageUpload(response.id);

        if (imageUrl) {
          console.log('✅ Image uploaded successfully:', imageUrl);
          response.image_url = imageUrl;
        } else {
          console.warn('⚠️ Image upload returned null');
        }
      } else {
        console.log('ℹ️ No image selected for this question');
      }

      setQuestions([...questions, response]);
      resetForm();
      clearImageSelection();
      setShowCreateForm(false);
      console.log('✅ Question creation complete!');
    } catch (error) {
      console.error('❌ Create error:', error);
      alert(`Failed to create question: ${error.message}\n\nPlease check the console for details.`);
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
          : null,
        correct_option_id: questionForm.type === "mcq" ? questionForm.correct_option_id : null,
        correct_answer: questionForm.type !== "mcq" ? questionForm.correct_answer : null
      };

      const response = await apiClient.put(`/api/questions/${selectedQuestion.id}`, payload);

      // Upload new image if one was selected
      if (selectedImageFile) {
        const imageUrl = await handleImageUpload(selectedQuestion.id);
        if (imageUrl) {
          response.image_url = imageUrl;
        }
      }

      setQuestions(questions.map(q => q.id === selectedQuestion.id ? response : q));
      setIsEditOpen(false);
      setSelectedQuestion(null);
      resetForm();
      clearImageSelection();
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

    // Get the correct option ID - could be in correct_option_id or correct_answer for MCQ
    let correctOptionId = "";
    if (question.type === "mcq") {
      correctOptionId = question.correct_option_id || question.correct_answer || "";
    }

    console.log("📝 Opening edit dialog for question:", question);
    console.log("Options:", optionsArray);
    console.log("Correct option ID:", correctOptionId);

    setQuestionForm({
      type: question.type,
      text: question.text,
      slide_number: question.slide_number?.toString() || "",
      options: optionsArray,
      correct_answer: question.type !== "mcq" ? (question.correct_answer || "") : "",
      correct_option_id: correctOptionId,
      learning_outcome: question.learning_outcome || "",
      bloom_taxonomy: question.bloom_taxonomy || "",
      image_url: question.image_url || "",
      has_text_input: question.has_text_input || false
    });

    // Set image preview if question has an image
    if (question.image_url) {
      setImagePreview(question.image_url);
    } else {
      setImagePreview(null);
    }
    setSelectedImageFile(null);

    setIsEditOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({...questionForm, options: newOptions});
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setSelectedImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (questionId) => {
    if (!selectedImageFile) {
      console.log('No image file selected');
      return null;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', selectedImageFile);

      console.log('==================== IMAGE UPLOAD START ====================');
      console.log('📤 Uploading image for question:', questionId);
      console.log('File name:', selectedImageFile.name);
      console.log('File type:', selectedImageFile.type);
      console.log('File size:', selectedImageFile.size, 'bytes');
      console.log('API endpoint:', `/api/questions/${questionId}/upload-image`);

      // Use native fetch instead of apiClient to properly handle multipart/form-data
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      const fetchResponse = await fetch(`${API_BASE_URL}/api/questions/${questionId}/upload-image`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          // Do NOT set Content-Type - browser sets it automatically with boundary for FormData
        },
        body: formData
      });

      if (!fetchResponse.ok) {
        const errorData = await fetchResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${fetchResponse.status}`);
      }

      const response = await fetchResponse.json();

      console.log('✅ Upload successful!');
      console.log('Response:', JSON.stringify(response, null, 2));

      // Response is the parsed JSON directly from fetch
      const imageUrl = response.image_url;

      if (!imageUrl) {
        console.error('❌ No image_url in response!');
        console.error('Full response object:', response);
        throw new Error('Server did not return image URL');
      }

      console.log('Image URL:', imageUrl);
      console.log('==================== IMAGE UPLOAD END ====================');

      return imageUrl;
    } catch (error) {
      console.error('==================== IMAGE UPLOAD ERROR ====================');
      console.error('❌ Image upload failed!');

      // Try to stringify the entire error object
      try {
        console.error('Error (stringified):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      } catch (e) {
        console.error('Error (could not stringify):', error);
      }

      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);

      console.error('==================== ERROR END ====================');

      const errorMsg = (typeof error.message === 'string' ? error.message : JSON.stringify(error.message))
        || 'Unknown error';

      alert(`Failed to upload image: ${errorMsg}\n\nCheck browser console for details.`);
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageRemove = async (questionId) => {
    if (!confirm('Remove image from this question?')) return;

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}/image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      // Update local state
      setQuestionForm({...questionForm, image_url: ""});
      setImagePreview(null);
      setSelectedImageFile(null);

      // Update questions list
      setQuestions(questions.map(q =>
        q.id === questionId ? {...q, image_url: null} : q
      ));

      alert('Image removed successfully');
    } catch (error) {
      console.error('Image remove error:', error);
      alert('Failed to remove image');
    }
  };

  const clearImageSelection = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
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
              </div>
            </div>

            {/* Unreviewed Questions Alert */}
            {unreviewedCount > 0 && (
              <Card className="mb-6 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                            {unreviewedCount} AI-Generated Question{unreviewedCount > 1 ? 's' : ''} Pending Review
                          </h3>
                          <Badge className="bg-purple-600 text-white">
                            {unreviewedCount}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Review and approve AI-generated questions before they become available to students
                        </p>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Link href={`/dashboard/questions/review?module_id=${currentModule?.id}&module_name=${encodeURIComponent(moduleName)}&status=unreviewed`}>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Review Questions
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sidebar - Create Question Form */}
              <div className="lg:col-span-4">
                <Card className={`sticky top-6 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col ${isEditOpen ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create New Question
                    </CardTitle>
                    <CardDescription>Add a new question to your module</CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-y-auto flex-1">
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
                          spellCheck={true}
                        />
                      </div>

                      {/* Image Upload Section */}
                      <div>
                        <Label>Question Image (Optional)</Label>
                        <div className="mt-2 space-y-3">
                          {imagePreview ? (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Question preview"
                                className="w-full max-h-64 object-contain rounded-lg border border-border"
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => document.getElementById('image-upload').click()}
                                >
                                  <Image className="w-4 h-4 mr-2" />
                                  Replace Image
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={clearImageSelection}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => document.getElementById('image-upload').click()}
                              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                            >
                              <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                              <p className="text-sm font-medium mb-1">Click to upload an image</p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, GIF or WebP (max 5MB)
                              </p>
                            </div>
                          )}
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </div>
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
                                  spellCheck={true}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="correct_answer">Correct Answer {questionForm.type === "mcq" && "*"}</Label>
                        {questionForm.type === "mcq" ? (
                          <Select
                            value={questionForm.correct_option_id}
                            onValueChange={(value) => setQuestionForm({...questionForm, correct_option_id: value})}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select the correct option" />
                            </SelectTrigger>
                            <SelectContent>
                              {questionForm.options
                                .filter(opt => opt.trim())
                                .map((option, index) => {
                                  const letter = String.fromCharCode(65 + index);
                                  return (
                                    <SelectItem key={letter} value={letter}>
                                      {letter} - {option}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="correct_answer"
                            value={questionForm.correct_answer}
                            onChange={(e) => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                            placeholder="Enter correct answer"
                            className="mt-1"
                            spellCheck={true}
                          />
                        )}
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
                        <Label htmlFor="bloom_taxonomy">Bloom&apos;s Taxonomy</Label>
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
                  {filteredQuestions.map((question, index) => (
                    <Card key={question.id} className="border-0 shadow-sm bg-white dark:bg-slate-900/50 hover:shadow-md transition-all duration-200">
                      <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          {getQuestionIcon(question.type)}
                        </div>
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
                          <p className="text-foreground font-medium mb-3 leading-relaxed whitespace-pre-wrap">
                            {question.text}
                          </p>
                          {question.image_url && (
                            <div className="mb-3">
                              <img
                                src={question.image_url}
                                alt="Question illustration"
                                className="max-h-48 rounded-lg border border-border object-contain"
                              />
                            </div>
                          )}
                          {question.type === "mcq" && question.options && typeof question.options === 'object' && (
                            <div className="space-y-2 text-sm">
                              {Object.entries(question.options).map(([key, option]) => {
                                const isCorrect = key === (question.correct_option_id || question.correct_answer);
                                return (
                                  <div
                                    key={key}
                                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                                      isCorrect
                                        ? 'bg-green-50 dark:bg-green-950/50 border-green-300 dark:border-green-700'
                                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isCorrect
                                        ? 'bg-green-600 dark:bg-green-500 text-white'
                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                    }`}>
                                      {key}
                                    </span>
                                    <span className={`flex-1 whitespace-pre-wrap ${isCorrect ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{option}</span>
                                    {isCorrect && (
                                      <div className="ml-auto flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-xs font-bold">Correct</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {question.type !== "mcq" && question.correct_answer && (
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/50 border border-green-300 dark:border-green-700 rounded-lg">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1.5">Correct Answer:</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{question.correct_answer}</p>
                                </div>
                              </div>
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
                    Search: &quot;{searchTerm}&quot;, Filter: {filterType}
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
          <DrawerContent className="max-h-[85vh] flex flex-col">
            <DrawerHeader className="border-b bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DrawerTitle className="text-lg">Edit Question</DrawerTitle>
                  <DrawerDescription className="text-sm">
                    Update question details for {moduleName}
                  </DrawerDescription>
                </div>
              </div>
            </DrawerHeader>

            <form onSubmit={handleEdit} className="flex flex-col flex-1 min-h-0">
              <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <BookOpen className="w-4 h-4" />
                    <span>Module: <strong>{moduleName}</strong></span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-type">Question Type *</Label>
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
                  <Label htmlFor="edit-text">Question Text *</Label>
                  <Textarea
                    id="edit-text"
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                    placeholder="Enter your question..."
                    required
                    rows={3}
                    className="mt-1"
                    spellCheck={true}
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <Label>Question Image (Optional)</Label>
                  <div className="mt-2 space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Question preview"
                          className="w-full max-h-64 object-contain rounded-lg border border-border"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById('edit-image-upload').click()}
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Replace Image
                          </Button>
                          {questionForm.image_url && !selectedImageFile ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleImageRemove(selectedQuestion.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete from Storage
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={clearImageSelection}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => document.getElementById('edit-image-upload').click()}
                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                      >
                        <Image className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Click to upload an image</p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, GIF or WebP (max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="edit-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
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
                            spellCheck={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="edit-correct_answer">Correct Answer {questionForm.type === "mcq" && "*"}</Label>
                  {questionForm.type === "mcq" ? (
                    <div className="mt-1">
                      <Select
                        value={questionForm.correct_option_id || ""}
                        onValueChange={(value) => {
                          console.log("✅ Selected correct option:", value);
                          setQuestionForm({...questionForm, correct_option_id: value});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select the correct option">
                            {questionForm.correct_option_id && (
                              <span>{questionForm.correct_option_id} - {questionForm.options[questionForm.correct_option_id.charCodeAt(0) - 65]}</span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {questionForm.options
                            .map((option, index) => {
                              const letter = String.fromCharCode(65 + index);
                              if (!option.trim()) return null;
                              return (
                                <SelectItem key={letter} value={letter}>
                                  {letter} - {option}
                                </SelectItem>
                              );
                            })
                            .filter(Boolean)}
                        </SelectContent>
                      </Select>
                      {questionForm.correct_option_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Selected: {questionForm.correct_option_id} - {questionForm.options[questionForm.correct_option_id.charCodeAt(0) - 65]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <Input
                      id="edit-correct_answer"
                      value={questionForm.correct_answer}
                      onChange={(e) => setQuestionForm({...questionForm, correct_answer: e.target.value})}
                      placeholder="Enter correct answer"
                      className="mt-1"
                      spellCheck={true}
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-slide_number">Slide Number</Label>
                  <Input
                    id="edit-slide_number"
                    type="number"
                    value={questionForm.slide_number}
                    onChange={(e) => setQuestionForm({...questionForm, slide_number: e.target.value})}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-bloom_taxonomy">Bloom&apos;s Taxonomy</Label>
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
              </div>

              <DrawerFooter className="border-t flex-shrink-0 bg-white dark:bg-gray-900">
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Update Question
                  </Button>
                </div>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
    </SidebarProvider>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <QuestionsPageContent />
    </Suspense>
  );
}