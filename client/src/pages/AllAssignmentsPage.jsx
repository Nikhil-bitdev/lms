import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService } from '../services/assignmentService';
import { courseService } from '../services/courseService';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';

const AllAssignmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, overdue, completed
  const [deleting, setDeleting] = useState(null); // Track which assignment is being deleted
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, assignmentId: null, assignmentTitle: '' });

  const isTeacher = user?.role === 'teacher' || user?.role === 'instructor';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await assignmentService.getUserAssignments();
      setAssignments(data.assignments || []);
      
      // Fetch courses for students
      if (isStudent) {
        const coursesData = await courseService.getMyCourses();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId, assignmentTitle) => {
    setConfirmDialog({ 
      isOpen: true, 
      assignmentId, 
      assignmentTitle 
    });
  };

  const confirmDelete = async () => {
    const { assignmentId } = confirmDialog;
    
    setDeleting(assignmentId);
    try {
      await assignmentService.deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      
      // Refresh the assignments list
      await fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeleting(null);
    }
  };

  const getFilteredAssignments = () => {
    const now = new Date();
    
    switch (filter) {
      case 'pending':
        return assignments.filter(assignment => {
          const dueDate = new Date(assignment.dueDate);
          return dueDate > now && !assignment.submitted;
        });
      case 'overdue':
        return assignments.filter(assignment => {
          const dueDate = new Date(assignment.dueDate);
          return dueDate < now && !assignment.submitted;
        });
      case 'completed':
        return assignments.filter(assignment => assignment.submitted);
      default:
        return assignments;
    }
  };

  const filteredAssignments = getFilteredAssignments();

  const AssignmentCard = ({ assignment }) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const isOverdue = dueDate < now;
    const timeUntilDue = dueDate - now;
    const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));

    const getStatus = () => {
      if (assignment.submitted) return 'Submitted';
      if (isOverdue) return 'Overdue';
      if (daysUntilDue <= 1) return 'Due Soon';
      return 'Pending';
    };

    const status = getStatus();
    
    const statusColors = {
      Submitted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Due Soon': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    };

    const formatTimeRemaining = () => {
      if (isOverdue) return 'Overdue';
      if (daysUntilDue === 0) return 'Due today';
      if (daysUntilDue === 1) return 'Due tomorrow';
      return `${daysUntilDue} days remaining`;
    };

    return (
      <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-2xl transition-all p-6 overflow-hidden transform hover:-translate-y-1">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {assignment.title}
                </h3>
                {assignment.attachments && assignment.attachments.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {assignment.attachments.length}
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-bold ring-2 ${statusColors[status]} group-hover:scale-110 transition-transform`}>
                  {status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-base">
                {assignment.description}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                  <span className="text-gray-500 dark:text-gray-400">Course: </span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300">{assignment.Course?.title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid with Icon Badges */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Due Date Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-700 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Due Date</p>
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-base">
                {dueDate.toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {/* Grade Card (if student has been graded) */}
            {assignment.Submissions && assignment.Submissions.length > 0 && assignment.Submissions[0].grade !== null ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border-2 border-green-200 dark:border-green-700 hover:shadow-md transition-all ring-4 ring-green-100 dark:ring-green-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Your Grade</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-2xl">
                  {assignment.Submissions[0].grade}<span className="text-lg text-gray-500 dark:text-gray-400">/{assignment.totalPoints}</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {((assignment.Submissions[0].grade / assignment.totalPoints) * 100).toFixed(1)}%
                </p>
              </div>
            ) : (
              /* Points Card (shown when not graded yet) */
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border-2 border-amber-200 dark:border-amber-700 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">Points</p>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-xl">
                  {assignment.totalPoints}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Points</p>
              </div>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold ${
              isOverdue 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                : daysUntilDue <= 1 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{formatTimeRemaining()}</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/assignments/${assignment.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </Link>
              
              {(isTeacher || isAdmin) && (
                <Link
                  to={`/assignments/${assignment.id}#submissions`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Submissions
                </Link>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  disabled={deleting === assignment.id}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                >
                  {deleting === assignment.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              )}
              
              {!isTeacher && !isAdmin && !assignment.submitted && !isOverdue && (
                <Link
                  to={`/assignments/${assignment.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Submit Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-2xl p-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {isAdmin ? 'All Assignments' : isTeacher ? 'My Assignments' : 'All Assignments'}
            </h1>
            <p className="text-blue-100 text-lg">
              {isAdmin
                ? 'All assignments from all courses in the system'
                : isTeacher 
                  ? 'Assignments from all your courses'
                  : 'All assignments from your enrolled courses'
              }
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-sm font-medium">{assignments.length} Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Course Cards Section - Students Only */}
      {isStudent && courses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Select a Course
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              // Calculate pending assignments for this course
              const courseAssignments = assignments.filter(
                a => a.courseId === course.id && !a.submitted && new Date(a.dueDate) > new Date()
              );
              const pendingCount = courseAssignments.length;
              
              // Check if there are assignments due within the next 3 days
              const hasDueSoon = courseAssignments.some(a => {
                const daysUntilDue = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                return daysUntilDue <= 3;
              });

              return (
                <button
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}/assignments`)}
                  className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-6 text-left overflow-hidden"
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Due Soon Badge */}
                  {hasDueSoon && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg shadow-sm">
                      <svg className="w-3 h-3 text-orange-600 dark:text-orange-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Due Soon</span>
                    </div>
                  )}
                  
                  <div className="relative">
                    {/* Course Code Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-3 shadow-md group-hover:shadow-lg transition-shadow">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <span className="text-sm font-bold text-white">{course.code}</span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      {course.title}
                    </h3>

                    {/* Course Description */}
                    {course.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    {/* Teacher Info */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Instructor</p>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {course.Teacher?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    {/* Pending Assignments Count */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {pendingCount} {pendingCount === 1 ? 'assignment' : 'assignments'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Arrow Icon */}
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Courses Message - Students Only */}
      {isStudent && courses.length === 0 && (
        <div className="relative bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-16 text-center overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #a855f7 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
          
          {/* Content */}
          <div className="relative">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-xl">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Courses Enrolled
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              You are not enrolled in any courses yet. Check with your instructor or admin to get enrolled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAssignmentsPage;