/**
 * Version Control Panel - Phase 3 Step 1
 * UI component for managing course content versions and history
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  GitBranch, 
  RotateCcw, 
  Eye, 
  FileText, 
  Calendar,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

const VersionControlPanel = ({ 
  courseId, 
  lessonId = null, 
  onVersionRestore, 
  isVisible = true 
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState(new Set());
  const [restoreStatus, setRestoreStatus] = useState(null);

  // Fetch version history
  useEffect(() => {
    if (isVisible && (courseId || lessonId)) {
      fetchVersionHistory();
    }
  }, [courseId, lessonId, isVisible]);

  const fetchVersionHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = lessonId 
        ? `/api/course-management/lessons/${lessonId}/versions`
        : `/api/course-management/${courseId}/versions`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version history');
      }

      const data = await response.json();
      setVersions(data.versions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionRestore = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version? This action cannot be undone.')) {
      return;
    }

    setRestoreStatus('loading');

    try {
      const endpoint = lessonId 
        ? `/api/course-management/lessons/${lessonId}/versions/${versionId}/restore`
        : `/api/course-management/${courseId}/versions/${versionId}/restore`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      const data = await response.json();
      setRestoreStatus('success');
      
      // Notify parent component
      if (onVersionRestore) {
        onVersionRestore(data);
      }

      // Refresh version history
      await fetchVersionHistory();

      setTimeout(() => setRestoreStatus(null), 3000);
    } catch (err) {
      setRestoreStatus('error');
      setError(err.message);
      setTimeout(() => setRestoreStatus(null), 3000);
    }
  };

  const toggleVersionExpansion = (versionId) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionTypeColor = (isLatest) => {
    return isLatest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <GitBranch className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          </div>
          
          {restoreStatus && (
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              restoreStatus === 'success' ? 'bg-green-100 text-green-800' :
              restoreStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {restoreStatus === 'success' && <Check className="w-4 h-4 mr-1" />}
              {restoreStatus === 'error' && <X className="w-4 h-4 mr-1" />}
              {restoreStatus === 'loading' && <Clock className="w-4 h-4 mr-1 animate-spin" />}
              {restoreStatus === 'success' && 'Restored successfully'}
              {restoreStatus === 'error' && 'Restore failed'}
              {restoreStatus === 'loading' && 'Restoring...'}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Clock className="w-6 h-6 text-gray-400 animate-spin mr-2" />
            <span className="text-gray-500">Loading version history...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>{error}</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No version history available</p>
            <p className="text-sm mt-1">Changes will appear here once you start editing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => {
              const isLatest = index === 0;
              const isExpanded = expandedVersions.has(version._id);

              return (
                <div 
                  key={version._id} 
                  className={`border rounded-lg p-4 ${
                    isLatest ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  {/* Version Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleVersionExpansion(version._id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionTypeColor(isLatest)}`}>
                            v{version.version}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              Current
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(version.timestamp)}
                          <User className="w-3 h-3 ml-3 mr-1" />
                          {version.editedBy?.firstName} {version.editedBy?.lastName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedVersion(version)}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </button>
                      
                      {!isLatest && (
                        <button
                          onClick={() => handleVersionRestore(version._id)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Restore
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Version Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {version.notes && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Version Notes:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{version.notes}</p>
                        </div>
                      )}

                      {/* Changes Summary */}
                      {version.changes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Changes:</h4>
                          <div className="space-y-1">
                            {version.changes.map((change, changeIndex) => (
                              <div key={changeIndex} className="flex items-center text-sm text-gray-600">
                                <FileText className="w-3 h-3 mr-2" />
                                {change.field}: {change.type}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content Snapshot Preview */}
                      {version.snapshot && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Content Snapshot:</h4>
                          <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                            <div><strong>Title:</strong> {version.snapshot.title}</div>
                            {version.snapshot.description && (
                              <div><strong>Description:</strong> {version.snapshot.description.substring(0, 100)}...</div>
                            )}
                            {version.snapshot.objectives?.length > 0 && (
                              <div><strong>Objectives:</strong> {version.snapshot.objectives.length} items</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Version Preview Modal */}
      {selectedVersion && (
        <VersionPreviewModal
          version={selectedVersion}
          onClose={() => setSelectedVersion(null)}
        />
      )}
    </div>
  );
};

// Version Preview Modal Component
const VersionPreviewModal = ({ version, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Version Preview - v{version.version}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(version.timestamp).toLocaleString()}
            <User className="w-4 h-4 ml-4 mr-2" />
            {version.editedBy?.firstName} {version.editedBy?.lastName}
          </div>

          {version.notes && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Notes:</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">{version.notes}</p>
            </div>
          )}

          {version.snapshot && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Content:</h4>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <div>
                  <strong className="text-gray-700">Title:</strong>
                  <p className="mt-1">{version.snapshot.title}</p>
                </div>
                
                {version.snapshot.description && (
                  <div>
                    <strong className="text-gray-700">Description:</strong>
                    <p className="mt-1">{version.snapshot.description}</p>
                  </div>
                )}

                {version.snapshot.objectives?.length > 0 && (
                  <div>
                    <strong className="text-gray-700">Objectives:</strong>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {version.snapshot.objectives.map((objective, index) => (
                        <li key={index} className="text-gray-600">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {version.snapshot.tags?.length > 0 && (
                  <div>
                    <strong className="text-gray-700">Tags:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {version.snapshot.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionControlPanel;
