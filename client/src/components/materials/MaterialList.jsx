import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import materialService from '../../services/materialService';

export default function MaterialList({ courseId, teacherId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  const isTeacherOrAdmin = user && (user.id === teacherId || user.role === 'admin' || user.role === 'teacher');

  useEffect(() => {
    fetchMaterials();
  }, [courseId, filterType]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getCourseMaterials(
        courseId, 
        filterType === 'all' ? null : filterType
      );
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      await materialService.downloadMaterial(material.id, material.originalName);
      toast.success('Download started');
      // Refresh the list to update download count
      fetchMaterials();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      await materialService.deleteMaterial(materialId);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete material');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading materials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'all', label: 'All Materials' },
          { key: 'notes', label: 'Notes' },
          { key: 'assignment', label: 'Assignments' },
          { key: 'lecture', label: 'Lectures' },
          { key: 'reference', label: 'References' },
          { key: 'other', label: 'Other' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              filterType === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No materials found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filterType === 'all' 
              ? 'No materials have been uploaded yet.'
              : `No ${filterType} materials have been uploaded yet.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => {
            const daysUntilDue = getDaysUntilDue(material.dueDate);
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <div
                key={material.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {materialService.getFileIcon(material.mimeType, material.fileExtension)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {material.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{material.originalName}</span>
                          <span>•</span>
                          <span>{materialService.formatFileSize(material.fileSize)}</span>
                          <span>•</span>
                          <span>{material.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>

                    {material.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                        {material.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${materialService.getTypeColor(material.type)}`}>
                        {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                      </span>
                      
                      {material.dueDate && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : isDueSoon
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {isOverdue 
                            ? `Overdue by ${Math.abs(daysUntilDue)} days`
                            : daysUntilDue === 0
                            ? 'Due today'
                            : `Due in ${daysUntilDue} days`
                          }
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Uploaded by {material.uploader?.name} • {formatDate(material.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleDownload(material)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>

                    {isTeacherOrAdmin && material.uploadedBy === user.id && (
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}