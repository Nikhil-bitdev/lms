import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import materialService from '../../services/materialService';
import ConfirmDialog from '../ConfirmDialog';

export default function MaterialList({ courseId, teacherId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const { user } = useAuth();

  const isTeacherOrAdmin = user && (user.id === teacherId || user.role === 'admin' || user.role === 'teacher');
  const cardRefs = useRef([]);

  useEffect(() => {
    fetchMaterials();
  }, [courseId, filterType]);

  useLayoutEffect(() => {
    if (cardRefs.current) {
      cardRefs.current.forEach((el, i) => {
        if (el) {
          el.style.opacity = 0;
          el.style.transform = 'translateY(40px) scale(0.98)';
          setTimeout(() => {
            el.style.transition = 'opacity 0.5s cubic-bezier(.4,2,.6,1), transform 0.5s cubic-bezier(.4,2,.6,1)';
            el.style.opacity = 1;
            el.style.transform = 'translateY(0) scale(1)';
          }, 80 * i);
        }
      });
    }
  }, [materials]);

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

  // Confirm dialog state for deleting materials
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null); // material object

  const handleDelete = (material) => {
    // open confirm dialog
    setToDelete(material);
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!toDelete) return;
    try {
      await materialService.deleteMaterial(toDelete.id);
      toast.success('Material deleted successfully');
      // refresh list
      fetchMaterials();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete material');
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
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
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-4">
        {[
          { key: 'all', label: 'All Materials', icon: '📚' },
          { key: 'notes', label: 'Notes', icon: '📝' },
          { key: 'assignment', label: 'Assignments', icon: '📋' },
          { key: 'lecture', label: 'Lectures', icon: '🎓' },
          { key: 'reference', label: 'References', icon: '📖' },
          { key: 'other', label: 'Other', icon: '📁' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 ${
              filterType === tab.key
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-2xl opacity-20" />
            <div className="relative text-8xl">📁</div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No materials found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {filterType === 'all' 
              ? 'No materials have been uploaded yet. Check back later or contact your instructor.'
              : `No ${filterType} materials have been uploaded yet.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material, idx) => {
            const daysUntilDue = getDaysUntilDue(material.dueDate);
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
            const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <div
                key={material.id}
                ref={el => cardRefs.current[idx] = el}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
                style={{ willChange: 'opacity, transform' }}
              >
                {/* Gradient background overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Top colored strip based on type */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  material.type === 'assignment' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                  material.type === 'notes' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  material.type === 'lecture' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  material.type === 'reference' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                }`} />
                
                {/* Content */}
                <div className="relative p-6 flex flex-col h-full">
                  {/* Icon and Title Section */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon with gradient background */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                        {materialService.getFileIcon(material.mimeType, material.fileExtension)}
                      </div>
                    </div>
                    
                    {/* Title and Type */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {material.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg ${materialService.getTypeColor(material.type)} shadow-sm`}>
                        {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="space-y-3 mb-4 flex-1">
                    {/* File name with tooltip */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="truncate font-medium" title={material.originalName}>{material.originalName}</span>
                    </div>
                    
                    {/* File size and downloads */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <span className="font-semibold">{materialService.formatFileSize(material.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{material.downloadCount} views</span>
                      </div>
                    </div>

                    {/* Uploader */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>{material.uploader?.name}</span>
                    </div>
                    
                    {/* Due Date */}
                    {material.dueDate && (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                        isOverdue 
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                          : isDueSoon
                          ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold">
                          {isOverdue 
                            ? 'Overdue'
                            : daysUntilDue === 0
                            ? 'Due today'
                            : `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                    )}
                    </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto pt-4">
                    <button
                      onClick={() => handleDownload(material)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>

                    {isTeacherOrAdmin && material.uploadedBy === user.id && (
                      <button
                        onClick={() => handleDelete(material)}
                        className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95"
                        title="Delete material"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Confirm dialog for delete action */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setToDelete(null); }}
        onConfirm={performDelete}
        title="Delete material"
        message={
          `Are you sure you want to delete "${toDelete?.title || toDelete?.originalName || ''}"?\nThis action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}