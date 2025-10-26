'use client';

import { Suspense, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { Upload, FolderOpen, File, FileText, FileVideo, Image as ImageIcon, Archive, Calendar, Edit3, Trash2, Download, Search, BookOpen, FileCheck, Clock, HardDrive, TrendingUp, Eye, Share2, ChevronRight, Plus, X, CheckCircle2, Loader2, AlertCircle, Database, Sparkles } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/auth";
import { SkeletonDocumentCard } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

function DocumentsContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get("module");

  const [documents, setDocuments] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadForm, setUploadForm] = useState({ title: "", file: null });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedDocForGeneration, setSelectedDocForGeneration] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationForm, setGenerationForm] = useState({ num_short: 0, num_long: 0, num_mcq: 0 });

  const fetchModuleAndDocuments = useCallback(async () => {
    try {
      setIsLoadingDocuments(true);
      const moduleData = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      // eslint-disable-next-line @next/next/no-assign-module-variable
      const module = moduleData.find(m => m.name === moduleName);

      if (module) {
        setCurrentModule(module);
        const documentsData = await apiClient.get(`/api/documents?teacher_id=${user.id}&module_id=${module.id}`);
        setDocuments(documentsData);
      }
    } catch (error) {
      console.error("Failed to fetch module or documents:", error);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, [user, moduleName]);

  // Load module and documents
  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      fetchModuleAndDocuments();
    }
  }, [isAuthenticated, user, moduleName, fetchModuleAndDocuments]);

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "docx":
      case "doc": return <File className="w-5 h-5 text-blue-500" />;
      case "pptx":
      case "ppt": return <FileVideo className="w-5 h-5 text-orange-500" />;
      case "jpg":
      case "jpeg":
      case "png": return <ImageIcon className="w-5 h-5 text-green-500" />;
      case "zip":
      case "rar": return <Archive className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (processingStatus) => {
    // Handle different status values that might come from the API
    // Backend uses 'processing_status' field
    const normalizedStatus = processingStatus?.toLowerCase() || 'uploaded';

    switch (normalizedStatus) {
      case 'embedded':
      case 'indexed':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Embedded
          </Badge>
        );
      case 'chunked':
      case 'extracted':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            <Database className="w-3 h-3 mr-1" />
            Processed
          </Badge>
        );
      case 'extracting':
      case 'chunking':
      case 'embedding':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'uploaded':
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800">
            <Upload className="w-3 h-3 mr-1" />
            Uploaded
          </Badge>
        );
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") {
      return matchesSearch;
    }

    const docStatus = doc.processing_status?.toLowerCase() || 'uploaded';

    if (statusFilter === "embedded") {
      return matchesSearch && (docStatus === 'embedded' || docStatus === 'indexed');
    } else if (statusFilter === "processed") {
      return matchesSearch && (docStatus === 'chunked' || docStatus === 'extracted');
    } else if (statusFilter === "processing") {
      return matchesSearch && (docStatus === 'extracting' || docStatus === 'chunking' || docStatus === 'embedding');
    } else if (statusFilter === "failed") {
      return matchesSearch && docStatus === 'failed';
    } else if (statusFilter === "uploaded") {
      return matchesSearch && docStatus === 'uploaded';
    }

    return matchesSearch;
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !currentModule) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("module_name", currentModule.name);
      formData.append("teacher_id", user.id);
      formData.append("title", uploadForm.title || uploadForm.file.name);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setUploadForm({ title: "", file: null });
        setIsUploadOpen(false);
      } else {
        console.error("Upload failed:", response.statusText);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedDocument) return;

    try {
      const updatedDoc = await apiClient.put(`/api/documents/${selectedDocument.id}`, {
        title: uploadForm.title,
      });
      setDocuments(docs => docs.map(d => d.id === selectedDocument.id ? updatedDoc : d));
      setIsEditOpen(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error("Edit error:", error);
      alert("Failed to update document. Please try again.");
    }
  };

  const handleDelete = (doc) => {
    // Check if it's a testbank - if so, show custom dialog
    if (doc.is_testbank) {
      setDocumentToDelete(doc);
      setDeleteDialogOpen(true);
    } else {
      // For regular documents, use simple confirmation
      if (!confirm("Are you sure you want to delete this document?")) return;
      executeDelete(doc.id, false);
    }
  };

  const executeDelete = async (id, deleteQuestions) => {
    try {
      setIsDeleting(id);
      setDeleteDialogOpen(false);

      // Add query parameter if deleteQuestions is true
      const url = deleteQuestions
        ? `/api/documents/${id}?delete_questions=true`
        : `/api/documents/${id}`;

      await apiClient.delete(url);
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(null);
      setDocumentToDelete(null);
    }
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    if (!selectedDocForGeneration) return;

    const total = generationForm.num_short + generationForm.num_long + generationForm.num_mcq;
    if (total === 0) {
      alert("Please specify at least one question to generate");
      return;
    }
    if (total > 100) {
      alert("Cannot generate more than 100 questions at once");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await apiClient.post(
        `/api/documents/${selectedDocForGeneration.id}/generate-questions`,
        generationForm
      );

      // Close modal
      setIsGenerateOpen(false);
      setSelectedDocForGeneration(null);
      setGenerationForm({ num_short: 0, num_long: 0, num_mcq: 0 });

      // Show success message
      alert(`Successfully generated ${response.generated_count} questions! Redirecting to review page...`);

      // Redirect to review page
      window.location.href = response.review_url;
    } catch (error) {
      console.error("Generate error:", error);
      alert(error.response?.data?.detail || "Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!isAuthenticated)
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl mb-4">Access Denied</h1>
        <Button asChild><Link href="/sign-in">Sign In</Link></Button>
      </div>
    );

  if (!moduleName)
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl mb-4">No Module Selected</h1>
        <Button asChild><Link href="/mymodules">Go to My Modules</Link></Button>
      </div>
    );

  // Calculate document statistics
  const totalSize = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  // Calculate status statistics
  const getStatusStats = () => {
    const stats = {
      embedded: 0,
      processed: 0,
      processing: 0,
      failed: 0,
      uploaded: 0
    };

    documents.forEach(doc => {
      const status = doc.processing_status?.toLowerCase() || 'uploaded';
      if (status === 'embedded' || status === 'indexed') {
        stats.embedded++;
      } else if (status === 'chunked' || status === 'extracted') {
        stats.processed++;
      } else if (status === 'extracting' || status === 'chunking' || status === 'embedding') {
        stats.processing++;
      } else if (status === 'failed') {
        stats.failed++;
      } else {
        stats.uploaded++;
      }
    });

    return stats;
  };

  const statusStats = getStatusStats();

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Enhanced Header */}
            <div className="mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold text-foreground">Document Library</h1>
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {currentModule?.name || moduleName}
                        </div>
                      </div>
                      <p className="text-muted-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Manage and organize your course materials and resources
                      </p>
                    </div>
                  </div>
                  <Drawer open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DrawerTrigger asChild>
                      <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-5 h-5 mr-2" />
                        Upload Document
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-w-2xl mx-auto">
                      <DrawerHeader className="border-b">
                        <DrawerTitle className="text-2xl flex items-center gap-2">
                          <Upload className="w-6 h-6 text-primary" />
                          Upload New Document
                        </DrawerTitle>
                        <DrawerDescription className="text-base">
                          Add course materials, slides, or resources for students
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-6">
                        <form onSubmit={handleUpload} className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="file" className="text-base font-semibold">
                              Select File
                            </Label>
                            <div className="relative">
                              <Input
                                id="file"
                                type="file"
                                onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                                required
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                              />
                            </div>
                            {uploadForm.file && (
                              <div className="mt-2 p-3 bg-muted rounded-lg flex items-center gap-2 text-sm">
                                <FileCheck className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{uploadForm.file.name}</span>
                                <span className="text-muted-foreground ml-auto">
                                  {formatFileSize(uploadForm.file.size)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-base font-semibold">
                              Document Title
                            </Label>
                            <Input
                              id="title"
                              value={uploadForm.title}
                              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                              placeholder="Enter a descriptive title (optional)"
                              className="text-base"
                            />
                            <p className="text-sm text-muted-foreground">
                              Leave empty to use the filename
                            </p>
                          </div>
                        </form>
                      </div>
                      <DrawerFooter className="border-t flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsUploadOpen(false);
                            setUploadForm({ title: "", file: null });
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || !uploadForm.file}
                          className="flex-1"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Document
                            </>
                          )}
                        </Button>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-blue-200/50 dark:bg-blue-800/50 rounded-full">
                      <TrendingUp className="w-3 h-3 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Documents</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                      {isLoadingDocuments ? '...' : documents.length}
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">Uploaded files</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <HardDrive className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-purple-200/50 dark:bg-purple-800/50 rounded-full">
                      <FileCheck className="w-3 h-3 text-purple-700 dark:text-purple-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Total Size</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {isLoadingDocuments ? '...' : formatFileSize(totalSize)}
                    </p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">Storage used</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-green-200/50 dark:bg-green-800/50 rounded-full">
                      <TrendingUp className="w-3 h-3 text-green-700 dark:text-green-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">PDF Documents</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {isLoadingDocuments ? '...' : documents.filter(d => d.file_type?.toLowerCase() === 'pdf').length}
                    </p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">PDF files</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="px-2 py-1 bg-emerald-200/50 dark:bg-emerald-800/50 rounded-full">
                      <Database className="w-3 h-3 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Embedded</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
                      {isLoadingDocuments ? '...' : statusStats.embedded}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600/70 dark:text-emerald-400/70">
                      <span>Processed: {statusStats.processed}</span>
                      {statusStats.processing > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Loader2 className="w-2 h-2 animate-spin" />
                            Processing: {statusStats.processing}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar and Filters */}
            <Card className="mb-8 border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search documents by title or filename..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-12 text-base"
                  />
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="h-8"
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === "embedded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("embedded")}
                    className="h-8"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Embedded
                  </Button>
                  <Button
                    variant={statusFilter === "processed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("processed")}
                    className="h-8"
                  >
                    <Database className="w-3 h-3 mr-1" />
                    Processed
                  </Button>
                  <Button
                    variant={statusFilter === "processing" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("processing")}
                    className="h-8"
                  >
                    <Loader2 className="w-3 h-3 mr-1" />
                    Processing
                  </Button>
                  <Button
                    variant={statusFilter === "uploaded" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("uploaded")}
                    className="h-8"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Uploaded
                  </Button>
                  {statusStats.failed > 0 && (
                    <Button
                      variant={statusFilter === "failed" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("failed")}
                      className="h-8"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents Grid/List */}
            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-border bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="animate-pulse flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-xl"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-muted rounded w-1/3"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocuments.map((doc) => {
                  const fileType = doc.file_type?.toLowerCase();
                  const getFileTypeColor = (type) => {
                    switch (type) {
                      case 'pdf': return 'from-red-500 to-red-600';
                      case 'docx':
                      case 'doc': return 'from-blue-500 to-blue-600';
                      case 'pptx':
                      case 'ppt': return 'from-orange-500 to-orange-600';
                      case 'jpg':
                      case 'jpeg':
                      case 'png': return 'from-green-500 to-green-600';
                      default: return 'from-gray-500 to-gray-600';
                    }
                  };

                  return (
                    <Card key={doc.id} className="border-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`w-16 h-16 bg-gradient-to-br ${getFileTypeColor(fileType)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                              {getFileIcon(doc.file_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                                  {doc.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <File className="w-3 h-3" />
                                  {doc.file_name}
                                </span>
                                {doc.file_size && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <HardDrive className="w-3 h-3" />
                                      {formatFileSize(doc.file_size)}
                                    </span>
                                  </>
                                )}
                                {doc.created_at && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(doc.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs font-medium uppercase">
                                  {doc.file_type || 'FILE'}
                                </Badge>
                                {getStatusBadge(doc.processing_status)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Show AI Generate button only for RAG-indexed documents */}
                            {(doc.processing_status === 'embedded' || doc.processing_status === 'indexed') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedDocForGeneration(doc);
                                  setGenerationForm({ num_short: 0, num_long: 0, num_mcq: 0 });
                                  setIsGenerateOpen(true);
                                }}
                                className="hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400"
                              >
                                <Sparkles className="h-4 w-4 mr-1" />
                                AI Generate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                                window.open(`${API_BASE_URL}/api/documents/${doc.id}/download`, '_blank');
                              }}
                              className="hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setUploadForm({ title: doc.title, file: null });
                                setIsEditOpen(true);
                              }}
                              className="hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400"
                            >
                              <Edit3 className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(doc)}
                              disabled={isDeleting === doc.id}
                              className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                            >
                              {isDeleting === doc.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                                  Deleting
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed border-2 text-center py-16 bg-card/30">
                <CardContent>
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm ? `No documents match "${searchTerm}"` : 'Upload your first document to get started'}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsUploadOpen(true)} size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Upload Your First Document
                    </Button>
                  )}
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Edit Document Drawer */}
            <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DrawerContent className="max-w-2xl mx-auto">
                <DrawerHeader className="border-b">
                  <DrawerTitle className="text-2xl flex items-center gap-2">
                    <Edit3 className="w-6 h-6 text-primary" />
                    Edit Document
                  </DrawerTitle>
                  <DrawerDescription className="text-base">
                    Update document information
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-6">
                  <form onSubmit={handleEdit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title" className="text-base font-semibold">
                        Document Title
                      </Label>
                      <Input
                        id="edit-title"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="Enter document title"
                        className="text-base"
                        required
                      />
                    </div>
                    {selectedDocument && (
                      <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Filename:</span>
                          <span className="font-medium">{selectedDocument.file_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="secondary">{selectedDocument.file_type}</Badge>
                        </div>
                        {selectedDocument.file_size && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Size:</span>
                            <span className="font-medium">{formatFileSize(selectedDocument.file_size)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </div>
                <DrawerFooter className="border-t flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedDocument(null);
                      setUploadForm({ title: "", file: null });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleEdit} className="flex-1">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* AI Question Generation Drawer */}
            <Drawer open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
              <DrawerContent className="max-w-2xl mx-auto">
                <DrawerHeader className="border-b">
                  <DrawerTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    AI Question Generation
                  </DrawerTitle>
                  <DrawerDescription className="text-base">
                    Generate questions from: <strong>{selectedDocForGeneration?.title}</strong>
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-6">
                  <form onSubmit={handleGenerateQuestions} className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                          <div className="text-sm text-purple-700 dark:text-purple-300">
                            <p className="font-semibold mb-1">How it works:</p>
                            <ul className="list-disc list-inside space-y-1 text-purple-600 dark:text-purple-400">
                              <li>AI analyzes your document content</li>
                              <li>Questions are generated and saved as &quot;unreviewed&quot;</li>
                              <li>You review and approve before students see them</li>
                              <li>Maximum 100 total questions per generation</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num-short" className="text-base font-semibold">
                          Short Answer Questions (1-2 sentences)
                        </Label>
                        <Input
                          id="num-short"
                          type="number"
                          min="0"
                          max="50"
                          value={generationForm.num_short}
                          onChange={(e) => setGenerationForm({ ...generationForm, num_short: parseInt(e.target.value) || 0 })}
                          className="text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          0-50 questions
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num-long" className="text-base font-semibold">
                          Long Answer Questions (1-2 paragraphs)
                        </Label>
                        <Input
                          id="num-long"
                          type="number"
                          min="0"
                          max="50"
                          value={generationForm.num_long}
                          onChange={(e) => setGenerationForm({ ...generationForm, num_long: parseInt(e.target.value) || 0 })}
                          className="text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          0-50 questions
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="num-mcq" className="text-base font-semibold">
                          Multiple Choice Questions (4 options)
                        </Label>
                        <Input
                          id="num-mcq"
                          type="number"
                          min="0"
                          max="50"
                          value={generationForm.num_mcq}
                          onChange={(e) => setGenerationForm({ ...generationForm, num_mcq: parseInt(e.target.value) || 0 })}
                          className="text-base"
                        />
                        <p className="text-sm text-muted-foreground">
                          0-50 questions
                        </p>
                      </div>

                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">
                          Total questions: <span className="text-lg font-bold text-primary">
                            {generationForm.num_short + generationForm.num_long + generationForm.num_mcq}
                          </span>
                          <span className="text-muted-foreground ml-2">/ 100 max</span>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
                <DrawerFooter className="border-t flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsGenerateOpen(false);
                      setSelectedDocForGeneration(null);
                      setGenerationForm({ num_short: 0, num_long: 0, num_mcq: 0 });
                    }}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating || (generationForm.num_short + generationForm.num_long + generationForm.num_mcq === 0)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Questions
                      </>
                    )}
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Delete Testbank Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Testbank</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>
                      You are about to delete the testbank: <strong>{documentToDelete?.title || documentToDelete?.file_name}</strong>
                    </p>
                    <p className="text-sm">
                      Would you like to also delete all the questions generated from this testbank?
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setDocumentToDelete(null);
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    variant="outline"
                    onClick={() => executeDelete(documentToDelete?.id, false)}
                    className="sm:flex-1"
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Keep Questions
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => executeDelete(documentToDelete?.id, true)}
                    className="sm:flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}