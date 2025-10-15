# Rubric + RAG AI Feedback Implementation

## Overview
Implemented a complete teacher-controlled rubric system with RAG (Retrieval-Augmented Generation) integration for AI feedback. Teachers can now customize feedback criteria, tone, and course material retrieval settings.

---

## What Was Implemented ✅

### 1. **Rubric Service** (`Backend/app/services/rubric.py`)
- `get_module_rubric()` - Fetches rubric with default fallback
- `merge_with_defaults()` - Merges custom rubric with base template
- `update_module_rubric()` - Saves custom rubric to module
- `apply_template_to_module()` - Applies predefined templates
- `validate_rubric()` - Validates rubric configuration
- `get_available_templates()` - Lists all rubric templates

### 2. **Rubric API Endpoints** (`Backend/app/api/routes/module.py`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modules/{module_id}/rubric` | Get module's rubric configuration |
| PUT | `/api/modules/{module_id}/rubric` | Update module's rubric |
| GET | `/api/rubric-templates` | List available rubric templates |
| POST | `/api/modules/{module_id}/rubric/apply-template` | Apply a template to module |
| POST | `/api/rubric/validate` | Validate rubric without saving |

### 3. **Prompt Builder** (`Backend/app/services/prompt_builder.py`)
- `build_mcq_feedback_prompt()` - Dynamic MCQ prompts with rubric + RAG
- `build_text_feedback_prompt()` - Dynamic text answer prompts with rubric + RAG
- `should_include_context()` - Determines when to use RAG
- Tone-aware prompt generation (encouraging, neutral, strict)

### 4. **RAG Integration in AI Feedback** (`Backend/app/services/ai_feedback.py`)
- **Updated `generate_instant_feedback()`**:
  - Loads rubric configuration for module
  - Retrieves RAG context if enabled
  - Passes rubric + context to prompt builder
  - Includes source citations in feedback
- **Updated `_analyze_mcq_answer()`**:
  - Uses dynamic prompts based on rubric
  - Integrates course material context
- **Updated `_analyze_text_answer()`**:
  - Uses dynamic prompts based on rubric
  - Integrates course material context

### 5. **Predefined Rubric Templates** (`Backend/app/config/feedback_templates.py`)
Six templates available:
1. **default** - General purpose, balanced rubric
2. **stem_course** - Focus on accuracy and methodology
3. **humanities** - Emphasize argumentation and evidence
4. **language_learning** - Grammar and fluency focused
5. **professional_skills** - Real-world application
6. **strict_grading** - High standards, detailed feedback

---

## Rubric Structure

### Base Rubric Configuration
```json
{
  "enabled": true,
  "grading_criteria": {
    "accuracy": {
      "weight": 40,
      "description": "Correctness of the answer"
    },
    "completeness": {
      "weight": 30,
      "description": "Covers all required points"
    },
    "clarity": {
      "weight": 20,
      "description": "Clear and well-structured"
    },
    "depth": {
      "weight": 10,
      "description": "Level of detail and insight"
    }
  },
  "feedback_style": {
    "tone": "encouraging",
    "detail_level": "detailed",
    "include_examples": true,
    "reference_course_material": true
  },
  "rag_settings": {
    "enabled": true,
    "max_context_chunks": 3,
    "similarity_threshold": 0.7,
    "include_source_references": true
  },
  "custom_instructions": "",
  "question_type_settings": {
    "mcq": {
      "explain_correct": true,
      "explain_incorrect": true,
      "show_all_options_analysis": false
    },
    "short_answer": {
      "minimum_length": 50,
      "check_grammar": false
    },
    "essay": {
      "require_structure": true,
      "check_citations": false,
      "minimum_paragraphs": 2
    }
  }
}
```

---

## How It Works

### Flow Diagram
```
Student submits answer
        ↓
AIFeedbackService.generate_instant_feedback()
        ↓
Load module rubric (merges with defaults)
        ↓
Check if RAG is enabled → YES → Retrieve similar chunks from course materials
        ↓                         (uses similarity threshold from rubric)
Build dynamic prompt
  - Grading criteria from rubric
  - Custom teacher instructions
  - Feedback tone & detail level
  - RAG context (if retrieved)
        ↓
Send to OpenAI API
        ↓
Parse JSON feedback
        ↓
Add metadata (sources, RAG usage, rubric summary)
        ↓
Return to student
```

