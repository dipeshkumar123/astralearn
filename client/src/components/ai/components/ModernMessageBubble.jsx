// Modern Message Bubble - Advanced chat message component with rich features
import React, { useState, useRef, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download,
  Share2,
  RefreshCw,
  Code,
  FileText,
  Image,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { format } from 'date-fns';

const ModernMessageBubble = ({ 
  message, 
  isUser = false, 
  isLoading = false, 
  onFeedback, 
  onCopy, 
  onEdit, 
  onDelete, 
  onRegenerate,
  showActions = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [feedback, setFeedback] = useState(message?.feedback || null);
  const menuRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopy?.(message);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const handleFeedback = (type) => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    onFeedback?.(message.id, newFeedback);
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const renderMessageContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm">AI is thinking...</span>
        </div>
      );
    }

    // Handle different message types
    if (message.type === 'code') {
      return (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {message.language || 'Code'}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
            <code>{message.content}</code>
          </pre>
        </div>
      );
    }

    if (message.type === 'image') {
      return (
        <div className="relative">
          <img 
            src={message.imageUrl} 
            alt={message.alt || 'AI generated image'}
            className="rounded-lg max-w-full h-auto"
          />
          {message.content && (
            <p className="mt-2 text-gray-700 dark:text-gray-300">{message.content}</p>
          )}
        </div>
      );
    }

    // Default text message with markdown-like formatting
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }} />
      </div>
    );
  };

  const formatMessageContent = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`group flex gap-3 p-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${className}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
            : 'bg-gradient-to-r from-green-500 to-teal-600'
        }`}>
          {isUser ? 'U' : 'AI'}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-2xl ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
        } shadow-sm`}>
          {renderMessageContent()}
        </div>

        {/* Message Actions */}
        {showActions && !isUser && !isLoading && (
          <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            {/* Feedback buttons */}
            <button
              onClick={() => handleFeedback('positive')}
              className={`p-1.5 rounded-full transition-colors ${
                feedback === 'positive' 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
              }`}
              title="Good response"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => handleFeedback('negative')}
              className={`p-1.5 rounded-full transition-colors ${
                feedback === 'negative' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              title="Poor response"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {/* Text-to-speech */}
            {!isUser && (
              <button
                onClick={handleTextToSpeech}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Read aloud"
              >
                {isPlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            )}

            {/* Regenerate for AI messages */}
            {!isUser && onRegenerate && (
              <button
                onClick={() => onRegenerate(message)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}

            {/* More actions menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="More actions"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  {isUser && onEdit && (
                    <button
                      onClick={() => {
                        onEdit(message);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                      Edit message
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      // Share functionality
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Share2 className="h-4 w-4" />
                    Share message
                  </button>

                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(message);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete message
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMessageBubble;
