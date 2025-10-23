import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
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
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null); // Track which assignment is being deleted
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, assignmentId: null, assignmentTitle: '' });
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    assignments: [],
    coursesCount: 0,
    pendingAssignments: 0,
    upcomingQuizzes: 0
  });
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [allSubmissions, setAllSubmissions] = useState([]);

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
        return dueDate > now && !assignment.submitted;
      });

      // For admin, calculate total assignments and active courses
      const activeAssignments = user.role === 'admin' 
        ? assignments.filter(a => new Date(a.dueDate) >= now).length
        : pendingAssignments.length;

      setDashboardData({
        courses,
        assignments,
        coursesCount: courses.length,
        pendingAssignments: activeAssignments,
        upcomingQuizzes: 0 // TODO: Implement quizzes
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      await fetchDashboardData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setDeleting(null);
    }
  };

  // Fetch submissions for assignments and open modal
  const openSubmissionsModal = async () => {
    setShowSubmissionsModal(true);
    setSubmissionsLoading(true);
    try {
      const assignments = dashboardData.assignments || [];
      console.log('[Dashboard] openSubmissionsModal - assignments count:', assignments.length, assignments.map(a=>a.id));
      const results = await Promise.all(assignments.map(async (a) => {
        try {
          const res = await assignmentService.getAssignmentSubmissions(a.id);
          console.log(`[Dashboard] submissions for assignment ${a.id}:`, (res.submissions || []).length);
          return { assignment: a, submissions: res.submissions || [] };
        } catch (err) {
          console.error(`[Dashboard] error fetching submissions for assignment ${a.id}:`, err?.response?.status, err?.response?.data || err.message || err);
          return { assignment: a, submissions: [] };
        }
      }));

      const flattened = [];
      results.forEach((r) => {
        (r.submissions || []).forEach((s) => {
          flattened.push({ assignmentId: r.assignment.id, assignmentTitle: r.assignment.title, submission: s });
        });
      });

      setAllSubmissions(flattened);
    } catch (error) {
      console.error('Error fetching submissions for dashboard:', error);
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const isTeacher = user.role === 'teacher' || user.role === 'admin' || user.role === 'instructor';
  const isStudent = user.role === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ...removed teacher's course cards section... */}
        
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Welcome back, {user.firstName}! 👋
                </h1>
                <p className="text-xl text-white/90">
                  {isTeacher 
                    ? 'Ready to inspire minds today?'
                    : 'Continue your learning journey'}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <AcademicCapIcon className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover-lift transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <BookOpenIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">
                      {user.role === 'admin' ? 'Total Courses' : 'Total Courses'}
                    </p>
                    <p className="text-white text-2xl font-bold">{dashboardData.coursesCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover-lift transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">
                      {user.role === 'admin' ? 'Total Assignments' : isTeacher ? 'Total Assignments' : 'Pending Tasks'}
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {user.role === 'admin' ? dashboardData.assignments.length : isStudent ? dashboardData.pendingAssignments : dashboardData.assignments.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover-lift transition-smooth">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    {user.role === 'admin' ? (
                      <ClockIcon className="h-6 w-6 text-white" />
                    ) : (
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">
                      {user.role === 'admin' ? 'Active Assignments' : 'Completion Rate'}
                    </p>
                    <p className="text-white text-2xl font-bold">
                      {user.role === 'admin' 
                        ? dashboardData.pendingAssignments
                        : dashboardData.assignments.length > 0 
                          ? Math.round(((dashboardData.assignments.length - dashboardData.pendingAssignments) / dashboardData.assignments.length) * 100) + '%'
                          : '0%'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Quick Actions
                  </span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.role === 'admin' ? (
                  <>
                    <button
                      onClick={() => navigate('/courses')}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-200 dark:border-blue-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <AcademicCapIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Manage Courses</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">View and manage all courses</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/create-course')}
                      className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-green-200 dark:border-green-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <PlusIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Create Course</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Add new course to system</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={openSubmissionsModal}
                      className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-200 dark:border-purple-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">All Assignments</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Monitor assignments system-wide</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/materials')}
                      className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-orange-200 dark:border-orange-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Study Materials</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Manage learning resources</p>
                        </div>
                      </div>
                    </button>
                  </>
                ) : isTeacher ? (
                  <>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-green-200 dark:border-green-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Upload Assignment</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Create new assignment for your courses</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/assignments')}
                      className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-purple-200 dark:border-purple-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">View Submissions</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Review and grade student work</p>
                        </div>
                      </div>
                    </button>

                    {/* Submissions Modal Trigger: fetch recent submissions for teacher's assignments */}

                    <button
                      onClick={() => navigate('/courses')}
                      className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-cyan-200 dark:border-cyan-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <AcademicCapIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">My Courses</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Access your teaching courses</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/materials')}
                      className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-amber-200 dark:border-amber-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Upload Materials</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Upload study materials to your courses</p>
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/courses')}
                      className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-200 dark:border-blue-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <BookOpenIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Browse Courses</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Discover new learning opportunities</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/assignments')}
                      className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-orange-200 dark:border-orange-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">My Assignments</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">View and submit your work</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/courses')}
                      className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-cyan-200 dark:border-cyan-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <AcademicCapIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">My Courses</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Access your enrolled courses</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate('/materials')}
                      className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-amber-200 dark:border-amber-800 hover:scale-105"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg p-3 group-hover:scale-110 transition-transform">
                          <DocumentTextIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Study Materials</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Access learning resources</p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed / Upcoming */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {user.role === 'admin' ? 'All Assignments' : 'Upcoming Deadlines'}
            </h2>
            <div className="space-y-3">
              {dashboardData.assignments.slice(0, 5).map((assignment, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {assignment.title}
                    </p>
                    {user.role === 'admin' && assignment.Course?.teacher && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                        By: {assignment.Course.teacher.firstName} {assignment.Course.teacher.lastName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {assignment.Course?.title && (
                        <span className="mr-2">📚 {assignment.Course.title}</span>
                      )}
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                </div>
              ))}
              {dashboardData.assignments.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.role === 'admin' ? 'No assignments in the system' : 'No upcoming deadlines'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Assignments Overview - Admin Only */}
        {user.role === 'admin' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  All Assignments Overview
                </span>
              </h2>
              <Link 
                to="/assignments" 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
              >
                View All
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {dashboardData.assignments.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.assignments.slice(0, 10).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2">
                            <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {assignment.title}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <BookOpenIcon className="h-4 w-4 mr-2 text-purple-500" />
                            <span className="truncate">{assignment.Course?.title || 'N/A'}</span>
                          </div>
                          
                          {assignment.Course?.teacher && (
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <UserGroupIcon className="h-4 w-4 mr-2 text-green-500" />
                              <span className="truncate">
                                {assignment.Course.teacher.firstName} {assignment.Course.teacher.lastName}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <ClockIcon className="h-4 w-4 mr-2 text-orange-500" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {assignment.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                          {assignment.totalPoints || 0} pts
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/assignments/${assignment.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Link>
                          
                          {user.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
                              disabled={deleting === assignment.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                              title="Delete Assignment"
                            >
                              {deleting === assignment.id ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Deleting...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                  No assignments in the system yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Teachers will be able to create assignments for their courses
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Courses Section - Only for Students */}
        {user.role === 'student' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Enrolled Courses
                </span>
              </h2>
              <Link 
                to="/courses" 
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group"
              >
                View All
                <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          
            {dashboardData.courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.courses.slice(0, 6).map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="absolute top-0 right-0 m-3">
                      <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2">
                        <BookOpenIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 pr-10 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-3">
                      {course.code}
                    </p>
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-2">
                      <AcademicCapIcon className="h-4 w-4 mr-2 text-purple-500" />
                      {course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'Instructor'}
                    </div>
                    {course.enrollmentCount !== undefined && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.enrollmentCount} students
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-700/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                  No courses enrolled yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Browse available courses and start your learning journey
                </p>
                <Link 
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <PlusIcon className="h-5 w-5" />
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Assignment Modal */}
      <QuickAssignmentUpload 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchDashboardData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, assignmentId: null, assignmentTitle: '' })}
        onConfirm={confirmDelete}
        type="danger"
        title="Delete Assignment"
        message={`Are you sure you want to delete "${confirmDialog.assignmentTitle}"?\n\nThis action cannot be undone and will permanently delete:\n• The assignment\n• All student submissions\n• All uploaded files`}
        confirmText="Delete Assignment"
        cancelText="Cancel"
      />

      {/* Submissions Modal (Teacher) */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSubmissionsModal(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Student Submissions</h3>
                <button onClick={() => setShowSubmissionsModal(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
              </div>

              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : allSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">No submissions found across your assignments.</p>
                </div>
              ) : (
                <div className="space-y-3 p-2 max-h-[60vh] overflow-auto">
                  {allSubmissions.map((item) => (
                    <div key={item.submission.id} className="group p-4 bg-gradient-to-r from-white to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.submission.User?.firstName} {item.submission.User?.lastName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.assignmentTitle} • Submitted: {new Date(item.submission.submittedAt).toLocaleString()}</p>
                          {item.submission.attachments && item.submission.attachments.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" /></svg>
                              <span>{item.submission.attachments.length} attachment(s)</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Link to={`/assignments/${item.assignmentId}#submissions`} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Open</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
