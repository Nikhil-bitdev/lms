import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { assignmentService } from '../services/assignmentService';
import LoadingSpinner from '../components/LoadingSpinner';

const AllAssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, overdue, completed

  const isTeacher = user?.role === 'teacher' || user?.role === 'instructor';

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await assignmentService.getUserAssignments();
        setAssignments(data.assignments || []);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to fetch assignments. Please try again later.');
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {assignment.title}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                {status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {assignment.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Course: <span className="font-medium">{assignment.Course?.title}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
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
            <p className="text-gray-500 dark:text-gray-400">Points</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {assignment.totalPoints} pts
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-sm font-medium ${
            isOverdue ? 'text-red-600 dark:text-red-400' : 
            daysUntilDue <= 1 ? 'text-orange-600 dark:text-orange-400' : 
            'text-green-600 dark:text-green-400'
          }`}>
            {formatTimeRemaining()}
          </p>
          
          <div className="flex space-x-2">
            <Link
              to={`/assignments/${assignment.id}`}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              View Details
            </Link>
            
            {!isTeacher && !assignment.submitted && !isOverdue && (
              <Link
                to={`/assignments/${assignment.id}/submit`}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Submit
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isTeacher ? 'My Assignments' : 'All Assignments'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isTeacher 
              ? 'Assignments from all your courses'
              : 'All assignments from your enrolled courses'
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All', count: assignments.length },
            { key: 'pending', label: 'Pending', count: assignments.filter(a => new Date(a.dueDate) > new Date() && !a.submitted).length },
            { key: 'overdue', label: 'Overdue', count: assignments.filter(a => new Date(a.dueDate) < new Date() && !a.submitted).length },
            { key: 'completed', label: 'Completed', count: assignments.filter(a => a.submitted).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No assignments found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
              ? 'No assignments available'
              : `No ${filter} assignments found`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllAssignmentsPage;