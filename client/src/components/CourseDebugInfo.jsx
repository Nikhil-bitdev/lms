import { useAuth } from '../contexts/AuthContext';

export default function CourseDebugInfo({ courseId, course }) {
  const { user } = useAuth();

  if (!user || !course) return null;

  const canUpload = user.role === 'admin' || course.teacherId === user.id;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-3 shadow-lg text-xs max-w-sm z-50">
      <div className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
        🔍 Upload Permission Check
      </div>
      <div className="space-y-1 text-yellow-800 dark:text-yellow-200">
        <div><strong>Your User ID:</strong> {user.id}</div>
        <div><strong>Your Role:</strong> {user.role}</div>
        <div><strong>Your Email:</strong> {user.email}</div>
        <div className="border-t border-yellow-400 dark:border-yellow-600 my-2"></div>
        <div><strong>Course ID:</strong> {courseId}</div>
        <div><strong>Course Title:</strong> {course.title}</div>
        <div><strong>Course Teacher ID:</strong> {course.teacherId}</div>
        <div className="border-t border-yellow-400 dark:border-yellow-600 my-2"></div>
        <div className={`font-bold ${canUpload ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {canUpload ? '✅ You CAN upload to this course' : '❌ You CANNOT upload to this course'}
        </div>
        {!canUpload && user.role === 'teacher' && (
          <div className="mt-2 text-red-600 dark:text-red-400">
            This course belongs to teacher ID {course.teacherId}. You need to go to YOUR course!
          </div>
        )}
      </div>
    </div>
  );
}
