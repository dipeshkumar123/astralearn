// Chat Interface - Modern chat interface with real-time messaging and advanced features
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  MicOff, 
  Square, 
  RefreshCw,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Image,
  FileText,
  X
} from 'lucide-react';
import ModernMessageBubble from './ModernMessageBubble';
import { useAIAssistantStore } from '../../../stores/aiAssistantStore';

const ChatInterface = ({ 
  conversation,
  onSendMessage,
  onRegenerateResponse,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  const { 
    isLoading, 
    sendMessage, 
    regenerateLastResponse,
    currentContext
  } = useAIAssistantStore();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Handle scroll events to show/hide scroll button
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, scrollToBottom]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Handle typing indicators
  useEffect(() => {
    let typingTimer;
    if (message.trim()) {
      setIsTyping(true);
      typingTimer = setTimeout(() => setIsTyping(false), 1000);
    } else {
      setIsTyping(false);
    }
    
    return () => clearTimeout(typingTimer);
  }, [message]);

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        console.log('Audio recorded:', audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  // File attachment
  const handleFileAttachment = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => {
      const updated = prev.filter(att => att.id !== attachmentId);
      // Clean up object URLs
      const removed = prev.find(att => att.id === attachmentId);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage && attachments.length === 0) return;
    
    const messageData = {
      content: trimmedMessage,
      attachments: attachments.map(att => ({
        name: att.name,
        type: att.type,
        size: att.size
      })),
      context: currentContext,
      timestamp: new Date().toISOString()
    };
    
    // Clear input
    setMessage('');
    setAttachments([]);
    
    // Send message
    try {
      await sendMessage(messageData);
      onSendMessage?.(messageData);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttachmentIcon = (type) => {
    if (type.startsWith('image/')) return Image;
    return FileText;
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {conversation?.messages?.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                Ask me anything! I'm here to help you learn, solve problems, and answer questions.
              </p>
            </div>
          </div>
        ) : (
          <>
            {conversation.messages.map((msg, index) => (
              <ModernMessageBubble
                key={msg.id || index}
                message={msg}
                isUser={msg.role === 'user'}
                isLoading={msg.isLoading}
                onFeedback={(messageId, feedback) => {
                  // Handle feedback
                  console.log('Feedback:', messageId, feedback);
                }}
                onCopy={(message) => {
                  // Handle copy
                  console.log('Copied:', message);
                }}
                onRegenerate={onRegenerateResponse}
                showActions={true}
              />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <ModernMessageBubble
                message={{ content: '' }}
                isUser={false}
                isLoading={true}
              />
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={scrollToBottom}
            className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => {
              const Icon = getAttachmentIcon(attachment.type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  {attachment.preview ? (
                    <img
                      src={attachment.preview}
                      alt={attachment.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                    {attachment.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileAttachment}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              style={{
                minHeight: '48px',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            
            {/* Emoji button */}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          {/* Voice recording button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice message'}
          >
            {isRecording ? (
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                <span className="text-xs font-mono">
                  {formatTime(recordingTime)}
                </span>
              </div>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || isLoading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        {/* Status indicators */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            {isTyping && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>AI is thinking...</span>
              </div>
            )}
            
            {currentContext?.course && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span>Context: {currentContext.course.title}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span>{message.length}/2000</span>
            {message.length > 1800 && (
              <AlertCircle className="h-3 w-3 text-yellow-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
