# Assignment Grading System

## Submission Status Indicators

### 🟡 Pending (Amber/Orange Badge)
**What it means:**
- Student has submitted their assignment
- **Teacher has NOT graded it yet**
- Grade field is `null` in the database

**What shows:**
- Badge displays: "Pending" with a pulsing clock icon
- Color: Amber/Orange gradient
- Action needed: Teacher needs to review and grade

### 🟢 Graded (Green Badge with Score)
**What it means:**
- Teacher has reviewed and graded the submission
- Grade has been assigned

**What shows:**
- Badge displays: Score (e.g., "85/100")
- Color: Green gradient with checkmark icon
- Student can see their grade and feedback

## How to Grade Submissions (For Teachers)

### Step 1: Navigate to Submissions
1. Go to `http://localhost:5173/assignments`
2. Find the assignment you want to grade
3. Click the **"Submissions"** button

### Step 2: Review Submission
On the assignment details page, you'll see:
- Student name and submission date
- Submission content (text if provided)
- **Attached files** with download buttons
- Current status (Pending or Graded)

### Step 3: Download and Review Files
- Click on any file button to download and review the student's work
- Files open in your default PDF viewer or application

### Step 4: Grade the Submission
1. Click the **"Grade Submission"** button (purple button at bottom of each submission)
2. Enter the grade (e.g., "85" for 85 out of 100)
   - Must be between 0 and the assignment's total points
3. Enter feedback (optional but recommended)
   - Provide constructive comments
   - Explain why points were deducted
   - Offer suggestions for improvement
4. Press OK/Enter

### Step 5: Confirmation
- ✅ Success message: "Grade submitted successfully!"
- Badge changes from "Pending" to the actual score
- Student can now see their grade and feedback

## Grading Interface Features

### For Each Submission:
- **Student Avatar** - Shows initials
- **Student Name** - Full name displayed
- **Submission Time** - When they submitted
- **Content** - Any text they wrote
- **Files** - All attached documents (downloadable)
- **Current Grade** - Shows score if already graded
- **Feedback** - Shows teacher's comments (if provided)
- **Grade Button** - Opens grading dialog

### Grade Button States:
- **"Grade Submission"** - For ungraded (pending) submissions
- **"Update Grade"** - For already graded submissions (allows changing)

## Feedback Display

When you provide feedback, students will see:
- Blue box with feedback text
- Displays below their submission
- Shows alongside their grade

## API Endpoints

### Get Submissions
```
GET /api/assignments/:assignmentId/submissions
```
Returns all submissions for an assignment (teachers/admins only)

### Grade Submission
```
POST /api/assignments/submissions/:submissionId/grade
```
Body:
```json
{
  "grade": 85,
  "feedback": "Great work! Minor improvements needed in section 3."
}
```

## Database Schema

### Submission Model
```javascript
{
  id: INTEGER,
  content: TEXT,              // Student's text submission
  attachments: JSON,          // Array of file objects
  submittedAt: DATE,          // When submitted
  grade: FLOAT,               // NULL = pending, number = graded
  feedback: TEXT,             // Teacher's comments
  status: ENUM,               // 'draft', 'submitted', 'graded', 'late'
  userId: INTEGER,            // Student ID
  assignmentId: INTEGER       // Assignment ID
}
```

## Grading Best Practices

### 1. Review Thoroughly
- Download and review all submitted files
- Read any text content provided
- Check against assignment requirements

### 2. Provide Feedback
- Always include feedback with grades
- Be specific about what was done well
- Explain deductions clearly
- Suggest improvements

### 3. Grade Consistently
- Use a rubric if available
- Apply same standards to all students
- Grade similar submissions similarly

### 4. Grade Promptly
- Try to grade within 3-5 days of submission
- Students appreciate timely feedback
- Helps them learn and improve

### 5. Update Grades When Needed
- You can update grades after submission
- Use "Update Grade" button
- Previous grade is replaced

## Common Grading Scenarios

### Late Submission
- System shows submission time
- You can apply late penalty manually
- Deduct points in grade (e.g., 80 instead of 90)
- Explain penalty in feedback

### Incomplete Work
- Grade based on what was submitted
- Note missing components in feedback
- Encourage resubmission if policy allows

### Exceptional Work
- Award full points or extra credit (within max)
- Provide positive feedback
- Highlight strengths

### Needs Improvement
- Provide constructive criticism
- Specific examples of issues
- Suggestions for improvement
- Encourage questions

## Student View

### Before Grading:
- Can see their submission
- Status shows as "submitted"
- No grade visible yet

### After Grading:
- Grade displayed prominently
- Feedback visible in blue box
- Can review what they submitted
- Understands what to improve

## Troubleshooting

### Can't See Submissions
- Make sure you're logged in as teacher
- Must be the course teacher or admin
- Check if students have actually submitted

### Can't Grade
- Verify you're the course teacher
- Check if backend is running
- Look for error messages in console

### Grade Not Saving
- Check network connection
- Verify grade is within valid range (0 to max points)
- Check server terminal for errors

### Files Won't Download
- Backend must be running on port 5000
- Files must exist in uploads folder
- Check authentication token is valid

## Tips for Effective Grading

1. **Set Clear Rubrics** - Create grading criteria before assignment
2. **Grade in Batches** - More consistent when done together
3. **Use Templates** - Have common feedback phrases ready
4. **Be Fair** - Apply same standards to everyone
5. **Encourage** - Balance criticism with encouragement
6. **Document** - Keep notes on grading decisions
7. **Respond** - Answer student questions about grades promptly

## Security & Permissions

### Who Can Grade:
- ✅ Course teacher
- ✅ Administrators
- ❌ Other teachers (can't grade other's courses)
- ❌ Students

### What Teachers Can See:
- All submissions for their courses
- Student names and emails
- Submission dates and files
- Current grades and feedback

### What Teachers Can Do:
- Download submission files
- Assign grades
- Provide feedback
- Update existing grades
- View submission history
