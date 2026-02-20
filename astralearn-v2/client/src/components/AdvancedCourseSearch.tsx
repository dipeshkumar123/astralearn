import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  X,
  Star,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Grid,
  List,
  ArrowUpDown,
  ChevronDown,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiService } from '@/utils/api';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructorName: string;
  rating: number;
  enrollmentCount: number;
  duration: number;
  price: number;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SearchFilters {
  query: string;
  category: string;
  difficulty: string;
  priceRange: [number, number];
  duration: string;
  rating: number;
  tags: string[];
  sortBy: 'relevance' | 'rating' | 'popularity' | 'newest' | 'price';
  sortOrder: 'asc' | 'desc';
}

const CATEGORIES = [
  'programming',
  'design',
  'business',
  'marketing',
  'data-science',
  'photography',
  'music',
  'language',
  'health',
  'other'
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const DURATION_RANGES = [
  { label: 'Under 2 hours', value: '0-2' },
  { label: '2-5 hours', value: '2-5' },
  { label: '5-10 hours', value: '5-10' },
  { label: '10+ hours', value: '10+' }
];

export const AdvancedCourseSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    priceRange: [0, 1000],
    duration: searchParams.get('duration') || '',
    rating: parseInt(searchParams.get('rating') || '0'),
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    sortBy: (searchParams.get('sort') as any) || 'relevance',
    sortOrder: (searchParams.get('order') as any) || 'desc',
  });

  // Fetch courses with search and filters
  const { data: coursesData, isLoading, refetch } = useQuery({
    queryKey: ['courses-search', filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();

        if (filters.query) params.append('q', filters.query);
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.duration) params.append('duration', filters.duration);
        if (filters.rating > 0) params.append('rating', filters.rating.toString());
        if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
        params.append('sort', filters.sortBy);
        params.append('order', filters.sortOrder);
        params.append('limit', '20');

        return await apiService.get(`/courses/search?${params.toString()}`);
      } catch (error) {
        // Fallback to regular courses endpoint with client-side filtering
        console.log('Search endpoint not available, using fallback with client-side filtering');
        const coursesResponse = await apiService.get('/courses');
        let courses = coursesResponse.data || [];

        // Apply client-side filtering
        if (filters.query) {
          courses = courses.filter((course: any) =>
            course.title.toLowerCase().includes(filters.query.toLowerCase()) ||
            course.description.toLowerCase().includes(filters.query.toLowerCase())
          );
        }

        if (filters.category) {
          courses = courses.filter((course: any) => course.category === filters.category);
        }

        if (filters.difficulty) {
          courses = courses.filter((course: any) => course.difficulty === filters.difficulty);
        }

        return { data: { courses, total: courses.length } };
      }
    },
    retry: false,
  });

  // Fetch popular tags (with fallback)
  const { data: tagsData } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: async () => {
      try {
        return await apiService.get('/courses/tags');
      } catch (error) {
        console.log('Tags endpoint not available, using mock data');
        return {
          data: ['javascript', 'react', 'node.js', 'python', 'web-development', 'programming', 'design', 'business']
        };
      }
    },
    retry: false,
  });

  const courses: Course[] = coursesData?.data?.courses || [];
  const totalResults = coursesData?.data?.total || 0;
  const popularTags: string[] = tagsData?.data || [];

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);
    if (filters.duration) params.set('duration', filters.duration);
    if (filters.rating > 0) params.set('rating', filters.rating.toString());
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('order', filters.sortOrder);

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      difficulty: '',
      priceRange: [0, 1000],
      duration: '',
      rating: 0,
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFilter('tags', filters.tags.filter(t => t !== tag));
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.duration || 
                          filters.rating > 0 || filters.tags.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for courses, topics, or instructors..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </div>

            {/* Filter and View Controls */}
            <div className="flex items-center space-x-3">
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                leftIcon={<SlidersHorizontal />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                    {[filters.category, filters.difficulty, filters.duration, 
                      filters.rating > 0 ? '★' : '', ...filters.tags].filter(Boolean).length}
                  </span>
                )}
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {filters.category && (
                <FilterTag
                  label={`Category: ${filters.category}`}
                  onRemove={() => updateFilter('category', '')}
                />
              )}
              
              {filters.difficulty && (
                <FilterTag
                  label={`Difficulty: ${filters.difficulty}`}
                  onRemove={() => updateFilter('difficulty', '')}
                />
              )}
              
              {filters.duration && (
                <FilterTag
                  label={`Duration: ${DURATION_RANGES.find(d => d.value === filters.duration)?.label}`}
                  onRemove={() => updateFilter('duration', '')}
                />
              )}
              
              {filters.rating > 0 && (
                <FilterTag
                  label={`Rating: ${filters.rating}+ stars`}
                  onRemove={() => updateFilter('rating', 0)}
                />
              )}
              
              {filters.tags.map(tag => (
                <FilterTag
                  key={tag}
                  label={tag}
                  onRemove={() => removeTag(tag)}
                />
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <FiltersSidebar
                filters={filters}
                updateFilter={updateFilter}
                popularTags={popularTags}
                addTag={addTag}
                removeTag={removeTag}
              />
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {totalResults} courses found
                </h2>
                {filters.query && (
                  <p className="text-gray-600">
                    Results for "{filters.query}"
                  </p>
                )}
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest</option>
                  <option value="price">Price</option>
                </select>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Course Results */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse our popular courses
                </p>
                <Button onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <CourseResults courses={courses} viewMode={viewMode} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Tag Component
const FilterTag: React.FC<{
  label: string;
  onRemove: () => void;
}> = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
    {label}
    <button
      onClick={onRemove}
      className="ml-2 hover:text-primary-600"
    >
      <X className="h-3 w-3" />
    </button>
  </span>
);

// Filters Sidebar Component
const FiltersSidebar: React.FC<{
  filters: SearchFilters;
  updateFilter: (key: keyof SearchFilters, value: any) => void;
  popularTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
}> = ({ filters, updateFilter, popularTags, addTag, removeTag }) => (
  <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

    {/* Category Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <select
        value={filters.category}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map(category => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
          </option>
        ))}
      </select>
    </div>

    {/* Difficulty Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
      <div className="space-y-2">
        {DIFFICULTIES.map(difficulty => (
          <label key={difficulty} className="flex items-center">
            <input
              type="radio"
              name="difficulty"
              value={difficulty}
              checked={filters.difficulty === difficulty}
              onChange={(e) => updateFilter('difficulty', e.target.value)}
              className="mr-2"
            />
            <span className="capitalize">{difficulty}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Duration Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
      <div className="space-y-2">
        {DURATION_RANGES.map(range => (
          <label key={range.value} className="flex items-center">
            <input
              type="radio"
              name="duration"
              value={range.value}
              checked={filters.duration === range.value}
              onChange={(e) => updateFilter('duration', e.target.value)}
              className="mr-2"
            />
            {range.label}
          </label>
        ))}
      </div>
    </div>

    {/* Rating Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
      <div className="space-y-2">
        {[4, 3, 2, 1].map(rating => (
          <label key={rating} className="flex items-center">
            <input
              type="radio"
              name="rating"
              value={rating}
              checked={filters.rating === rating}
              onChange={(e) => updateFilter('rating', parseInt(e.target.value))}
              className="mr-2"
            />
            <div className="flex items-center">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
              <span className="ml-1">& up</span>
            </div>
          </label>
        ))}
      </div>
    </div>

    {/* Tags Filter */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
      
      {/* Selected Tags */}
      {filters.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {filters.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-primary-100 text-primary-800"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-primary-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600">Popular tags:</p>
        <div className="flex flex-wrap gap-1">
          {popularTags.slice(0, 10).map(tag => (
            <button
              key={tag}
              onClick={() => addTag(tag)}
              disabled={filters.tags.includes(tag)}
              className={`px-2 py-1 rounded text-xs border ${
                filters.tags.includes(tag)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Course Results Component
const CourseResults: React.FC<{
  courses: Course[];
  viewMode: 'grid' | 'list';
}> = ({ courses, viewMode }) => {
  const navigate = useNavigate();

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} onClick={() => navigate(`/courses/${course.id}`)} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map(course => (
        <CourseListItem key={course.id} course={course} onClick={() => navigate(`/courses/${course.id}`)} />
      ))}
    </div>
  );
};

// Course Card Component (Grid View)
const CourseCard: React.FC<{
  course: Course;
  onClick: () => void;
}> = ({ course, onClick }) => (
  <div
    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
    onClick={onClick}
  >
    <div className="p-6">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{course.title}</h3>
        <span className="text-sm font-medium text-primary-600">
          {course.price > 0 ? `$${course.price}` : 'Free'}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-400" />
          {course.rating.toFixed(1)}
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {course.enrollmentCount}
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {course.duration}h
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">by {course.instructorName}</span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
          course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {course.difficulty}
        </span>
      </div>
    </div>
  </div>
);

// Course List Item Component (List View)
const CourseListItem: React.FC<{
  course: Course;
  onClick: () => void;
}> = ({ course, onClick }) => (
  <div
    className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6"
    onClick={onClick}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
          <span className="text-lg font-bold text-primary-600">
            {course.price > 0 ? `$${course.price}` : 'Free'}
          </span>
        </div>
        
        <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400" />
            {course.rating.toFixed(1)} ({course.enrollmentCount} students)
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration} hours
          </div>
          <span className="capitalize">{course.difficulty}</span>
          <span>by {course.instructorName}</span>
        </div>
      </div>
    </div>
  </div>
);
