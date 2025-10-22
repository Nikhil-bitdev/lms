# Role-Based Access Control Guide

## Overview
The LMS implements strict role-based access control (RBAC) to ensure proper separation of duties and security. This document outlines the permissions and access levels for each role.

---

## Roles

### 1. **Admin** 👑
**Full system control and administrative privileges**

#### Course Management
- ✅ View all courses in the system
- ✅ Create new courses and assign them to teachers
- ✅ Edit any course details
- ✅ Delete any course
- ✅ View all course analytics

#### User Management
- ✅ Invite teachers via email (with secure invitation tokens)
- ✅ View all teachers and their status
- ✅ Activate/Deactivate teacher accounts
- ✅ Revoke pending teacher invitations
- ✅ View all students in the system
- ⛔ Cannot self-register teachers (security measure)

#### Access Points
- Admin Dashboard: `/admin`
- All teacher and student features

---

### 2. **Teacher** 👨‍🏫
**Limited to assigned courses only**

#### Course Management
- ✅ View **only courses assigned by admin**
- ✅ Edit courses assigned to them
- ✅ Delete courses assigned to them
- ⛔ Cannot create new courses (admin-only feature)
- ⛔ Cannot view courses assigned to other teachers

#### Student Management
- ✅ View students enrolled in their courses
- ✅ Grade assignments and submissions
- ✅ View student progress in their courses

#### Content Management
- ✅ Create/edit/delete assignments in their courses
- ✅ Create/edit/delete quizzes in their courses
- ✅ Upload course materials
- ✅ Manage course announcements

#### Registration
- ⛔ Cannot self-register
- ✅ Must be invited by admin via secure email invitation
- ✅ Invitation link expires after 7 days

#### Access Points
- Teacher Dashboard: `/dashboard`
- Course Details: `/courses/:id` (assigned courses only)
- Assignments, Materials, Quizzes (for assigned courses)

---

### 3. **Student** 🎓
**Can browse and enroll in published courses**

#### Course Access
- ✅ View **all published courses** (can browse catalog)
- ✅ Enroll in available courses
- ✅ Unenroll from courses they're enrolled in
- ✅ View course details, materials, and assignments
- ⛔ Cannot view unpublished courses
- ⛔ Cannot edit or delete courses

#### Learning Activities
- ✅ Submit assignments
- ✅ Take quizzes
- ✅ Download course materials
- ✅ View their grades and feedback
- ✅ Participate in course discussions

#### Registration
- ✅ Can self-register with student role
- ✅ Public registration page: `/register`
- ⛔ Cannot register as teacher or admin

#### Access Points
- Student Dashboard: `/dashboard`
- Courses Page: `/courses` (shows all available courses)
- Course Details: `/courses/:id` (enrolled courses)
- Assignments: `/assignments`
- Materials: `/materials`

---

## Course Visibility Matrix

| Role | Course View | Details |
|------|------------|---------|
| **Admin** | All courses | Can see and manage all courses in the system |
| **Teacher** | Assigned courses only | Only sees courses assigned by admin |
| **Student** | All published courses | Can browse catalog and enroll in any published course |

---

## Course Creation Workflow

### Previous Workflow (Deprecated)
```
Teacher creates course → Students enroll
```

### Current Workflow (Secure)
```
Admin creates course → Admin assigns to teacher → Course published → Students can enroll
```

**Why this change?**
- Better administrative control
- Prevents unauthorized course creation
- Ensures proper teacher assignment
- Maintains quality control

---

## User Registration Workflows

### Admin Registration
- **Method**: Manual database creation or initial setup script
- **Login**: `admin@lms.com` / `admin123` (change in production!)

### Teacher Registration
```
1. Admin sends invitation from Admin Dashboard
2. Teacher receives email with secure invitation link
3. Teacher clicks link (valid for 7 days)
4. Teacher completes registration form
5. Account activated automatically
```

### Student Registration
```
1. Student visits /register page
2. Fills out registration form
3. Selects "Student" role (only option)
4. Account created immediately
5. Can log in and browse courses
```

---

## Security Features

