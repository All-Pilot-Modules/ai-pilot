# Quick Fix: Restart Backend

## Error You're Seeing

```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This error when trying to add questions from the dashboard.

## What's Happening

The backend is returning an HTML error page instead of JSON. This happens because:
1. The backend needs to be restarted to load the new `ai_feedback` model
2. OR the backend crashed on startup due to the new imports

## Fix (3 Steps)

### Step 1: Stop the Backend

If backend is running, press `Ctrl+C` to stop it.

### Step 2: Restart the Backend

```bash
cd Backend
uvicorn main:app --reload
```

### Step 3: Check for Errors

Look for these messages:

**✅ Good (Success):**
```
🚀 App started! Creating tables...
✅ All tables created successfully (including ai_feedback table)
INFO:     Application startup complete.
```

**❌ Bad (Error):**
```
Error loading model...
Traceback...
```

## If You See Errors

### Test the Model First

```bash
cd Backend
source venv/bin/activate  # or on Windows: venv\Scripts\activate
python test_ai_feedback_model.py
```

This will tell you exactly what's wrong.

### Common Issues

**Issue 1: Module not found**
```
ModuleNotFoundError: No module named 'sqlalchemy'
```

**Fix:** Activate virtual environment
```bash
source venv/bin/activate
```

**Issue 2: Database connection error**
```
Could not connect to database
```

**Fix:** Check `.env` file has correct `DATABASE_URL`

**Issue 3: Import circular dependency**

**Fix:** Check the error message and let me know what it says

## Quick Test

Once backend restarts successfully, test the question creation:

```bash
curl -X POST http://localhost:8000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test question",
    "type": "mcq",
    "document_id": "your-document-uuid",
    "correct_answer": "A",
    "options": {"A": "Option A", "B": "Option B"}
  }'
```

Should return JSON, not HTML.

## What to Do

1. **Stop backend** (Ctrl+C)
2. **Restart backend** (`uvicorn main:app --reload`)
3. **Check logs** - Look for "✅ All tables created"
4. **Try adding question again** from dashboard

If still getting error, send me the backend startup logs!
