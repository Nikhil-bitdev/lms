# How to Check Assignment Submissions

## For Teachers/Instructors

### Method 1: From All Assignments Page
1. Navigate to `http://localhost:5173/assignments`
2. Find the assignment you want to check
3. Click the **"Submissions"** button (gray button with document icon)
4. You'll be taken to the assignment details page with submissions section

### Method 2: From Assignment Details
1. Click **"View Details"** on any assignment
2. Scroll down to the **"Student Submissions"** section
3. You'll see:
   - Number of submissions received
   - List of all student submissions with:
     - Student name and email
     - Submission date/time
     - Submitted files (click to download)
     - Current grade (if graded)
     - "Grade" button to assign/update grades

### Method 3: From Course Page
1. Go to any course you teach
2. Click on the **"Assignments"** tab
3. Click **"View Submissions"** on any assignment

### Method 4: From Dashboard
1. Go to your dashboard
2. Look for the "Recent Assignments" section
3. Click **"View Submissions"** on any assignment card

## What You Can Do with Submissions

### View Submission Details
- Student name and email
- Submission timestamp
- Submitted files

### Download Files
- Click on any file name to download the student's submission

### Grade Submissions
1. Click the **"Grade"** button on any submission
2. Enter:
   - Score (out of total points)
   - Feedback comments
3. Click **"Submit Grade"**

## Troubleshooting

### "No Submissions Yet" Message
This means:
- Students haven't submitted their work yet
- Check the due date - students might still be working on it

### Can't See Submissions
Make sure:
1. You are logged in as a **Teacher** or **Admin**
2. You are the teacher of the course (or an admin)
3. The assignment belongs to your course
4. The backend server is running on port 5000
5. The frontend server is running on port 5173

### Authorization Error
If you get a 403 error:
- You must be the teacher who created the course
- OR be an admin
- Regular teachers can only see submissions for their own courses

## Backend Logs

The backend now logs submission requests:
- Check the server terminal for messages like:
  ```
  [Submissions] Fetching submissions for assignment X by user Y (teacher)
  [Submissions] Found N submissions for assignment X
  ```

## API Endpoint

The submissions are fetched from:
```
GET /api/assignments/:assignmentId/submissions
```

Requires:
- Authentication (JWT token)
- Role: teacher or admin
- Permission: Must be the course teacher or admin

## Database

Submissions are stored in the `Submissions` table with:
- Student ID
- Assignment ID
- Submission content
- Attached files
- Submission timestamp
- Grade (if graded)
- Feedback

## Tips

1. **Check regularly**: Set a schedule to check submissions after due dates
2. **Grade promptly**: Students appreciate quick feedback
3. **Download files**: Keep local copies of important submissions
4. **Use feedback**: Provide constructive comments when grading
5. **Monitor late submissions**: The system shows if submissions are after the due date