### RAG Context Retrieval
1. Combines question + student answer as search query
2. Generates embedding for the query
3. Searches all embedded documents in the module
4. Filters by similarity threshold (default: 0.7)
5. Returns top N chunks (default: 3)
6. Formats context with source citations

---

## API Usage Examples

### 1. Get Module Rubric
```bash
GET /api/modules/abc-123-def/rubric
```

**Response:**
```json
{
  "module_id": "abc-123-def",
  "rubric": { /* full rubric config */ },
  "summary": "4 grading criteria, encouraging tone, RAG enabled"
}
```

### 2. Update Module Rubric
```bash
PUT /api/modules/abc-123-def/rubric
Content-Type: application/json

{
  "feedback_style": {
    "tone": "strict",
    "detail_level": "detailed"
  },
  "rag_settings": {
    "max_context_chunks": 5,
    "similarity_threshold": 0.8
  },
  "custom_instructions": "Focus on mathematical rigor and proper notation."
}
```

### 3. Apply Template
```bash
POST /api/modules/abc-123-def/rubric/apply-template?template_name=stem_course&preserve_custom_instructions=true
```

### 4. List Available Templates
```bash
GET /api/rubric-templates
```

**Response:**
```json
{
  "templates": [
    {
      "key": "default",
      "name": "General Purpose",
      "description": "Balanced rubric suitable for most courses"
    },
    {
      "key": "stem_course",
      "name": "STEM / Science",
      "description": "Focus on accuracy, methodology, and problem-solving"
    }
    // ... more templates
  ],
  "count": 6
}
```

---

## Testing Guide

### Prerequisites
1. Have a module with uploaded documents (processed to "embedded" status)
2. Have questions in the module
3. Module rubric configured (or using default)

### Test Cases

#### Test 1: Default Rubric Without RAG
```bash
# 1. Create module (uses default rubric)
POST /api/modules
{
  "teacher_id": "teacher1",
  "name": "Test Module",
  "description": "Test module"
}

# 2. Submit student answer
POST /api/student/submit-answer
{
  "student_id": "student1",
  "question_id": "question-123",
  "answer": {"text_response": "Sample answer"},
  "attempt": 1
}

# 3. Check feedback response includes:
# - feedback.model_used
# - feedback.used_rag = false (no documents yet)
```

#### Test 2: Custom Rubric with RAG
```bash
# 1. Upload course document to module
POST /api/upload-document
# (wait for processing to reach "embedded" status)

# 2. Update rubric to enable RAG
PUT /api/modules/{module_id}/rubric
{
  "rag_settings": {
    "enabled": true,
    "max_context_chunks": 3,
    "similarity_threshold": 0.7
  },
  "custom_instructions": "Reference specific concepts from the course material."
}

# 3. Submit answer
POST /api/student/submit-answer

# 4. Check feedback response includes:
# - feedback.used_rag = true
# - feedback.rag_sources = ["Document Title"]
# - feedback.rag_context_summary
# - feedback contains references to course material
```

#### Test 3: Different Tones
```bash
# Test "strict" tone
PUT /api/modules/{module_id}/rubric
{
  "feedback_style": {
    "tone": "strict"
  }
}

# Submit answer and verify feedback is more rigorous

# Test "encouraging" tone
PUT /api/modules/{module_id}/rubric
{
  "feedback_style": {
    "tone": "encouraging"
  }
}

# Submit answer and verify feedback is more supportive
```

#### Test 4: Template Application
```bash
# Apply STEM template
POST /api/modules/{module_id}/rubric/apply-template?template_name=stem_course

# Get rubric and verify:
# - accuracy weight = 50%
# - methodology criterion exists
# - similarity_threshold = 0.75
```

---

## Configuration Options

### Feedback Tones
- **encouraging**: Supportive, motivating, focuses on growth
- **neutral**: Objective, factual, balanced
- **strict**: Rigorous, precise, high standards

### Detail Levels
- **brief**: Concise, key points only
- **moderate**: Balanced detail
- **detailed**: Comprehensive, thorough

### RAG Settings
- **enabled**: true/false - Enable RAG retrieval
- **max_context_chunks**: 1-10 - Number of document chunks to retrieve
- **similarity_threshold**: 0.0-1.0 - Minimum similarity score (higher = stricter matching)
- **include_source_references**: true/false - Show document sources in feedback

