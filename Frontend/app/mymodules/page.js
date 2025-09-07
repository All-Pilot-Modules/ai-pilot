'use client';

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, ExternalLink, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/auth";

export default function MyModules() {
  const { user, loading, isAuthenticated } = useAuth();
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedItems, setCopiedItems] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchModules();
    }
  }, [isAuthenticated, user]);

  const fetchModules = async () => {
    try {
      const data = await apiClient.get(`/api/modules?teacher_id=${user.id}`);
      setModules(data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const moduleData = {
        teacher_id: user.id,
        name: formData.name,
        description: formData.description,
        is_active: true,
        visibility: 'class-only'
      };
      
      await apiClient.post('/api/modules', moduleData);
      setFormData({ name: '', description: '' });
      fetchModules(); // Refresh the list
    } catch (error) {
      console.error('Failed to create module:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateModuleUrl = (accessCode) => {
    return `${window.location.origin}/join/${accessCode}`;
  };

  const copyToClipboard = async (text, type, moduleId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems({...copiedItems, [`${moduleId}-${type}`]: true});
      setTimeout(() => {
        setCopiedItems(prev => ({...prev, [`${moduleId}-${type}`]: false}));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const regenerateAccessCode = async (moduleId) => {
    try {
      await apiClient.post(`/api/modules/${moduleId}/regenerate-code`);
      fetchModules(); // Refresh to get new access code
    } catch (error) {
      console.error('Failed to regenerate access code:', error);
    }
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">My Modules</h1>
          <p className="text-gray-600">Create and manage your modules</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Module Form - Left Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New Module</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Module Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter module name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter module description"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Creating...' : 'Create Module'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Modules List - Right Side */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Modules</h2>
              <p className="text-sm text-gray-600">Manage your created modules</p>
            </div>
            
            <div className="space-y-3">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{module.name}</h3>
                        {module.description && (
                          <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                        )}
                        
                        {/* Access Code */}
                        <div className="mb-3">
                          <Label className="text-xs text-gray-500 mb-1 block">Access Code</Label>
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                              {module.access_code}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(module.access_code, 'code', module.id)}
                              className="h-7 px-2"
                            >
                              {copiedItems[`${module.id}-code`] ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => regenerateAccessCode(module.id)}
                              className="h-7 px-2"
                              title="Regenerate access code"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Module URL */}
                        <div className="mb-3">
                          <Label className="text-xs text-gray-500 mb-1 block">Join URL</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded font-mono truncate flex-1">
                              {generateModuleUrl(module.access_code)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(generateModuleUrl(module.access_code), 'url', module.id)}
                              className="h-7 px-2"
                            >
                              {copiedItems[`${module.id}-url`] ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(generateModuleUrl(module.access_code), '_blank')}
                              className="h-7 px-2"
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button asChild className="ml-6">
                        <Link href={`/dashboard?module=${encodeURIComponent(module.name)}`}>
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {modules.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No modules yet. Create your first module using the form on the left.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}