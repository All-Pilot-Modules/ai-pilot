'use client';

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Upload,
  FileText,
  Download,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Filter,
  FolderOpen,
  BookOpen,
  Calendar,
  User,
  File,
  Image,
  FileVideo,
  Archive
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";

export default function DocumentsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const moduleName = searchParams.get('module');
  
  const [documents, setDocuments] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [uploadForm, setUploadForm] = useState({
    title: "",
    file: null
  });

  // Load module and documents
  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      fetchModuleAndDocuments();
    }
  }, [isAuthenticated, user, moduleName]);

  const fetchModuleAndDocuments = async () => {
    try {
      // First get the module info to get module_id
      const moduleData = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      const module = moduleData.find(m => m.name === moduleName);
      
      if (module) {
        setCurrentModule(module);
        // Then fetch documents for this module
        const documentsData = await apiClient.get(`/api/documents?teacher_id=${user.id}&module_id=${module.id}`);
        setDocuments(documentsData);
      }
    } catch (error) {
      console.error('Failed to fetch module or documents:', error);
    }
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <File className="w-5 h-5 text-blue-500" />;
      case 'pptx':
      case 'ppt':
        return <FileVideo className="w-5 h-5 text-orange-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'zip':
      case 'rar':
        return <Archive className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileSize = (filePath) => {
    // For demo purposes, we'll generate a random size
    // In real implementation, this would come from the backend
    const sizes = ['1.2 MB', '2.4 MB', '856 KB', '5.8 MB', '3.1 MB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !currentModule) return;

    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('module_name', currentModule.name);
      formData.append('teacher_id', user.id);
      formData.append('title', uploadForm.title || uploadForm.file.name);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (response.ok) {
        const newDoc = await response.json();
        setDocuments([newDoc, ...documents]);
        setUploadForm({ title: "", file: null });
        setIsUploadOpen(false);
      } else {
        console.error('Upload failed:', response.statusText);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedDocument) return;

    try {
      const updateData = {
        title: uploadForm.title
      };

      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedDoc = await response.json();
        setDocuments(documents.map(doc => 
          doc.id === selectedDocument.id ? updatedDoc : doc
        ));
        setIsEditOpen(false);
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Edit error:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDownload = async (doc) => {
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

  const openEditDialog = (doc) => {
    setSelectedDocument(doc);
    setUploadForm({
      title: doc.title,
      file: null
    });
    setIsEditOpen(true);
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
        <div className="flex flex-1 flex-col bg-gradient-to-br from-background via-background to-muted/20">
          {/* Professional Header */}
          <div className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Documents
                      </h1>
                      <p className="text-sm text-muted-foreground font-medium">
                        {moduleName} • Document Management
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground max-w-2xl leading-relaxed">
                    Upload, organize, and manage course materials and resources
                  </p>
                </div>

                {/* Upload Button */}
                <Drawer open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DrawerTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Upload New Document</DrawerTitle>
                      <DrawerDescription>
                        Add a new document to your module library
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                      <form onSubmit={handleUpload} className="space-y-4">
                        <div>
                          <Label htmlFor="file">Select File</Label>
                          <Input
                            id="file"
                            type="file"
                            onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                            className="mt-1"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">Document Title (Optional)</Label>
                          <Input
                            id="title"
                            value={uploadForm.title}
                            onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                            placeholder="Enter custom title or leave blank to use filename"
                          />
                        </div>
                      </form>
                    </div>
                    <DrawerFooter>
                      <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" onClick={handleUpload}>
                          Upload Document
                        </Button>
                      </div>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="border-0 shadow-sm bg-white dark:bg-slate-900/50 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {getFileIcon(doc.file_type)}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {doc.title}
                            </h3>
                            <Badge className="text-xs bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                              {doc.file_type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <File className="w-4 h-4" />
                              <span>{doc.file_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{getFileSize(doc.storage_path)}</span>
                              {doc.slide_count && (
                                <span>• {doc.slide_count} slides</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(doc)}
                          className="hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleDelete(doc.id)}
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

            {filteredDocuments.length === 0 && (
              <Card className="border-2 border-dashed border-muted-foreground/25 bg-muted/5">
                <CardContent className="py-16 text-center">
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No documents found
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || filterCategory !== "all" 
                      ? "Try adjusting your search or filter criteria" 
                      : "Upload your first document to get started"
                    }
                  </p>
                  {!searchTerm && filterCategory === "all" && (
                    <Button onClick={() => setIsUploadOpen(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Drawer */}
        <Drawer open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit Document</DrawerTitle>
              <DrawerDescription>
                Update document information
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Document Title</Label>
                  <Input
                    id="edit-title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="Enter document title"
                    required
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
                  Update Document
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </SidebarInset>
    </SidebarProvider>
  );
}