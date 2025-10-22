import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courseService } from '../services/courseService';
import materialService from '../services/materialService';
import { toast } from 'react-hot-toast';
import { DocumentTextIcon, ArrowUpTrayIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

export default function AllMaterialsPage() {
  const [courses, setCourses] = useState([]);
  const [materialsMap, setMaterialsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCoursesAndMaterials();
  }, []);

  const fetchCoursesAndMaterials = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getMyCourses();
      setCourses(coursesData);

      // Fetch materials for each course
      const materialsData = {};
      for (const course of coursesData) {
        try {
          const materials = await materialService.getCourseMaterials(course.id);
          materialsData[course.id] = materials;
        } catch (err) {
          console.error(`Failed to fetch materials for course ${course.id}:`, err);
          materialsData[course.id] = [];
        }
      }
      setMaterialsMap(materialsData);
    } catch (error) {
      console.error('Error fetching courses and materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      await materialService.downloadMaterial(material.id, material.originalName);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (materialId, courseId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await materialService.deleteMaterial(materialId);
      toast.success('Material deleted successfully');
      // Refresh materials for this course
      const materials = await materialService.getCourseMaterials(courseId);
      setMaterialsMap(prev => ({ ...prev, [courseId]: materials }));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete material');
    }
  };

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const getTotalMaterials = () => {
    return Object.values(materialsMap).reduce((total, materials) => total + materials.length, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading materials...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Study Materials
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isTeacher 
            ? `Manage materials across all your courses (${getTotalMaterials()} total materials)`
            : `Access all your course materials in one place (${getTotalMaterials()} materials available)`
          }
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AcademicCapIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {isTeacher 
                ? "You haven't created any courses yet"
                : "You're not enrolled in any courses yet"
              }
            </p>
            {isTeacher && (
              <button
                onClick={() => navigate('/create-course')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Create Your First Course
              </button>
            )}
          </div>
        ) : (
          courses.map((course) => {
            const materials = materialsMap[course.id] || [];
            return (
              <button
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}/materials`)}
                className="relative group w-full text-left bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-md transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
              >
                {/* Glassy Gradient Header */}
                <div className="relative bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-4 flex flex-col gap-0.5">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-b-2xl pointer-events-none" />
                  <h2 className="relative text-base font-bold text-white leading-tight drop-shadow-sm z-10">
                    {course.title}
                  </h2>
                  <p className="relative text-purple-100 text-xs z-10">
                    {course.code} • {materials.length} material{materials.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Quick Action for Teachers */}
      {isTeacher && courses.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ArrowUpTrayIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Upload Study Materials
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share notes, lectures, assignments, and resources with your students. 
                Click on any course above to upload materials.
              </p>
              <div className="flex flex-wrap gap-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}/materials`)}
                    className="px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    {course.code}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
