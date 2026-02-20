import React from 'react';
import { Button } from '@/components/ui/Button';
import { SimpleButton } from '@/components/ui/SimpleButton';
import { ArrowRight, Mail, Lock } from 'lucide-react';

export const ButtonTestPage: React.FC = () => {
  const [clickCount, setClickCount] = React.useState(0);
  const [lastClicked, setLastClicked] = React.useState<string>('');

  const handleButtonClick = (buttonName: string) => {
    console.log(`Button clicked: ${buttonName}`);
    setClickCount(prev => prev + 1);
    setLastClicked(buttonName);
    alert(`Button "${buttonName}" clicked! Total clicks: ${clickCount + 1}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Button Functionality Test</h1>
        
        {/* Click Counter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Click Counter</h2>
          <p className="text-lg">Total clicks: <span className="font-bold text-blue-600">{clickCount}</span></p>
          <p className="text-sm text-gray-600">Last clicked: {lastClicked || 'None'}</p>
        </div>

        {/* Button Variants Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="primary" 
              onClick={() => handleButtonClick('Primary')}
            >
              Primary Button
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => handleButtonClick('Secondary')}
            >
              Secondary Button
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleButtonClick('Outline')}
            >
              Outline Button
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => handleButtonClick('Ghost')}
            >
              Ghost Button
            </Button>
            
            <Button 
              variant="danger" 
              onClick={() => handleButtonClick('Danger')}
            >
              Danger Button
            </Button>
          </div>
        </div>

        {/* Button Sizes Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Button Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              size="sm" 
              onClick={() => handleButtonClick('Small')}
            >
              Small Button
            </Button>
            
            <Button 
              size="md" 
              onClick={() => handleButtonClick('Medium')}
            >
              Medium Button
            </Button>
            
            <Button 
              size="lg" 
              onClick={() => handleButtonClick('Large')}
            >
              Large Button
            </Button>
          </div>
        </div>

        {/* Buttons with Icons */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Buttons with Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              leftIcon={<Mail />}
              onClick={() => handleButtonClick('Left Icon')}
            >
              Left Icon
            </Button>
            
            <Button 
              rightIcon={<ArrowRight />}
              onClick={() => handleButtonClick('Right Icon')}
            >
              Right Icon
            </Button>
            
            <Button 
              leftIcon={<Lock />}
              rightIcon={<ArrowRight />}
              onClick={() => handleButtonClick('Both Icons')}
            >
              Both Icons
            </Button>
          </div>
        </div>

        {/* Loading State Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Loading State</h2>
          <div className="flex gap-4">
            <Button 
              loading={true}
              onClick={() => handleButtonClick('Loading')}
            >
              Loading Button
            </Button>
            
            <Button 
              disabled={true}
              onClick={() => handleButtonClick('Disabled')}
            >
              Disabled Button
            </Button>
          </div>
        </div>

        {/* Form Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Form Submission Test</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="test-input" className="block text-sm font-medium text-gray-700 mb-1">
                Test Input
              </label>
              <input
                id="test-input"
                type="text"
                placeholder="Enter some text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit">
                Submit Form
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => handleButtonClick('Form Button')}
              >
                Regular Button in Form
              </Button>
            </div>
          </form>
        </div>

        {/* Navigation Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => {
                console.log('Navigating to home');
                window.location.href = '/';
              }}
            >
              Go to Home
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                console.log('Navigating to login');
                window.location.href = '/login';
              }}
            >
              Go to Login
            </Button>
          </div>
        </div>

        {/* Basic HTML Button Test */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Basic HTML Button Test</h2>
          <div className="space-y-4">
            <button
              onClick={() => alert('Basic HTML button works!')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Basic HTML Button
            </button>

            <button
              onClick={(e) => {
                console.log('HTML button clicked', e);
                alert('HTML button with console log works!');
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
            >
              HTML Button with Console Log
            </button>

            <SimpleButton
              onClick={() => {
                console.log('SimpleButton component clicked');
                alert('SimpleButton component works!');
              }}
              className="ml-4"
            >
              Simple React Button
            </SimpleButton>
          </div>
        </div>

        {/* Console Test */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Instructions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Open browser developer tools (F12)</li>
            <li>• Check the Console tab for any JavaScript errors</li>
            <li>• Click any button above and verify console logs appear</li>
            <li>• Check if alerts appear when clicking buttons</li>
            <li>• Verify the click counter updates</li>
            <li>• Test the basic HTML buttons first</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
