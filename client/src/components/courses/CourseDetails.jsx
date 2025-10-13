import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import LoadingSpinner from '../LoadingSpinner';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await courseService.getCourseById(id);
        setCourse(courseData);
        // Check if user is enrolled
        const myCourses = await courseService.getMyCourses();
        setIsEnrolled(myCourses.some(c => c.id === courseData.id));
      } catch (err) {
        setError('Failed to fetch course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await courseService.enrollInCourse(id);
      setIsEnrolled(true);
    } catch (err) {
      setError('Failed to enroll in the course. Please try again.');
    }
  };

  const handleUnenroll = async () => {
    try {
      await courseService.unenrollFromCourse(id);
      setIsEnrolled(false);
    } catch (err) {
      setError('Failed to unenroll from the course. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(id);
        navigate('/courses');
      } catch (err) {
        setError('Failed to delete the course. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {course.description}
            </p>
          </div>
          {user?.role === 'instructor' && user.id === course.instructorId ? (
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/courses/${id}/edit`)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete
              </button>
            </div>
          ) : (
            isEnrolled ? (
              <button
                onClick={handleUnenroll}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Unenroll
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Enroll
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Course Information
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Instructor:</span> {course.instructor?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Start Date:</span>{' '}
                {new Date(course.startDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">End Date:</span>{' '}
                {new Date(course.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Capacity:</span>{' '}
                {course.enrollmentCount}/{course.capacity}
              </p>
            </div>
          </div>

          {isEnrolled && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href={`/courses/${id}/materials`}
                  className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  📁 Course Materials
                </a>
                <a
                  href={`/courses/${id}/assignments`}
                  className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  📝 Assignments
                </a>
                <a
                  href={`/courses/${id}/quizzes`}
                  className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ✍️ Quizzes
                </a>
                <a
                  href={`/courses/${id}/discussions`}
                  className="block text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  💬 Discussions
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;