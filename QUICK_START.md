# 🚀 Quick Start Guide

## Starting the System (After Restart)

Just run this one command:

```bash
./start-servers.sh
```

That's it! The script will:
- ✅ Automatically detect your current IP
- ✅ Update configuration files
- ✅ Start both backend and frontend
- ✅ Show you the correct URLs to use

## Stopping the System

```bash
./stop-servers.sh
```

## Access URLs

The script will show you the URLs, but typically:
- **Computer**: http://localhost:5173
- **Phone** (same WiFi): Check script output for current IP

## Admin Login

- **Email**: admin@lms.com
- **Password**: admin123

## Why Use the Script?

Your IP address may change when you:
- Restart your Mac
- Restart your router
- Reconnect to WiFi
- Mac sleeps for a long time

The script automatically handles IP changes, so you never have to worry about it!

## More Information

- **Full Documentation**: See `RESTART_SOLUTION.md`
- **IP Change Help**: See `IP_CHANGED_FIX.md`
- **Teacher Registration**: See `TEACHER_REGISTRATION_REMOVED.md`

## Manual Start (Alternative)

If you prefer not to use the script:

```bash
# Terminal 1 - Backend
cd server && npm start

# Terminal 2 - Frontend
cd client && npm run dev
```

But you'll need to manually update IPs in `.env` files if they change.

---

**Recommended**: Always use `./start-servers.sh` 🎯
