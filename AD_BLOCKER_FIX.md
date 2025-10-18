# 🚫 ERR_BLOCKED_BY_CLIENT - Fixed!

## The Problem

**Error:** `ERR_BLOCKED_BY_CLIENT`

**Cause:** Browser extension (ad blocker, privacy extension, etc.) is blocking the API requests to localhost:5000

**Additional Issue:** Frontend was hardcoded to use `localhost:5000` instead of the IP address, so it wouldn't work on your phone anyway.

---

## ✅ What Was Fixed

### 1. Updated Frontend API URL

**Before:**
```
VITE_API_URL=http://localhost:5000/api
```

**After:**
```
VITE_API_URL=http://192.168.1.13:5000/api
```

### 2. Fixed TeacherRegisterPage

Changed hardcoded `localhost:5000` URLs to use the environment variable, so it works on both Mac and phone.

---

## 🔧 Solutions for ERR_BLOCKED_BY_CLIENT

### Solution 1: Disable Ad Blocker (Recommended for Testing)

**Common ad blockers:**
- uBlock Origin
- Adblock Plus
- Ghostery
- Privacy Badger
- Brave Shields

**How to disable:**

**Chrome/Brave:**
1. Click the extension icon (usually top-right)
2. Click "Pause on this site" or turn off shield
3. Reload the page

**Safari:**
1. Safari menu → Settings → Extensions
2. Uncheck the ad blocker
3. Reload the page

**Or temporarily disable all extensions:**
- Open an Incognito/Private window (extensions usually disabled there)
- Try the link in that window

---

### Solution 2: Whitelist Your Local Development

**uBlock Origin:**
1. Click uBlock icon
2. Click the big power button to whitelist the site
3. Reload

**Adblock Plus:**
1. Click Adblock icon
2. Toggle "Enabled on this site" to OFF
3. Reload

**Brave Browser:**
1. Click the Brave Shields icon (lion)
2. Toggle "Shields" to OFF
3. Reload

---

### Solution 3: Use Different Browser

Try a browser without extensions:
- Fresh Chrome profile
- Safari (if you don't have extensions)
- Firefox Developer Edition
- Edge

---

## 🚀 Next Steps

### 1. Restart Servers

The configuration has changed, so restart:

```bash
# Stop servers
lsof -iTCP -sTCP:LISTEN -P | grep -E ":(5000|5173)" | awk '{print $2}' | xargs kill -9

# Start fresh
cd /Users/nikhil/Desktop/lms
npm run dev
```

### 2. Clear Browser Cache

After restarting servers:
1. Clear browser cache
2. Or use Incognito/Private window

### 3. Disable Ad Blocker

**On Mac:**
- Disable for http://192.168.1.13:5173

**On Phone:**
- Disable any content blockers in browser settings

### 4. Try the Link Again

Send a new invitation (old ones might be cached) and click the link.

---

## 🧪 Test if Ad Blocker is the Issue

**Before disabling ad blocker, test:**

Open browser console (F12) → Network tab → Try the link

**If you see:**
- Red requests with "Blocked" status → Ad blocker
- No requests at all → Frontend issue
- Requests with errors → Backend issue

---

## 📱 Phone-Specific Issues

### Ad Blockers on Phone

**iOS Safari:**
- Settings → Safari → Content Blockers
- Disable all content blockers
- Try again

**Android Chrome:**
- Chrome → Settings → Site settings
- Turn off "Ads" blocking for this site

**Brave Mobile:**
- Tap the Brave Shields icon
- Set Shields to OFF for this site

---

## 🔍 Verify the Fix

### Step 1: Test API Access

**On your Mac, open terminal:**
```bash
curl http://192.168.1.13:5000/api/health
```

**Expected:**
```json
{"status":"ok","time":"..."}
```

**If this works:** Backend is accessible!

### Step 2: Test Frontend Access

**On your phone, open browser:**
```
http://192.168.1.13:5173
```

**Expected:** Login page loads

### Step 3: Test Full Flow

1. Login as admin on Mac or phone
2. Send new teacher invitation
3. Open email on phone
4. **Disable ad blocker first!**
5. Click the invitation link
6. Should work now! 🎉

---

## 📋 Checklist

Before clicking the invitation link:

- [ ] Servers restarted with new config
- [ ] Frontend .env updated to use IP (192.168.1.13)
- [ ] Browser cache cleared (or using incognito)
- [ ] **Ad blocker disabled** or site whitelisted
- [ ] Can access http://192.168.1.13:5173 (login page)
- [ ] Backend accessible: http://192.168.1.13:5000/api/health
- [ ] Phone on same WiFi as Mac
- [ ] New invitation sent (after config changes)

---

## 🎯 Common Ad Blockers That Block Local Development

These extensions commonly block localhost/local IPs:

1. **uBlock Origin** - Most common culprit
2. **Adblock Plus** - Blocks some local requests
3. **Privacy Badger** - Blocks tracker-like requests
4. **Ghostery** - Blocks analytics-like requests
5. **Brave Shields** - Built-in blocker in Brave browser
6. **DuckDuckGo Privacy Essentials**
7. **NoScript** - Blocks JavaScript execution

**Best for development:** Use a separate browser profile without extensions!

---

## 💡 Pro Tip: Create a Development Browser Profile

### Chrome/Brave:

1. Click your profile icon → "Add"
2. Create "Development" profile
3. Don't install any extensions
4. Use this for LMS development

This way you can keep ad blockers in your main profile but have a clean development environment!

---

## ✅ Summary

**Problem:** 
- Ad blocker blocking API requests
- Frontend hardcoded to localhost (won't work on phone)

**Solution:**
- Updated frontend to use IP address (192.168.1.13)
- Disable ad blocker for your LMS site
- Restart servers and test

**Next:**
1. Restart servers
2. Disable ad blocker
3. Try invitation link again
4. Should work now! 🎉

---

## 🆘 Still Not Working?

After trying all the above, if still failing:

**Tell me:**
1. Which browser are you using?
2. Which extensions do you have installed?
3. Are you testing on Mac or phone?
4. What error do you see in console after disabling ad blocker?
5. Can you access http://192.168.1.13:5173 directly?

I'll help you debug it! 🚀
