import React from 'react';

export const MinimalTestPage: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Minimal Button Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Count: {count}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', maxWidth: '300px' }}>
        <button 
          onClick={() => {
            console.log('Button 1 clicked');
            alert('Button 1 works!');
            setCount(c => c + 1);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Button 1 (Alert + Counter)
        </button>
        
        <button 
          onClick={() => {
            console.log('Button 2 clicked');
            setCount(c => c + 10);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Button 2 (Counter +10)
        </button>
        
        <button 
          onClick={() => {
            console.log('Button 3 clicked');
            console.log('Current count:', count);
            alert(`Current count is: ${count}`);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Button 3 (Show Count)
        </button>
        
        <button 
          onClick={() => {
            console.log('Reset button clicked');
            setCount(0);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset Counter
        </button>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '5px' }}>
        <h3>Debug Information:</h3>
        <ul>
          <li>React version: {React.version}</li>
          <li>Current count: {count}</li>
          <li>Page loaded at: {new Date().toLocaleTimeString()}</li>
        </ul>
        
        <h4>Instructions:</h4>
        <ol>
          <li>Open browser developer tools (F12)</li>
          <li>Click each button above</li>
          <li>Check if alerts appear</li>
          <li>Check if console logs appear</li>
          <li>Check if counter updates</li>
        </ol>
        
        <p><strong>If these buttons don't work, the issue is with React event handling or JavaScript execution.</strong></p>
      </div>
    </div>
  );
};
