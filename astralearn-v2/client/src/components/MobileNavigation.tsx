import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  User,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Play,
  Award,
  Target,
  Users,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

interface MobileNavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  submenu?: {
    name: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

export const MobileNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setActiveSubmenu(null);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const mainNavItems: MobileNavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: <BookOpen className="h-5 w-5" />,
      submenu: [
        { name: 'Browse Courses', href: '/courses', icon: <Search className="h-4 w-4" /> },
        { name: 'My Learning', href: '/my-courses', icon: <Play className="h-4 w-4" /> },
        { name: 'Completed', href: '/completed', icon: <Award className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      submenu: [
        { name: 'Learning Analytics', href: '/analytics', icon: <BarChart3 className="h-4 w-4" /> },
        { name: 'Recommendations', href: '/recommendations', icon: <Brain className="h-4 w-4" /> },
        { name: 'Goals', href: '/goals', icon: <Target className="h-4 w-4" /> },
      ]
    },
    {
      name: 'Forums',
      href: '/forum',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: 3,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: <User className="h-5 w-5" />,
      submenu: [
        { name: 'My Profile', href: '/profile', icon: <User className="h-4 w-4" /> },
        { name: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> },
        { name: 'Study Groups', href: '/study-groups', icon: <Users className="h-4 w-4" /> },
      ]
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleSubmenuToggle = (itemName: string) => {
    setActiveSubmenu(activeSubmenu === itemName ? null : itemName);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AL</span>
            </div>
            <span className="text-lg font-bold text-gray-900">AstraLearn</span>
          </Link>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1">
                  {mainNavItems.map((item) => (
                    <div key={item.name}>
                      <div
                        className={`flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (item.submenu) {
                            handleSubmenuToggle(item.name);
                          } else {
                            navigate(item.href);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span>{item.name}</span>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.submenu && (
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform ${
                              activeSubmenu === item.name ? 'rotate-90' : ''
                            }`} 
                          />
                        )}
                      </div>

                      {/* Submenu */}
                      {item.submenu && activeSubmenu === item.name && (
                        <div className="bg-gray-50 border-l-2 border-gray-200 ml-4">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.href}
                              to={subItem.href}
                              className={`flex items-center space-x-3 px-6 py-2 text-sm transition-colors ${
                                location.pathname === subItem.href
                                  ? 'text-primary-700 bg-primary-50'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                            >
                              {subItem.icon}
                              <span>{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Menu Footer */}
              <div className="border-t p-4 space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Settings />}
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<LogOut />}
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="grid grid-cols-5 py-2">
          {mainNavItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                isActive(item.href)
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for fixed bottom navigation */}
      <div className="lg:hidden h-16" />
    </>
  );
};

// Mobile-optimized Quick Actions Component
export const MobileQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      name: 'Continue Learning',
      icon: <Play className="h-6 w-6" />,
      color: 'bg-green-500',
      action: () => navigate('/my-courses'),
    },
    {
      name: 'Browse Courses',
      icon: <Search className="h-6 w-6" />,
      color: 'bg-blue-500',
      action: () => navigate('/courses'),
    },
    {
      name: 'View Progress',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'bg-purple-500',
      action: () => navigate('/analytics'),
    },
    {
      name: 'Join Discussion',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-orange-500',
      action: () => navigate('/forum'),
    },
  ];

  return (
    <div className="lg:hidden bg-white rounded-lg shadow-sm border p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.name}
            onClick={action.action}
            className="flex flex-col items-center p-4 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center text-white mb-2`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-900 text-center">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Mobile-optimized Course Card Component
export const MobileCourseCard: React.FC<{
  course: any;
  onClick: () => void;
}> = ({ course, onClick }) => (
  <div 
    className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:shadow-md transition-shadow"
    onClick={onClick}
  >
    <div className="flex items-start space-x-3">
      <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <BookOpen className="h-8 w-8 text-primary-600" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className="capitalize">{course.difficulty}</span>
            <span>•</span>
            <span>{course.duration}h</span>
          </div>
          
          {course.progress !== undefined && (
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary-600 h-1.5 rounded-full"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-900">{course.progress}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Mobile-optimized Search Component
export const MobileSearch: React.FC<{
  onSearch: (query: string) => void;
  placeholder?: string;
}> = ({ onSearch, placeholder = "Search courses..." }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="lg:hidden mb-4">
      <div className={`transition-all duration-200 ${isExpanded ? 'mb-4' : ''}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => setIsExpanded(false)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />
        </div>
        
        {isExpanded && query && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            <div className="p-2">
              <div className="text-sm text-gray-600 px-3 py-2">
                Search suggestions will appear here
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Touch-optimized Button Component
export const TouchButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
}> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  leftIcon 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 transition-transform";
  
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm min-h-[40px]",
    md: "px-4 py-3 text-base min-h-[48px]",
    lg: "px-6 py-4 text-lg min-h-[56px]"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";
  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses}`}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
  );
};
