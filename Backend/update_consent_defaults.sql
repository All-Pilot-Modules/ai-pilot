-- Update existing modules to have default consent settings
-- Run this if modules were created before consent fields were added

UPDATE modules
SET
    consent_required = true,
    consent_form_text = '# Research Consent Form

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
If you have any questions about this research, please contact your instructor.'
WHERE consent_required IS NULL OR consent_form_text IS NULL;

-- Verify the update
SELECT id, name, consent_required,
       CASE
           WHEN consent_form_text IS NOT NULL THEN 'Has consent text'
           ELSE 'No consent text'
       END as consent_status
FROM modules;
