import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { assignmentService } from '../../services/assignmentService';
import LoadingSpinner from '../LoadingSpinner';

const AssignmentDetails = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [content, setContent] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const isTeacher = user?.role === 'teacher' || user?.role === 'instructor';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const assignmentData = await assignmentService.getAssignment(assignmentId);
        setAssignment(assignmentData.assignment);

        // If teacher, fetch submissions
        if (isTeacher) {
          const submissionsData = await assignmentService.getAssignmentSubmissions(assignmentId);
          setSubmissions(submissionsData.submissions || []);
        }
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('Failed to fetch assignment details. Please try again later.');
        toast.error('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId, isTeacher]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter(file => {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    setFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && files.length === 0) {
      toast.error('Please provide either text content or file attachments');
      return;
    }

    setSubmitting(true);
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