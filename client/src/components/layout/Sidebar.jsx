import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Navigation items based on user role
const getNavItems = (role) => {
  const items = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Courses', path: '/courses', icon: '📚' },
  ];

  if (role === 'student') {
    items.push(
      { name: 'Assignments', path: '/assignments', icon: '📝' },
      { name: 'Study Materials', path: '/materials', icon: '📚' }
    );
  }

  if (role === 'instructor' || role === 'teacher') {
    items.push(
      { name: 'Assignments', path: '/assignments', icon: '📝' },
      { name: 'Upload Materials', path: '/materials', icon: '📄' }
    );
  }

  if (role === 'admin') {
    items.push(
      { name: 'Admin Panel', path: '/admin', icon: '⚙️' }
    );
  }

  return items;
};

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <span className="text-xl">{isMobileOpen ? '✕' : '☰'}</span>
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      <aside className={`bg-white dark:bg-gray-800 h-screen w-64 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 z-40 overflow-y-auto shadow-lg lg:shadow-none transition-transform duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">LMS</h1>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/profile"
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2"
            >
              <span className="text-xl">👤</span>
              <div className="flex-1">
                <p className="font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role || 'Role'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;