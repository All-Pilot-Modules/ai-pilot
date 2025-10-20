# User Manual

Complete guide to using AI Education Pilot for teachers and administrators.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Module Management](#module-management)
4. [Creating and Managing Tests](#creating-and-managing-tests)
5. [Student Management](#student-management)
6. [Document Management](#document-management)
7. [Analytics and Reporting](#analytics-and-reporting)
8. [Settings and Configuration](#settings-and-configuration)

## Getting Started

### Signing Up

1. Navigate to your AI Pilot instance (e.g., `http://localhost:3000`)
2. Click **Sign Up** in the top right
3. Fill in your information:
   - **Username**: Choose a unique username
   - **Email**: Your professional email address
   - **Password**: Strong password (8+ characters)
   - **Role**: Select "Teacher" or "Administrator"
4. Click **Create Account**

### First Login

1. Enter your credentials on the login page
2. You'll be redirected to your home dashboard
3. Complete your profile:
   - Click your avatar → **Profile**
   - Add your name, organization, and bio
   - Upload a profile picture (optional)

## Dashboard Overview

### Home Dashboard

The home dashboard displays:

- **Active Modules**: Number of modules you've created
- **Total Students**: Students enrolled across all modules
- **AI Insights**: AI-generated feedback count
- **Completion Rate**: Average test completion rate

**Quick Actions**:
- Create new module
- View recent activity
- Access analytics
- Check notifications

### Navigation

**Sidebar Menu**:
- **Home**: Dashboard overview
- **My Modules**: List of your modules
- **Students**: Student management
- **Documents**: Course materials
- **Analytics**: Performance reports
- **Settings**: Account configuration
- **Help**: Documentation and support

**Top Bar**:
- Search modules and students
- Notifications bell
- Profile dropdown (Profile, Settings, Logout)

## Module Management

### Creating a Module

1. Click **Create Module** from home dashboard
2. Fill in module details:
   - **Module Name**: e.g., "Introduction to Python"
   - **Description**: Brief overview of the module
   - **Subject**: Choose subject area (optional)
   - **Grade Level**: Target grade/level (optional)
3. Click **Create**
4. You'll receive a 6-digit **access code**

### Module Settings

Access via: **Dashboard** → Select module → **Settings**

**Available Options**:
- **Module Information**: Edit name, description
- **Access Control**:
  - Regenerate access code
  - Enable/disable student enrollment
  - Set enrollment deadline
- **Test Settings**:
  - Allow late submissions
  - Show correct answers after submission
  - Randomize question order
- **Grading**:
  - Choose grading scale
  - Set passing threshold
  - Enable/disable AI feedback

### Sharing Modules

**Method 1: Access Code**
- Share the 6-digit code with students
- Students visit `/join` and enter the code

**Method 2: Direct Link**
- Copy the join link: `your-domain.com/join/ACCESS_CODE`
- Share via email, LMS, or messaging

**Method 3: Email Invitation** (if configured)
- Enter student email addresses
- System sends automatic invitation

### Archiving/Deleting Modules

**Archive** (preserves data):
1. Go to module settings
2. Click **Archive Module**
3. Confirm - module moves to "Archived" section

**Delete** (permanent):
1. Go to module settings
2. Click **Delete Module**
3. Type module name to confirm
4. Click **Permanently Delete**

⚠️ Deletion cannot be undone!

## Creating and Managing Tests

See detailed guide: [Creating Tests](Creating-Tests)

### Quick Test Creation

1. Navigate to module dashboard
2. Click **Questions** tab
3. Click **+ Add Question**
4. Select question type:
   - Multiple Choice
   - True/False
   - Short Answer
   - Essay
5. Fill in question details
6. Set point value
7. Click **Save**

### Test Organization

**Question Bank**:
- All questions are stored in a question bank
- Tag questions by topic, difficulty, or learning objective
- Reuse questions across multiple tests

**Creating Tests**:
1. Go to **Tests** tab
2. Click **+ Create Test**
3. Add test details (name, description, time limit)
4. Select questions from question bank
5. Set test availability dates
6. Click **Publish**

## Student Management

See detailed guide: [Managing Students](Managing-Students)

### Enrolling Students

**Self-Enrollment**:
- Share access code or join link
- Students create accounts and join automatically

**Manual Enrollment**:
1. Go to **Students** tab
2. Click **+ Add Student**
3. Enter student email or username
4. Click **Add**

**Bulk Import**:
1. Prepare CSV file with columns: `email, first_name, last_name`
2. Go to **Students** → **Import**
3. Upload CSV file
4. Review and confirm

### Viewing Student Progress

**Individual Student**:
1. Click on student name in Students list
2. View:
   - Test scores and submissions
   - Progress percentage
   - Time spent on activities
   - AI feedback received
   - Performance trends

**Class Overview**:
- Go to **Analytics** tab
- View class-wide statistics:
  - Average scores
  - Completion rates
  - Question difficulty analysis
  - Common mistakes

### Managing Student Access

**Remove Student**:
1. Go to Students tab
2. Click student → **Remove from Module**
3. Confirm

**Reset Student Progress**:
1. Click student → **Reset Progress**
2. Choose what to reset (tests, submissions, etc.)
3. Confirm

## Document Management

See detailed guide: [Document Management](Document-Management)

### Uploading Documents

1. Go to **Documents** tab
2. Click **+ Upload Document**
3. Select file(s) or drag and drop
4. Add metadata:
   - Title (auto-filled from filename)
   - Description (optional)
   - Tags (optional)
5. Click **Upload**

**Supported Formats**:
- Documents: PDF, DOCX, DOC, TXT, RTF
- Presentations: PPTX, PPT
- Spreadsheets: XLSX, XLS
- Images: JPG, PNG, GIF, SVG
- Archives: ZIP, RAR

**File Size Limits**:
- Default: 10MB per file
- Can be increased in backend configuration

### Organizing Documents

**Folders**:
1. Click **New Folder**
2. Name the folder
3. Drag documents into folder

**Tags**:
- Add tags to documents for easy filtering
- Click document → **Edit** → Add tags
- Filter by tag in Documents view

### Document Actions

**View/Download**:
- Click document card to preview
- Click **Download** icon to save locally

**Share with Students**:
- Toggle **Visible to Students** switch
- Students see document in their module view

**Edit**:
- Click **Edit** icon
- Update title, description, or tags
- Click **Save**

**Delete**:
- Click **Delete** icon
- Confirm deletion

### Document Q&A (RAG Feature)

If RAG is enabled:
1. Upload course documents
2. Go to **Ask Questions** tab
3. Type question about uploaded content
4. AI retrieves relevant information and answers

Example: "What are the key concepts in Chapter 3?"

## Analytics and Reporting

See detailed guide: [Analytics Dashboard](Analytics-Dashboard)

### Performance Analytics

**Student Performance**:
- Individual student scores
- Class average comparison
- Percentile rankings
- Progress over time

**Test Analytics**:
- Average scores per test
- Question difficulty (% correct)
- Time to complete
- Common wrong answers

**Engagement Metrics**:
- Login frequency
- Time spent in module
- Document views
- Test attempt rates

### Generating Reports

1. Go to **Analytics** → **Reports**
2. Select report type:
   - Student Progress Report
   - Test Results Summary
   - Engagement Report
   - Performance Trends
3. Choose date range
4. Select students (all or specific)
5. Click **Generate Report**

**Export Options**:
- CSV (for Excel)
- JSON (for data analysis)
- PDF (for printing/sharing)

### AI-Generated Insights

AI analyzes data to provide:
- Students who need additional support
- Topics with low comprehension
- Recommended intervention strategies
- Predicted performance trends

Access: **Analytics** → **AI Insights**

## Settings and Configuration

### Account Settings

Access: **Profile Icon** → **Settings**

**Account Information**:
- Username, email
- First name, last name
- Phone number
- Bio/About
- Organization, job title
- Location, website

**Password & Security**:
- Change password
- Enable two-factor authentication (if available)
- View active sessions
- Download account data

**Preferences**:
- Theme (Light, Dark, System)
- Language
- Timezone
- Date format

**Notifications**:
- Email notifications
  - New student enrollments
  - Test submissions
  - Low performance alerts
  - Weekly summary
- In-app notifications
- Push notifications (if enabled)

### Application Settings

**AI Configuration** (Admin only):
- OpenAI API key
- Model selection (GPT-4, GPT-3.5)
- Feedback generation settings
- RAG configuration

**Integration Settings**:
- LMS integration (Canvas, Moodle, etc.)
- Email service (SMTP settings)
- Calendar integration

**Privacy & Data**:
- Data retention policies
- Export all data
- Delete account

## Common Tasks

### How do I...

**...create a graded assignment?**
1. Create test questions
2. Set point values
3. Publish test
4. Set due date
5. Enable AI feedback (optional)
6. Students submit → view results in Analytics

**...give personalized feedback?**
- Enable AI feedback in module settings
- AI automatically generates feedback for each submission
- Or manually add comments to individual submissions

**...see who hasn't submitted a test?**
1. Go to **Tests** tab
2. Click on test
3. View **Submissions** section
4. Filter by "Not Submitted"

**...export grades?**
1. Go to **Analytics** → **Reports**
2. Select "Test Results Summary"
3. Choose test and date range
4. Export as CSV
5. Open in Excel/Google Sheets

**...reset a student's test?**
1. Go to **Students** → Select student
2. Find test in submissions
3. Click **Reset Submission**
4. Student can retake test

**...reorder questions in a test?**
1. Edit test
2. Drag and drop questions
3. Click **Save Order**

**...make announcements?**
1. Go to module dashboard
2. Click **Announcements**
3. Write message
4. Click **Post**
5. Students see on their dashboard

## Tips for Success

1. **Start Simple**: Create one module and test all features before scaling
2. **Use AI Feedback**: Save time with automated, personalized feedback
3. **Monitor Analytics**: Check dashboard weekly for insights
4. **Organize Documents**: Use folders and tags from the start
5. **Engage Students**: Post regular announcements and feedback
6. **Backup Data**: Export important data regularly
7. **Set Clear Expectations**: Configure module settings before enrolling students
8. **Use Tags**: Tag questions and documents for easy retrieval
9. **Review AI Insights**: Let AI identify struggling students early
10. **Ask for Help**: Check [FAQ](FAQ) or [GitHub Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Quick search
- **Ctrl/Cmd + N**: New module/test (context-dependent)
- **Ctrl/Cmd + S**: Save (when editing)
- **Esc**: Close modal/dialog

## Mobile Usage

AI Pilot is fully responsive:
- Access from mobile browser
- All features available
- Optimized touch interface
- Supports tablets and phones

## Need More Help?

- **[FAQ](FAQ)**: Common questions
- **[Troubleshooting](Troubleshooting)**: Fix issues
- **[Video Tutorials](Video-Tutorials)**: Watch step-by-step guides
- **[API Documentation](API-Documentation)**: For developers
- **[GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)**: Report bugs
- **[Discussions](https://github.com/All-Pilot-Modules/ai-pilot/discussions)**: Ask community

---

**Ready to dive deeper?** Explore our specialized guides:
- [Creating Tests](Creating-Tests)
- [Managing Students](Managing-Students)
- [AI Feedback System](AI-Feedback-System)
- [Analytics Dashboard](Analytics-Dashboard)
