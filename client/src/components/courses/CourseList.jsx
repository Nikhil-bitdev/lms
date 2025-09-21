import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import { LoadingSpinner } from '../LoadingSpinner';

const CourseCard = ({ course, onEnroll, onUnenroll, isEnrolled }) => {
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
            👤 {course.instructor.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            👥 {course.enrollmentCount} students
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            to={`/courses/${course.id}`}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View Details
          </Link>
          {isEnrolled ? (
            <button
              onClick={() => onUnenroll(course.id)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Unenroll
            </button>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Enroll
            </button>
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
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const [allCourses, myCourses] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getMyCourses()
        ]);
        setCourses(allCourses);
        setEnrolledCourses(myCourses);
      } catch (err) {
        setError('Failed to fetch courses. Please try again later.');
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
    } catch (err) {
      setError('Failed to enroll in the course. Please try again.');
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      await courseService.unenrollFromCourse(courseId);
      const updatedCourses = await courseService.getMyCourses();
      setEnrolledCourses(updatedCourses);
    } catch (err) {
      setError('Failed to unenroll from the course. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Available Courses
        </h1>
        {user?.role === 'instructor' && (
          <Link
            to="/courses/create"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
            isEnrolled={enrolledCourses.some((c) => c.id === course.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseList;