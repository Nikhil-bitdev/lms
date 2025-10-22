# Permission Error Fix - Study Materials Upload

## Problem
You're getting "You do not have permission to perform this action" when trying to upload study materials.

## Root Cause
The material upload endpoint requires users to have either **'teacher'** or **'admin'** role. If you're logged in as a **'student'**, you cannot upload materials.

## Solution

### Step 1: Check Your Current User Role

A debug component has been added to your dashboard. When you visit the dashboard, you'll see a blue box in the **bottom-right corner** showing:
- Your name
- Your email
- **Your role** (STUDENT/TEACHER/ADMIN)

### Step 2: Solutions Based on Your Role

#### Option A: If You're a Student
You need to login as a teacher or admin to upload materials. Students can only **view and download** materials.

**Create a Test Teacher Account:**
```bash
cd /Users/nikhil/Desktop/lms/server
node create-test-teacher.js
```

This will create:
- **Email**: teacher@test.com
- **Password**: teacher123
- **Role**: teacher

Then:
1. Logout from your current account
2. Login with the teacher credentials above
3. You'll now be able to upload materials

#### Option B: If You're Already a Teacher/Admin
The permission error might be due to:

1. **Token expiry**: Try logging out and logging back in
2. **Browser cache**: Clear your browser cache and localStorage
3. **Session issue**: Open DevTools (F12) → Application → Local Storage → Clear token

### Step 3: Test the Upload Feature

Once logged in as a teacher:

1. **From Dashboard**:
   - Click "Study Materials" in Quick Actions

2. **From Course Details**:
   - Go to Courses → Click on a course
   - You'll see "Study Materials" section
   - Click "Upload Material" button

3. **Upload a File**:
   - Drag & drop or click to browse
   - Fill in:
     - Title (required)
     - Type (notes/assignment/lecture/reference/other)
     - Description (optional)
   - Click "Upload Material"

## File Requirements

- **Max size**: 50MB
- **Supported formats**:
  - Documents: PDF, Word (.doc, .docx), PowerPoint (.ppt, .pptx), Excel (.xls, .xlsx)
  - Images: JPEG, PNG, GIF
  - Videos: MP4, AVI, QuickTime
  - Archives: ZIP, RAR
  - Text files

## Permissions Summary

### Teachers & Admins Can:
✅ Upload materials
✅ Delete materials
✅ Edit materials
✅ View all materials
✅ Download materials

### Students Can:
✅ View materials (enrolled courses only)
✅ Download materials
❌ Cannot upload materials
❌ Cannot delete materials

## Quick Test Credentials

If you don't have a teacher account, use the script mentioned above to create:

**Teacher Account**:
- Email: teacher@test.com
- Password: teacher123

## Troubleshooting

### Still Getting Permission Error?

1. **Open Browser DevTools** (F12)
2. Go to **Console** tab
3. Try to upload a material
4. Look for errors
5. Share the error message

### Check Your Token

Open DevTools → Application → Local Storage → Check if `token` exists:
- If missing: Login again
- If present: Try logging out and in again

### API Endpoint Info

The upload endpoint is:
```
POST http://0.0.0.0:5001/api/materials/upload
```

It requires:
- Valid authentication token
- Role: 'teacher' OR 'admin'

## Development Servers

Your servers are running at:
- **Frontend**: http://localhost:5173
- **Backend**: http://0.0.0.0:5001

## Next Steps

1. Visit http://localhost:5173
2. Check the blue debug box (bottom-right) to see your role
3. If student, create teacher account using the script
4. Login as teacher
5. Try uploading materials

## Removing Debug Component

Once you've verified everything works, you can remove the debug component by editing:

`/Users/nikhil/Desktop/lms/client/src/pages/DashboardPage.jsx`

Remove the line:
```jsx
<UserDebugInfo />
```

And the import:
```jsx
import UserDebugInfo from '../components/UserDebugInfo';
```

---

**Need Help?** Check the browser console for specific error messages and share them for further troubleshooting.
