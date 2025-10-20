# API Documentation

Complete API reference for AI Education Pilot backend.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Modules API](#modules-api)
4. [Tests & Questions API](#tests--questions-api)
5. [Students API](#students-api)
6. [Submissions API](#submissions-api)
7. [Documents API](#documents-api)
8. [Analytics API](#analytics-api)
9. [AI Features API](#ai-features-api)
10. [Error Handling](#error-handling)

## Getting Started

### Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

### API Versioning

Current version: `v1`

All endpoints are prefixed with `/api/`

### Response Format

All responses are in JSON format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-02-15T10:30:00Z"
}
```

### Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per minute per user
- **AI endpoints**: 10 requests per minute per user

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1234567890
```

## Authentication

### Register

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "username": "teacher123",
  "email": "teacher@example.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "teacher"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "username": "teacher123",
      "email": "teacher@example.com",
      "role": "teacher"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 1800
  }
}
```

### Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "username": "teacher123",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "uuid-here",
    "username": "teacher123",
    "email": "teacher@example.com",
    "role": "teacher"
  }
}
```

### Get Current User

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "id": "uuid-here",
  "username": "teacher123",
  "email": "teacher@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "teacher",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Request**:
```json
{
  "refresh_token": "your-refresh-token"
}
```

**Response**:
```json
{
  "access_token": "new-access-token",
  "token_type": "bearer",
  "expires_in": 1800
}
```

## Modules API

### Create Module

**Endpoint**: `POST /api/modules`

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request**:
```json
{
  "name": "Introduction to Python",
  "description": "Learn Python fundamentals",
  "subject": "Computer Science",
  "grade_level": "Undergraduate",
  "settings": {
    "allow_late_submissions": true,
    "show_correct_answers": "after_due_date",
    "randomize_questions": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "module-uuid",
    "name": "Introduction to Python",
    "description": "Learn Python fundamentals",
    "access_code": "ABC123",
    "teacher_id": "teacher-uuid",
    "created_at": "2025-02-15T10:30:00Z",
    "settings": { ... }
  }
}
```

### List Modules

**Endpoint**: `GET /api/modules`

**Query Parameters**:
- `teacher_id`: Filter by teacher (optional)
- `status`: `active`, `archived` (default: `active`)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Example**:
```
GET /api/modules?teacher_id=uuid&status=active&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "module-1-uuid",
      "name": "Introduction to Python",
      "access_code": "ABC123",
      "student_count": 25,
      "created_at": "2025-01-15T00:00:00Z"
    },
    {
      "id": "module-2-uuid",
      "name": "Advanced JavaScript",
      "access_code": "XYZ789",
      "student_count": 18,
      "created_at": "2025-02-01T00:00:00Z"
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

### Get Module

**Endpoint**: `GET /api/modules/{module_id}`

**Response**:
```json
{
  "id": "module-uuid",
  "name": "Introduction to Python",
  "description": "Learn Python fundamentals",
  "access_code": "ABC123",
  "teacher_id": "teacher-uuid",
  "teacher_name": "Jane Smith",
  "student_count": 25,
  "test_count": 8,
  "document_count": 15,
  "created_at": "2025-01-15T00:00:00Z",
  "settings": {
    "allow_late_submissions": true,
    "late_penalty": 10,
    "show_correct_answers": "after_due_date"
  }
}
```

### Update Module

**Endpoint**: `PUT /api/modules/{module_id}`

**Request**:
```json
{
  "name": "Introduction to Python - Updated",
  "description": "Updated description",
  "settings": {
    "allow_late_submissions": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "module-uuid",
    "name": "Introduction to Python - Updated",
    "updated_at": "2025-02-15T11:00:00Z"
  }
}
```

### Delete Module

**Endpoint**: `DELETE /api/modules/{module_id}`

**Response**:
```json
{
  "success": true,
  "message": "Module deleted successfully"
}
```

### Join Module (Student)

**Endpoint**: `POST /api/modules/join`

**Request**:
```json
{
  "access_code": "ABC123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "module": {
      "id": "module-uuid",
      "name": "Introduction to Python"
    },
    "enrollment": {
      "student_id": "student-uuid",
      "enrolled_at": "2025-02-15T10:30:00Z"
    }
  }
}
```

## Tests & Questions API

### Create Question

**Endpoint**: `POST /api/questions`

**Request** (Multiple Choice):
```json
{
  "module_id": "module-uuid",
  "type": "multiple_choice",
  "question_text": "What is the capital of France?",
  "points": 1,
  "difficulty": "easy",
  "choices": [
    {"text": "London", "is_correct": false},
    {"text": "Berlin", "is_correct": false},
    {"text": "Paris", "is_correct": true},
    {"text": "Madrid", "is_correct": false}
  ],
  "explanation": "Paris is the capital of France.",
  "tags": ["geography", "europe"]
}
```

**Request** (Essay):
```json
{
  "module_id": "module-uuid",
  "type": "essay",
  "question_text": "Discuss the impact of climate change.",
  "points": 20,
  "difficulty": "hard",
  "rubric_id": "rubric-uuid",
  "settings": {
    "min_words": 500,
    "max_words": 2000,
    "ai_feedback": true
  },
  "tags": ["essay", "environmental"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "question-uuid",
    "type": "multiple_choice",
    "question_text": "What is the capital of France?",
    "points": 1,
    "created_at": "2025-02-15T10:30:00Z"
  }
}
```

### List Questions

**Endpoint**: `GET /api/questions`

**Query Parameters**:
- `module_id`: Required
- `type`: Filter by question type
- `difficulty`: `easy`, `medium`, `hard`
- `tags`: Comma-separated tags
- `limit`, `offset`: Pagination

**Example**:
```
GET /api/questions?module_id=uuid&type=multiple_choice&difficulty=easy
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "q1-uuid",
      "type": "multiple_choice",
      "question_text": "What is 2+2?",
      "points": 1,
      "difficulty": "easy",
      "tags": ["math", "basic"]
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

### Create Test

**Endpoint**: `POST /api/tests`

**Request**:
```json
{
  "module_id": "module-uuid",
  "name": "Midterm Exam",
  "description": "Covers chapters 1-5",
  "duration_minutes": 60,
  "available_from": "2025-02-20T09:00:00Z",
  "available_until": "2025-02-25T23:59:59Z",
  "settings": {
    "max_attempts": 2,
    "randomize_questions": true,
    "show_correct_answers": "after_due_date",
    "require_sequential": false
  },
  "question_ids": ["q1-uuid", "q2-uuid", "q3-uuid"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "test-uuid",
    "name": "Midterm Exam",
    "question_count": 3,
    "total_points": 25,
    "created_at": "2025-02-15T10:30:00Z"
  }
}
```

### Get Test

**Endpoint**: `GET /api/tests/{test_id}`

**Response**:
```json
{
  "id": "test-uuid",
  "module_id": "module-uuid",
  "name": "Midterm Exam",
  "description": "Covers chapters 1-5",
  "duration_minutes": 60,
  "total_points": 25,
  "question_count": 3,
  "available_from": "2025-02-20T09:00:00Z",
  "available_until": "2025-02-25T23:59:59Z",
  "settings": { ... },
  "questions": [
    {
      "id": "q1-uuid",
      "order": 1,
      "question_text": "What is...",
      "type": "multiple_choice",
      "points": 2
    }
  ]
}
```

## Students API

### List Students in Module

**Endpoint**: `GET /api/modules/{module_id}/students`

**Query Parameters**:
- `status`: `active`, `inactive`
- `performance`: `high`, `medium`, `low`
- `search`: Search by name/email
- `limit`, `offset`: Pagination

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "student-uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "enrolled_at": "2025-01-15T00:00:00Z",
      "stats": {
        "tests_completed": 8,
        "tests_total": 10,
        "average_score": 85.5,
        "last_active": "2025-02-14T15:30:00Z"
      }
    }
  ],
  "total": 25
}
```

### Get Student Details

**Endpoint**: `GET /api/students/{student_id}`

**Query Parameters**:
- `module_id`: Required

**Response**:
```json
{
  "id": "student-uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "enrolled_at": "2025-01-15T00:00:00Z",
  "stats": {
    "tests_completed": 8,
    "tests_total": 10,
    "average_score": 85.5,
    "highest_score": 95.0,
    "lowest_score": 72.0,
    "time_spent_hours": 12.5,
    "last_active": "2025-02-14T15:30:00Z"
  },
  "recent_activity": [
    {
      "type": "test_submission",
      "test_name": "Test 8",
      "score": 88.0,
      "timestamp": "2025-02-14T14:00:00Z"
    }
  ],
  "submissions": [...]
}
```

### Add Student to Module

**Endpoint**: `POST /api/modules/{module_id}/students`

**Request**:
```json
{
  "student_id": "student-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "module_id": "module-uuid",
    "student_id": "student-uuid",
    "enrolled_at": "2025-02-15T10:30:00Z"
  }
}
```

### Remove Student from Module

**Endpoint**: `DELETE /api/modules/{module_id}/students/{student_id}`

**Response**:
```json
{
  "success": true,
  "message": "Student removed from module"
}
```

## Submissions API

### Submit Test

**Endpoint**: `POST /api/submissions`

**Request**:
```json
{
  "test_id": "test-uuid",
  "student_id": "student-uuid",
  "answers": [
    {
      "question_id": "q1-uuid",
      "answer": "C",
      "time_spent_seconds": 45
    },
    {
      "question_id": "q2-uuid",
      "answer": "Paris",
      "time_spent_seconds": 30
    },
    {
      "question_id": "q3-uuid",
      "answer": "Long essay text here...",
      "time_spent_seconds": 1200
    }
  ],
  "total_time_seconds": 1800
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-uuid",
    "test_id": "test-uuid",
    "student_id": "student-uuid",
    "submitted_at": "2025-02-15T11:00:00Z",
    "auto_graded": true,
    "score": 18,
    "max_score": 20,
    "percentage": 90.0,
    "feedback": {
      "q1-uuid": {
        "correct": true,
        "points_earned": 2,
        "points_possible": 2
      },
      "q2-uuid": {
        "correct": true,
        "points_earned": 2,
        "points_possible": 2
      },
      "q3-uuid": {
        "pending_review": true,
        "ai_feedback": "Strong analysis with good examples..."
      }
    }
  }
}
```

### Get Submissions for Test

**Endpoint**: `GET /api/tests/{test_id}/submissions`

**Query Parameters**:
- `status`: `graded`, `pending`, `in_progress`
- `student_id`: Filter by student

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "submission_id": "sub1-uuid",
      "student_id": "student-uuid",
      "student_name": "John Doe",
      "submitted_at": "2025-02-15T11:00:00Z",
      "score": 18,
      "max_score": 20,
      "percentage": 90.0,
      "status": "graded",
      "time_taken_seconds": 1800
    }
  ],
  "total": 25,
  "graded": 20,
  "pending": 3,
  "in_progress": 2
}
```

