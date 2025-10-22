import { useAuth } from '../contexts/AuthContext';

export default function UserDebugInfo() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
        <p className="font-bold">⚠️ Not Logged In</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold text-lg mb-2">👤 Current User Debug</h3>
      <div className="text-sm space-y-1">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> <span className="px-2 py-1 bg-yellow-400 text-black rounded font-bold">{user.role?.toUpperCase()}</span></p>
      </div>
      <div className="mt-3 text-xs opacity-75">
        {user.role === 'student' && (
          <p>⚠️ Students cannot upload materials</p>
        )}
        {(user.role === 'teacher' || user.role === 'admin') && (
          <p>✅ You can upload materials</p>
        )}
      </div>
    </div>
  );
}
