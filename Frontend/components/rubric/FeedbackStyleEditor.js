'use client';

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FeedbackStyleEditor({ value, onChange }) {
  const tones = [
    { value: 'encouraging', label: 'Encouraging', description: 'Supportive and motivating', emoji: '😊' },
    { value: 'neutral', label: 'Neutral', description: 'Objective and balanced', emoji: '📊' },
    { value: 'strict', label: 'Strict', description: 'Rigorous and precise', emoji: '🎯' }
  ];

  const detailLevels = [
    { value: 'brief', label: 'Brief', description: 'Concise key points' },
    { value: 'moderate', label: 'Moderate', description: 'Balanced detail' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive feedback' }
  ];

  const updateStyle = (key, val) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  return (
    <div className="space-y-6">
      {/* Tone Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feedback Tone</CardTitle>
          <CardDescription className="text-sm">
            Set the overall tone for AI-generated feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={value?.tone || 'encouraging'}
            onValueChange={(val) => updateStyle('tone', val)}
            className="grid grid-cols-1 gap-3"
          >
            {tones.map((tone) => (
              <label
                key={tone.value}
                className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  value?.tone === tone.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={tone.value} id={tone.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tone.emoji}</span>
                    <span className="font-medium">{tone.label}</span>
                    {tone.value === 'encouraging' && (
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{tone.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Detail Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Level</CardTitle>
          <CardDescription className="text-sm">
            Choose how detailed the feedback should be
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={value?.detail_level || 'detailed'}
            onValueChange={(val) => updateStyle('detail_level', val)}
            className="grid grid-cols-1 gap-3"
          >
            {detailLevels.map((level) => (
              <label
                key={level.value}
                className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  value?.detail_level === level.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                <div className="flex-1">
                  <span className="font-medium">{level.label}</span>
                  <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="include_examples">Include Examples</Label>
              <p className="text-sm text-muted-foreground">
                Provide specific examples in feedback
              </p>
            </div>
            <Switch
              id="include_examples"
              checked={value?.include_examples ?? true}
              onCheckedChange={(checked) => updateStyle('include_examples', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reference_course_material">Reference Course Material</Label>
              <p className="text-sm text-muted-foreground">
                Cite course materials when relevant (requires RAG)
              </p>
            </div>
            <Switch
              id="reference_course_material"
              checked={value?.reference_course_material ?? true}
              onCheckedChange={(checked) => updateStyle('reference_course_material', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
