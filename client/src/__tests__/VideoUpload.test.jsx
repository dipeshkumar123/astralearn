import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import VideoUpload from '../src/components/VideoUpload';

// Mock Clerk
jest.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    getToken: jest.fn().mockResolvedValue('test_token')
  })
}));

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock MuxPlayer
jest.mock('@mux/mux-player-react', () => ({
  __esModule: true,
  default: ({ playbackId }) => <div data-testid="mux-player">{playbackId}</div>
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const mockLesson = {
  id: 'l1',
  courseId: 'c1',
  title: 'Test Lesson',
  muxAssetId: null,
  muxPlaybackId: null
};

const renderComponent = (lesson = mockLesson) => {
  return render(
    <BrowserRouter>
      <VideoUpload lesson={lesson} onUploadComplete={jest.fn()} />
    </BrowserRouter>
  );
};

describe('VideoUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Should render upload area when no video is uploaded', () => {
    renderComponent();

    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/pdf or txt/i)).toBeInTheDocument();
  });

  test('Should request upload URL with authorization token', async () => {
    axios.post.mockResolvedValue({
      data: {
        uploadUrl: 'https://upload.mux.com/test',
        uploadId: 'upload_123'
      }
    });

    const { getByRole } = renderComponent();

    const file = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByRole('checkbox', { hidden: true });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      const callArgs = axios.post.mock.calls[0];
      expect(callArgs[2]).toHaveProperty('headers');
      expect(callArgs[2].headers).toHaveProperty('Authorization');
      expect(callArgs[2].headers.Authorization).toContain('Bearer');
    });
  });

  test('Should display video player when video is uploaded', () => {
    const lessonWithVideo = {
      ...mockLesson,
      muxPlaybackId: 'playback_123'
    };

    renderComponent(lessonWithVideo);

    expect(screen.getByTestId('mux-player')).toBeInTheDocument();
    expect(screen.getByText(/remove video/i)).toBeInTheDocument();
  });

  test('Should allow removing video', async () => {
    axios.delete.mockResolvedValue({});
    axios.patch.mockResolvedValue({});

    const onUploadComplete = jest.fn();
    const lessonWithVideo = {
      ...mockLesson,
      muxAssetId: 'asset_123',
      muxPlaybackId: 'playback_123'
    };

    renderComponent(lessonWithVideo);

    const removeButton = screen.getByText(/remove video/i);
    fireEvent.click(removeButton);

    // Confirm dialog
    window.confirm = jest.fn(() => true);

    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalled();
    });
  });

  test('Should reject non-video files', () => {
    const toast = require('react-hot-toast').default;
    renderComponent();

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByRole('checkbox', { hidden: true });

    fireEvent.change(input, { target: { files: [file] } });

    expect(toast.error).toHaveBeenCalledWith('Please select a video file');
  });

  test('Should include authorization header in delete request', async () => {
    axios.delete.mockResolvedValue({});
    axios.patch.mockResolvedValue({});

    const lessonWithVideo = {
      ...mockLesson,
      muxAssetId: 'asset_123',
      muxPlaybackId: 'playback_123'
    };

    renderComponent(lessonWithVideo);

    window.confirm = jest.fn(() => true);
    const removeButton = screen.getByText(/remove video/i);

    fireEvent.click(removeButton);

    await waitFor(() => {
      const deleteCall = axios.delete.mock.calls[0];
      expect(deleteCall[1]).toHaveProperty('headers');
      expect(deleteCall[1].headers).toHaveProperty('Authorization');
    });
  });
});
