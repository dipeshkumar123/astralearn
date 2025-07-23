import React from 'react';

// This page bypasses all auth and complex components to test basic functionality
export const NoAuthTestPage: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [message, setMessage] = React.useState('Page loaded');

  const handleClick1 = () => {
    console.log('Click 1 detected');
    setCount(prev => prev + 1);
    setMessage('Button 1 clicked');
    alert('Button 1 works!');
  };

  const handleClick2 = () => {
    console.log('Click 2 detected');
    setCount(prev => prev + 5);
    setMessage('Button 2 clicked');
  };

  const handleClick3 = () => {
    console.log('Click 3 detected');
    setMessage('Button 3 clicked');
    console.log('Current state:', { count, message });
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333' }}>No Auth Test Page</h1>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p><strong>Count:</strong> {count}</p>
        <p><strong>Message:</strong> {message}</p>
        <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <button 
          onClick={handleClick1}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Click Me (+1 & Alert)
        </button>
        
        <button 
          onClick={handleClick2}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Add 5 to Counter
        </button>
        
        <button 
          onClick={handleClick3}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Log State to Console
        </button>
        
        <button 
          onClick={() => {
            setCount(0);
            setMessage('Reset');
            console.log('Reset clicked');
          }}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Reset
        </button>
      </div>
      
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fef3c7', 
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>Debug Information</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Environment:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>React Version: {React.version}</li>
            <li>User Agent: {navigator.userAgent.substring(0, 50)}...</li>
            <li>JavaScript Enabled: Yes (if you can see this)</li>
          </ul>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <strong>Test Instructions:</strong>
          <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Open browser developer tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click each button above</li>
            <li>Verify console logs appear</li>
            <li>Check if counter updates</li>
            <li>Check if alerts appear (for first button)</li>
          </ol>
        </div>
        
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fee2e2', 
          borderRadius: '4px',
          border: '1px solid #fca5a5'
        }}>
          <strong style={{ color: '#dc2626' }}>If these buttons don't work:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#dc2626' }}>
            <li>JavaScript is disabled in your browser</li>
            <li>React is not loading properly</li>
            <li>There's a fundamental issue with the build</li>
            <li>Browser extensions are blocking JavaScript</li>
          </ul>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f0fdf4', 
        borderRadius: '8px',
        border: '1px solid #22c55e'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#15803d' }}>Quick Browser Tests</h4>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Open browser console and try these commands:
        </p>
        <code style={{ 
          display: 'block', 
          backgroundColor: '#1f2937', 
          color: '#f9fafb', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          marginTop: '10px'
        }}>
          document.querySelector('button').click();<br/>
          console.log('Test from console');<br/>
          alert('Manual test');
        </code>
      </div>
    </div>
  );
};
