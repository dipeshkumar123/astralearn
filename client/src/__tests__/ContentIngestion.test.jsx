import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import '@testing-library/jest-dom';
import ContentIngestion from '../src/pages/teacher/ContentIngestion';

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock Clerk
jest.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test_token'),
    isSignedIn: true
  })
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ClerkProvider publishableKey="test">
        <ContentIngestion />
      </ClerkProvider>
    </BrowserRouter>
  );
};

describe('ContentIngestion Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should fetch and display teacher courses on mount', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Course 1', isPublished: true },
        { id: 'c2', title: 'Course 2', isPublished: false }
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/courses/instructor',
        expect.objectContaining({ headers: { Authorization: 'Bearer test_token' } })
      );
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Course 1 (Published)')).toBeInTheDocument();
    });
  });

  test('Should show loading state while fetching courses', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderComponent();

    expect(screen.getByText(/loading your courses/i)).toBeInTheDocument();
  });

  test('Should show empty state when no courses exist', async () => {
    axios.get.mockResolvedValue({
      data: []
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
      expect(screen.getByText(/create a course first/i)).toBeInTheDocument();
    });
  });

  test('Should auto-select first course', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'First Course', isPublished: true }
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('First Course (Published)')).toBeInTheDocument();
    });
  });

  test('Should allow file selection', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Course 1', isPublished: true }
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('checkbox', { hidden: true });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });
  });

  test('Should disable upload button when no file selected', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Course 1', isPublished: true }
      ]
    });

    renderComponent();

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', {
        name: /upload and index content/i
      });
      expect(uploadButton).toBeDisabled();
    });
  });

  test('Should upload file with authorization header', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Course 1', isPublished: true }
      ]
    });

    axios.post.mockResolvedValue({
      data: { chunksCreated: 5 }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('checkbox', { hidden: true });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', {
        name: /upload and index content/i
      });
      expect(uploadButton).not.toBeDisabled();

      fireEvent.click(uploadButton);
    });

    await waitFor(() => {
      const postCall = axios.post.mock.calls[0];
      expect(postCall[0]).toBe('/api/ai/ingest');
      expect(postCall[2]).toHaveProperty('headers');
      expect(postCall[2].headers).toHaveProperty('Content-Type');
      expect(postCall[2].headers).toHaveProperty('Authorization');
    });
  });

  test('Should allow text indexing', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Course 1', isPublished: true }
      ]
    });

    axios.post.mockResolvedValue({
      data: { success: true }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/paste lesson text/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/paste lesson text/i);
    fireEvent.change(textarea, { target: { value: 'Sample lesson content' } });

    const indexButton = screen.getByRole('button', {
      name: /index lesson to ai/i
    });

    fireEvent.click(indexButton);

    await waitFor(() => {
      const postCall = axios.post.mock.calls[0];
      expect(postCall[0]).toBe('/api/ai/ingest-text');
      expect(postCall[1]).toHaveProperty('courseId', 'c1');
      expect(postCall[1]).toHaveProperty('text', 'Sample lesson content');
    });
  });

  test('Should handle upload errors', async () => {
    const toast = require('react-hot-toast').default;

    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Course 1', isPublished: true }
      ]
    });

    axios.post.mockRejectedValue({
      response: { data: { error: 'Course not owned' } }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    });

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByRole('checkbox', { hidden: true });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', {
        name: /upload and index content/i
      });
      fireEvent.click(uploadButton);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Course not owned');
    });
  });

  test('Should display course selector with status badges', async () => {
    axios.get.mockResolvedValue({
      data: [
        { id: 'c1', title: 'Published Course', isPublished: true },
        { id: 'c2', title: 'Draft Course', isPublished: false }
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue(/published course \(published\)/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/draft course \(draft\)/i)).toBeInTheDocument();
    });
  });
});
