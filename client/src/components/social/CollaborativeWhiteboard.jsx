/**
 * Real-time Collaborative Whiteboard Component
 * Integrated with WebSocket service for live drawing collaboration
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  Type,
  Palette,
  Undo,
  Redo,
  Save,
  Trash2,
  Users,
  Download,
  Upload
} from 'lucide-react';
import realTimeIntegrationService from '../../services/realTimeIntegrationService';

const CollaborativeWhiteboard = ({ sessionId, isActive = true }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [otherCursors, setOtherCursors] = useState(new Map());
  
  // Element synchronization state
  const [whiteboardElements, setWhiteboardElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  
  // Tool coordination state
  const [selectedTool, setSelectedTool] = useState('pen');
  const [toolSettings, setToolSettings] = useState({
    color: '#000000',
    strokeWidth: 2,
    opacity: 1
  });
  
  // History management for undo/redo
  const [undoHistory, setUndoHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!sessionId || !isActive) return;

    // Join whiteboard session
    realTimeIntegrationService.joinWhiteboardSession(sessionId);

    // Setup real-time event listeners
    realTimeIntegrationService.on('whiteboardDrawingUpdate', handleDrawingUpdate);
    realTimeIntegrationService.on('whiteboardElementAdded', handleElementAdded);
    realTimeIntegrationService.on('whiteboardElementUpdated', handleElementUpdated);
    realTimeIntegrationService.on('whiteboardElementDeleted', handleElementDeleted);
    realTimeIntegrationService.on('whiteboardCursorMoved', handleCursorMoved);
    realTimeIntegrationService.on('whiteboardCleared', handleWhiteboardCleared);

    return () => {
      // Cleanup event listeners
      realTimeIntegrationService.off('whiteboardDrawingUpdate', handleDrawingUpdate);
      realTimeIntegrationService.off('whiteboardElementAdded', handleElementAdded);
      realTimeIntegrationService.off('whiteboardElementUpdated', handleElementUpdated);
      realTimeIntegrationService.off('whiteboardElementDeleted', handleElementDeleted);
      realTimeIntegrationService.off('whiteboardCursorMoved', handleCursorMoved);
      realTimeIntegrationService.off('whiteboardCleared', handleWhiteboardCleared);
    };
  }, [sessionId, isActive]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Set initial styles
      context.lineCap = 'round';
      context.lineJoin = 'round';
    }
  }, []);

  // Real-time event handlers
  const handleDrawingUpdate = (data) => {
    if (data.user.id === 'current-user-id') return; // Skip own updates
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Draw the received drawing data
    drawFromData(context, data.drawingData);
  };

  const handleElementAdded = (data) => {
    if (data.user.id === 'current-user-id') return;
    
    setWhiteboardElements(prev => [...prev, data.element]);
    redrawCanvas();
  };

  const handleElementUpdated = (data) => {
    if (data.user.id === 'current-user-id') return;
    
    setWhiteboardElements(prev => 
      prev.map(element => 
        element.id === data.elementId 
          ? { ...element, ...data.updates }
          : element
      )
    );
    redrawCanvas();
  };

  const handleElementDeleted = (data) => {
    if (data.user.id === 'current-user-id') return;
    
    setWhiteboardElements(prev => 
      prev.filter(element => element.id !== data.elementId)
    );
    redrawCanvas();
  };

  const handleCursorMoved = (data) => {
    if (data.user.id === 'current-user-id') return;
    
    setOtherCursors(prev => {
      const updated = new Map(prev);
      updated.set(data.user.id, {
        user: data.user,
        position: data.position,
        timestamp: Date.now()
      });
      return updated;
    });

    // Remove old cursors after 3 seconds
    setTimeout(() => {
      setOtherCursors(prev => {
        const updated = new Map(prev);
        const cursor = updated.get(data.user.id);
        if (cursor && Date.now() - cursor.timestamp > 3000) {
          updated.delete(data.user.id);
        }
        return updated;
      });
    }, 3000);
  };

  const handleWhiteboardCleared = (data) => {
    if (data.user.id === 'current-user-id') return;
    
    setWhiteboardElements([]);
    clearCanvas();
  };

  // Drawing functions
  const startDrawing = (e) => {
    if (!isActive || currentTool === 'text') return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(x, y);
    
    // Send cursor position
    sendCursorPosition({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing || !isActive) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const context = canvas.getContext('2d');
    
    if (currentTool === 'pen') {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = currentColor;
      context.lineWidth = strokeWidth;
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
      
      // Send drawing data
      sendDrawingData({
        type: 'stroke',
        x,
        y,
        color: currentColor,
        width: strokeWidth,
        tool: currentTool
      });
    } else if (currentTool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = strokeWidth * 2;
      context.lineTo(x, y);
      context.stroke();
      context.beginPath();
      context.moveTo(x, y);
      
      // Send eraser data
      sendDrawingData({
        type: 'erase',
        x,
        y,
        width: strokeWidth * 2,
        tool: currentTool
      });
    }
    
    // Send cursor position
    sendCursorPosition({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.beginPath();
    
    // Save to history
    saveToHistory();
  };

  const sendDrawingData = (data) => {
    if (sessionId) {
      realTimeIntegrationService.sendWhiteboardDrawing(sessionId, data);
    }
  };

  const sendCursorPosition = (position) => {
    if (sessionId) {
      realTimeIntegrationService.sendWhiteboardCursor(sessionId, position);
    }
  };

  const drawFromData = (context, data) => {
    context.save();
    
    if (data.type === 'stroke') {
      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = data.color;
      context.lineWidth = data.width;
      context.lineTo(data.x, data.y);
      context.stroke();
    } else if (data.type === 'erase') {
      context.globalCompositeOperation = 'destination-out';
      context.lineWidth = data.width;
      context.lineTo(data.x, data.y);
      context.stroke();
    }
    
    context.restore();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all elements
    whiteboardElements.forEach(element => {
      drawElement(context, element);
    });
  };

  const drawElement = (context, element) => {
    context.save();
    
    switch (element.type) {
      case 'rectangle':
        context.strokeStyle = element.color;
        context.lineWidth = element.strokeWidth;
        context.strokeRect(element.x, element.y, element.width, element.height);
        break;
      case 'circle':
        context.strokeStyle = element.color;
        context.lineWidth = element.strokeWidth;
        context.beginPath();
        context.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
        context.stroke();
        break;
      case 'text':
        context.fillStyle = element.color;
        context.font = `${element.fontSize}px Arial`;
        context.fillText(element.text, element.x, element.y);
        break;
    }
    
    context.restore();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    
    setUndoHistory(prev => {
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      newHistory.push(imageData);
      return newHistory;
    });
    
    setCurrentHistoryIndex(prev => prev + 1);
  };

  const undo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(prev => prev - 1);
      restoreFromHistory(undoHistory[currentHistoryIndex - 1]);
    }
  };

  const redo = () => {
    if (currentHistoryIndex < undoHistory.length - 1) {
      setCurrentHistoryIndex(prev => prev + 1);
      restoreFromHistory(undoHistory[currentHistoryIndex + 1]);
    }
  };

  const restoreFromHistory = (imageData) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    
    img.src = imageData;
  };

  const clearWhiteboard = () => {
    if (sessionId) {
      realTimeIntegrationService.clearWhiteboard(sessionId);
    }
    
    setWhiteboardElements([]);
    clearCanvas();
    saveToHistory();
  };

  // Sync elements across users
  const syncElements = (elements) => {
    if (realTimeIntegrationService.isConnected()) {
      realTimeIntegrationService.sendWhiteboardUpdate(sessionId, {
        type: 'elementsSync',
        elements: elements,
        timestamp: Date.now()
      });
    }
  };

  // Handle multi-user cursor tracking
  const handleCursorMove = (event) => {
    const rect = event.target.getBoundingClientRect();
    const newPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    
    setCursorPosition(newPosition);
    
    if (realTimeIntegrationService.isConnected()) {
      realTimeIntegrationService.sendWhiteboardCursor(sessionId, {
        ...newPosition,
        visible: true,
        userId: 'current-user',
        timestamp: Date.now()
      });
    }
  };

  // Tool coordination functions
  const handleToolChange = (newTool) => {
    setSelectedTool(newTool);
    
    if (realTimeIntegrationService.isConnected()) {
      realTimeIntegrationService.sendWhiteboardUpdate(sessionId, {
        type: 'toolChange',
        tool: newTool,
        settings: toolSettings,
        userId: 'current-user'
      });
    }
  };

  // History management functions
  const addToHistory = (action) => {
    const newHistory = undoHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(action);
    setUndoHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setRedoHistory([]);
    
    // Sync history with other users
    if (realTimeIntegrationService.isConnected()) {
      realTimeIntegrationService.sendWhiteboardUpdate(sessionId, {
        type: 'historyUpdate',
        action: action,
        historyIndex: newHistory.length - 1
      });
    }
  };

  const applyHistoryAction = (action, type) => {
    // Implementation for applying history actions
    console.log(`Applying ${type} action:`, action);
  };

  const tools = [
    { id: 'pen', icon: PenTool, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          {/* Tool Selection */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id)}
                  className={`p-2 rounded transition-colors ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={tool.label}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {/* Color Palette */}
          <div className="flex items-center space-x-1 ml-4">
            <Palette className="h-4 w-4 text-gray-600" />
            <div className="flex space-x-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded border-2 ${
                    currentColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width */}
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-6">{strokeWidth}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            disabled={currentHistoryIndex <= 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={currentHistoryIndex >= undoHistory.length - 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
          <button
            onClick={clearWhiteboard}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{otherCursors.size + 1}</span>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        {/* Active Cursors */}
        {Array.from(otherCursors.values()).map((cursor) => (
          <motion.div
            key={cursor.user.id}
            className="absolute pointer-events-none"
            style={{
              left: cursor.position.x,
              top: cursor.position.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
              {cursor.user.name}
            </div>
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg mt-1 mx-auto" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeWhiteboard;
