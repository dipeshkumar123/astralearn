// Settings Panel - Comprehensive AI Assistant settings and preferences
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Globe, 
  Shield, 
  Zap, 
  Brain, 
  Mic, 
  Volume2,
  Moon, 
  Sun, 
  Monitor,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Sliders,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAIAssistantStore } from '../../../stores/aiAssistantStore';

const SettingsPanel = ({ 
  onSettingsChange,
  className = ''
}) => {
  const { settings: storeSettings, updateSettings } = useAIAssistantStore();
  
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'system',
    colorScheme: 'blue',
    fontSize: 'medium',
    compactMode: false,
    animations: true,
    
    // AI Behavior
    aiPersonality: 'helpful',
    responseLength: 'balanced',
    expertise: 'adaptive',
    proactiveMode: true,
    contextAwareness: true,
    
    // Voice & Audio
    voiceEnabled: true,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    voiceVolume: 0.8,
    autoSpeak: false,
    voiceLanguage: 'en-US',
    
    // Notifications
    notificationsEnabled: true,
    soundEnabled: true,
    visualNotifications: true,
    suggestionNotifications: true,
    progressNotifications: true,
    
    // Privacy & Security
    dataSharing: 'minimal',
    conversationHistory: true,
    analyticsOptIn: true,
    personalizedExperience: true,
    
    // Accessibility
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    
    // Advanced
    developerMode: false,
    debugMode: false,
    betaFeatures: false,
    cacheEnabled: true,
    
    ...storeSettings
  });

  const [activeTab, setActiveTab] = useState('appearance');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(storeSettings);
    setHasUnsavedChanges(hasChanges);
  }, [settings, storeSettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    updateSettings(settings);
    onSettingsChange?.(settings);
    setHasUnsavedChanges(false);
  };

  const handleResetSettings = () => {
    if (showResetConfirm) {
      setSettings({
        theme: 'system',
        colorScheme: 'blue',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        aiPersonality: 'helpful',
        responseLength: 'balanced',
        expertise: 'adaptive',
        proactiveMode: true,
        contextAwareness: true,
        voiceEnabled: true,
        voiceSpeed: 1.0,
        voicePitch: 1.0,
        voiceVolume: 0.8,
        autoSpeak: false,
        voiceLanguage: 'en-US',
        notificationsEnabled: true,
        soundEnabled: true,
        visualNotifications: true,
        suggestionNotifications: true,
        progressNotifications: true,
        dataSharing: 'minimal',
        conversationHistory: true,
        analyticsOptIn: true,
        personalizedExperience: true,
        highContrast: false,
        reduceMotion: false,
        screenReader: false,
        keyboardNavigation: true,
        developerMode: false,
        debugMode: false,
        betaFeatures: false,
        cacheEnabled: true
      });
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'astralearn-ai-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          setSettings(prev => ({
            ...prev,
            ...importedSettings
          }));
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'ai', label: 'AI Behavior', icon: Brain },
    { id: 'voice', label: 'Voice & Audio', icon: Mic },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'advanced', label: 'Advanced', icon: Sliders }
  ];

  const colorSchemes = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' }
  ];

  const voiceLanguages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'pt-BR', label: 'Portuguese' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'ko-KR', label: 'Korean' },
    { value: 'zh-CN', label: 'Chinese' }
  ];

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</h4>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform transition-transform bg-white rounded-full ${
            enabled ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Theme</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('theme', value)}
              className={`p-3 rounded-lg border text-center transition-all ${
                settings.theme === value
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Color Scheme</h4>
        <div className="grid grid-cols-6 gap-2">
          {colorSchemes.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => handleSettingChange('colorScheme', value)}
              className={`p-2 rounded-lg border text-center transition-all ${
                settings.colorScheme === value
                  ? 'border-gray-400 ring-2 ring-gray-300'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={label}
            >
              <div className={`w-8 h-8 rounded-full mx-auto ${color}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Font Size</h4>
        <select
          value={settings.fontSize}
          onChange={(e) => handleSettingChange('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
          <option value="xlarge">Extra Large</option>
        </select>
      </div>

      {/* Interface Options */}
      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.compactMode}
          onChange={(value) => handleSettingChange('compactMode', value)}
          label="Compact Mode"
          description="Use a more condensed interface layout"
        />
        <ToggleSwitch
          enabled={settings.animations}
          onChange={(value) => handleSettingChange('animations', value)}
          label="Animations"
          description="Enable smooth animations and transitions"
        />
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      {/* AI Personality */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">AI Personality</h4>
        <select
          value={settings.aiPersonality}
          onChange={(e) => handleSettingChange('aiPersonality', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="helpful">Helpful & Supportive</option>
          <option value="professional">Professional</option>
          <option value="friendly">Friendly & Casual</option>
          <option value="encouraging">Encouraging & Motivating</option>
          <option value="direct">Direct & Concise</option>
        </select>
      </div>

      {/* Response Length */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Response Length</h4>
        <select
          value={settings.responseLength}
          onChange={(e) => handleSettingChange('responseLength', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="brief">Brief & Concise</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed & Comprehensive</option>
        </select>
      </div>

      {/* Expertise Level */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Expertise Level</h4>
        <select
          value={settings.expertise}
          onChange={(e) => handleSettingChange('expertise', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="beginner">Beginner-Friendly</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="adaptive">Adaptive (Recommended)</option>
        </select>
      </div>

      {/* AI Behavior Options */}
      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.proactiveMode}
          onChange={(value) => handleSettingChange('proactiveMode', value)}
          label="Proactive Mode"
          description="AI will offer suggestions without being asked"
        />
        <ToggleSwitch
          enabled={settings.contextAwareness}
          onChange={(value) => handleSettingChange('contextAwareness', value)}
          label="Context Awareness"
          description="AI will remember previous conversations and context"
        />
      </div>
    </div>
  );

  const renderVoiceSettings = () => (
    <div className="space-y-6">
      {/* Voice Language */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Voice Language</h4>
        <select
          value={settings.voiceLanguage}
          onChange={(e) => handleSettingChange('voiceLanguage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {voiceLanguages.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Voice Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Voice Speed: {settings.voiceSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voiceSpeed}
            onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Voice Pitch: {settings.voicePitch.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voicePitch}
            onChange={(e) => handleSettingChange('voicePitch', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Voice Volume: {Math.round(settings.voiceVolume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.voiceVolume}
            onChange={(e) => handleSettingChange('voiceVolume', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Voice Options */}
      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.voiceEnabled}
          onChange={(value) => handleSettingChange('voiceEnabled', value)}
          label="Voice Features"
          description="Enable text-to-speech and voice recognition"
        />
        <ToggleSwitch
          enabled={settings.autoSpeak}
          onChange={(value) => handleSettingChange('autoSpeak', value)}
          label="Auto-Speak Responses"
          description="Automatically read AI responses aloud"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.notificationsEnabled}
          onChange={(value) => handleSettingChange('notificationsEnabled', value)}
          label="Enable Notifications"
          description="Receive notifications about AI interactions"
        />
        <ToggleSwitch
          enabled={settings.soundEnabled}
          onChange={(value) => handleSettingChange('soundEnabled', value)}
          label="Sound Notifications"
          description="Play sounds for notifications"
        />
        <ToggleSwitch
          enabled={settings.visualNotifications}
          onChange={(value) => handleSettingChange('visualNotifications', value)}
          label="Visual Notifications"
          description="Show visual notification indicators"
        />
        <ToggleSwitch
          enabled={settings.suggestionNotifications}
          onChange={(value) => handleSettingChange('suggestionNotifications', value)}
          label="Suggestion Notifications"
          description="Notify when AI has suggestions"
        />
        <ToggleSwitch
          enabled={settings.progressNotifications}
          onChange={(value) => handleSettingChange('progressNotifications', value)}
          label="Progress Notifications"
          description="Notify about learning progress updates"
        />
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      {/* Data Sharing */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Data Sharing</h4>
        <select
          value={settings.dataSharing}
          onChange={(e) => handleSettingChange('dataSharing', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="none">No Data Sharing</option>
          <option value="minimal">Minimal (Recommended)</option>
          <option value="standard">Standard</option>
          <option value="full">Full Analytics</option>
        </select>
      </div>

      {/* Privacy Options */}
      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.conversationHistory}
          onChange={(value) => handleSettingChange('conversationHistory', value)}
          label="Conversation History"
          description="Save conversation history for better context"
        />
        <ToggleSwitch
          enabled={settings.analyticsOptIn}
          onChange={(value) => handleSettingChange('analyticsOptIn', value)}
          label="Analytics Opt-in"
          description="Help improve AI by sharing usage analytics"
        />
        <ToggleSwitch
          enabled={settings.personalizedExperience}
          onChange={(value) => handleSettingChange('personalizedExperience', value)}
          label="Personalized Experience"
          description="Customize AI behavior based on your usage patterns"
        />
      </div>
    </div>
  );

  const renderAccessibilitySettings = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.highContrast}
          onChange={(value) => handleSettingChange('highContrast', value)}
          label="High Contrast Mode"
          description="Increase contrast for better visibility"
        />
        <ToggleSwitch
          enabled={settings.reduceMotion}
          onChange={(value) => handleSettingChange('reduceMotion', value)}
          label="Reduce Motion"
          description="Minimize animations and transitions"
        />
        <ToggleSwitch
          enabled={settings.screenReader}
          onChange={(value) => handleSettingChange('screenReader', value)}
          label="Screen Reader Support"
          description="Optimize for screen reader compatibility"
        />
        <ToggleSwitch
          enabled={settings.keyboardNavigation}
          onChange={(value) => handleSettingChange('keyboardNavigation', value)}
          label="Keyboard Navigation"
          description="Enable keyboard shortcuts and navigation"
        />
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Advanced Settings</span>
        </div>
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          These settings are for advanced users. Changing them may affect performance or functionality.
        </p>
      </div>

      <div className="space-y-3">
        <ToggleSwitch
          enabled={settings.developerMode}
          onChange={(value) => handleSettingChange('developerMode', value)}
          label="Developer Mode"
          description="Show additional technical information"
        />
        <ToggleSwitch
          enabled={settings.debugMode}
          onChange={(value) => handleSettingChange('debugMode', value)}
          label="Debug Mode"
          description="Enable debugging features and logs"
        />
        <ToggleSwitch
          enabled={settings.betaFeatures}
          onChange={(value) => handleSettingChange('betaFeatures', value)}
          label="Beta Features"
          description="Access experimental features (may be unstable)"
        />
        <ToggleSwitch
          enabled={settings.cacheEnabled}
          onChange={(value) => handleSettingChange('cacheEnabled', value)}
          label="Cache Enabled"
          description="Cache responses for faster performance"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'ai':
        return renderAISettings();
      case 'voice':
        return renderVoiceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'accessibility':
        return renderAccessibilitySettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant Settings</h3>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-600 dark:text-orange-400">Unsaved changes</span>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={exportSettings}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer">
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handleResetSettings}
              className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                showResetConfirm
                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              {showResetConfirm ? 'Confirm Reset?' : 'Reset'}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
