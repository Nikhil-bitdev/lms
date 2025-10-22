# How to Prevent IP Address Issues After System Restart

## The Problem

When you restart your Mac or router, your IP address may change (e.g., from `192.168.1.3` to `192.168.1.15`), causing:
- ❌ Login failures
- ❌ ERR_ADDRESS_UNREACHABLE errors
- ❌ Can't access from phone

## 3 Solutions (Choose One)

---

## ✅ Option 1: Use Automatic Startup Script (Recommended)

This script automatically detects your IP and updates configuration every time you start the servers.

### How to Use:

```bash
# From now on, just run this command:
./start-servers.sh
```

**That's it!** The script will:
1. Detect your current IP automatically
2. Update both `.env` files
3. Start both servers
4. Show you the correct URLs

### First Time Setup:
```bash
cd /Users/nikhil/Desktop/lms
chmod +x start-servers.sh
./start-servers.sh
```

### To Stop Servers:
```bash
./stop-servers.sh
```

**Pros:**
- ✅ Never worry about IP changes
- ✅ Works automatically
- ✅ Easy to use
- ✅ Phone access always works

**Cons:**
- ⚠️ Must use script to start (but it's just one command)

---

## ✅ Option 2: Use localhost Only

If you **don't need phone access**, use localhost which never changes.

### Update Configuration:

**Backend** `/server/.env`:
```properties
CLIENT_URL=http://localhost:5173
```

**Frontend** `/client/.env`:
```properties
VITE_API_URL=http://localhost:5000/api
```

**Pros:**
- ✅ Never breaks
- ✅ No IP updates needed
- ✅ Simple and reliable

**Cons:**
- ❌ Can't access from phone
- ❌ Can't access from other devices

---

## ✅ Option 3: Set Static IP (Advanced)

Reserve a permanent IP address for your Mac.

### Method A: Router DHCP Reservation (Better)

1. Find your Mac's MAC address:
   ```bash
   ifconfig en0 | grep ether
   ```
   Output: `ether xx:xx:xx:xx:xx:xx`

2. Login to your router:
   - Usually: http://192.168.1.1
   - Or: http://192.168.0.1
   - Username/Password: Usually on router sticker

3. Find DHCP Settings:
   - Look for: "DHCP Reservation", "Static DHCP", or "Address Reservation"
   - Add your Mac's MAC address
   - Assign IP: `192.168.1.3` (or any you want)
   - Save settings

4. Restart your Mac
   - Your Mac will always get the same IP

### Method B: macOS Static IP (Alternative)

1. Open **System Settings** → **Network**
2. Select **Wi-Fi** → Click **Details...**
3. Go to **TCP/IP** tab
4. Change **Configure IPv4**: From `Using DHCP` to `Manually`
5. Enter:
   - **IP Address**: `192.168.1.3`
   - **Subnet Mask**: `255.255.255.0`
   - **Router**: `192.168.1.1` (your router's IP)
6. Click **OK** and **Apply**

**⚠️ Warning:** If you set wrong values, you may lose internet. Write down original settings first!

**Pros:**
- ✅ IP never changes
- ✅ Works after restarts
- ✅ Phone access always works

**Cons:**
- ⚠️ Requires router configuration
- ⚠️ May cause conflicts if done wrong

---

## Comparison Table

| Feature | Auto Script | localhost | Static IP |
|---------|-------------|-----------|-----------|
| Survives restart | ✅ Yes | ✅ Yes | ✅ Yes |
| Phone access | ✅ Yes | ❌ No | ✅ Yes |
| Easy setup | ✅ Very Easy | ✅ Very Easy | ⚠️ Medium |
| Auto-updates IP | ✅ Yes | N/A | N/A |
| Requires router access | ❌ No | ❌ No | ✅ Yes |

---

## My Recommendation

### For You (Needs Phone Access):

**Use Option 1: Automatic Script** ✅

Why?
- You're testing on phone
- IP may change frequently
- Script handles everything automatically
- Just one command: `./start-servers.sh`

### How Your Workflow Will Be:

#### Every Time You Start Working:
```bash
cd /Users/nikhil/Desktop/lms
./start-servers.sh
```

That's it! Script shows you the correct URLs automatically.

#### When Done Working:
```bash
./stop-servers.sh
```

Or just close the terminal.

---

## Quick Reference Commands

### Start Servers (Auto IP Detection):
```bash
cd ~/Desktop/lms
./start-servers.sh
```

### Stop Servers:
```bash
./stop-servers.sh
```

### Check Current IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### Manual Start (Without Script):
```bash
# Backend
cd ~/Desktop/lms/server && npm start

# Frontend (in new terminal)
cd ~/Desktop/lms/client && npm run dev
```

---

## Troubleshooting

### Script doesn't detect IP
**Solution**: Manually set IP in script or use localhost

### Can't access from phone
**Solutions**:
1. Make sure phone is on same WiFi
2. Check firewall isn't blocking ports 5000/5173
3. Try disabling Mac firewall temporarily
4. Use the exact IP shown by the script

### localhost works but IP doesn't
**Solutions**:
1. Check Mac firewall settings
2. Make sure both devices on same WiFi network
3. Check if router has AP isolation enabled

### Script says "permission denied"
**Solution**:
```bash
chmod +x start-servers.sh stop-servers.sh
```

---

## What Happens After Restart

### Without Script:
1. ❌ IP changes
2. ❌ Login fails
3. ❌ You have to manually update .env files
4. ❌ You have to remember new IP

### With Script:
1. ✅ Run `./start-servers.sh`
2. ✅ Script detects new IP automatically
3. ✅ Script updates .env files
4. ✅ Script shows correct URLs
5. ✅ Everything works!

---

## Testing the Script

Let's test it now:

```bash
# 1. Stop current servers
./stop-servers.sh

# 2. Start with script
./start-servers.sh

# You should see:
# 🚀 Starting LMS System...
# 📡 Detected IP: 192.168.1.3
# ✅ Backend server started successfully
# ✅ Frontend server started successfully
# 🎉 LMS System is running!
# 
# 📱 Access URLs:
#    Computer: http://localhost:5173
#    Network:  http://192.168.1.3:5173
```

---

## Bonus: Create Desktop Shortcut

Make it even easier:

```bash
# Create alias in your shell
echo 'alias lms-start="cd ~/Desktop/lms && ./start-servers.sh"' >> ~/.zshrc
echo 'alias lms-stop="cd ~/Desktop/lms && ./stop-servers.sh"' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

Now from anywhere:
```bash
lms-start  # Start servers
lms-stop   # Stop servers
```

---

## Files Created

✅ `/Users/nikhil/Desktop/lms/start-servers.sh` - Auto-start with IP detection  
✅ `/Users/nikhil/Desktop/lms/stop-servers.sh` - Stop all servers  

---

## Summary

**Question**: Will it create problems after restart?  
**Answer**: Not if you use the automatic script! 

**What to do from now on:**
1. After restart, just run: `./start-servers.sh`
2. Script handles everything automatically
3. Use the URLs it shows you

**No more manual IP updates needed!** 🎉

---

*Created: October 21, 2025*  
*Recommended: Use Option 1 (Automatic Script)*
