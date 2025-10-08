import { useAuth } from '../contexts/AuthContext';
import { getApiBaseURL } from '../services/api';

export default function DebugStatus() {
  const { user, loading, apiError } = useAuth();
  return (
    <div style={{
      position: 'fixed',
      bottom: 8,
      right: 8,
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      padding: '6px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontFamily: 'monospace',
      zIndex: 9999,
      lineHeight: 1.4,
      maxWidth: 240
    }}>
      <div><strong>Debug</strong></div>
      <div>loading: {String(loading)}</div>
      <div>user: {user ? user.email : 'null'}</div>
      <div>role: {user?.role || '-'}</div>
      <div>api: {getApiBaseURL()}</div>
      {apiError && <div style={{color:'#fca5a5'}}>err: {apiError}</div>}
    </div>
  );
}