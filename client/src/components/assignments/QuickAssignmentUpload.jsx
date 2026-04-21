import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { courseService } from '../../services/courseService';
import { assignmentService } from '../../services/assignmentService';
import { toast } from 'react-hot-toast';

const QuickAssignmentUpload = ({ isOpen, onClose, onSuccess }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    totalPoints: 100
  });
  
  // New state for quick course creation
  const [isQuickAddingCourse, setIsQuickAddingCourse] = useState(false);
  const [quickCourseData, setQuickCourseData] = useState({
    title: '',
    code: ''
  });
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMyCourses();
    }
  }, [isOpen]);

  const fetchMyCourses = async (selectNewId = null) => {
    try {
      const response = await courseService.getMyCourses();
      const courseList = Array.isArray(response) ? response : [];
      setCourses(courseList);
      
      // If we just created a course, select it
      if (selectNewId) {
        setSelectedCourse(selectNewId);
      } else if (courseList.length > 0 && !selectedCourse) {
        // Don't auto-select during assignments, let the user choose
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load your courses');
    }
  };

  const handleQuickCourseSubmit = async (e) => {
    e.preventDefault();
    if (!quickCourseData.title || !quickCourseData.code) {
      toast.error('Please provide both title and code');
      return;
    }

    setIsCreatingCourse(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      const endDate = sixMonthsLater.toISOString().split('T')[0];

      const newCourse = await courseService.createCourse({
        title: quickCourseData.title,
        code: quickCourseData.code.toUpperCase().replace(/\s+/g, '-'),
        description: `Quick created course for assignment: ${quickCourseData.title}`,
        startDate: today,
        endDate: endDate,
        enrollmentLimit: 50
      });

      toast.success('Course created successfully!');
      setIsQuickAddingCourse(false);
      setQuickCourseData({ title: '', code: '' });
      
      // Refresh list and select the new course
      await fetchMyCourses(newCourse.id || newCourse.course?.id);
    } catch (err) {
      console.error('Quick course creation error:', err);
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }

    setLoading(true);

    try {
      const assignmentData = new FormData();
      assignmentData.append('courseId', selectedCourse);
      assignmentData.append('title', formData.title);
      assignmentData.append('description', formData.description);
      assignmentData.append('dueDate', formData.dueDate);
      assignmentData.append('totalPoints', formData.totalPoints);

      // Append files
      files.forEach(file => {
        assignmentData.append('files', file);
      });

      await assignmentService.createAssignment(assignmentData);
      
      toast.success('Assignment created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        totalPoints: 100
      });
      setFiles([]);
      setSelectedCourse('');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <DocumentArrowUpIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              Quick Upload Assignment
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Course *
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickAddingCourse(!isQuickAddingCourse)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isQuickAddingCourse ? 'Cancel' : '+ Create New Course'}
                </button>
              </div>

              {isQuickAddingCourse ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Course Title"
                      value={quickCourseData.title}
                      onChange={(e) => setQuickCourseData({ ...quickCourseData, title: e.target.value })}
                      className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Code (e.g. CS101)"
                      value={quickCourseData.code}
                      onChange={(e) => setQuickCourseData({ ...quickCourseData, code: e.target.value })}
                      className="text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickCourseSubmit}
                    disabled={isCreatingCourse}
                    className="w-full py-1 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isCreatingCourse ? 'Creating...' : 'Create & Select Course'}
                  </button>
                </div>
              ) : (
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </option>
                  ))}
                </select>
              )}
              {courses.length === 0 && !isQuickAddingCourse && (
                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                  You don't have any courses yet. Click "+ Create New Course" to add one.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Week 5 Homework"
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="Provide assignment instructions (optional)..."
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Due Date and Points */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Points *
                </label>
                <input
                  type="number"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="1000"
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Attach Files (Max 5)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload files</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOC, DOCX, TXT, images up to 10MB each
                  </p>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickAssignmentUpload;
