'use client';

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Zap } from "lucide-react";

export default function RAGSettingsPanel({ value, onChange }) {
  const updateRAG = (key, val) => {
    onChange({
      ...value,
      [key]: val
    });
  };

  const enabled = value?.enabled ?? true;
  const maxChunks = value?.max_context_chunks ?? 3;
  const threshold = value?.similarity_threshold ?? 0.7;
  const includeReferences = value?.include_source_references ?? true;

  return (
    <div className="space-y-6">
      {/* RAG Enable/Disable */}
      <Card className={enabled ? 'border-primary/50' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                RAG (Retrieval-Augmented Generation)
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Use course materials to enhance feedback quality
              </CardDescription>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => updateRAG('enabled', checked)}
            />
          </div>
        </CardHeader>
        {enabled && (
          <CardContent className="space-y-6">
            {/* Max Context Chunks */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Context Chunks</Label>
                <Badge variant="secondary">{maxChunks} chunks</Badge>
              </div>
              <Slider
                value={[maxChunks]}
                onValueChange={(val) => updateRAG('max_context_chunks', val[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Number of document chunks to retrieve for context. More chunks = more comprehensive but slower.</span>
              </p>
            </div>

            {/* Similarity Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Similarity Threshold</Label>
                <Badge variant="secondary">{(threshold * 100).toFixed(0)}%</Badge>
              </div>
              <Slider
                value={[threshold * 100]}
                onValueChange={(val) => updateRAG('similarity_threshold', val[0] / 100)}
                min={50}
                max={95}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Minimum relevance score for retrieved content. Higher = stricter matching, fewer but more relevant results.</span>
              </p>
            </div>

            {/* Include Source References */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="include_refs">Include Source Citations</Label>
                <p className="text-xs text-muted-foreground">
                  Show which documents were referenced in feedback
                </p>
              </div>
              <Switch
                id="include_refs"
                checked={includeReferences}
                onCheckedChange={(checked) => updateRAG('include_source_references', checked)}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Info Card */}
      {!enabled && (
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  RAG is disabled
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Feedback will be generated without course material context. Enable RAG to reference uploaded documents in feedback.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
