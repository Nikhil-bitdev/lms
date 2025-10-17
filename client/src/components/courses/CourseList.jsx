import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import LoadingSpinner from '../LoadingSpinner';
import ConfirmDialog from '../common/ConfirmDialog';

const CourseCard = ({ course, onEnroll, onUnenroll, isEnrolled, user }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
        {course.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {course.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            👤 {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Teacher'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            👥 {course.enrollmentCount || 0} students
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Link
            to={`/courses/${course.id}`}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View Details
          </Link>
          
          {/* Teacher/Instructor actions */}
          {(user?.role === 'teacher' || user?.role === 'instructor') && course.teacherId === user?.id && (
            <>
              <Link
                to={`/courses/${course.id}/assignments`}
                className="px-3 py-1 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                📝 Assignments
              </Link>
              <Link
                to={`/courses/${course.id}/assignments/create`}
                className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                ➕ New Assignment
              </Link>
            </>
          )}
          
          {/* Student actions */}
          {isEnrolled && course.teacherId !== user?.id && (
            <Link
              to={`/courses/${course.id}/assignments`}
              className="px-3 py-1 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              📝 Assignments
            </Link>
          )}
          
          {/* Enrollment actions (only for non-teachers) */}
          {course.teacherId !== user?.id && (
            <>
              {isEnrolled ? (
                <button
                  onClick={() => onUnenroll(course.id)}
                  className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Unenroll
                </button>
              ) : (
                <button
                  onClick={() => onEnroll(course.id)}
                  className="px-3 py-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  Enroll
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    courseId: null,
    courseName: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [allCoursesResponse, myCourses] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getMyCourses()
        ]);
        // Handle the response structure from backend
        const allCourses = allCoursesResponse.courses || allCoursesResponse;
        setCourses(allCourses);
        setEnrolledCourses(myCourses);
      } catch (err) {
        setError('Failed to fetch courses. Please try again later.');
        console.error('Fetch courses error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollInCourse(courseId);
      const updatedCourses = await courseService.getMyCourses();
      setEnrolledCourses(updatedCourses);
      
      // Clear any existing errors
      setError(null);
      
      const course = courses.find(c => c.id === courseId);
      const courseName = course ? course.title : 'the course';
      alert(`Successfully enrolled in "${courseName}"`);
    } catch (err) {
      console.error('Enroll error:', err);
      setError(err.response?.data?.message || 'Failed to enroll in the course. Please try again.');
    }
  };

  const handleUnenroll = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    const courseName = course ? course.title : 'this course';
    
    // Open confirmation dialog
    setConfirmDialog({
      isOpen: true,
      courseId,
      courseName
    });
  };

  const confirmUnenroll = async () => {
    const { courseId, courseName } = confirmDialog;
    
    try {
      await courseService.unenrollFromCourse(courseId);
      const updatedCourses = await courseService.getMyCourses();
      setEnrolledCourses(updatedCourses);
      
      // Show success message
      setError(null);
      setSuccessMessage(`Successfully unenrolled from "${courseName}"`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Unenroll error:', err);
      setError(err.response?.data?.message || 'Failed to unenroll from the course. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Available Courses
        </h1>
        {(user?.role === 'instructor' || user?.role === 'teacher' || user?.role === 'admin') && (
          <Link
            to="/create-course"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Course
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
            isEnrolled={enrolledCourses.some((c) => c.id === course.id)}
            user={user}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, courseId: null, courseName: '' })}
        onConfirm={() => {
          confirmUnenroll();
          setConfirmDialog({ isOpen: false, courseId: null, courseName: '' });
        }}
        title="Unenroll from Course"
        message={`Are you sure you want to unenroll from "${confirmDialog.courseName}"? You will lose access to all course materials and assignments.`}
        confirmText="Unenroll"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CourseList;