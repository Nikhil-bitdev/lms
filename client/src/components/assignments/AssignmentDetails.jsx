import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService } from '../../services/assignmentService';
import { LoadingSpinner } from '../LoadingSpinner';

const AssignmentDetails = () => {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignmentData, submissionData] = await Promise.all([
          assignmentService.getAssignment(courseId, assignmentId),
          assignmentService.getSubmission(courseId, assignmentId)
        ]);
        setAssignment(assignmentData);
        setSubmission(submissionData);
      } catch (err) {
        setError('Failed to fetch assignment details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, assignmentId]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      await assignmentService.submitAssignment(courseId, assignmentId, {
        files,
        content
      });
      const newSubmission = await assignmentService.getSubmission(courseId, assignmentId);
      setSubmission(newSubmission);
      setFiles([]);
      setContent('');
    } catch (err) {
      setSubmitError('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentService.deleteAssignment(courseId, assignmentId);
        navigate(`/courses/${courseId}/assignments`);
      } catch (err) {
        setError('Failed to delete assignment. Please try again.');
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!assignment) return <div>Assignment not found</div>;

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate < new Date();
  const canSubmit = !isOverdue && !submission?.grade;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {assignment.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {assignment.description}
            </p>
          </div>
          {user?.role === 'instructor' && (
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/courses/${courseId}/assignments/${assignmentId}/edit`)}
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
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Assignment Details
            </h3>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Due Date:</span>{' '}
                {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Max Score:</span>{' '}
                {assignment.maxScore} points
              </p>
              {assignment.allowedFileTypes && (
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Allowed File Types:</span>{' '}
                  {assignment.allowedFileTypes.join(', ')}
                </p>
              )}
            </div>
          </div>

          {submission && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Submission Status
              </h3>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Submitted:</span>{' '}
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
                {submission.grade !== undefined && (
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Grade:</span>{' '}
                    {submission.grade}/{assignment.maxScore}
                  </p>
                )}
                {submission.feedback && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      Feedback:
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {canSubmit && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Submission Text (Optional)
              </label>
              <textarea
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Enter your submission text here..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Files
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="block w-full text-sm text-gray-500 dark:text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900 dark:file:text-blue-200
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                accept={assignment.allowedFileTypes?.join(',')}
              />
            </div>

            {submitError && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {submitError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;