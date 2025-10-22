# ✅ FIXED: Teacher Upload Issue - Proper Solution

## 🎯 What Was Fixed

### Authorization Logic (Corrected)
**File**: `/server/src/controllers/materialController.js`

**Rule**: Teachers can ONLY upload materials to courses they teach (where `course.teacherId === user.id`)

### ✅ Your Database Status

Based on the diagnostic check, here's what we found:

#### Users:
1. **Admin User** (admin@lms.com) - ID: 6, Role: admin
   - Not teaching any courses

2. **Nikhil Thapa** (nik224134@gmail.com) - ID: 7, Role: student
   - Student account (cannot upload)

3. **Nikhil Thapa** (nikhilthapa1414@gmail.com) - ID: 8, Role: teacher
   - ✅ Teaching: Course ID 1 "Computer Networks" (TCS514)

4. **Kavita Thapa** (anshbash@gmail.com) - ID: 9, Role: teacher
   - ✅ Teaching: Course ID 2 "Data analysis and algorithm" (TCS-409)

5. **Test Teacher** (teacher@test.com) - ID: 10, Role: teacher
   - Not teaching any courses yet

## 🔑 The Solution

### To Upload Materials as Nikhil Thapa (Teacher):

1. **Login with**: nikhilthapa1414@gmail.com (User ID 8)
2. **You can ONLY upload to**: Course ID 1 ("Computer Networks")
3. **You CANNOT upload to**: Course ID 2 (Kavita's course)

### To Upload Materials as Kavita Thapa (Teacher):

1. **Login with**: anshbash@gmail.com (User ID 9)
2. **You can ONLY upload to**: Course ID 2 ("Data analysis and algorithm")
3. **You CANNOT upload to**: Course ID 1 (Nikhil's course)

## 🧪 How to Test

### Step 1: Verify Which Account You're Logged In As

Open Browser Console (F12) and run:
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', payload.id);
console.log('Email:', payload.email);
console.log('Role:', payload.role);
```

Expected output for Nikhil (teacher):
```
User ID: 8
Email: nikhilthapa1414@gmail.com
Role: teacher
```

### Step 2: Check Your Courses

You should see the debug info box on the dashboard showing:
- Your name
- Your email  
- Your role
- **Make note of your User ID**

### Step 3: Upload to YOUR Course

1. Go to http://localhost:5175/courses
2. Click on **your** course:
   - If you're **Nikhil (ID 8)**: Click "Computer Networks"
   - If you're **Kavita (ID 9)**: Click "Data analysis and algorithm"
3. Scroll to "Study Materials" section
4. Click "Upload Material"
5. Upload a file

### Step 4: Check Error If Upload Fails

If you get an error, check the debug information in the error:
```json
{
  "message": "You can only upload materials to courses you teach",
  "debug": {
    "userRole": "teacher",
    "userId": 8,
    "courseTeacherId": 9,
    "courseId": 2,
    "courseTitle": "Data analysis and algorithm"
  }
}
```

This tells you:
- `userId: 8` - You are user 8 (Nikhil)
- `courseTeacherId: 9` - This course belongs to user 9 (Kavita)
- **Result**: You cannot upload because you're not the course teacher

## 🆘 Common Problems & Solutions

### Problem 1: "You can only upload materials to courses you teach"

**Diagnosis**:
Check the debug info in the error. If:
- `userId` ≠ `courseTeacherId`
- You're trying to upload to someone else's course

**Solution**:
- Make sure you're logged in with the correct account
- Navigate to YOUR course (where userId === courseTeacherId)

### Problem 2: Wrong Account Logged In

**Check**:
```javascript
// In browser console
localStorage.getItem('token') && 
  JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
```

**Solution**:
1. Logout
2. Login with the teacher account that owns the course
3. Try again

### Problem 3: Student Account Trying to Upload

**Error**: "You can only upload materials to courses you teach"

**Solution**:
You're logged in as:
- nik224134@gmail.com (Student account)

You need to login as a teacher:
- nikhilthapa1414@gmail.com (Teacher account)

## 📋 Account Summary

| Email | Role | User ID | Can Upload To |
|-------|------|---------|---------------|
| admin@lms.com | admin | 6 | All courses |
| nik224134@gmail.com | student | 7 | ❌ None |
| nikhilthapa1414@gmail.com | teacher | 8 | ✅ Course 1 only |
| anshbash@gmail.com | teacher | 9 | ✅ Course 2 only |
| teacher@test.com | teacher | 10 | ❌ No courses assigned |

## 🔧 Diagnostic Commands

### Check Your Courses
```bash
cd /Users/nikhil/Desktop/lms/server
node check-courses.js
```

### Create a New Course for a Teacher
```bash
cd /Users/nikhil/Desktop/lms/server
node create-course-for-teacher.js
```

### Check All Users
```bash
cd /Users/nikhil/Desktop/lms/server
sqlite3 dev.sqlite "SELECT id, firstName, lastName, email, role FROM Users;"
```

### Check All Courses
```bash
cd /Users/nikhil/Desktop/lms/server
sqlite3 dev.sqlite "SELECT id, title, code, teacherId FROM Courses;"
```

## 🎓 Creating a New Course for Teacher

If Test Teacher (teacher@test.com) wants to upload materials:

1. **Run**:
```bash
cd /Users/nikhil/Desktop/lms/server
node create-course-for-teacher.js
```

2. **Select**: Teacher number (e.g., 5 for Test Teacher)

3. **Enter**: Course details

4. **Result**: Course created, now Test Teacher can upload materials to it

## ✅ Successful Upload Checklist

- [ ] Logged in with teacher account (not student)
- [ ] Navigated to a course YOU teach
- [ ] Clicked "Upload Material" button
- [ ] Selected file < 50MB
- [ ] Filled title and type
- [ ] Clicked "Upload Material"
- [ ] Received success message

## 🚀 Quick Test Guide

### For Nikhil (nikhilthapa1414@gmail.com):
1. Login: nikhilthapa1414@gmail.com
2. Go to: http://localhost:5175/courses
3. Click: "Computer Networks" (Course ID 1)
4. Scroll to: "Study Materials"
5. Click: "Upload Material"
6. Upload: Any file
7. Expected: ✅ Success!

### For Kavita (anshbash@gmail.com):
1. Login: anshbash@gmail.com
2. Go to: http://localhost:5175/courses
3. Click: "Data analysis and algorithm" (Course ID 2)
4. Scroll to: "Study Materials"
5. Click: "Upload Material"
6. Upload: Any file
7. Expected: ✅ Success!

## 🔍 Debug Information

The error response now includes helpful debug info:
```json
{
  "debug": {
    "userRole": "teacher",
    "userId": 8,
    "courseTeacherId": 8,
    "courseId": 1,
    "courseTitle": "Computer Networks"
  }
}
```

If `userId === courseTeacherId`, upload should work.
If `userId !== courseTeacherId`, you're trying to upload to someone else's course.

## 📝 Next Steps

1. **Verify**: Check which account you're logged in as
2. **Navigate**: Go to YOUR course
3. **Upload**: Try uploading a file
4. **Report**: If still failing, share the debug info from the error

---

**Status**: ✅ Fixed - Teachers restricted to their own courses
**Your Servers**: 
- Frontend: http://localhost:5175
- Backend: Port varies (check terminal)

**Diagnostic Tools Available**:
- `check-courses.js` - See all users and courses
- `create-course-for-teacher.js` - Create new courses
- `create-test-teacher.js` - Create teacher accounts
