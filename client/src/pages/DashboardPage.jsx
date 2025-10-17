import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import QuickAssignmentUpload from '../components/assignments/QuickAssignmentUpload';
import { courseService } from '../services/courseService';
import { assignmentService } from '../services/assignmentService';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    assignments: [],
    coursesCount: 0,
    pendingAssignments: 0,
    upcomingQuizzes: 0
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesResponse, assignmentsResponse] = await Promise.all([
        courseService.getMyCourses(),
        assignmentService.getUserAssignments()
      ]);

      const courses = Array.isArray(coursesResponse) ? coursesResponse : [];
      const assignments = assignmentsResponse?.assignments || [];

      // For students, calculate pending assignments
      const now = new Date();
      const pendingAssignments = assignments.filter(assignment => {
        const dueDate = new Date(assignment.dueDate);
        return dueDate > now && !assignment.isSubmitted;
      });

      setDashboardData({
        courses,
        assignments,
        coursesCount: courses.length,
        pendingAssignments: pendingAssignments.length,
        upcomingQuizzes: 0 // TODO: Implement quizzes
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const isTeacher = user.role === 'teacher' || user.role === 'admin';
  const isStudent = user.role === 'student';

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome back, {user.firstName} {user.lastName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {isTeacher 
            ? 'Manage your courses, assignments, and student progress from here.'
            : 'This is your personalized dashboard. You can access all your learning resources from here.'}
        </p>
      </div>

      {/* Teacher Quick Actions */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/create-course')}
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">Create Course</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add a new course</p>
              </div>
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">Upload Assignment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Create assignment for course</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/assignments')}
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">View Submissions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Grade student work</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Student Quick Actions */}
      {isStudent && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">Browse Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Explore available courses</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/assignments')}
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <ClipboardDocumentListIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">My Assignments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">View and submit work</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/courses')}
              className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 dark:text-white">My Courses</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Access enrolled courses</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/courses')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {isTeacher ? 'Teaching' : 'Enrolled Courses'}
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.coursesCount}
              </p>
            </div>
            <AcademicCapIcon className="h-12 w-12 text-blue-200 dark:text-blue-800" />
          </div>
        </div>
        
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/assignments')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {isTeacher ? 'Total Assignments' : 'Pending Assignments'}
              </h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {isTeacher ? dashboardData.assignments.length : dashboardData.pendingAssignments}
              </p>
            </div>
            <ClipboardDocumentListIcon className="h-12 w-12 text-yellow-200 dark:text-yellow-800" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Upcoming Quizzes
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {dashboardData.upcomingQuizzes}
              </p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-200 dark:text-green-800" />
          </div>
        </div>
      </div>

      {/* My Courses / Enrolled Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isTeacher ? 'My Courses' : 'Enrolled Courses'}
          </h2>
          <Link 
            to="/courses" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All
          </Link>
        </div>
        
        {dashboardData.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.courses.slice(0, 6).map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {course.code}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Instructor'}
                </div>
                {course.enrollmentCount !== undefined && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {course.enrollmentCount} students enrolled
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-300">
              {isTeacher ? 'You haven\'t created any courses yet.' : 'You haven\'t enrolled in any courses yet.'}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isTeacher ? 'Create Course' : 'Browse Courses'}
            </button>
          </div>
        )}
      </div>

      {/* Recent Assignments */}
      {isStudent && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Recent Assignments
            </h2>
            <Link 
              to="/assignments" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </Link>
          </div>
          
          {dashboardData.assignments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.assignments.slice(0, 5).map((assignment) => {
                const dueDate = new Date(assignment.dueDate);
                const now = new Date();
                const isOverdue = dueDate < now && !assignment.isSubmitted;
                const isPending = dueDate > now && !assignment.isSubmitted;
                
                return (
                  <Link
                    key={assignment.id}
                    to={`/assignments/${assignment.id}`}
                    className="block border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {assignment.Course?.title || 'Course'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        {assignment.isSubmitted ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium rounded-full">
                            Submitted
                          </span>
                        ) : isOverdue ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded-full">
                            Overdue
                          </span>
                        ) : isPending ? (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-300">
                No assignments yet
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Assignment Upload Modal */}
      <QuickAssignmentUpload
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
    </div>
  );
};

export default DashboardPage;