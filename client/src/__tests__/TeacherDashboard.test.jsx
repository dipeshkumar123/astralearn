import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import '@testing-library/jest-dom';
import TeacherDashboard from '../src/pages/teacher/TeacherDashboard';

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock Clerk
jest.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test_token'),
    isSignedIn: true
  }),
  UserButton: () => <div data-testid="user-button">User</div>
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ClerkProvider publishableKey="test">
        <TeacherDashboard />
      </ClerkProvider>
    </BrowserRouter>
  );
};

describe('TeacherDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should render dashboard header', () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 5,
        lessonsCount: 20,
        sectionsCount: 10,
        publishedCount: 3
      }
    });

    renderComponent();

    expect(screen.getByText(/teacher dashboard/i)).toBeInTheDocument();
  });

  test('Should display statistics cards', async () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 5,
        lessonsCount: 20,
        sectionsCount: 10,
        publishedCount: 3
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/5/)).toBeInTheDocument(); // courses
      expect(screen.getByText(/20/)).toBeInTheDocument(); // lessons
      expect(screen.getByText(/10/)).toBeInTheDocument(); // sections
      expect(screen.getByText(/3/)).toBeInTheDocument(); // published
    });
  });

  test('Should display action cards with links', () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 0,
        lessonsCount: 0,
        sectionsCount: 0,
        publishedCount: 0
      }
    });

    renderComponent();

    expect(screen.getByText(/manage courses/i)).toBeInTheDocument();
    expect(screen.getByText(/upload content/i)).toBeInTheDocument();
    expect(screen.getByText(/analytics/i)).toBeInTheDocument();
  });

  test('Should navigate to courses page', async () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 0,
        lessonsCount: 0,
        sectionsCount: 0,
        publishedCount: 0
      }
    });

    renderComponent();

    const manageLink = screen.getByRole('link', { name: /manage courses/i });
    expect(manageLink).toHaveAttribute('href', '/teacher/courses');
  });

  test('Should navigate to content ingestion page', async () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 0,
        lessonsCount: 0,
        sectionsCount: 0,
        publishedCount: 0
      }
    });

    renderComponent();

    const uploadLink = screen.getByRole('link', { name: /upload content/i });
    expect(uploadLink).toHaveAttribute('href', '/teacher/content-ingestion');
  });

  test('Should display gradient cards styling', () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 5,
        lessonsCount: 20,
        sectionsCount: 10,
        publishedCount: 3
      }
    });

    const { container } = renderComponent();

    const cards = container.querySelectorAll('[class*="gradient"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  test('Should fetch stats with authorization', async () => {
    axios.get.mockResolvedValue({
      data: {
        coursesCount: 5,
        lessonsCount: 20,
        sectionsCount: 10,
        publishedCount: 3
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/courses/stats',
        expect.any(Object)
      );
    });
  });

  test('Should handle API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/teacher dashboard/i)).toBeInTheDocument();
    });
  });
});
