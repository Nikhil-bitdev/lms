import React from 'react';

function DebugApp() {
  return (
    <div style={{ 
      padding: '20px', 
      background: '#fff', 
      minHeight: '100vh',
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>LMS Debug Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ 
        padding: '10px', 
        background: '#e7f3ff', 
        border: '1px solid #b3d9ff',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        <strong>Debug Info:</strong>
        <ul>
          <li>React is rendering ✅</li>
          <li>JavaScript is working ✅</li>
          <li>Vite dev server is serving files ✅</li>
        </ul>
      </div>
    </div>
  );
}

export default DebugApp;