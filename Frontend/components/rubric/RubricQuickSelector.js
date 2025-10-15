'use client';

import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export default function RubricQuickSelector({ value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const templates = [
    { key: 'default', name: 'General Purpose', emoji: '📚' },
    { key: 'stem_course', name: 'STEM / Science', emoji: '🔬' },
    { key: 'humanities', name: 'Humanities', emoji: '📖' },
    { key: 'language_learning', name: 'Language', emoji: '🌍' },
    { key: 'professional_skills', name: 'Professional', emoji: '💼' },
    { key: 'strict_grading', name: 'Strict / Exam Prep', emoji: '🎯' }
  ];

  const selectedTemplate = templates.find(t => t.key === value) || templates[0];

  const handleTemplateSelect = (templateKey) => {
    onChange(templateKey);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Feedback Rubric Template</Label>
      <p className="text-xs text-muted-foreground">
        Choose a feedback style for this module (can be customized later)
      </p>

      <Card>
        <CardContent className="p-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between hover:bg-muted/50 p-2 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedTemplate.emoji}</span>
              <span className="font-medium text-sm">{selectedTemplate.name}</span>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Template
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-1 border-t pt-3">
              {templates.map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => handleTemplateSelect(template.key)}
                  className={`w-full flex items-center gap-2 p-2 rounded-md text-left transition-colors ${
                    selectedTemplate.key === template.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span className="text-lg">{template.emoji}</span>
                  <span className="text-sm">{template.name}</span>
                  {selectedTemplate.key === template.key && (
                    <Badge variant="default" className="ml-auto text-xs">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic">
        💡 You can fully customize the rubric after creating the module
      </p>
    </div>
  );
}
