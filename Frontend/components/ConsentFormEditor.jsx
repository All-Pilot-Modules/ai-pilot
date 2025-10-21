'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FileText, Save, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/auth';

const DEFAULT_CONSENT_FORM = `# Research Consent Form

## Purpose of the Study
This study aims to improve educational outcomes using AI-assisted learning tools. Your participation will help advance educational research and improve this platform for future students.

## What to Expect
- Your responses and interactions will be collected for research purposes
- All data will be anonymized and kept confidential
- Participation will not affect your grades or academic standing
- You may withdraw from the study at any time without penalty

## Your Rights
- Your participation is completely voluntary
- You can choose not to participate without any consequences
- All data collected will remain confidential and anonymous
- The research has been approved by the institutional review board

## Questions?
If you have any questions about this research, please contact your instructor.`;

export default function ConsentFormEditor({ moduleId, initialConsentText, initialConsentRequired = true, onUpdate }) {
  const [consentText, setConsentText] = useState(initialConsentText || DEFAULT_CONSENT_FORM);
  const [consentRequired, setConsentRequired] = useState(initialConsentRequired);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      console.log('Saving consent form:', {
        moduleId,
        consent_form_text: consentText.substring(0, 100) + '...',
        consent_required: consentRequired
      });

      const response = await apiClient.put(`/api/modules/${moduleId}/consent-form`, {
        consent_form_text: consentText,
        consent_required: consentRequired
      });

      console.log('Consent form saved successfully:', response);
      setSaveStatus({ type: 'success', message: 'Consent form updated successfully!' });
      if (onUpdate) {
        onUpdate(response);
      }
    } catch (error) {
      console.error('Failed to update consent form:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.detail || error.message || 'Failed to save consent form. Please try again.';
      setSaveStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConsentText(DEFAULT_CONSENT_FORM);
    setSaveStatus(null);
  };

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Research Consent Form</CardTitle>
              <CardDescription>
                Customize the consent form that students see before accessing this module
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Consent Required Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="consent-required" className="text-base font-semibold">
              Require Consent
            </Label>
            <p className="text-sm text-muted-foreground">
              Students must complete the consent form before accessing module content
            </p>
          </div>
          <Switch
            id="consent-required"
            checked={consentRequired}
            onCheckedChange={setConsentRequired}
          />
        </div>

        {/* Editor or Preview */}
        {isPreview ? (
          <div className="p-6 border rounded-lg bg-background">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: consentText
                  .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                  .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
                  .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^(?!<[hl]|<li)(.+)$/gm, '<p class="mb-4">$1</p>')
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="consent-text" className="text-base font-semibold">
                Consent Form Content
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                Reset to Default
              </Button>
            </div>
            <Textarea
              id="consent-text"
              value={consentText}
              onChange={(e) => setConsentText(e.target.value)}
              placeholder="Enter consent form text (supports Markdown)"
              className="min-h-[400px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Supports basic Markdown: # for headings, ## for subheadings, - for bullet points
            </p>
          </div>
        )}

        {/* Save Status */}
        {saveStatus && (
          <div className={`p-4 rounded-lg border flex items-center gap-2 ${
            saveStatus.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm ${
              saveStatus.type === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {saveStatus.message}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Consent Form
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
