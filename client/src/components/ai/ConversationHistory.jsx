// Conversation History - Advanced conversation management with search, categorization, and export
import React, { useState, useEffect, useMemo } from 'react';
import { 
  History,
  Search,
  Filter,
  Calendar,
  Clock,
  MessageCircle,
  BookOpen,
  Star,
  Trash2,
  Archive,
  Download,
  Share2,
  Tag,
  SortAsc,
  SortDesc,
  MoreVertical,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  User,
  Bot
} from 'lucide-react';
import { format, formatDistanceToNow, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';
import { useAIAssistantStore } from '../../stores/aiAssistantStore';

const ConversationHistory = ({ 
  onConversationSelect,
  onMessageClick,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationDetail, setShowConversationDetail] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState(new Set());
  const [archivedConversations, setArchivedConversations] = useState(new Set());

  const { 
    conversations, 
    currentConversation,
    searchConversations,
    deleteConversation,
    archiveConversation,
    exportConversation
  } = useAIAssistantStore();

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations || [];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.title?.toLowerCase().includes(query) ||
        conv.messages?.some(msg => 
          msg.content?.toLowerCase().includes(query)
        ) ||
        conv.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply type filter
    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'pinned':
          filtered = filtered.filter(conv => pinnedConversations.has(conv.id));
          break;
        case 'archived':
          filtered = filtered.filter(conv => archivedConversations.has(conv.id));
          break;
        case 'learning':
          filtered = filtered.filter(conv => conv.category === 'learning');
          break;
        case 'help':
          filtered = filtered.filter(conv => conv.category === 'help');
          break;
        case 'course':
          filtered = filtered.filter(conv => conv.context?.course);
          break;
        default:
          break;
      }
    }

    // Apply date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (selectedDateRange) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = subWeeks(now, 1);
          break;
        case 'month':
          startDate = subMonths(now, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        filtered = filtered.filter(conv => 
          new Date(conv.updatedAt) >= startDate
        );
      }
    }

    // Sort conversations
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'messages':
          aValue = a.messages?.length || 0;
          bValue = b.messages?.length || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Prioritize pinned conversations
    const pinned = filtered.filter(conv => pinnedConversations.has(conv.id));
    const unpinned = filtered.filter(conv => !pinnedConversations.has(conv.id));
    
    return [...pinned, ...unpinned];
  }, [
    conversations, 
    searchQuery, 
    selectedFilter, 
    selectedDateRange, 
    sortBy, 
    sortOrder,
    pinnedConversations,
    archivedConversations
  ]);

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups = {};
    
    filteredConversations.forEach(conv => {
      const date = format(new Date(conv.updatedAt), 'yyyy-MM-dd');
      const dateLabel = format(new Date(conv.updatedAt), 'MMMM d, yyyy');
      
      if (!groups[date]) {
        groups[date] = {
          label: dateLabel,
          conversations: []
        };
      }
      
      groups[date].conversations.push(conv);
    });
    
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredConversations]);

  const togglePin = (conversationId) => {
    const newPinned = new Set(pinnedConversations);
    if (newPinned.has(conversationId)) {
      newPinned.delete(conversationId);
    } else {
      newPinned.add(conversationId);
    }
    setPinnedConversations(newPinned);
  };

  const toggleArchive = (conversationId) => {
    const newArchived = new Set(archivedConversations);
    if (newArchived.has(conversationId)) {
      newArchived.delete(conversationId);
    } else {
      newArchived.add(conversationId);
    }
    setArchivedConversations(newArchived);
    archiveConversation?.(conversationId, !archivedConversations.has(conversationId));
  };

  const handleExport = (conversation) => {
    exportConversation?.(conversation);
  };

  const handleDelete = (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation?.(conversationId);
    }
  };

  const getConversationIcon = (conversation) => {
    if (conversation.context?.course) return BookOpen;
    if (conversation.category === 'help') return MessageCircle;
    return MessageCircle;
  };

  const getConversationPreview = (conversation) => {
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    if (!lastMessage) return 'No messages';
    
    const preview = lastMessage.content?.substring(0, 100) || '';
    return preview.length === 100 ? preview + '...' : preview;
  };

  const filters = [
    { value: 'all', label: 'All Conversations' },
    { value: 'pinned', label: 'Pinned' },
    { value: 'learning', label: 'Learning' },
    { value: 'help', label: 'Help & Support' },
    { value: 'course', label: 'Course Related' },
    { value: 'archived', label: 'Archived' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'messages', label: 'Message Count' },
    { value: 'rating', label: 'Rating' }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Conversation History</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({filteredConversations.length})
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            {filters.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          
          <div className="flex gap-2">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm border-none"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-2 bg-white dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-l border-gray-200 dark:border-gray-600 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? 
                  <SortAsc className="h-4 w-4" /> : 
                  <SortDesc className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <History className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Start a conversation with the AI Assistant to see your history here.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {groupedConversations.map(([date, group]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {group.label}
                </div>
                
                {/* Conversations in this date group */}
                {group.conversations.map((conversation) => {
                  const Icon = getConversationIcon(conversation);
                  const isPinned = pinnedConversations.has(conversation.id);
                  const isArchived = archivedConversations.has(conversation.id);
                  const isActive = currentConversation?.id === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`relative group hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedConversation(conversation);
                          onConversationSelect?.(conversation);
                        }}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon and Pin indicator */}
                          <div className="relative flex-shrink-0">
                            <div className={`p-2 rounded-lg ${
                              isActive 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {isPinned && (
                              <Pin className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          
                          {/* Conversation Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium truncate ${
                                isActive 
                                  ? 'text-blue-900 dark:text-blue-100'
                                  : 'text-gray-900 dark:text-gray-100'
                              }`}>
                                {conversation.title || 'Untitled Conversation'}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                {conversation.messages && (
                                  <span>{conversation.messages.length} msgs</span>
                                )}
                                {conversation.rating && (
                                  <div className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                                    <span>{conversation.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                              {getConversationPreview(conversation)}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                                </span>
                                
                                {conversation.context?.course && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                                    {conversation.context.course.title}
                                  </span>
                                )}
                                
                                {isArchived && (
                                  <Archive className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                              
                              {conversation.tags && conversation.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {conversation.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {conversation.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">
                                      +{conversation.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      {/* Action Menu */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(conversation.id);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isPinned 
                                ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title={isPinned ? 'Unpin' : 'Pin conversation'}
                          >
                            {isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                          </button>
                          
                          <div className="relative group/menu">
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                            
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleArchive(conversation.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Archive className="h-4 w-4" />
                                {isArchived ? 'Unarchive' : 'Archive'}
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(conversation);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Download className="h-4 w-4" />
                                Export
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Share functionality
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <Share2 className="h-4 w-4" />
                                Share
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(conversation.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
