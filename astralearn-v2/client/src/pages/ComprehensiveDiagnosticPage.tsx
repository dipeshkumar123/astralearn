import React from 'react';
import { DebugButton } from '@/components/ui/DebugButton';

export const ComprehensiveDiagnosticPage: React.FC = () => {
  const [logs, setLogs] = React.useState<string[]>([]);
  const [formData, setFormData] = React.useState({ name: '', email: '' });

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DIAGNOSTIC] ${message}`);
  };

  React.useEffect(() => {
    addLog('Component mounted successfully');
    
    // Test if event listeners can be added
    const testListener = () => addLog('Global click listener triggered');
    document.addEventListener('click', testListener);
    
    return () => {
      document.removeEventListener('click', testListener);
    };
  }, []);

  const handleBasicClick = () => {
    addLog('Basic click handler executed');
    alert('Basic click works!');
  };

  const handleStateUpdate = () => {
    addLog('State update handler executed');
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] State updated via button`]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLog('Form submit handler executed');
    addLog(`Form data: ${JSON.stringify(formData)}`);
    alert(`Form submitted with: ${JSON.stringify(formData)}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    addLog(`Input changed: ${name} = ${value}`);
  };

  const runDiagnosticTests = () => {
    addLog('Running diagnostic tests...');
    
    // Test 1: Basic JavaScript
    try {
      const result = 2 + 2;
      addLog(`JavaScript math test: 2 + 2 = ${result}`);
    } catch (error) {
      addLog(`JavaScript error: ${error}`);
    }

    // Test 2: DOM manipulation
    try {
      const testDiv = document.createElement('div');
      testDiv.textContent = 'Test';
      addLog('DOM manipulation test: SUCCESS');
    } catch (error) {
      addLog(`DOM manipulation error: ${error}`);
    }

    // Test 3: React state
    try {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] React state test: SUCCESS`]);
    } catch (error) {
      addLog(`React state error: ${error}`);
    }

    // Test 4: Event system
    try {
      const button = document.querySelector('#diagnostic-button');
      if (button) {
        addLog('Found diagnostic button in DOM');
      } else {
        addLog('Could not find diagnostic button in DOM');
      }
    } catch (error) {
      addLog(`DOM query error: ${error}`);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1f2937', marginBottom: '20px' }}>
        Comprehensive Button Diagnostic Tool
      </h1>
      
      {/* Status Panel */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f0f9ff', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #0ea5e9'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>System Status</h3>
        <p>React Version: {React.version}</p>
        <p>Component Rendered: ✅</p>
        <p>JavaScript Enabled: ✅</p>
        <p>Total Logs: {logs.length}</p>
      </div>

      {/* Basic Button Tests */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #d1d5db'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>Basic Button Tests</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
          <button 
            id="diagnostic-button"
            onClick={handleBasicClick}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Basic Click Test
          </button>
          
          <button 
            onClick={handleStateUpdate}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            State Update Test
          </button>
          
          <button 
            onClick={runDiagnosticTests}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Run All Tests
          </button>
          
          <button
            onClick={() => setLogs([])}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Clear Logs
          </button>

          <DebugButton
            variant="primary"
            onClick={() => addLog('DebugButton (primary) clicked')}
          >
            Debug Button Primary
          </DebugButton>

          <DebugButton
            variant="outline"
            onClick={() => addLog('DebugButton (outline) clicked')}
          >
            Debug Button Outline
          </DebugButton>
        </div>
      </div>

      {/* Form Test */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #d1d5db'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>Form Submission Test</h3>
        
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleInputChange}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              alignSelf: 'flex-start'
            }}
          >
            Submit Form
          </button>
        </form>
      </div>

      {/* Event Listener Tests */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#ffffff', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #d1d5db'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#374151' }}>Event Listener Tests</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button 
            onMouseEnter={() => addLog('Mouse enter detected')}
            onMouseLeave={() => addLog('Mouse leave detected')}
            onClick={() => addLog('Click detected')}
            onFocus={() => addLog('Focus detected')}
            onBlur={() => addLog('Blur detected')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Multi-Event Test
          </button>
          
          <button 
            onDoubleClick={() => addLog('Double click detected')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ec4899',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Double Click Test
          </button>
        </div>
      </div>

      {/* Log Display */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#1f2937', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#f9fafb' }}>Event Log</h3>
        <div style={{ 
          maxHeight: '200px', 
          overflowY: 'auto',
          backgroundColor: '#111827',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#9ca3af' }}>No events logged yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ color: '#f9fafb', marginBottom: '2px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#fef3c7', 
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#92400e' }}>Diagnostic Instructions</h3>
        <ol style={{ margin: '0', paddingLeft: '20px', color: '#92400e' }}>
          <li>Open browser developer tools (F12)</li>
          <li>Click each button above and observe the log</li>
          <li>Check browser console for any errors</li>
          <li>Try the form submission</li>
          <li>Test hover and focus events</li>
          <li>If no logs appear, there's a fundamental React/JS issue</li>
        </ol>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#fee2e2', 
          borderRadius: '4px',
          border: '1px solid #fca5a5'
        }}>
          <strong style={{ color: '#dc2626' }}>If buttons don't work:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px', color: '#dc2626' }}>
            <li>Check if JavaScript is enabled</li>
            <li>Try disabling browser extensions</li>
            <li>Test in incognito/private mode</li>
            <li>Try a different browser</li>
            <li>Check for console errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
