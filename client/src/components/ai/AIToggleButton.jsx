// AI Assistant Toggle Button - Responsive floating toggle for navigation
import React, { useState, useEffect } from 'react';
import { Brain, MessageCircle, Sparkles, Zap } from 'lucide-react';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';
import { useAuth } from '../auth/AuthProvider';

const AIToggleButton = ({ 
  variant = 'floating', // 'floating', 'navbar', 'sidebar'
  position = 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  size = 'medium', // 'small', 'medium', 'large'
  showLabel = true,
  customClass = ''
}) => {
  const { isOpen, toggleAssistant, isTyping, unreadCount } = useAIAssistantStore();
  const { user } = useAuth();
  const [viewportSize, setViewportSize] = useState('desktop');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Responsive viewport detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewportSize('mobile');
      } else if (width < 1024) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-hide on mobile when scrolling down
  useEffect(() => {
    if (variant === 'floating' && viewportSize === 'mobile') {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [lastScrollY, variant, viewportSize]);

  // Get role-based styling
  const getRoleTheme = () => {
    switch (user?.role) {
      case 'student':
        return {
          gradient: 'from-blue-600 to-purple-600',
          hover: 'hover:from-blue-700 hover:to-purple-700',
          glow: 'shadow-blue-500/25'
        };
      case 'instructor':
        return {
          gradient: 'from-green-600 to-emerald-600',
          hover: 'hover:from-green-700 hover:to-emerald-700',
          glow: 'shadow-green-500/25'
        };
      case 'admin':
        return {
          gradient: 'from-purple-600 to-violet-600',
          hover: 'hover:from-purple-700 hover:to-violet-700',
          glow: 'shadow-purple-500/25'
        };
      default:
        return {
          gradient: 'from-blue-600 to-purple-600',
          hover: 'hover:from-blue-700 hover:to-purple-700',
          glow: 'shadow-blue-500/25'
        };
    }
  };

  const theme = getRoleTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'w-10 h-10 sm:w-12 sm:h-12',
      icon: 'w-4 h-4 sm:w-5 sm:h-5',
      text: 'text-xs sm:text-sm',
      padding: 'p-2 sm:p-3'
    },
    medium: {
      button: 'w-12 h-12 sm:w-14 sm:h-14',
      icon: 'w-5 h-5 sm:w-6 sm:h-6',
      text: 'text-sm sm:text-base',
      padding: 'p-3 sm:p-4'
    },
    large: {
      button: 'w-14 h-14 sm:w-16 sm:h-16',
      icon: 'w-6 h-6 sm:w-7 sm:h-7',
      text: 'text-base sm:text-lg',
      padding: 'p-4 sm:p-5'
    }
  };

  const config = sizeConfig[size];

  // Position classes for floating variant
  const getPositionClasses = () => {
    if (variant !== 'floating') return '';

    const base = 'fixed z-40';
    const spacing = viewportSize === 'mobile' ? '4' : '6';

    switch (position) {
      case 'bottom-right':
        return `${base} bottom-${spacing} right-${spacing}`;
      case 'bottom-left':
        return `${base} bottom-${spacing} left-${spacing}`;
      case 'top-right':
        return `${base} top-${spacing} right-${spacing}`;
      case 'top-left':
        return `${base} top-${spacing} left-${spacing}`;
      default:
        return `${base} bottom-${spacing} right-${spacing}`;
    }
  };

  // Navbar variant
  if (variant === 'navbar') {
    return (
      <button
        onClick={toggleAssistant}
        className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg bg-gradient-to-r ${theme.gradient} ${theme.hover} text-white transition-all duration-200 ${customClass}`}
        aria-label="Toggle AI Assistant"
      >
        <Brain className={config.icon} />
        {showLabel && viewportSize !== 'mobile' && (
          <span className={config.text}>AI Assistant</span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggleAssistant}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-gradient-to-r ${theme.gradient} ${theme.hover} text-white transition-all duration-200 ${customClass}`}
        aria-label="Toggle AI Assistant"
      >
        <Brain className={config.icon} />
        {showLabel && (
          <span className={config.text}>AI Assistant</span>
        )}
        {unreadCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  // Floating variant (default)
  return (
    <div
      className={`${getPositionClasses()} transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
      }`}
    >
      <div className="relative group">
        {/* Main button */}
        <button
          onClick={toggleAssistant}
          className={`
            ${config.button} 
            ${config.padding}
            bg-gradient-to-r ${theme.gradient} ${theme.hover}
            text-white rounded-full shadow-lg ${theme.glow}
            transition-all duration-300 transform
            ${isOpen ? 'scale-110 rotate-12' : 'hover:scale-105'}
            focus:outline-none focus:ring-4 focus:ring-blue-500/30
            ${customClass}
          `}
          aria-label="Toggle AI Assistant"
        >
          {isTyping ? (
            <div className="flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          ) : (
            <Brain className={`${config.icon} ${isOpen ? 'animate-pulse' : ''}`} />
          )}
        </button>

        {/* Notification badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}

        {/* Tooltip */}
        {!isOpen && showLabel && viewportSize !== 'mobile' && (
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            AI Assistant
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
          </div>
        )}

        {/* Floating action hints */}
        {!isOpen && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
              <Zap className="w-3 h-3 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIToggleButton;
