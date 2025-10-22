# 🔍 403 Upload Error - Diagnostic Guide

## ❌ Error You're Seeing:
```
192.168.1.3:5000/api/materials/upload:1 
Failed to load resource: the server responded with a status of 403 (Forbidden)
```

## 🎯 What This Means:
You are logged in as **User ID 9** (anshbash@gmail.com) but trying to upload to a course you don't own.

---

## ✅ Your Account Details:
- **User ID**: 9
- **Email**: anshbash@gmail.com (Kavita Thapa)
- **Role**: teacher
- **Your Course**: Course ID 2 - "Data analysis and algorithm" (TCS-409)

---

## 📋 Courses in Database:

| Course ID | Title | Code | Teacher ID | Teacher Email |
|-----------|-------|------|------------|---------------|
| 1 | Computer Networks | TCS514 | 8 | nikhilthapa1414@gmail.com |
| 2 | Data analysis and algorithm | TCS-409 | 9 | anshbash@gmail.com |

---

## 🚨 Common Mistake:
**You're probably on the wrong course page!**

### ❌ If you're at: `http://localhost:5173/courses/1`
- This is "Computer Networks" (Course ID 1)
- Owned by User ID 8 (Nikhil Thapa)
- **You CANNOT upload here**

### ✅ You need to be at: `http://localhost:5173/courses/2`
- This is "Data analysis and algorithm" (Course ID 2)
- Owned by User ID 9 (YOU!)
- **You CAN upload here**

---

## 🛠️ How to Fix:

### Step 1: Check Current Page
Look at your browser URL:
- If it says `/courses/1` → **WRONG COURSE!**
- If it says `/courses/2` → **CORRECT COURSE!**

### Step 2: Look at Debug Box
I've added a **yellow debug box** in the bottom-left corner of the course page that shows:
- ✅ Your User ID
- ✅ Your Role
- ✅ Course Teacher ID
- ✅ Whether you can upload or not

### Step 3: Go to YOUR Course
1. Click "Courses" in the sidebar
2. Find **"Data analysis and algorithm"** (TCS-409)
3. Click on it
4. Check the URL is `/courses/2`
5. Look at the yellow debug box - it should say **"✅ You CAN upload to this course"**

### Step 4: Upload Material
1. Scroll to "Study Materials" section
2. Click "Upload Material" button
3. Fill the form (Title, Type, File)
4. Click "Upload Material"
5. Success! ✅

---

## 🧪 Enhanced Error Messages:

I've improved the error handling so now you'll see:
- Detailed console logs showing:
  - Your User ID
  - Your Role
  - Course ID you're trying to upload to
  - Course Teacher ID
  - Whether IDs match (✅ YES or ❌ NO)

### Check Browser Console (F12):
After trying to upload, press F12 and look for:
```
=== UPLOAD DEBUG INFO ===
Your User ID: 9
Your Role: teacher
Course ID: 1 or 2
Course Title: [Course name]
Course Teacher ID: 8 or 9
Match: ✅ YES or ❌ NO
```

If **Match: ❌ NO** → You're on the wrong course!
If **Match: ✅ YES** → Something else is wrong (let me know!)

---

## 🎯 Quick Verification Checklist:

- [ ] I'm logged in as anshbash@gmail.com (User ID 9)
- [ ] I'm on the course details page
- [ ] URL shows `/courses/2` (not `/courses/1`)
- [ ] Yellow debug box shows "✅ You CAN upload"
- [ ] I clicked "Upload Material" button
- [ ] I filled in Title and Type
- [ ] I selected a file under 50MB
- [ ] I clicked "Upload Material" button
- [ ] Expected: Success! ✅

---

## 🔧 If Still Not Working:

### Check 1: Verify You're on the Right Page
Open browser console (F12) and run:
```javascript
console.log('Current URL:', window.location.href);
console.log('Should be:', 'http://localhost:5173/courses/2');
```

### Check 2: Verify Course Info
Look at the page title - it should say **"Data analysis and algorithm"**, NOT "Computer Networks"

### Check 3: Look at the Debug Box
The yellow box in bottom-left should show:
- Your User ID: **9**
- Course Teacher ID: **9**
- Status: **✅ You CAN upload to this course**

### Check 4: Try Another Browser
Sometimes cached tokens cause issues. Try:
1. Logout
2. Clear browser cache
3. Login again with anshbash@gmail.com
4. Go directly to http://localhost:5173/courses/2

---

## 📞 What to Report if Still Failing:

If you're absolutely sure you're on Course ID 2 and still getting 403:

1. **Browser Console Output**: Copy the "=== UPLOAD DEBUG INFO ===" section
2. **Yellow Debug Box Info**: What does it say?
3. **Current URL**: What's showing in the address bar?
4. **Course Title**: What course name is displayed on the page?

---

## 🚀 Success Path:

1. Login: **anshbash@gmail.com**
2. Go to: **http://localhost:5173/courses**
3. Click: **"Data analysis and algorithm"**
4. Verify URL: **http://localhost:5173/courses/2**
5. Check Debug Box: **✅ You CAN upload**
6. Click: **"Upload Material"**
7. Fill form and upload
8. Result: **SUCCESS!** 🎉

---

**Note**: The authorization is working correctly. Teachers can ONLY upload to their OWN courses. You just need to make sure you're on YOUR course (Course ID 2), not someone else's course (Course ID 1).
