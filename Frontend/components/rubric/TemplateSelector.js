'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/auth";

export default function TemplateSelector({ value, onChange, onApply }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await apiClient.get('/api/rubric-templates');
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.key);
  };

  const handleApplyTemplate = async () => {
    if (selectedTemplate && onApply) {
      await onApply(selectedTemplate);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Choose a Template</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Start with a pre-configured rubric template or customize your own
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.key}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.key
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {template.name}
                    {template.key === 'default' && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                {selectedTemplate === template.key && (
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {selectedTemplate && onApply && (
        <Button
          onClick={handleApplyTemplate}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Apply {templates.find(t => t.key === selectedTemplate)?.name} Template
        </Button>
      )}
    </div>
  );
}
