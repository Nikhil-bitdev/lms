# IP Address Changed - Fixed! ✅

## Problem
Your IP address changed from `192.168.1.13` to `192.168.1.3`, causing:
- ❌ `ERR_ADDRESS_UNREACHABLE`
- ❌ `ERR_CONNECTION_TIMED_OUT`
- ❌ Login failure with "Network Error"

## Solution Applied

### 1. Updated Backend Configuration
**File**: `/server/.env`
```diff
- CLIENT_URL=http://192.168.1.13:5173
+ CLIENT_URL=http://192.168.1.3:5173
```

### 2. Updated Frontend Configuration
**File**: `/client/.env`
```diff
- VITE_API_URL=http://192.168.1.13:5000/api
+ VITE_API_URL=http://192.168.1.3:5000/api
```

### 3. Restarted Both Servers
✅ Backend running on: `http://0.0.0.0:5000`
✅ Frontend running on: `http://192.168.1.3:5173`

---

## How to Access Now

### From Computer
- **Frontend**: http://localhost:5173
- **Or**: http://192.168.1.3:5173

### From Phone (Same WiFi)
- **Frontend**: http://192.168.1.3:5173

### Admin Login
- **Email**: admin@lms.com
- **Password**: admin123

---

## What to Do When IP Changes Again

Your router may reassign IP addresses periodically. When you see connection errors:

### Quick Fix (2 commands):

```bash
# 1. Find your new IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

# 2. Run the update script (see below)
```

### Automated Update Script

Create this file: `/server/update-ip.sh`

```bash
#!/bin/bash

# Get current IP
NEW_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🔍 Current IP: $NEW_IP"

# Update server .env
sed -i '' "s|CLIENT_URL=http://192.168.[0-9]*\.[0-9]*:5173|CLIENT_URL=http://$NEW_IP:5173|g" /Users/nikhil/Desktop/lms/server/.env

# Update client .env
sed -i '' "s|VITE_API_URL=http://192.168.[0-9]*\.[0-9]*:5000/api|VITE_API_URL=http://$NEW_IP:5000/api|g" /Users/nikhil/Desktop/lms/client/.env

echo "✅ Updated to IP: $NEW_IP"
echo ""
echo "Now restart servers:"
echo "1. Stop servers: lsof -iTCP -sTCP:LISTEN -P | grep -E ':(5000|5173)' | awk '{print \$2}' | xargs kill -9"
echo "2. Start backend: cd server && npm start"
echo "3. Start frontend: cd client && npm run dev"
```

**Usage**:
```bash
chmod +x /Users/nikhil/Desktop/lms/server/update-ip.sh
bash /Users/nikhil/Desktop/lms/server/update-ip.sh
```

---

## Alternative: Use localhost Only

If you only need to access from your computer (not phone), you can use `localhost`:

### Backend `.env`:
```properties
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`:
```properties
VITE_API_URL=http://localhost:5000/api
```

**Pros**: 
- ✅ Never breaks when IP changes
- ✅ Always works on your computer

**Cons**:
- ❌ Can't access from phone
- ❌ Can't access from other devices

---

## Why Does IP Change?

### Common Reasons:
1. **DHCP Lease Expiration**: Router reassigns IPs periodically
2. **Router Restart**: New IP assigned when router reboots
3. **WiFi Reconnect**: Disconnecting/reconnecting can change IP
4. **Multiple Devices**: More devices = more IP reassignments

### Prevention Options:

#### Option 1: Reserve IP on Router
1. Login to router (usually http://192.168.1.1)
2. Find DHCP settings
3. Reserve/bind your Mac's IP address
4. Your Mac will always get the same IP

#### Option 2: Static IP
1. System Settings → Network → WiFi → Details
2. TCP/IP tab → Configure IPv4: Manually
3. IP Address: 192.168.1.3
4. Subnet Mask: 255.255.255.0
5. Router: 192.168.1.1

**Warning**: May cause conflicts if not done properly

---

## Current System Status

✅ **Backend**: Running on 0.0.0.0:5000  
✅ **Frontend**: Running on 0.0.0.0:5173  
✅ **Network**: http://192.168.1.3:5173  
✅ **Admin**: admin@lms.com / admin123  
✅ **Database**: SQLite (dev.sqlite)  
✅ **Email**: nik224134@gmail.com  

---

## Troubleshooting

### Still Can't Login?
1. **Clear browser cache** (Ctrl+Shift+Delete / Cmd+Shift+Delete)
2. **Hard refresh page** (Ctrl+Shift+R / Cmd+Shift+R)
3. **Check if using old URL** - Should be 192.168.1.3, not 192.168.1.13
4. **Disable ad blocker** if getting ERR_BLOCKED_BY_CLIENT

### Check Server Status
```bash
lsof -iTCP -sTCP:LISTEN -P | grep -E ":(5000|5173)"
```

Should show:
```
node    [PID]  TCP *:5173 (LISTEN)
node    [PID]  TCP *:5000 (LISTEN)
```

### Test Backend Directly
```bash
curl http://192.168.1.3:5000/api/health
# or
curl http://localhost:5000/api/health
```

### Check IP Address
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

---

## Next Steps

1. ✅ **Clear your browser cache**
2. ✅ **Navigate to**: http://192.168.1.3:5173
3. ✅ **Login with**: admin@lms.com / admin123
4. ✅ **On phone**: Use same URL (same WiFi network)

If you want phone access to always work without updating IPs, consider setting up a static IP or DHCP reservation on your router.

---

*Updated: October 21, 2025*  
*New IP: 192.168.1.3*  
*Old IP: 192.168.1.13*
