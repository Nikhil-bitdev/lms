# Admin-Controlled Teacher Registration System

## Overview
This system prevents unauthorized users from registering as teachers. Only administrators can invite and approve teacher accounts, ensuring no imposters can gain teacher privileges.

## Key Features

### 1. **Secure Registration Flow**
- ✅ Public users can only register as **students**
- ✅ Teacher and admin registration is **blocked** for public signup
- ✅ Teachers can only register via **admin invitation links**
- ✅ Invitations expire after **7 days**
- ✅ Admin can **revoke** pending invitations

### 2. **Admin Dashboard**
- Invite teachers by email
- View all registered teachers
- Activate/Deactivate teacher accounts
- Track pending invitations
- Revoke unused invitations

### 3. **Teacher Invitation System**
- Admin sends invitation with first name, last name, and email
- Unique invitation token generated for each invite
- Teacher receives invitation link
- Teacher completes registration with password
- Account automatically created with teacher role

## System Components

### Backend

#### New Models
1. **TeacherInvitation Model** (`/server/src/models/TeacherInvitation.js`)
   - Tracks teacher invitations
   - Fields: email, firstName, lastName, invitationToken, status, expiresAt, invitedBy

#### New Controllers
1. **Admin Controller** (`/server/src/controllers/adminController.js`)
   - `inviteTeacher` - Create teacher invitation
   - `getInvitations` - List all invitations
   - `getTeachers` - List all teachers
   - `toggleTeacherStatus` - Activate/deactivate teachers
   - `revokeInvitation` - Revoke pending invitation
   - `registerTeacher` - Complete teacher registration
   - `getInvitationByToken` - Verify invitation token

#### Updated Controllers
1. **Auth Controller** (`/server/src/controllers/authController.js`)
   - Modified `register` function to block teacher/admin self-registration
   - Forces all public registrations to use 'student' role

#### New Routes
1. **Admin Routes** (`/server/src/routes/adminRoutes.js`)
   - `POST /api/admin/teachers/invite` - Invite teacher
   - `GET /api/admin/teachers/invitations` - List invitations
   - `DELETE /api/admin/teachers/invitations/:id` - Revoke invitation
   - `GET /api/admin/teachers` - List teachers
   - `PATCH /api/admin/teachers/:id/toggle-status` - Toggle teacher status

2. **Auth Routes** (`/server/src/routes/authRoutes.js`)
   - `GET /api/auth/register/teacher/:token` - Get invitation details
   - `POST /api/auth/register/teacher/:token` - Complete teacher registration

### Frontend

#### New Pages
1. **AdminDashboardPage** (`/client/src/pages/AdminDashboardPage.jsx`)
   - Admin control panel
   - Teacher invitation interface
   - Teacher management table
   - Invitation status tracking

2. **TeacherRegisterPage** (`/client/src/pages/TeacherRegisterPage.jsx`)
   - Teacher registration form
   - Invitation token verification
   - Password setup

#### Updated Routes
- `/admin` - Admin dashboard (admin only)
- `/register/teacher/:token` - Teacher registration page

## Usage Guide

### For Administrators

#### 1. Login as Admin
```
Email: admin@lms.com
Password: admin123
```
⚠️ **IMPORTANT**: Change this password after first login!

#### 2. Invite a Teacher
1. Navigate to Admin Dashboard (`/admin`)
2. Click "Invite Teacher" button
3. Fill in teacher details:
   - First Name
   - Last Name
   - Email
4. Click "Send Invitation"
5. Copy the invitation link and share it with the teacher

#### 3. Manage Teachers
- **View All Teachers**: See list of registered teachers
- **Activate/Deactivate**: Toggle teacher account status
- **Revoke Invitations**: Cancel pending invitations

### For Teachers

#### 1. Receive Invitation
- Admin sends you an invitation link
- Link format: `http://localhost:5173/register/teacher/{token}`

#### 2. Complete Registration
1. Click the invitation link
2. You'll see your pre-filled information (name, email)
3. Create a secure password
4. Click "Create Teacher Account"
5. You'll be redirected to login page

#### 3. Login
- Use your registered email and password
- Access teacher dashboard

### For Students

#### Registration
1. Go to `/register`
2. Fill in your details
3. Automatically registered as a **student**
4. Cannot select "teacher" or "admin" role

## Security Features

### 1. **Role-Based Access Control**
- Public registration forced to 'student' role
- Admin routes protected with `authorize('admin')` middleware
- Teacher registration requires valid invitation token

### 2. **Invitation Security**
- Unique cryptographic tokens (32 bytes)
- Time-limited validity (7 days)
- One-time use (status changes to 'accepted')
- Can be revoked by admin

