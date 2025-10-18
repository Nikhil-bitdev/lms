# Database Persistence Guide

## Overview
This LMS application uses SQLite database for data persistence in development. All your data (courses, assignments, users, enrollments, etc.) is automatically saved and will persist across server restarts.

## Database Configuration

### Database File Location
- **File**: `server/dev.sqlite`
- **Size**: Currently ~68KB (contains existing data)
- **Type**: SQLite database (file-based)

### How It Works
1. When the server starts, it connects to the SQLite database file
2. Sequelize ORM automatically:
   - Creates tables if they don't exist
   - Updates table schemas using `sync({ alter: true })` without losing data
   - Maintains all existing records

### Data Persistence Features
✅ **Courses** - All course data persists (title, description, code, teacher info)
✅ **Assignments** - Assignment details, deadlines, and files persist
✅ **Users** - Student and teacher accounts remain available
✅ **Enrollments** - Student course enrollments are maintained
✅ **Submissions** - Assignment submissions and grades persist
✅ **Materials** - Course materials and resources persist
✅ **Quizzes** - Quiz questions and attempts persist

## Important Notes

### Database File
- The `dev.sqlite` file is stored in `server/` directory
- This file is added to `.gitignore` (won't be pushed to GitHub)
- **BACKUP THIS FILE** if you want to preserve your data when moving between machines

### Schema Updates
- When you modify models, Sequelize will automatically update the schema
- Uses `alter: true` mode which preserves existing data while updating structure
- If major changes occur, you might need to manually migrate data

### Backing Up Your Data

#### Manual Backup
```bash
# Create a backup of your database
cp server/dev.sqlite server/dev.sqlite.backup

# Restore from backup if needed
cp server/dev.sqlite.backup server/dev.sqlite
```

#### Automated Backup Script
Create a backup script in `server/backup-db.js`:
```javascript
const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'dev.sqlite');
const backupFile = path.join(__dirname, `backup-${Date.now()}.sqlite`);

fs.copyFileSync(dbFile, backupFile);
console.log(`Database backed up to: ${backupFile}`);
```

Run with: `node server/backup-db.js`

### Viewing Database Contents

You can view/edit the SQLite database using:
1. **DB Browser for SQLite** - https://sqlitebrowser.org/
2. **VS Code Extensions** - "SQLite" by alexcvzz
3. **Command Line**:
   ```bash
   sqlite3 server/dev.sqlite
   .tables  # List all tables
   SELECT * FROM Users;  # View users
   .quit    # Exit
   ```

## Environment Variables

In `server/.env`:
```env
SQLITE_STORAGE=server/dev.sqlite
```

This variable controls where the database file is stored.

## Troubleshooting

### Data Not Persisting
1. Check if `dev.sqlite` file exists in `server/` directory
2. Verify file permissions (should be readable/writable)
3. Check for errors in server logs during database sync

### Starting Fresh
If you want to reset the database and start with clean data:
```bash
# Stop the server first
# Then delete the database file
rm server/dev.sqlite

# Restart the server - it will create a new empty database
npm run dev
```

### Database Locked Error
If you get "database is locked" error:
1. Close any database browser tools
2. Stop all server instances
3. Delete `dev.sqlite-journal` file if it exists
4. Restart the server

## Production Considerations

For production deployment, consider:
1. **PostgreSQL** or **MySQL** for better concurrent access
2. Regular automated backups
3. Database migration tools (Sequelize migrations)
4. Environment-specific database configurations

## Current Status

✅ Database persistence is **ENABLED**
✅ Database file: `server/dev.sqlite` (68KB with existing data)
✅ Data will persist across server restarts
✅ Schema updates won't delete existing data
✅ Database file excluded from Git repository

## Next Steps

1. Your data is already persisting! Test by:
   - Creating a course
   - Restarting the server
   - Logging in - you should see the course

2. For long-term use, consider backing up the database file regularly

3. For production, plan to migrate to PostgreSQL or MySQL