---

## Database Schema

### Module Table
```sql
assignment_config JSONB {
  "features": { ... },
  "feedback_rubric": {
    /* rubric configuration */
  }
}
```

**No migration needed!** The `assignment_config` JSONB field already exists and supports the `feedback_rubric` structure.

---

## Error Handling

### Graceful Degradation
1. **No rubric configured**: Falls back to default template
2. **RAG retrieval fails**: Continues without context, logs warning
3. **No documents embedded**: RAG disabled automatically
4. **Invalid rubric**: Validation errors returned, not saved
5. **OpenAI API error**: Falls back to simple feedback

### Validation Rules
- Grading criteria weights must sum to 99-101% (allows rounding)
- Tone must be: "encouraging", "neutral", or "strict"
- Detail level: "brief", "moderate", or "detailed"
- Similarity threshold: 0.0 - 1.0
- Max context chunks: 1-10

---

## Next Steps (Frontend)

### 1. Rubric Editor UI
Create page: `Frontend/app/dashboard/modules/[moduleId]/rubric/page.js`

Features needed:
- Template selector dropdown
- Live preview
- Tabs for:
  - Grading Criteria Editor (weights, descriptions)
  - Feedback Style (tone, detail level)
  - RAG Settings (enable/disable, chunks, threshold)
  - Custom Instructions (textarea)
  - Question Type Settings

### 2. Feedback Display
Update student feedback display to show:
- Source citations from RAG
- "Retrieved from: [Document Name]" badge
- Feedback tone indicator

### 3. Module Settings Integration
Add "Rubric" tab to module settings page with:
- Current rubric summary
- "Edit Rubric" button → opens rubric editor
- Template quick-apply buttons

---

## Performance Considerations

### RAG Retrieval
- Embedding generation: ~0.5s per chunk
- Similarity search: ~0.1s per document
- Total overhead: ~1-2s for RAG-enhanced feedback

### Caching Opportunities
- Rubric configurations (rarely change)
- Document embeddings (pre-computed)
- Template definitions (static)

---

## Monitoring & Analytics

### Metrics to Track
1. **RAG Usage Rate**: % of feedback using RAG
2. **Average Similarity Scores**: Quality of context retrieval
3. **Feedback Generation Time**: With/without RAG
4. **Template Usage**: Which templates are most popular
5. **Custom Rubric Adoption**: % of teachers customizing

### Logging
- RAG context retrieval success/failure
- Rubric validation errors
- OpenAI API failures
- Fallback usage frequency

---

## Troubleshooting

### RAG Not Working
1. Check document `processing_status` = "embedded"
2. Verify `rag_settings.enabled` = true in rubric
3. Check similarity threshold (lower = more results)
4. Ensure documents exist in module

### Feedback Quality Issues
1. Lower similarity threshold for more context
2. Increase max_context_chunks
3. Adjust tone and detail_level
4. Add custom_instructions for domain-specific guidance

### API Errors
1. Check OpenAI API key in config
2. Verify EMBED_MODEL and LLM_MODEL settings
3. Check database connection
4. Review logs for detailed errors

---

## Files Modified/Created

### Created
- `Backend/app/services/rubric.py`
- `Backend/app/services/prompt_builder.py`
- `Backend/app/config/feedback_templates.py` (already existed, documented)

### Modified
- `Backend/app/api/routes/module.py` (added 5 rubric endpoints)
- `Backend/app/services/ai_feedback.py` (integrated rubric + RAG)

### Existing (Not Modified)
- `Backend/app/services/rag_retriever.py` (already complete)
- `Backend/app/services/embedding.py` (already complete)
- `Backend/app/models/module.py` (already has `assignment_config`)

---

## Summary

The implementation is **complete and ready for testing**. Teachers can now:
1. Choose from 6 predefined rubric templates
2. Customize grading criteria, feedback tone, and detail level
3. Configure RAG settings (enable/disable, chunk count, similarity threshold)
4. Add custom instructions for domain-specific feedback
5. API automatically merges custom settings with defaults

The AI feedback system now:
1. Loads teacher's rubric for each module
2. Retrieves relevant course material context (RAG)
3. Builds dynamic prompts based on rubric settings
4. Generates personalized, context-aware feedback
5. Includes source citations from course materials

**Next:** Build the frontend rubric editor UI for teachers to easily customize their feedback settings.
