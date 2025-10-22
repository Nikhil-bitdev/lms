# Troubleshooting: Teacher Cannot Upload Materials

## Updated Authorization Logic

The upload authorization has been updated to be more flexible:

### ✅ Who Can Upload Materials?

1. **Admins** - Can upload to ANY course
2. **Teachers** - Can upload to ANY course (not just their own)
3. **Students** - Cannot upload materials

### Previous Issue (FIXED)

Previously, teachers could only upload to courses where they were the assigned teacher (`course.teacherId === user.id`). This has been changed to allow all teachers to upload to any course.

## How to Test

### Step 1: Verify Your Role
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `localStorage.getItem('token')`
4. Copy the token value
5. Go to https://jwt.io/
6. Paste your token in the "Encoded" section
7. Check the "Payload" section for your `role` field

### Step 2: Check Network Requests
1. Open DevTools (F12) → Network tab
2. Try to upload a file
3. Look for the `upload` request
4. Check the response:
   - **401 Unauthorized**: Authentication issue (token expired or invalid)
   - **403 Forbidden**: Permission issue (not a teacher/admin)
   - **400 Bad Request**: Missing file or form data
   - **404 Not Found**: Course doesn't exist
   - **201 Created**: Success!

### Step 3: Verify Request Headers
In the Network tab, click on the `upload` request:
- **Headers** tab should show:
  - `Authorization: Bearer <your-token>`
  - `Content-Type: multipart/form-data`

### Step 4: Check Request Payload
- **Payload** tab should include:
  - `courseId`: The course ID
  - `title`: Material title
  - `type`: Material type
  - `file`: The uploaded file
  - `description`: (optional)
  - `dueDate`: (optional)

## Common Issues & Solutions

### Issue 1: "Authentication required"
**Cause**: No token or invalid token
**Solution**: 
```javascript
// Clear localStorage and login again
localStorage.clear();
// Then login with your teacher account
```

### Issue 2: "Only teachers and admins can upload materials"
**Cause**: Your role is 'student'
**Solution**: You need a teacher or admin account

**Quick Fix**: Create a teacher account
```bash
cd /Users/nikhil/Desktop/lms/server
node create-test-teacher.js
```

Then login with:
- Email: teacher@test.com
- Password: teacher123

### Issue 3: "Course not found"
**Cause**: The courseId doesn't exist in the database
**Solution**: 
1. Make sure you're trying to upload to an existing course
2. Check the course ID in the URL
3. Navigate to Courses page and select a valid course

### Issue 4: "No file uploaded"
**Cause**: File wasn't attached to the request
**Solution**:
1. Make sure you selected a file
2. Check file size (must be < 50MB)
3. Check file type (must be in allowed list)

### Issue 5: File upload succeeds but materials don't show
**Cause**: Frontend cache or materials list not refreshing
**Solution**:
1. Refresh the page (F5)
2. Check browser console for errors
3. Verify the material was created in the database

## Debug Mode

The backend now includes debug information in error responses:

```json
{
  "message": "Only teachers and admins can upload materials",
  "debug": {
    "userRole": "student",
    "userId": 123,
    "courseTeacherId": 456
  }
}
```

This helps identify:
- What role the system thinks you have
- Your user ID
- Who the course teacher is

## Testing Checklist

- [ ] Logged in as teacher
- [ ] Token is valid (not expired)
- [ ] Navigated to a valid course
- [ ] Clicked "Upload Material" button
- [ ] Selected a file < 50MB
- [ ] Filled in required fields (title, type)
- [ ] Clicked "Upload Material"
- [ ] Checked Network tab for errors
- [ ] Verified upload was successful

## Server Endpoints

### Upload Material
```
POST http://localhost:5001/api/materials/upload
Headers:
  Authorization: Bearer <token>
  Content-Type: multipart/form-data
Body:
  courseId: <number>
  title: <string>
  type: <string>
  file: <file>
  description: <string> (optional)
  dueDate: <datetime> (optional)
```

### Get Course Materials
```
GET http://localhost:5001/api/materials/course/:courseId
Headers:
  Authorization: Bearer <token>
```

## Manual API Test

You can test the API directly using curl:

```bash
# Get your token from localStorage in browser console
TOKEN="your-token-here"
COURSE_ID=1

# Upload a test file
curl -X POST http://localhost:5001/api/materials/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "courseId=$COURSE_ID" \
  -F "title=Test Material" \
  -F "type=notes" \
  -F "description=Test upload" \
  -F "file=@/path/to/your/file.pdf"
```

## Still Having Issues?

### Collect Debug Information:

1. **Your Role**:
   - Open DevTools Console
   - Type: `JSON.parse(atob(localStorage.getItem('token').split('.')[1])).role`

2. **Network Request Details**:
   - DevTools → Network → upload request
   - Copy the full request and response

3. **Browser Console Errors**:
   - DevTools → Console
   - Copy any error messages

4. **Server Logs**:
   - Check terminal where server is running
   - Look for error messages

Share this information for further troubleshooting.

---

**Last Updated**: After authorization logic update
**Status**: Teachers can now upload to any course, not just their own courses
