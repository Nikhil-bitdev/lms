import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService } from '../../services/assignmentService';
import LoadingSpinner from '../LoadingSpinner';

const AssignmentCard = ({ assignment, courseId, userRole }) => {
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const isOverdue = dueDate < now;
  const timeUntilDue = dueDate - now;
  const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));
  
  // Determine status based on submission and due date
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {assignment.title}
            </h3>
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="ml-1 text-sm">{assignment.attachments.length}</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
            {assignment.description}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      {/* Assignment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Due Date</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {dueDate.toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div>
          <p className="text-gray-500 dark:text-gray-400">Time Remaining</p>
          <p className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 
            daysUntilDue <= 1 ? 'text-orange-600 dark:text-orange-400' : 
            'text-green-600 dark:text-green-400'}`}>
            {formatTimeRemaining()}
          </p>
        </div>

        <div>
          <p className="text-gray-500 dark:text-gray-400">Points</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {assignment.totalPoints} pts
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <Link
            to={`/assignments/${assignment.id}`}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            View Details
          </Link>
          
          {userRole === 'teacher' && (
            <Link
              to={`/assignments/${assignment.id}/submissions`}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              View Submissions
            </Link>
          )}
        </div>
        
        {userRole !== 'teacher' && !assignment.submitted && !isOverdue && (
          <Link
            to={`/assignments/${assignment.id}/submit`}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Submit Assignment
          </Link>
        )}
      </div>
    </div>
  );
};

const AssignmentList = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await assignmentService.getCourseAssignments(courseId);
        setAssignments(data.assignments || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to fetch assignments. Please try again later.');
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  if (loading) return <LoadingSpinner />;

  const isTeacher = user?.role === 'teacher' || user?.role === 'instructor';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Assignments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isTeacher ? 'Manage course assignments' : 'View and submit assignments'}
          </p>
        </div>
        
        {isTeacher && (
          <Link
            to={`/courses/${courseId}/assignments/create`}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Assignment</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No assignments yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {isTeacher 
              ? 'Create your first assignment to get started'
              : 'No assignments have been posted for this course yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              courseId={courseId}
              userRole={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;