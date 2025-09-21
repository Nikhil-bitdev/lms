import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This is your personalized dashboard. You can access all your learning resources from here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Active Courses
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Pending Assignments
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">0</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Upcoming Quizzes
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-gray-600 dark:text-gray-300 text-center py-8">
          No recent activity to show
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;