import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import '@testing-library/jest-dom';
import RoleBasedRedirect from '../src/components/RoleBasedRedirect';

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <ClerkProvider publishableKey="test">
        {component}
      </ClerkProvider>
    </BrowserRouter>
  );
};

describe('RoleBasedRedirect Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should redirect teacher to /teacher', async () => {
    axios.get.mockResolvedValue({
      data: { role: 'TEACHER' }
    });

    renderWithRouter(<RoleBasedRedirect />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher');
    });
  });

  test('Should redirect student to /dashboard', async () => {
    axios.get.mockResolvedValue({
      data: { role: 'STUDENT' }
    });

    renderWithRouter(<RoleBasedRedirect />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('Should show loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<RoleBasedRedirect />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('Should handle API errors gracefully', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));

    renderWithRouter(<RoleBasedRedirect />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
