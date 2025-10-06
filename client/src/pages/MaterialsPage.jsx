import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MaterialUpload from '../components/materials/MaterialUpload';
import MaterialList from '../components/materials/MaterialList';
import { courseService } from '../services/courseService';

export default function MaterialsPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTeacherOrAdmin = user && (user.id === course?.teacherId || user.role === 'admin' || user.role === 'teacher');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading course...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Course Materials
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {course ? `${course.title} - ${course.code}` : 'Loading course...'}
          </p>
        </div>
        
        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Upload Material
          </button>
        )}
      </div>

      {/* Instructions for students */}
      {!isTeacherOrAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Student View
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Here you can download course materials uploaded by your instructor. 
                Click the download button next to any material to save it to your device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions for teachers */}
      {isTeacherOrAdmin && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                Instructor Tools
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Upload course materials, assignments, notes, and resources for your students. 
                Supported formats include PDF, Word, PowerPoint, Excel, images, videos, and more.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Materials List */}
      <MaterialList 
        courseId={courseId} 
        teacherId={course?.teacherId}
      />

      {/* Upload Modal */}
      {showUpload && (
        <MaterialUpload
          courseId={courseId}
          onUploadSuccess={() => {
            setShowUpload(false);
            // The MaterialList component will automatically refresh
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}