### Grade Submission

**Endpoint**: `PUT /api/submissions/{submission_id}/grade`

**Request**:
```json
{
  "scores": [
    {
      "question_id": "q3-uuid",
      "points_earned": 16,
      "feedback": "Good analysis. Consider adding more examples."
    }
  ],
  "overall_feedback": "Strong performance overall."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "submission_id": "submission-uuid",
    "total_score": 18,
    "max_score": 20,
    "percentage": 90.0,
    "graded_at": "2025-02-15T12:00:00Z"
  }
}
```

## Documents API

### Upload Document

**Endpoint**: `POST /api/documents`

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data**:
```
file: [binary file data]
module_id: module-uuid
title: Chapter 1 Notes
description: Introduction to Python
tags: python,chapter1,notes
visible_to_students: true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "module_id": "module-uuid",
    "filename": "chapter1_notes.pdf",
    "title": "Chapter 1 Notes",
    "file_type": "pdf",
    "file_size": 1048576,
    "url": "/uploads/doc-uuid/chapter1_notes.pdf",
    "uploaded_at": "2025-02-15T10:30:00Z",
    "tags": ["python", "chapter1", "notes"]
  }
}
```

### List Documents

**Endpoint**: `GET /api/documents`

**Query Parameters**:
- `module_id`: Required
- `file_type`: Filter by type (pdf, docx, etc.)
- `tags`: Filter by tags
- `visible_to_students`: true/false

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "doc-uuid",
      "filename": "chapter1_notes.pdf",
      "title": "Chapter 1 Notes",
      "file_type": "pdf",
      "file_size": 1048576,
      "url": "/uploads/...",
      "uploaded_at": "2025-02-15T10:30:00Z",
      "download_count": 15
    }
  ],
  "total": 8
}
```

### Delete Document

**Endpoint**: `DELETE /api/documents/{document_id}`

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Analytics API

### Module Analytics

**Endpoint**: `GET /api/analytics/modules/{module_id}`

**Response**:
```json
{
  "module_id": "module-uuid",
  "module_name": "Introduction to Python",
  "stats": {
    "total_students": 25,
    "active_students": 22,
    "total_tests": 10,
    "avg_completion_rate": 87.5,
    "avg_score": 82.3,
    "total_submissions": 218
  },
  "performance_distribution": {
    "90-100": 6,
    "80-89": 10,
    "70-79": 5,
    "60-69": 3,
    "<60": 1
  },
  "engagement": {
    "avg_logins_per_week": 4.2,
    "avg_time_per_session_minutes": 35,
    "document_views": 342
  }
}
```

### Student Analytics

**Endpoint**: `GET /api/analytics/students/{student_id}`

**Query Parameters**:
- `module_id`: Required

**Response**:
```json
{
  "student_id": "student-uuid",
  "module_id": "module-uuid",
  "performance": {
    "average_score": 85.5,
    "median_score": 86.0,
    "highest_score": 95.0,
    "lowest_score": 72.0,
    "tests_completed": 8,
    "tests_total": 10,
    "completion_rate": 80.0
  },
  "trends": {
    "score_trend": "improving",
    "recent_scores": [72, 78, 82, 88, 90]
  },
  "engagement": {
    "total_time_hours": 12.5,
    "avg_session_minutes": 35,
    "last_active": "2025-02-14T15:30:00Z",
    "login_count": 24
  },
  "predictions": {
    "predicted_final_score": 87.0,
    "confidence": 0.85,
    "risk_level": "low"
  }
}
```

### Test Analytics

**Endpoint**: `GET /api/analytics/tests/{test_id}`

**Response**:
```json
{
  "test_id": "test-uuid",
  "test_name": "Midterm Exam",
  "stats": {
    "submissions": 25,
    "average_score": 78.5,
    "median_score": 81.0,
    "highest_score": 95.0,
    "lowest_score": 52.0,
    "std_deviation": 12.3,
    "avg_time_minutes": 45.2
  },
  "question_analysis": [
    {
      "question_id": "q1-uuid",
      "question_text": "What is...",
      "correct_count": 22,
      "incorrect_count": 3,
      "difficulty_actual": 0.88,
      "avg_time_seconds": 45
    }
  ],
  "common_mistakes": [
    {
      "question_id": "q5-uuid",
      "wrong_answer": "B",
      "count": 12,
      "percentage": 48.0
    }
  ]
}
```

## AI Features API

### Generate AI Feedback

**Endpoint**: `POST /api/ai/feedback`

**Request**:
```json
{
  "question_id": "question-uuid",
  "student_answer": "Student's answer text",
  "correct_answer": "Expected answer",
  "rubric_id": "rubric-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "feedback": "Your answer demonstrates good understanding...",
    "strengths": [
      "Clear explanation of main concept",
      "Good use of examples"
    ],
    "improvements": [
      "Could elaborate more on secondary effects",
      "Consider adding citations"
    ],
    "score": 16,
    "max_score": 20,
    "rubric_scores": {
      "content": 5,
      "analysis": 4,
      "organization": 4,
      "grammar": 3
    }
  }
}
```

### Generate Questions from Document

**Endpoint**: `POST /api/ai/generate-questions`

**Request**:
```json
{
  "document_id": "doc-uuid",
  "count": 10,
  "types": ["multiple_choice", "short_answer"],
  "difficulty": "mixed",
  "topics": ["loops", "functions"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "type": "multiple_choice",
        "question_text": "What is the purpose of a for loop?",
        "choices": [...],
        "correct_answer": "B",
        "explanation": "...",
        "difficulty": "easy",
        "suggested_points": 2
      }
    ],
    "count": 10
  }
}
```

### RAG Query (Document Q&A)

**Endpoint**: `POST /api/ai/rag/query`

**Request**:
```json
{
  "module_id": "module-uuid",
  "query": "What are the key concepts in Chapter 3?",
  "document_ids": ["doc1-uuid", "doc2-uuid"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "answer": "The key concepts in Chapter 3 include...",
    "sources": [
      {
        "document_id": "doc1-uuid",
        "document_title": "Chapter 3 Notes",
        "page": 5,
        "excerpt": "Relevant text excerpt...",
        "relevance_score": 0.92
      }
    ],
    "confidence": 0.88
  }
}
```

### AI Insights

**Endpoint**: `GET /api/ai/insights/module/{module_id}`

**Response**:
```json
{
  "success": true,
  "data": {
    "at_risk_students": [
      {
        "student_id": "student-uuid",
        "student_name": "Alice Johnson",
        "risk_level": "high",
        "factors": [
          "Declining scores (85% → 68%)",
          "Low engagement (2 logins in 14 days)"
        ],
        "recommendations": [
          "Schedule 1-on-1 meeting",
          "Provide additional resources"
        ]
      }
    ],
    "difficult_topics": [
      {
        "topic": "Recursion",
        "avg_score": 62.5,
        "question_count": 8,
        "recommendation": "Consider additional practice problems"
      }
    ],
    "engagement_trends": {
      "trend": "declining",
      "current_active_rate": 78,
      "previous_active_rate": 92
    }
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  },
  "timestamp": "2025-02-15T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | Invalid or expired token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `AI_SERVICE_ERROR` | 503 | AI service unavailable |

### Example Errors

**Authentication Error**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token has expired",
    "details": {
      "expired_at": "2025-02-15T09:00:00Z"
    }
  }
}
```

**Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "email": "Invalid email format",
        "password": "Password must be at least 8 characters"
      }
    }
  }
}
```

