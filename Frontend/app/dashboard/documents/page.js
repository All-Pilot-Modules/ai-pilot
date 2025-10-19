'use client';

import { Suspense, useState, useEffect } from "react";
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
import { Upload, FolderOpen, File, FileText, FileVideo, Image, Archive, Calendar, Edit3, Trash2, Download, Search } from "lucide-react";
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
  const [uploadForm, setUploadForm] = useState({ title: "", file: null });

  // Load module and documents
  useEffect(() => {
    if (isAuthenticated && user && moduleName) {
      fetchModuleAndDocuments();
    }
  }, [isAuthenticated, user, moduleName]);

  const fetchModuleAndDocuments = async () => {
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
  };

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf": return <FileText className="w-5 h-5 text-red-500" />;
      case "docx":
      case "doc": return <File className="w-5 h-5 text-blue-500" />;
      case "pptx":
      case "ppt": return <FileVideo className="w-5 h-5 text-orange-500" />;
      case "jpg":
      case "jpeg":
      case "png": return <Image className="w-5 h-5 text-green-500" />;
      case "zip":
      case "rar": return <Archive className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      setIsDeleting(id);
      await apiClient.delete(`/api/documents/${id}`);
      setDocuments(docs => docs.filter(d => d.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(null);
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

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Documents - {moduleName}</h1>
            <Drawer open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DrawerTrigger asChild>
                <Button><Upload className="w-4 h-4 mr-2" /> Upload</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Upload Document</DrawerTitle>
                  <DrawerDescription>Add new material</DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input id="file" type="file" onChange={(e) =>
                        setUploadForm({ ...uploadForm, file: e.target.files[0] })
                      } required />
                    </div>
                    <div>
                      <Label htmlFor="title">Document Title</Label>
                      <Input id="title" value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="Optional title" />
                    </div>
                  </form>
                </div>
                <DrawerFooter>
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoadingDocuments ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonDocumentCard key={i} />)
          ) : filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="mb-4 shadow-sm">
                <CardContent className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-4">
                    {getFileIcon(doc.file_type)}
                    <div>
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">{doc.file_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(doc)}>
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(doc.storage_path)}>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed text-center py-10">
              <CardContent>
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p>No documents found. Upload one to get started.</p>
              </CardContent>
            </Card>
          )}
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