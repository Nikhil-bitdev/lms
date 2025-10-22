# Login Troubleshooting Guide

## Test User Credentials

### Teacher Account
- **Email:** `teacher@example.com`
- **Password:** `password123`
- **Role:** teacher

### Student Account
- **Email:** `student@example.com`
- **Password:** `password123`
- **Role:** student

### Admin Account (if created)
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** admin

## Your Real Account
- **Email:** `nikhilthapa1414@gmail.com`
- **Role:** TEACHER
- **Password:** (whatever you set during registration)

## Common Login Issues & Solutions

### 1. "Invalid credentials" Error
**Possible causes:**
- Wrong email or password
- Email typo (check spacing, case)
- Password incorrect

**Solution:**
- Try test account: `teacher@example.com` / `password123`
- Check if CAPS LOCK is on
- Copy-paste the credentials from above

### 2. "Account is deactivated" Error
**Cause:** User account has `isActive: false`

**Solution:**
```bash
cd server
node -e "const {User} = require('./src/models'); (async () => { await User.update({isActive: true}, {where: {email: 'YOUR_EMAIL'}}); console.log('Account activated'); process.exit(); })()"
```

### 3. Cannot connect to backend
**Symptoms:**
- Network error
- "Failed to fetch"
- CORS error

**Check:**
1. Backend running on port 5000?
   ```bash
   lsof -i:5000
   ```

2. Frontend on port 5173 or 5174?
   ```bash
   lsof -i:5173
   lsof -i:5174
   ```

**Solution:**
```bash
# Kill all ports
pkill -9 node; pkill -9 vite; sleep 2

# Start backend
cd /Users/nikhil/Desktop/lms/server && npm start

# Start frontend (in new terminal)
cd /Users/nikhil/Desktop/lms/client && npm run dev
```

### 4. Wrong port issue
**Check your frontend URL:**
- If frontend is on 5174: Use `http://localhost:5174/login`
- If frontend is on 5173: Use `http://localhost:5173/login`

### 5. Token/Auth issues
**Symptoms:**
- Login seems to work but redirects back
- Stuck in loading state

**Solution:**
```bash
# Clear browser localStorage
# In browser console (F12):
localStorage.clear()
# Then refresh page
```

## How to Test Login

### Method 1: Use Browser
1. Go to `http://localhost:5173/login` (or 5174)
2. Enter:
   - Email: `teacher@example.com`
   - Password: `password123`
3. Click "Sign in"

### Method 2: Use curl (Test API directly)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password123"}'
```

**Expected response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 8,
    "email": "teacher@example.com",
    "firstName": "Nikhil",
    "lastName": "Thapa",
    "role": "teacher"
  },
  "token": "eyJhbGc..."
}
```

### Method 3: Check database directly
```bash
cd server
node -e "const {User} = require('./src/models'); (async () => { const users = await User.findAll({attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']}); console.log(users.map(u => u.toJSON())); process.exit(); })()"
```

## Create New Test Users

If test users don't exist:

```bash
cd server
node create-test-user.js
```

This creates:
- `teacher@example.com` / `password123`
- `student@example.com` / `password123`

## Reset Your Password

If you forgot your password:

```bash
cd server
node -e "const {User} = require('./src/models'); (async () => { const user = await User.findOne({where: {email: 'YOUR_EMAIL'}}); if(user) { user.password = 'newpassword123'; await user.save(); console.log('Password updated to: newpassword123'); } else { console.log('User not found'); } process.exit(); })()"
```

## Check Server Logs

When you try to login, check the backend terminal for:
- POST /api/auth/login
- Any error messages
- Status codes (200 = success, 401 = wrong credentials, 500 = server error)

## Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab:** Look for errors
2. **Network tab:** 
   - Find the `/auth/login` request
   - Check status code
   - Check response

## Current Server Status

Backend: Running on port 5000
Frontend: Running on port 5174

**Access your app at:** `http://localhost:5174/login`

## Quick Fix Commands

```bash
# 1. Kill everything
pkill -9 node; pkill -9 vite; sleep 2

# 2. Recreate test users
cd /Users/nikhil/Desktop/lms/server && node create-test-user.js

# 3. Start backend
cd /Users/nikhil/Desktop/lms/server && npm start &

# 4. Start frontend
cd /Users/nikhil/Desktop/lms/client && npm run dev &

# 5. Open browser
open http://localhost:5173/login

# 6. Login with: teacher@example.com / password123
```

## Still Can't Login?

Tell me:
1. What error message do you see?
2. What credentials are you using?
3. What does the browser console show? (Press F12)
4. What does the server terminal show?