### 3. **Status Checks**
```javascript
// Example: Checking invitation validity
- Token must exist
- Status must be 'pending'
- Expiration date must be in future
- Email must not be already registered
```

## API Endpoints

### Admin Endpoints (Require Admin Authentication)

#### Invite Teacher
```http
POST /api/admin/teachers/invite
Content-Type: application/json

{
  "email": "teacher@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "Teacher invitation created successfully",
  "invitation": {
    "id": 1,
    "email": "teacher@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "pending",
    "expiresAt": "2025-10-24T12:00:00.000Z"
  },
  "invitationLink": "http://localhost:5173/register/teacher/abc123..."
}
```

#### Get All Invitations
```http
GET /api/admin/teachers/invitations
```

#### Get All Teachers
```http
GET /api/admin/teachers
```

#### Toggle Teacher Status
```http
PATCH /api/admin/teachers/:id/toggle-status
```

#### Revoke Invitation
```http
DELETE /api/admin/teachers/invitations/:id
```

### Teacher Registration Endpoints (Public)

#### Get Invitation Details
```http
GET /api/auth/register/teacher/:token
```

**Response:**
```json
{
  "email": "teacher@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "expiresAt": "2025-10-24T12:00:00.000Z"
}
```

#### Complete Teacher Registration
```http
POST /api/auth/register/teacher/:token
Content-Type: application/json

{
  "password": "securepassword123"
}
```

## Database Schema

### TeacherInvitations Table
```sql
CREATE TABLE TeacherInvitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  firstName VARCHAR(255) NOT NULL,
  lastName VARCHAR(255) NOT NULL,
  invitationToken VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('pending', 'accepted', 'expired') DEFAULT 'pending',
  invitedBy INTEGER NOT NULL REFERENCES Users(id),
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

## Testing

### 1. Test Admin Account Creation
```bash
cd server
node create-admin.js
```

### 2. Test Teacher Invitation Flow
1. Login as admin (admin@lms.com / admin123)
2. Navigate to `/admin`
3. Click "Invite Teacher"
4. Enter teacher details
5. Copy invitation link
6. Open link in new browser/incognito
7. Complete registration
8. Login as teacher

### 3. Test Security
1. Try to register as teacher via `/register` - Should fail
2. Try to access `/admin` as student - Should redirect to unauthorized
3. Try to use expired invitation token - Should show error

## Error Handling

### Common Errors

#### Invalid/Expired Invitation
```json
{
  "message": "Invalid or expired invitation token"
}
```

#### Email Already Registered
```json
{
  "message": "Email already registered as a user"
}
```

#### Self-Registration as Teacher Blocked
```json
{
  "message": "Cannot self-register as teacher or admin. Please contact an administrator for teacher access."
}
```

## Admin User Details

### Default Admin Account
```
📧 Email: admin@lms.com
🔑 Password: admin123
👤 Role: admin
```

⚠️ **Security Notice**: Change the default password immediately after first login!

### Create Additional Admin Users
```bash
# Modify create-admin.js with new credentials
# Then run:
node server/create-admin.js
```

## Deployment Considerations

### Environment Variables
Ensure these are set in production:
```env
JWT_SECRET=your-production-secret-key
CLIENT_URL=https://your-production-domain.com
```

### Production Setup
1. Change default admin password
2. Use strong JWT secret
3. Enable HTTPS for invitation links
4. Set up email service for automatic invitation emails
5. Configure proper CORS settings

## Future Enhancements

### Potential Features
- [ ] Email notifications for invitations
- [ ] Bulk teacher invitation import
- [ ] Custom invitation messages
- [ ] Teacher application requests
- [ ] Multi-factor authentication for admin
- [ ] Audit log for admin actions
- [ ] Teacher profile approval workflow
- [ ] Invitation reminder emails

## Troubleshooting

### Invitation Link Not Working
- Check if invitation has expired
- Verify token in URL is complete
- Check if invitation was revoked
- Ensure email is not already registered

### Cannot Access Admin Dashboard
- Verify user role is 'admin'
- Check if logged in
- Clear browser cache/cookies
- Verify JWT token is valid

### Teacher Cannot Register
- Verify invitation token is valid
- Check invitation status (must be 'pending')
- Ensure expiration date hasn't passed
- Confirm email is not already in use

## Support

For issues or questions:
1. Check server logs for errors
2. Verify database contains TeacherInvitations table
3. Confirm all routes are properly registered
4. Test API endpoints with Postman/curl

## Summary

✅ **Security Enhanced**: No unauthorized teacher registrations
✅ **Admin Control**: Full teacher management capabilities
✅ **Audit Trail**: Track all invitations and registrations
✅ **User-Friendly**: Simple invitation and registration process
✅ **Scalable**: Can handle multiple admins and teachers

The system is now production-ready with proper security controls! 🎉