## Usage Examples

### Python

```python
import requests

BASE_URL = "http://localhost:8000"

# Login
response = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username": "teacher123",
    "password": "SecurePass123!"
})
data = response.json()
token = data["access_token"]

# Create module
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/api/modules",
    headers=headers,
    json={
        "name": "Python 101",
        "description": "Learn Python basics"
    }
)
module = response.json()["data"]
print(f"Module created: {module['access_code']}")

# List students
response = requests.get(
    f"{BASE_URL}/api/modules/{module['id']}/students",
    headers=headers
)
students = response.json()["data"]
print(f"Total students: {len(students)}")
```

### JavaScript (Node.js)

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Login
const { data: authData } = await axios.post(`${BASE_URL}/api/auth/login`, {
  username: 'teacher123',
  password: 'SecurePass123!'
});

const token = authData.access_token;

// Create test
const { data: testData } = await axios.post(
  `${BASE_URL}/api/tests`,
  {
    module_id: 'module-uuid',
    name: 'Quiz 1',
    duration_minutes: 30,
    question_ids: ['q1', 'q2', 'q3']
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);

console.log('Test created:', testData.data);
```

### cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher123","password":"SecurePass123!"}'

# Use token
TOKEN="your-token-here"

# Get modules
curl -X GET http://localhost:8000/api/modules \
  -H "Authorization: Bearer $TOKEN"

# Create question
curl -X POST http://localhost:8000/api/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": "module-uuid",
    "type": "multiple_choice",
    "question_text": "What is 2+2?",
    "choices": [
      {"text": "3", "is_correct": false},
      {"text": "4", "is_correct": true}
    ],
    "points": 1
  }'
```

## Webhooks

### Configure Webhook

**Endpoint**: `POST /api/webhooks`

**Request**:
```json
{
  "url": "https://your-server.com/webhook",
  "events": [
    "test.submitted",
    "student.enrolled",
    "module.created"
  ],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

**test.submitted**:
```json
{
  "event": "test.submitted",
  "timestamp": "2025-02-15T10:30:00Z",
  "data": {
    "test_id": "test-uuid",
    "student_id": "student-uuid",
    "score": 85.0,
    "submission_id": "submission-uuid"
  }
}
```

## Rate Limiting Best Practices

1. **Cache responses** when possible
2. **Batch requests** instead of individual calls
3. **Use pagination** for large datasets
4. **Implement exponential backoff** for retries
5. **Monitor rate limit headers**

## Next Steps

- [Getting Started](Getting-Started): Quick start guide
- [User Manual](User-Manual): Complete user guide
- [FAQ](FAQ): Common questions

---

**Need help?** [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues) | [Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)
