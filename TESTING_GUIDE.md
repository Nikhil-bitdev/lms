# Quick Test Guide - Assignment Upload Feature

## Prerequisites
- Backend running on: http://127.0.0.1:5001
- Frontend running on: http://localhost:5174
- Test teacher account: teacher@example.com / password123

## Testing Steps

### Test 1: Dashboard Quick Actions
1. Open http://localhost:5174
2. Login with teacher credentials
3. Navigate to Dashboard
4. Verify:
   - ✅ "Quick Actions" panel is visible (blue gradient background)
   - ✅ Three action buttons are displayed:
     - Create Course
     - Upload Assignment
     - View Submissions
   - ✅ Icons are displaying correctly

### Test 2: Quick Upload Modal from Dashboard
1. Click "Upload Assignment" button in Quick Actions
2. Verify:
   - ✅ Modal opens with proper styling
   - ✅ "Quick Upload Assignment" header is visible
   - ✅ Close button (X) works
3. Fill in the form:
   - Select a course from dropdown
   - Enter title: "Test Assignment"
   - Enter description: "This is a test assignment for the quick upload feature"
   - Select due date (future date)
   - Enter points: 100
   - Upload 1-2 test files
4. Verify:
   - ✅ Course dropdown populates with your courses
   - ✅ Files show up in the list with name and size
   - ✅ File remove button (X) works
   - ✅ Form validation works (try submitting empty)
5. Click "Create Assignment"
6. Verify:
   - ✅ Success toast notification appears
   - ✅ Modal closes
   - ✅ Assignment is created (check in courses page)

### Test 3: Floating Action Button (FAB)
1. Navigate to Courses page
2. Verify:
   - ✅ Blue circular button visible at bottom-right
   - ✅ Button shows "+" icon
   - ✅ On hover, text "Upload Assignment" appears
3. Click the FAB
4. Verify:
   - ✅ Same modal opens as from dashboard
   - ✅ All functionality works the same

### Test 4: Dark Mode
1. Toggle dark mode (if available in your app)
2. Verify:
   - ✅ Quick Actions panel has proper dark mode colors
   - ✅ Modal has dark background and text
   - ✅ All form inputs are readable
   - ✅ FAB is visible in dark mode

### Test 5: Student View
1. Logout
2. Login as a student (if available)
3. Navigate to Dashboard
4. Verify:
   - ✅ Quick Actions panel is NOT visible
5. Navigate to Courses page
6. Verify:
   - ✅ FAB is NOT visible

### Test 6: File Upload Validation
1. Login as teacher
2. Open upload modal
3. Try to upload:
   - More than 5 files
   - Large files (> 10MB if configured)
4. Verify:
   - ✅ Error message appears
   - ✅ Files are not added to the list

### Test 7: Form Validation
1. Open upload modal
2. Try to submit without:
   - Selecting a course
   - Entering title
   - Entering description
   - Setting due date
3. Verify:
   - ✅ Browser/form validation prevents submission
   - ✅ Error messages are clear

### Test 8: Course Code Validation (Fixed Earlier)
1. Navigate to Create Course page
2. Try entering lowercase course code
3. Verify:
   - ✅ Code automatically converts to uppercase
   - ✅ Only allows A-Z, 0-9, and hyphens
4. Create a course successfully
5. Verify:
   - ✅ Course appears in Upload Assignment dropdown

### Test 9: Mobile Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device
4. Navigate through:
   - Dashboard
   - Quick Actions
   - Upload Modal
   - FAB on Courses page
5. Verify:
   - ✅ Layout adapts to mobile screen
   - ✅ All buttons are clickable
   - ✅ Modal is scrollable
   - ✅ FAB doesn't overlap content

### Test 10: Error Handling
1. Stop the backend server temporarily
2. Try to create an assignment
3. Verify:
   - ✅ Error toast appears
   - ✅ Modal stays open
   - ✅ Form data is preserved
4. Restart backend
5. Try again
6. Verify:
   - ✅ Works after backend recovers

## Expected Results Summary

### UI Elements Created:
1. ✅ Quick Actions panel on Dashboard
2. ✅ QuickAssignmentUpload modal component
3. ✅ Floating Action Button on Courses page
4. ✅ Toast notifications for feedback

### Functionality:
1. ✅ Teachers can quickly upload assignments
2. ✅ File upload with drag & drop support
3. ✅ Form validation and error handling
4. ✅ Role-based UI rendering
5. ✅ Dark mode support
6. ✅ Mobile responsive design

### Bug Fixes:
1. ✅ Fixed duplicate route keys warning
2. ✅ Fixed course code validation
3. ✅ Improved error message display

## Common Issues & Solutions

### Issue 1: Modal doesn't open
- **Solution**: Check browser console for errors, verify imports

### Issue 2: No courses in dropdown
- **Solution**: 
  - Ensure you're logged in as teacher
  - Create a course first
  - Check network tab for API errors

### Issue 3: File upload fails
- **Solution**:
  - Check backend multer configuration
  - Verify file size limits
  - Check file types are allowed

### Issue 4: FAB not visible
- **Solution**:
  - Ensure logged in as teacher
  - Check user role in AuthContext
  - Verify z-index isn't conflicting

## Next Steps After Testing

If all tests pass:
1. ✅ Feature is ready for production
2. Consider adding analytics tracking
3. Document any edge cases found
4. Create user training materials

If tests fail:
1. Note which tests failed
2. Check browser console for errors
3. Review server logs
4. Fix issues and re-test

## Performance Notes

- Modal loads on demand (not initially rendered)
- Files are validated client-side before upload
- API calls use multipart/form-data for efficiency
- Toast notifications auto-dismiss after 3-5 seconds

## Accessibility Checklist

- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Color contrast meets WCAG standards
- ✅ Focus indicators visible
- ✅ ARIA labels present

---

**Test Date**: _________________
**Tester**: _________________
**Status**: [ ] Pass [ ] Fail [ ] Needs Review
**Notes**: _________________