### 1. **Defense in Depth**
- Backend validation for all role-based actions
- Frontend UI restrictions (hiding unauthorized options)
- Database-level constraints
- Middleware authorization checks

### 2. **Teacher Invitation Security**
- Cryptographically secure random tokens (32 bytes)
- Time-limited invitations (7 days expiration)
- Single-use tokens (marked as used after registration)
- Email verification required

### 3. **Course Access Control**
- Published/unpublished course states
- Enrollment limits enforcement
- Teacher-course assignment validation
- Student enrollment validation

### 4. **API Protection**
- JWT authentication required for all routes
- Role-based middleware authorization
- Input validation on all endpoints
- SQL injection protection via Sequelize ORM

---

## Common Scenarios

### Scenario 1: Adding a New Teacher
1. Admin logs in → Admin Dashboard
2. Click "Invite Teacher"
3. Enter teacher's email, first name, last name
4. System sends invitation email
5. Teacher receives email and completes registration
6. Admin assigns courses to the new teacher

### Scenario 2: Creating a New Course
1. Admin logs in → Admin Dashboard
2. Click "Create New Course"
3. Fill in course details (title, code, description, dates)
4. Select teacher from dropdown (active teachers only)
5. Course created and automatically assigned to selected teacher
6. Course is published and visible to students

### Scenario 3: Student Enrolling in a Course
1. Student logs in → Dashboard
2. Navigate to Courses page (sees all available courses)
3. Browse courses (can see course details)
4. Click "Enroll" on desired course
5. Instant enrollment (if within enrollment limit)
6. Course appears in "My Courses"

---

## Troubleshooting

### "Why can't I see any courses as a teacher?"
- You need courses assigned by admin
- Check with admin to assign courses to your account

### "Why can't I create a course as a teacher?"
- Course creation is admin-only for security
- Request admin to create and assign courses

### "Students can't see my new course"
- Ensure course is marked as "Published"
- Check course visibility settings
- Verify course was created by admin

### "Teacher invitation link not working"
- Check if invitation expired (7 days limit)
- Verify correct link from email
- Contact admin to resend invitation

---

## Best Practices

### For Admins
- ✅ Change default admin password immediately
- ✅ Only invite trusted individuals as teachers
- ✅ Regularly review active teacher accounts
- ✅ Monitor course creation and assignment
- ✅ Set appropriate enrollment limits

### For Teachers
- ✅ Keep invitation links confidential
- ✅ Report any access issues to admin
- ✅ Only work within assigned courses
- ✅ Regularly update course materials

### For Students
- ✅ Browse all available courses before enrolling
- ✅ Check enrollment limits before enrolling
- ✅ Unenroll from courses you won't complete
- ✅ Keep login credentials secure

---

## Technical Implementation

### Frontend Course Fetching Logic
```javascript
// CourseList.jsx
if (user?.role === 'teacher') {
  // Teachers: only assigned courses
  const myCourses = await courseService.getMyCourses();
  setCourses(myCourses);
} else if (user?.role === 'student') {
  // Students: all available courses + enrollment status
  const [allCourses, myCourses] = await Promise.all([
    courseService.getAllCourses(),
    courseService.getMyCourses()
  ]);
  setCourses(allCourses);
  setEnrolledCourses(myCourses);
} else if (user?.role === 'admin') {
  // Admin: all courses
  const allCourses = await courseService.getAllCourses();
  setCourses(allCourses);
}
```

### Backend Authorization Middleware
```javascript
// Protect course creation (admin only)
router.post('/',
  auth,
  authorize('admin'),
  courseController.createCourse
);

// Protect course updates (teacher/admin only)
router.put('/:id',
  auth,
  authorize('teacher', 'admin'),
  courseController.updateCourse
);
```

---

## Related Documentation
- [Login Fix Guide](LOGIN_FIXED.md) - Troubleshooting authentication
- [README](README.md) - General setup and installation
- [GitHub Workflow](.github/workflows/) - CI/CD pipelines

---

**Last Updated**: October 21, 2025  
**Version**: 2.0 (Role-based course management)
