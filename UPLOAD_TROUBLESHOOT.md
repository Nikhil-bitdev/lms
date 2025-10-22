# 🔍 Material Upload Troubleshooting Guide

## ✅ Database Status (Just Checked):

### Teachers & Their Courses:
1. **Nikhil Thapa** (nikhilthapa1414@gmail.com) - User ID 8
   - ✅ Teaches: Course ID 1 "Computer Networks" (TCS514)
   - Can upload: ✅ YES

2. **Kavita Thapa** (anshbash@gmail.com) - User ID 9
   - ✅ Teaches: Course ID 2 "Data analysis and algorithm" (TCS-409)
   - Can upload: ✅ YES

3. **Test Teacher** (teacher@test.com) - User ID 10
   - ❌ No courses assigned
   - Can upload: ❌ NO

---

## 🎯 Current Server Status:

- **Frontend**: http://localhost:5174
- **Backend**: http://localhost:5001

⚠️ **Note**: Ports changed from default 5173/5000 to 5174/5001

---

## 🚨 Common Issues & Solutions:

### Issue 1: "Upload Material" Button Not Showing
**Symptoms**: Don't see the upload button on course page

**Causes**:
- Not logged in as teacher/admin
- Logged in as student
- Not on YOUR course page

**Solutions**:
1. Check browser console (F12) and run:
```javascript
const token = localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('User ID:', payload.id);
  console.log('Email:', payload.email);
  console.log('Role:', payload.role);
}
```

2. Make sure role === 'teacher' or 'admin'

---

### Issue 2: 403 Forbidden Error
**Symptoms**: Error when clicking upload

**Causes**:
- Trying to upload to another teacher's course
- User ID doesn't match course teacherId

**Solutions**:
1. Verify you're on YOUR course:
   - User ID 8 → Can only upload to Course ID 1
   - User ID 9 → Can only upload to Course ID 2
   
2. Check URL: Should be `/courses/[YOUR_COURSE_ID]`

---

### Issue 3: Network Error / Cannot Connect
**Symptoms**: Request fails, no response

**Causes**:
- Backend not running
- Wrong port number in API calls
- CORS issues

**Solutions**:
1. Check backend is running: http://localhost:5001
2. Check API base URL in client
3. Restart servers:
```bash
pkill -9 node; pkill -9 vite; sleep 2
cd /Users/nikhil/Desktop/lms && npm run dev
```

---

### Issue 4: File Upload Fails
**Symptoms**: Upload starts but fails

**Causes**:
- File too large (>50MB)
- Invalid file type
- Missing title or type
- Network timeout

**Solutions**:
1. Check file size: Must be < 50MB
2. Check file type: PDF, Word, PowerPoint, Excel, Images, Videos, Archives
3. Fill all required fields: Title, Type, File
4. Check network tab in browser dev tools

---

### Issue 5: Token Expired / Unauthorized
**Symptoms**: 401 Unauthorized error

**Causes**:
- JWT token expired
- Logged out in another tab
- Token corrupted

**Solutions**:
1. Logout and login again
2. Clear browser cache
3. Check localStorage has valid token:
```javascript
localStorage.getItem('token')
```

---

## 🧪 Step-by-Step Debug Process:

### Step 1: Verify Your Login
Open browser console (F12) and run:
```javascript
const token = localStorage.getItem('token');
if (!token) {
  console.log('❌ NOT LOGGED IN');
} else {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('✅ LOGGED IN');
  console.log('User ID:', payload.id);
  console.log('Email:', payload.email);
  console.log('Role:', payload.role);
  
  if (payload.role !== 'teacher' && payload.role !== 'admin') {
    console.log('❌ You need to be a TEACHER or ADMIN');
  }
}
```

### Step 2: Check Current Course
```javascript
const url = window.location.pathname;
const courseId = url.split('/courses/')[1];
console.log('Current Course ID:', courseId);

// Match with your courses
// User ID 8 → Course ID 1
// User ID 9 → Course ID 2
```

### Step 3: Test Upload Button Visibility
1. Go to: http://localhost:5174/courses/[YOUR_COURSE_ID]
2. Scroll to "Study Materials" section
3. Look for "Upload Material" button (purple-blue gradient)
4. If not visible:
   - Check console for errors
   - Verify you're logged in as teacher/admin
   - Verify you're on your own course

### Step 4: Test Upload
1. Click "Upload Material"
2. Fill form:
   - Title: "Test Material"
   - Type: "Notes"
   - File: Select any PDF < 50MB
3. Click "Upload Material"
4. Watch browser console for errors
5. Check network tab for API response

### Step 5: Check Backend Logs
Look at terminal output for:
- Authorization checks
- File upload progress
- Error messages

---

## 📞 What to Report:

If still not working, provide:

1. **Your Login Info** (from console):
   - User ID: ?
   - Email: ?
   - Role: ?

2. **Current Page**:
   - URL: ?
   - Course ID: ?

3. **Error Message**:
   - Browser console errors?
   - Network tab shows what?
   - Toast notification says what?

4. **Upload Button**:
   - Can you see it? Yes/No
   - What happens when you click?

5. **Backend Terminal**:
   - Any error messages?
   - Request received?

---

## 🚀 Quick Fix Commands:

### Restart Everything:
```bash
pkill -9 node; pkill -9 vite; sleep 2
cd /Users/nikhil/Desktop/lms && npm run dev
```

### Clear Browser Data:
1. Open Dev Tools (F12)
2. Go to Application tab
3. Clear Storage → Clear site data
4. Reload page
5. Login again

### Test API Directly:
```bash
# Test if backend is responding
curl http://localhost:5001/api/courses

# Check if uploads folder exists
ls -la /Users/nikhil/Desktop/lms/server/uploads/materials
```

---

## ✅ Expected Behavior:

### For User ID 9 (anshbash@gmail.com):
1. Login at: http://localhost:5174
2. Go to: http://localhost:5174/courses
3. See: Only "Data analysis and algorithm" (Course ID 2)
4. Click on it
5. See: "Upload Material" button (purple-blue gradient)
6. Click: Upload modal opens
7. Fill: Title, Type, File
8. Upload: Success! Material appears in list

---

## 🔧 Manual Database Check:

If you want to verify database directly:
```bash
cd /Users/nikhil/Desktop/lms/server
sqlite3 dev.sqlite

# Check your user
SELECT id, firstName, lastName, email, role FROM Users WHERE email = 'anshbash@gmail.com';

# Check your courses
SELECT id, title, code, teacherId FROM Courses WHERE teacherId = 9;

# Check existing materials
SELECT id, title, courseId, uploadedBy FROM Materials WHERE courseId = 2;

.exit
```

---

**Next Steps**: 
1. Check which specific issue you're facing from the list above
2. Run the debug commands in browser console
3. Report back with the specific error message and context
