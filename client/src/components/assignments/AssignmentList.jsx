import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService } from '../../services/assignmentService';
import { LoadingSpinner } from '../LoadingSpinner';

const AssignmentCard = ({ assignment, courseId }) => {
  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();
  const status = assignment.submitted
    ? 'Submitted'
    : isOverdue
    ? 'Overdue'
    : 'Pending';
  
  const statusColors = {
    Submitted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {assignment.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {assignment.description}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
          </p>
          {assignment.maxScore && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Max Score: {assignment.maxScore} points
            </p>
          )}
        </div>
        <Link
          to={`/courses/${courseId}/assignments/${assignment.id}`}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Details →
        </Link>
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
        setAssignments(data);
      } catch (err) {
        setError('Failed to fetch assignments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Assignments
        </h1>
        {user?.role === 'instructor' && (
          <Link
            to={`/courses/${courseId}/assignments/create`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Assignment
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No assignments found for this course.
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              courseId={courseId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;