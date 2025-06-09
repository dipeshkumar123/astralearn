// AI Assistant Integration Test
// This test validates that all components are working together correctly

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AIAssistant from '../components/ai/AIAssistant';
import AIContextProvider from '../contexts/AIContextProvider';
import { useAIAssistantStore } from '../stores/aiAssistantStore';

// Mock the AI service
jest.mock('../services/aiService', () => ({
  default: {
    chat: jest.fn(() => Promise.resolve({
      response: 'Test AI response',
      metadata: { type: 'chat' },
      suggestions: ['Test suggestion']
    })),
    checkHealth: jest.fn(() => Promise.resolve({ status: 'healthy' }))
  }
}));

const TestWrapper = ({ children }) => (
  <AIContextProvider>
    {children}
  </AIContextProvider>
);

describe('AI Assistant Integration', () => {
  beforeEach(() => {
    // Reset store state
    useAIAssistantStore.setState({
      isOpen: false,
      isMinimized: false,
      isLoading: false,
      messages: [],
      currentMessage: '',
      error: null
    });
  });

  test('renders floating button when closed', () => {
    render(
      <TestWrapper>
        <AIAssistant />
      </TestWrapper>
    );

    const floatingButton = screen.getByRole('button', { name: /open ai assistant/i });
    expect(floatingButton).toBeInTheDocument();
  });

  test('opens assistant when floating button is clicked', async () => {
    render(
      <TestWrapper>
        <AIAssistant />
      </TestWrapper>
    );

    const floatingButton = screen.getByRole('button', { name: /open ai assistant/i });
    fireEvent.click(floatingButton);

    await waitFor(() => {
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });
  });

  test('allows sending messages', async () => {
    // Open the assistant first
    useAIAssistantStore.setState({ isOpen: true });

    render(
      <TestWrapper>
        <AIAssistant />
      </TestWrapper>
    );

    const input = screen.getByPlaceholderText(/ask me anything/i);
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  test('displays different modes correctly', () => {
    useAIAssistantStore.setState({ isOpen: true });

    render(
      <TestWrapper>
        <AIAssistant />
      </TestWrapper>
    );

    // Check that mode tabs are present
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Explain')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Suggest')).toBeInTheDocument();
  });

  test('context provider updates context correctly', () => {
    let contextValue;
    const TestComponent = () => {
      const { setUserContext } = useAIContext();
      contextValue = { setUserContext };
      return <div>Test</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    expect(typeof contextValue.setUserContext).toBe('function');
  });

  test('store manages state correctly', () => {
    const { getState, setState } = useAIAssistantStore;

    // Test initial state
    expect(getState().isOpen).toBe(false);
    expect(getState().messages).toEqual([]);

    // Test state updates
    setState({ isOpen: true });
    expect(getState().isOpen).toBe(true);

    // Test adding messages
    getState().addMessage({
      type: 'user',
      content: 'Test message'
    });

    expect(getState().messages).toHaveLength(1);
    expect(getState().messages[0].content).toBe('Test message');
  });
});

// Integration test for the complete flow
describe('AI Assistant Complete Flow', () => {
  test('complete user interaction flow', async () => {
    render(
      <TestWrapper>
        <AIAssistant />
      </TestWrapper>
    );

    // 1. Click floating button to open
    const floatingButton = screen.getByRole('button', { name: /open ai assistant/i });
    fireEvent.click(floatingButton);

    // 2. Wait for assistant to open
    await waitFor(() => {
      expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    });

    // 3. Type a message
    const input = screen.getByPlaceholderText(/ask me anything/i);
    fireEvent.change(input, { target: { value: 'Help me understand AI' } });

    // 4. Send the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // 5. Verify message appears in chat
    await waitFor(() => {
      expect(screen.getByText('Help me understand AI')).toBeInTheDocument();
    });

    // 6. Verify AI response appears
    await waitFor(() => {
      expect(screen.getByText('Test AI response')).toBeInTheDocument();
    });
  });
});

export default {};
