# Creating Tests Guide

Complete guide to creating, managing, and analyzing tests in AI Education Pilot.

## Table of Contents

1. [Question Types](#question-types)
2. [Creating Questions](#creating-questions)
3. [Creating Tests](#creating-tests)
4. [Test Settings](#test-settings)
5. [Question Bank Management](#question-bank-management)
6. [AI-Assisted Test Creation](#ai-assisted-test-creation)
7. [Grading and Rubrics](#grading-and-rubrics)
8. [Best Practices](#best-practices)

## Question Types

AI Education Pilot supports multiple question types:

### 1. Multiple Choice

**Use cases**:
- Objective knowledge assessment
- Quick comprehension checks
- Large-scale testing

**Features**:
- 2-10 answer choices
- Single or multiple correct answers
- Randomize choice order
- Partial credit support

**Example**:
```
Question: What is the capital of France?
A) London
B) Berlin
C) Paris ✓
D) Madrid

Points: 1
Explanation: Paris is the capital and most populous city of France.
```

### 2. True/False

**Use cases**:
- Fact verification
- Quick assessments
- Prerequisite checks

**Features**:
- Binary choice (True/False)
- Optional explanation
- Fast to create and grade

**Example**:
```
Question: Python is a compiled programming language.
Answer: False ✓

Explanation: Python is an interpreted language, not compiled.
```

### 3. Short Answer

**Use cases**:
- Definitions
- Brief explanations
- Formula answers

**Features**:
- Text input (1-3 sentences)
- Keyword matching
- AI-assisted grading
- Case-sensitive option

**Example**:
```
Question: Define polymorphism in object-oriented programming.
Expected keywords: inheritance, multiple forms, methods, override
AI grading: Enabled
Max length: 200 characters
```

### 4. Essay/Long Answer

**Use cases**:
- Critical thinking
- In-depth analysis
- Creative writing

**Features**:
- Rich text editor
- No character limit
- AI feedback generation
- Rubric-based grading

**Example**:
```
Question: Discuss the impact of climate change on coastal ecosystems.
Min length: 500 words
Max length: 2000 words
Rubric: Climate Essay Rubric
AI feedback: Enabled
```

### 5. Fill in the Blank (Coming Soon)

**Use cases**:
- Vocabulary testing
- Sentence completion
- Code completion

### 6. Matching (Coming Soon)

**Use cases**:
- Pair concepts
- Match terms to definitions
- Connect relationships

## Creating Questions

### Step-by-Step: Multiple Choice

1. Navigate to module dashboard
2. Click **Questions** tab
3. Click **+ Add Question**
4. Select **Multiple Choice**

**Fill in details**:

```
Question Text: What is the time complexity of binary search?

Choices:
[ ] O(n²)
[ ] O(n log n)
[✓] O(log n)  ← Mark correct answer
[ ] O(n)

Points: 2
Difficulty: Medium
Tags: algorithms, complexity, search

Explanation (optional):
Binary search divides the search space in half each iteration,
resulting in logarithmic time complexity.
```

5. Click **Save**

### Step-by-Step: Short Answer

1. Click **+ Add Question** → **Short Answer**

```
Question Text: What does CPU stand for?

Expected Answer: Central Processing Unit
(AI will check for semantic similarity)

Accept variations:
☑ Case insensitive
☑ Ignore whitespace
☐ Exact match only

Points: 1
AI Feedback: ☑ Enabled

Grading Keywords (optional):
- central
- processing
- unit
```

2. Click **Save**

### Step-by-Step: Essay Question

1. Click **+ Add Question** → **Essay**

```
Question Text:
Analyze the theme of isolation in Mary Shelley's Frankenstein.
Discuss at least three examples from the text.

Requirements:
- Minimum words: 500
- Maximum words: 1500
- Citations required: Yes

Rubric: Literary Analysis Rubric (5 criteria, 20 points total)

AI Feedback:
☑ Generate personalized feedback
☑ Check for plagiarism indicators
☑ Assess argument strength
☑ Evaluate evidence usage

Points: 20
Difficulty: Hard
Tags: literature, analysis, frankenstein
```

2. Attach or create rubric (see [Rubric Management](Rubric-Management))
3. Click **Save**

## Creating Tests

### Method 1: Manual Test Creation

1. Go to **Tests** tab
2. Click **+ Create Test**

**Test Settings**:
```
Test Name: Midterm Exam - Python Fundamentals

Description:
Covers chapters 1-5: variables, loops, functions, and data structures

Instructions:
- You have 60 minutes to complete
- You may use course notes
- No collaboration allowed

Settings:
Duration: 60 minutes
Available from: 2025-02-01 09:00
Available until: 2025-02-07 23:59
Attempts allowed: 2
Show correct answers: After due date
Randomize questions: Yes
Require sequential completion: No
```

3. Click **Add Questions**
4. Select from question bank or create new
5. Drag to reorder questions
6. Set point values
7. Click **Save Draft** or **Publish**

### Method 2: Quick Test from Template

1. Click **Use Template**
2. Choose template:
   - Quiz (5-10 questions, 15 min)
   - Mid-length Test (10-20 questions, 30 min)
   - Full Exam (20+ questions, 60+ min)
3. Customize questions
4. Publish

### Method 3: AI-Generated Test

See [AI-Assisted Test Creation](#ai-assisted-test-creation)

## Test Settings

### Access Control

**Availability Window**:
```
Start date: 2025-02-01 09:00
End date: 2025-02-07 23:59
Grace period: 15 minutes
```

**Access Restrictions**:
- Require password (optional)
- IP address restrictions (optional)
- Device limitations (optional)

### Timing

**Time Limit**:
```
Duration: 45 minutes
Auto-submit: Yes (when time expires)
Show timer: Yes
Warning at: 5 minutes remaining
```

**Scheduling**:
- Immediate availability
- Scheduled release
- Custom availability dates

### Attempts

```
Maximum attempts: 2
Grading method:
  ○ Highest score
  ○ Latest attempt
  ○ Average of attempts
  ● First attempt

Time between attempts: 24 hours
```

### Display Options

**Question Display**:
```
☑ Randomize question order
☐ Randomize choice order (MC questions)
☑ Show one question at a time
☐ Allow backtracking
```

**Feedback Options**:
```
Show correct answers:
  ○ Immediately after submission
  ○ After due date
  ● Never
  ○ After all attempts used

Show score:
  ● Immediately
  ○ After due date

Show AI feedback:
  ● Immediately
  ○ After due date
```

### Proctoring (if enabled)

```
☐ Require webcam
☐ Full-screen mode enforced
☐ Disable copy/paste
☐ Block browser navigation
☐ Record screen activity
☐ Lockdown browser required
```

## Question Bank Management

### Organizing Questions

**Tags**:
- Add multiple tags per question
- Filter by tag when creating tests
- Examples: `chapter-3`, `difficult`, `review`

**Categories**:
- Organize by topic, chapter, or learning objective
- Nested categories supported
- Example structure:
  ```
  Mathematics
  ├── Algebra
  │   ├── Linear Equations
  │   └── Quadratic Equations
  └── Geometry
      ├── Triangles
      └── Circles
  ```

**Difficulty Levels**:
- Easy, Medium, Hard
- Filter questions by difficulty
- Balance test difficulty

### Importing Questions

**From CSV**:
1. Download template CSV
2. Fill in questions (see format below)
3. Go to **Questions** → **Import**
4. Upload CSV
5. Review and confirm

**CSV Format**:
```csv
type,question,choice_a,choice_b,choice_c,choice_d,correct,points,tags
multiple_choice,"What is 2+2?","3","4","5","6","B",1,"math,easy"
true_false,"The sky is blue",,,,,True,1,"general"
short_answer,"Capital of France?",,,,,"Paris",2,"geography"
```

**From QTI** (Question and Test Interoperability):
- Export from other LMS (Canvas, Moodle, etc.)
- Import QTI package
- AI Pilot converts to native format

### Bulk Actions

```
Select multiple questions:
☑ Question 1
☑ Question 2
☑ Question 5

Actions:
- Change difficulty
- Add/remove tags
- Duplicate
- Delete
- Export
- Add to test
```

## AI-Assisted Test Creation

### Generate Questions from Content

1. Upload course document (PDF, DOCX, etc.)
2. Go to **Questions** → **AI Generate**
3. Configure:
   ```
   Source: Chapter 3.pdf
   Number of questions: 10
   Question types:
     ☑ Multiple Choice (60%)
     ☑ Short Answer (30%)
     ☑ Essay (10%)
   Difficulty: Mixed
   Topics to focus: loops, functions
   ```
4. Click **Generate**
5. Review AI-generated questions
6. Edit as needed
7. Save to question bank

### AI Question Suggestions

While creating a question:
1. Start typing question text
2. Click **Get AI Suggestions**
3. AI provides:
   - Improved question phrasing
   - Answer choices (for MC)
   - Expected answer patterns
   - Difficulty estimate
4. Accept or modify suggestions

### Auto-Generate Test

1. Click **AI Create Test**
2. Provide inputs:
   ```
   Test topic: Introduction to Databases
   Number of questions: 15
   Duration: 30 minutes
   Difficulty level: Medium
   Learning objectives:
     - Understand relational model
     - Write basic SQL queries
     - Explain normalization
   ```
3. AI generates complete test
4. Review and customize
5. Publish

## Grading and Rubrics

### Auto-Grading

**Automatically graded**:
- Multiple Choice
- True/False
- Short Answer (with keyword matching)

**AI-Assisted grading**:
- Short Answer (semantic analysis)
- Essays (using rubrics)

**Manual grading required**:
- Complex essays
- Project submissions
- Creative work

### Creating Rubrics

See detailed guide: [Rubric Management](Rubric-Management)

**Quick Rubric Creation**:
1. Go to **Rubrics** tab
2. Click **+ New Rubric**
3. Add criteria:
   ```
   Rubric Name: Essay Evaluation

   Criterion 1: Thesis Statement (5 points)
   - 5: Clear, compelling thesis
   - 3-4: Adequate thesis, somewhat clear
   - 1-2: Weak or unclear thesis
   - 0: No thesis present

   Criterion 2: Evidence (5 points)
   - 5: Strong, relevant evidence with analysis
   - 3-4: Adequate evidence, limited analysis
   - 1-2: Weak or insufficient evidence
   - 0: No evidence provided

   ... (add more criteria)

   Total: 20 points
   ```
4. Click **Save**

### Attaching Rubrics to Questions

1. Edit essay question
2. Under **Grading**, select rubric
3. Enable **AI-Assisted Grading**
4. Save

**AI uses rubric to**:
- Score each criterion
- Provide feedback per criterion
- Calculate total score
- Suggest improvements

### Manual Grading Interface

1. Go to **Tests** → Select test → **Submissions**
2. Click student submission
3. View answers
4. Grade manually:
   ```
   Question 1: [Auto-graded] ✓ Correct (2/2 points)

   Question 2: [Essay - needs grading]
   Student answer: [shows text]

   Rubric scoring:
   - Thesis: 4/5 points
   - Evidence: 5/5 points
   - Organization: 3/5 points
   - Grammar: 4/5 points

   Total: 16/20 points

   Feedback: [AI-generated] "Strong use of evidence..."
   [Edit feedback or add comments]
   ```
5. Click **Save Grade**

## Best Practices

### Question Writing

1. **Be Clear and Specific**
   - ❌ "What happens in the process?"
   - ✅ "What are the three stages of mitosis?"

2. **Avoid Ambiguity**
   - ❌ "Most programming languages use..."
   - ✅ "Python uses which data structure for..."

3. **Test Understanding, Not Memorization**
   - ❌ "In what year was Python created?"
   - ✅ "Why is Python considered a high-level language?"

4. **Use Distractors Wisely** (for MC)
   - Make incorrect choices plausible
   - Avoid "All of the above" or "None of the above"
   - Each choice should be similar length

5. **Provide Context When Needed**
   ```
   Given the following code snippet:
   ```python
   def mystery(n):
       if n <= 1:
           return 1
       return n * mystery(n - 1)
   ```
   What does mystery(5) return?
   ```

### Test Design

1. **Balance Difficulty**
   - 60% Easy, 30% Medium, 10% Hard
   - Start with easier questions
   - End with challenging questions

2. **Align with Learning Objectives**
   - Each question should map to a learning outcome
   - Cover all important topics
   - Avoid trivial questions

3. **Set Appropriate Time Limits**
   - Rule of thumb: 1-2 minutes per MC question
   - 5-10 minutes per short answer
   - 20-30 minutes per essay

4. **Mix Question Types**
   - Combine MC, short answer, essay
   - Different types test different skills
   - Keeps students engaged

5. **Provide Clear Instructions**
   ```
   Instructions:
   - Read all questions carefully
   - Answer all questions; partial credit is available
   - Show your work for math problems
   - Cite sources for essay questions
   - You may use your textbook and notes
   ```

### Using AI Feedback Effectively

1. **Enable for subjective questions** (essays, short answers)
2. **Review AI feedback** before releasing to students
3. **Customize AI feedback** if needed
4. **Use rubrics** to guide AI feedback generation
5. **Combine AI and human feedback** for best results

### Test Security

1. **Randomize questions and choices**
2. **Create question pools** (random selection per student)
3. **Use time limits**
4. **Disable backtracking** for high-stakes exams
5. **Enable proctoring** if available
6. **Limit attempts**

## Common Workflows

### Weekly Quiz

```
1. Create 5-10 MC questions from week's material
2. Set 15-minute time limit
3. Allow 1 attempt
4. Auto-release every Friday at 5 PM
5. Due Sunday at 11:59 PM
6. Show correct answers after due date
```

### Midterm Exam

```
1. Create 30-40 questions (MC, short answer, essay)
2. Set 90-minute time limit
3. Schedule for specific exam period
4. Randomize questions
5. One attempt only
6. Manual grading for essays
7. Release grades after all students complete
```

### Practice Test

```
1. Create 20+ questions covering all topics
2. No time limit
3. Unlimited attempts
4. Show correct answers immediately
5. Provide AI feedback for wrong answers
6. Not graded (or weighted 0%)
```

## Troubleshooting

### Students can't see test

**Check**:
- Test is published (not draft)
- Current date/time is within availability window
- Students are enrolled in module
- No access restrictions blocking them

### Questions not saving

**Try**:
- Check all required fields are filled
- Ensure at least one correct answer for MC
- Verify rich text editor content is valid
- Check browser console for errors

### AI feedback not generating

**Verify**:
- OpenAI API key is configured
- AI feedback is enabled in test settings
- Question type supports AI feedback
- API key has available credits

## Next Steps

- **[Managing Students](Managing-Students)**: Track student progress
- **[Analytics Dashboard](Analytics-Dashboard)**: Analyze test results
- **[AI Feedback System](AI-Feedback-System)**: Deep dive into AI features
- **[Rubric Management](Rubric-Management)**: Create detailed rubrics

---

**Need help?** [FAQ](FAQ) | [Troubleshooting](Troubleshooting) | [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
