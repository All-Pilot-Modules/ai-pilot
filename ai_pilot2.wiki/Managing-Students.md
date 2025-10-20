# Managing Students Guide

Complete guide to enrolling, tracking, and supporting students in AI Education Pilot.

## Table of Contents

1. [Student Enrollment](#student-enrollment)
2. [Viewing Student Information](#viewing-student-information)
3. [Tracking Progress](#tracking-progress)
4. [Managing Submissions](#managing-submissions)
5. [Communication](#communication)
6. [Bulk Operations](#bulk-operations)
7. [Student Analytics](#student-analytics)
8. [Intervention Strategies](#intervention-strategies)

## Student Enrollment

### Method 1: Self-Enrollment with Access Code

**How it works**:
1. You create a module → receive 6-digit access code
2. Share code with students
3. Students visit `/join` page
4. Enter access code → automatically enrolled

**Steps to share code**:
1. Go to module dashboard
2. Copy access code from top banner
3. Share via:
   - Email
   - Class announcement
   - LMS post
   - Written on board

**Example message to students**:
```
Join the "Introduction to Python" module:
1. Go to: https://your-pilot-instance.com/join
2. Enter code: ABC123
3. Create an account or sign in
```

### Method 2: Direct Join Link

**Generate link**:
```
https://your-domain.com/join/ABC123
```

**Share link**:
- Email to student list
- Post in LMS
- Add to syllabus
- QR code for physical handouts

### Method 3: Manual Enrollment

**Add individual student**:
1. Go to module dashboard → **Students** tab
2. Click **+ Add Student**
3. Search by:
   - Email address
   - Username
   - Student ID
4. Select student
5. Click **Add to Module**

**Student receives**:
- Email notification (if enabled)
- Module appears in their dashboard

### Method 4: Bulk Import from CSV

**Prepare CSV file**:
```csv
email,first_name,last_name,student_id
john@example.com,John,Doe,12345
jane@example.com,Jane,Smith,12346
alice@example.com,Alice,Johnson,12347
```

**Import steps**:
1. Go to **Students** tab
2. Click **Import Students**
3. Upload CSV file
4. Preview import (review for errors)
5. Choose options:
   ```
   ☑ Send welcome email
   ☑ Create accounts for new users
   ☐ Overwrite existing data
   ```
6. Click **Confirm Import**

**Result**:
- Accounts created (if needed)
- Students enrolled
- Welcome emails sent

### Method 5: LMS Integration

If integrated with Canvas, Moodle, etc.:
1. Link AI Pilot as external tool
2. Students click link in LMS
3. Automatically enrolled via LTI

See [LMS Integration Guide](LMS-Integration) for details.

## Viewing Student Information

### Student List View

Navigate to: **Module Dashboard** → **Students**

**Table columns**:
- Name
- Email
- Enrollment date
- Tests completed
- Average score
- Last active
- Status (Active, Inactive)

**Sorting**:
- Click column headers to sort
- Default: Alphabetical by last name

**Filtering**:
```
Filters:
Status: [All] [Active] [Inactive]
Performance: [All] [High] [Medium] [Low]
Engagement: [All] [Active] [At risk] [Inactive]
```

**Search**:
- Search by name, email, or student ID
- Real-time filtering

### Individual Student View

**Access**:
1. Click on student name in list
2. Opens detailed student profile

**Information displayed**:

**Personal Info**:
```
Name: John Doe
Email: john@example.com
Student ID: 12345
Enrolled: Jan 15, 2025
Last active: Feb 10, 2025
```

**Performance Summary**:
```
Tests completed: 8/10 (80%)
Average score: 85%
Highest score: 95% (Test 3)
Lowest score: 72% (Test 5)
Time spent: 12.5 hours
```

**Recent Activity**:
```
Feb 10, 2025 - Completed Test 8 (Score: 88%)
Feb 8, 2025 - Viewed Document: Chapter 5 Notes
Feb 5, 2025 - Submitted Test 7 (Score: 82%)
Feb 3, 2025 - Started Test 7
```

## Tracking Progress

### Progress Dashboard

**Module-wide progress**:
```
Completion Rates:
Test 1: ████████░░ 80% (24/30 students)
Test 2: ███████░░░ 70% (21/30 students)
Test 3: ██████░░░░ 60% (18/30 students)

Average Scores:
Test 1: 82%
Test 2: 78%
Test 3: 85%
```

**Individual progress**:
```
Student: John Doe
Overall progress: 75% complete

Completed:
✓ Test 1 - 85% (Jan 20)
✓ Test 2 - 78% (Jan 27)
✓ Test 3 - 90% (Feb 3)
✓ Assignment 1 - 88% (Feb 5)

In Progress:
⏳ Test 4 - Started Feb 10

Not Started:
○ Test 5
○ Final Project
```

### Progress Reports

**Generate report**:
1. Go to **Analytics** → **Progress Reports**
2. Select:
   ```
   Students: [All] or [Select specific]
   Date range: Last 30 days
   Include:
     ☑ Test scores
     ☑ Completion rates
     ☑ Time spent
     ☑ Engagement metrics
   ```
3. Click **Generate Report**

**Export formats**:
- **PDF**: For printing/sharing
- **CSV**: For Excel analysis
- **JSON**: For data processing

### Progress Tracking Views

**Timeline View**:
```
Jan 15 |---[Test 1]---[Test 2]------[Test 3]---| Feb 15
        85%           78%            90%

On track: ✓
Projected final score: 84%
```

**Heatmap View**:
```
           Week 1  Week 2  Week 3  Week 4
Test 1       🟢      🟢      -       -
Test 2       -       🟡      🟢      -
Test 3       -       -       🔴      🟡
Engagement   🟢      🟢      🟡      🔴

🟢 High performance  🟡 Medium  🔴 Needs attention
```

## Managing Submissions

### Viewing Submissions

**All submissions for a test**:
1. Go to **Tests** tab
2. Click on test name
3. View **Submissions** section

**Submission statuses**:
- ✅ **Graded**: Complete with score
- ⏳ **Pending**: Submitted, awaiting grading
- 📝 **In Progress**: Started but not submitted
- ⭕ **Not Started**: Not attempted

**Submission details**:
```
Student: John Doe
Submitted: Feb 10, 2025 3:45 PM
Time taken: 42 minutes (of 60 allotted)
Score: 18/20 (90%)
Attempt: 1 of 2

Status: Graded ✅
Feedback: AI-generated feedback provided
```

### Grading Submissions

**Auto-graded questions**:
- Multiple Choice, True/False → Instant grading
- No action needed

**Manual grading required**:
1. Click on submission
2. View student answers
3. Grade each question:
   ```
   Question 4 (Essay): Explain the water cycle.

   Student answer:
   [Student's essay text appears here]

   Rubric scoring:
   - Content accuracy: [0-5] → 4
   - Depth of explanation: [0-5] → 5
   - Organization: [0-5] → 3
   - Grammar: [0-5] → 4

   Total: 16/20

   Feedback: "Good explanation of evaporation and condensation.
              Could improve discussion of transpiration."
   ```
4. Click **Save Grade**

**AI-assisted grading**:
1. Click **AI Analyze**
2. AI provides:
   - Suggested score per rubric criterion
   - Feedback draft
   - Key strengths/weaknesses
3. Review and adjust
4. Save

### Late Submissions

**Settings**:
```
Late submission policy:
○ Not allowed
● Allowed with penalty
○ Allowed without penalty

Penalty: 10% per day late
Maximum days late: 3
```

**Handling late submissions**:
1. Student submits after deadline
2. System calculates penalty
3. Score shown as: `Original: 85% → Adjusted: 75%`
4. Override penalty if needed:
   ```
   Reason for override: Medical emergency
   Adjusted score: 85% (no penalty)
   ```

### Regrade Requests

**Process**:
1. Student submits regrade request
2. Appears in **Pending Regrades** section
3. Review:
   ```
   Student: Jane Smith
   Test: Midterm Exam
   Question: #5 (Essay)
   Original score: 12/20

   Request reason:
   "I believe my answer covered all required points.
    The rubric shows 4 criteria, and I addressed each."

   Your options:
   [Review Submission] [Deny Request] [Adjust Grade]
   ```
4. Make decision
5. Student notified

### Resetting Submissions

**Use cases**:
- Technical issue during test
- Incorrectly submitted
- Need to retake

**Steps**:
1. Find submission
2. Click **Actions** → **Reset Submission**
3. Choose:
   ```
   ○ Delete current attempt (allow retake)
   ● Reset to draft (student can edit)
   ○ Reset all attempts

   ☐ Notify student via email
   ☐ Reset timer
   ```
4. Confirm

## Communication

### Individual Messaging

**Send message to student**:
1. Go to student profile
2. Click **Send Message**
3. Compose:
   ```
   To: John Doe
   Subject: Great progress on Test 3!

   Message:
   Hi John,

   I noticed your excellent performance on Test 3 (90%).
   Keep up the great work!

   Let me know if you have questions on upcoming topics.

   Best,
   Prof. Smith
   ```
4. Send

**Student receives**:
- In-app notification
- Email (if enabled)

### Announcements

**Create announcement**:
1. Go to module dashboard
2. Click **Announcements** → **+ New**
3. Compose:
   ```
   Title: Test 4 Scheduled for Next Week

   Message:
   Hello everyone,

   Test 4 will be available Monday, Feb 15 at 9 AM.
   It covers Chapters 7-9.

   Review the practice problems before the test.

   Good luck!
   ```
4. Options:
   ```
   ☑ Send email notification
   ☑ Pin to top of dashboard
   ☐ Schedule for later
   ```
5. Post

**All students see announcement** on module dashboard.

### Bulk Messaging

**Message multiple students**:
1. Go to **Students** tab
2. Select students:
   ```
   ☑ John Doe
   ☑ Jane Smith
   ☑ Alice Johnson
   ```
3. Click **Actions** → **Send Message**
4. Compose message
5. Send to all selected

**Filter and message**:
```
Example: Message all students who scored < 70% on Test 3

1. Filter: Performance = Low
2. Select all
3. Send message offering help/resources
```

### Feedback on Submissions

**Provide feedback**:
1. Open graded submission
2. Add comments:
   - **Question-level**: Comment on specific answer
   - **Overall**: General feedback at top

**Example**:
```
Question 3: Good identification of the main theme.
           Consider exploring the symbolism more deeply.

Overall feedback:
Strong analytical skills demonstrated. Work on
providing more textual evidence for your claims.
Consider visiting office hours to discuss essay
writing strategies.

Score: 16/20 (80%)
```

## Bulk Operations

### Bulk Actions

**Select students → Actions menu**:

**Available actions**:
```
Actions ▼
├─ Send message
├─ Change status
│  ├─ Activate
│  └─ Deactivate
├─ Export data
│  ├─ Student list (CSV)
│  ├─ Grades (CSV)
│  └─ Full report (PDF)
├─ Unenroll from module
└─ Delete (⚠️ permanent)
```

### Bulk Grading

**Scenario**: Grade same question for all students

1. Go to **Tests** → Select test → **Grade by Question**
2. Select question #5 (essay)
3. View all student answers for that question
4. Grade sequentially:
   ```
   Student 1: John Doe
   Answer: [shows answer]
   Score: [18/20] Next →

   Student 2: Jane Smith
   Answer: [shows answer]
   Score: [16/20] Next →

   ... continue for all students
   ```

**Benefits**:
- Consistent grading
- Faster than per-student grading
- Easy to compare answers

### Bulk Export

**Export all student data**:
1. Go to **Students** → **Export**
2. Choose data:
   ```
   ☑ Student information
   ☑ Enrollment dates
   ☑ All test scores
   ☑ Submission dates
   ☑ Engagement metrics
   ☑ AI feedback summary
   ```
3. Format: CSV, JSON, or Excel
4. Download

## Student Analytics

### Performance Metrics

**Individual metrics**:
```
Student: John Doe

Test Performance:
- Average score: 85%
- Median score: 86%
- Score trend: ↗ Improving
- Consistency: High (σ = 5.2)

Percentile rank: 75th percentile
Class comparison: Above average

Strengths:
✓ Multiple choice questions (92% avg)
✓ Short answers (88% avg)

Areas for improvement:
⚠ Essay questions (72% avg)
⚠ Time management (often uses >90% of time)
```

**Class-wide analytics**:
```
Module: Introduction to Python

Performance distribution:
90-100%: ████░░░░░░ 20% (6 students)
80-89%:  ████████░░ 40% (12 students)
70-79%:  ████░░░░░░ 20% (6 students)
60-69%:  ██░░░░░░░░ 10% (3 students)
< 60%:   ██░░░░░░░░ 10% (3 students)

Average: 78%
Median: 81%
```

### Engagement Tracking

**Engagement metrics**:
```
Student: John Doe

Activity:
- Logins: 24 times (last 30 days)
- Avg session: 35 minutes
- Total time: 14 hours
- Documents viewed: 18/20 (90%)
- Tests completed: 7/8 (87.5%)

Engagement score: 8.5/10 (High)

Recent activity:
Feb 10 - Completed Test 8
Feb 9 - Viewed Chapter 6 notes
Feb 7 - Submitted Test 7
Feb 5 - Reviewed feedback on Test 6
```

**Engagement alerts**:
```
⚠ Low engagement detected:

Jane Smith - Last login: 15 days ago
Alice Johnson - No test submissions in 10 days
Bob Wilson - Only 2 logins in past 30 days

Suggested action: Send check-in message
```

### Predictive Analytics (AI)

**AI predictions**:
```
Student: John Doe

Predicted final score: 83% ± 5%
Confidence: High

Risk assessment: Low risk
Likelihood to complete: 95%

Recommendations:
✓ Student is on track
- Encourage continued engagement
- Challenge with advanced materials
```

**At-risk students**:
```
⚠ Students needing support:

1. Alice Johnson
   Risk level: High
   Factors:
   - Declining scores (85% → 72% → 68%)
   - Low engagement (3 logins in 14 days)
   - Missed 2 recent tests

   Suggested interventions:
   - Schedule 1-on-1 meeting
   - Offer tutoring resources
   - Extend deadlines if needed

2. Bob Wilson
   Risk level: Medium
   Factors:
   - Inconsistent performance
   - Low time on platform

   Suggested: Check in via message
```

## Intervention Strategies

### Identifying Students Who Need Help

**Auto-flagged by AI**:
```
Dashboard → "Students Needing Attention"

Flags:
🔴 Critical: Failing (< 60%), very low engagement
🟡 Warning: Declining performance, missed deadlines
🟢 Watch: Minor concerns
```

**Manual identification**:
- Filter by performance < 70%
- Sort by "Last Active" (find inactive students)
- Check test completion rates

### Intervention Actions

**1. Automated Check-in**:
```
Trigger: Student scores < 65% on 2 consecutive tests

Automated email:
"Hi [Name],

I noticed you've been having some challenges recently.
I'm here to help!

Would you like to:
- Schedule office hours?
- Access additional study resources?
- Discuss the material?

Please reply or click here to book a time.

Best,
[Your name]"
```

**2. Resource Sharing**:
```
Send targeted resources:
- Links to tutorial videos
- Practice problems
- Study guides
- Peer tutoring info
```

**3. Deadline Extensions**:
```
For student → Actions → Extend Deadline

Test 4: Original due date: Feb 15
        New due date: Feb 18
        Reason: Medical issue

☑ Notify student
```

**4. 1-on-1 Meetings**:
- Schedule via integrated calendar
- Or send meeting invite via message
- Document meeting notes in student profile

**5. Adaptive Learning Paths**:
```
Based on performance:
- Struggling with Topic A → Assign remedial materials
- Excelling → Provide advanced challenges
```

### Success Stories

**Tracking interventions**:
```
Student: Alice Johnson

Intervention history:
Jan 20: Flagged for declining performance
Jan 22: Sent check-in email
Jan 25: Met during office hours
Jan 27: Extended Test 4 deadline
Feb 1: Provided additional resources

Result:
Test 4 score: 78% (improved from 68%)
Engagement: Increased to 7/10
Status: Back on track ✓
```

## Best Practices

### Enrollment

1. ✅ Send welcome message after enrollment
2. ✅ Provide clear expectations upfront
3. ✅ Share syllabus and schedule
4. ✅ Test access codes before sharing

### Tracking

1. ✅ Check dashboard weekly
2. ✅ Monitor engagement, not just grades
3. ✅ Identify at-risk students early
4. ✅ Document interventions

### Communication

1. ✅ Respond to messages within 24-48 hours
2. ✅ Be encouraging and supportive
3. ✅ Provide actionable feedback
4. ✅ Use announcements for important info

### Grading

1. ✅ Grade consistently across students
2. ✅ Provide timely feedback (within 1 week)
3. ✅ Combine AI and human feedback
4. ✅ Explain scores with rubrics

### Intervention

1. ✅ Act early when issues arise
2. ✅ Offer multiple support options
3. ✅ Follow up on interventions
4. ✅ Celebrate improvements

## Common Workflows

### Weekly Student Review

```
Every Monday:
1. Check student dashboard
2. Identify low engagement (< 1 login last week)
3. Review test completion rates
4. Send reminder/encouragement to inactive students
5. Grade pending submissions
6. Post weekly announcement
```

### End of Module

```
1. Export all grades to CSV
2. Generate final progress reports
3. Identify students who need final exam support
4. Send module wrap-up message
5. Request feedback via survey
6. Archive module
```

### Student Request Handling

```
Regrade request:
1. Review original submission and rubric
2. Check if concerns are valid
3. Adjust grade if appropriate or explain decision
4. Respond within 48 hours

Technical issue:
1. Verify issue (check logs if needed)
2. Reset submission or extend deadline
3. Document issue
4. Follow up to ensure resolved
```

## Troubleshooting

### Student can't access module

**Check**:
1. Student is enrolled (appears in Students list)
2. Module is published (not draft)
3. Access code is correct
4. Student account is active

**Solution**:
- Manually enroll student
- Or re-send correct access code

### Grades not showing

**Check**:
- Test is graded (not pending)
- "Show scores" setting is enabled
- Student has submitted (not just started)

**Solution**:
- Grade submission
- Update test settings
- Notify student

### Missing students after import

**Check**:
- CSV format is correct
- Email addresses are valid
- No duplicate accounts

**Solution**:
- Re-import with corrected CSV
- Manually add missing students

## Next Steps

- **[Creating Tests](Creating-Tests)**: Build assessments
- **[Analytics Dashboard](Analytics-Dashboard)**: Deep dive into data
- **[AI Feedback System](AI-Feedback-System)**: Enhance feedback
- **[Communication Tools](Communication-Tools)**: Advanced messaging

---

**Need help?** [FAQ](FAQ) | [Troubleshooting](Troubleshooting) | [GitHub Issues](https://github.com/All-Pilot-Modules/ai-pilot/issues)
