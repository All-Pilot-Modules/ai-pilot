'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Lightbulb, Sparkles } from "lucide-react";

export default function SimpleRubricEditor({ value, onChange, templates, onApplyTemplate, isApplyingTemplate = false }) {
  const tones = [
    { value: 'encouraging', emoji: '😊', label: 'Friendly', description: 'Supportive and positive' },
    { value: 'neutral', emoji: '📊', label: 'Balanced', description: 'Professional and fair' },
    { value: 'strict', emoji: '🎯', label: 'Direct', description: 'Clear and rigorous' }
  ];

  const handleToneSelect = (tone) => {
    onChange({
      ...value,
      feedback_style: {
        ...value?.feedback_style,
        tone: tone
      }
    });
  };

  const handleInstructionsChange = (instructions) => {
    onChange({
      ...value,
      custom_instructions: instructions
    });
  };

  const handleTemplateSelect = (templateKey) => {
    if (onApplyTemplate) {
      onApplyTemplate(templateKey);
    }
  };

  const selectedTone = value?.feedback_style?.tone || 'encouraging';
  const instructions = value?.custom_instructions || '';

  return (
    <div className="space-y-6">
      {/* Quick Template Selection */}
      {templates && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Quick Start: Choose a Template
            </CardTitle>
            <CardDescription>
              Select a pre-configured feedback style for your subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isApplyingTemplate ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" className="text-primary mr-3" />
                <p className="text-muted-foreground">Applying template...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <Button
                    key={template.key}
                    variant="outline"
                    onClick={() => handleTemplateSelect(template.key)}
                    className="h-auto p-4 flex flex-col items-start text-left hover:border-primary hover:bg-primary/5"
                  >
                    <span className="text-2xl mb-2">
                      {template.key === 'default' && '📚'}
                      {template.key === 'stem_course' && '🔬'}
                      {template.key === 'humanities' && '📖'}
                      {template.key === 'language_learning' && '🌍'}
                      {template.key === 'professional_skills' && '💼'}
                      {template.key === 'strict_grading' && '🎯'}
                    </span>
                    <span className="font-medium text-sm">{template.name}</span>
                    <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback Tone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback Tone</CardTitle>
          <CardDescription>
            How should the AI communicate with your students?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tones.map((tone) => (
              <button
                key={tone.value}
                onClick={() => handleToneSelect(tone.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTone === tone.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col items-start gap-2">
                  <span className="text-3xl">{tone.emoji}</span>
                  <div>
                    <p className="font-semibold">{tone.label}</p>
                    <p className="text-xs text-muted-foreground">{tone.description}</p>
                  </div>
                  {selectedTone === tone.value && (
                    <Badge variant="default" className="text-xs mt-1">Selected</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Instructions (Optional)</CardTitle>
          <CardDescription>
            Add specific guidance for AI feedback in this module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              value={instructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="Example: Focus on mathematical accuracy and show step-by-step solutions"
              rows={4}
              maxLength={300}
              className="resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Tell the AI what to focus on when giving feedback
              </p>
              <span className="text-xs text-muted-foreground">
                {instructions.length} / 300
              </span>
            </div>
          </div>

          {/* Example Instructions */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium">Quick Examples:</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                'Focus on mathematical accuracy and proper notation',
                'Emphasize real-world applications and practical examples',
                'Check grammar, vocabulary, and natural expression',
                'Evaluate critical thinking and argumentation skills'
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleInstructionsChange(example)}
                  className="text-left p-2 text-xs rounded-md hover:bg-muted/50 transition-colors border border-border"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                💡 Keep it simple!
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                <li>• <strong>Friendly</strong> - Best for encouraging students</li>
                <li>• <strong>Balanced</strong> - Professional and objective</li>
                <li>• <strong>Direct</strong> - Clear expectations, exam prep</li>
              </ul>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-3">
                The AI will automatically reference your uploaded course materials when giving feedback.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
