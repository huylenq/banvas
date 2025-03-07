import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Toolbar from '@/components/Toolbar';
import Canvas from '@/components/Canvas';
import { 
  Editor, 
  TLShapeId, 
  TldrawEditor, 
  createTLStore, 
  defaultShapeUtils,
  useEditor
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'text' | 'line';

const DrawingApp = () => {
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState('Ready');
  const [editor, setEditor] = useState<Editor | null>(null);

  const colors = [
    { id: 'black', value: '#000000' },
    { id: 'red', value: '#ef4444' },
    { id: 'blue', value: '#3b82f6' },
    { id: 'green', value: '#10b981' },
    { id: 'yellow', value: '#f59e0b' },
  ];

  const handleEditorMount = (editor: Editor) => {
    setEditor(editor);
    
    // Listen to zoom changes
    editor.store.listen(
      () => {
        const newZoom = editor.zoomLevel;
        if (newZoom !== zoom) {
          setZoom(newZoom);
        }
      },
      { source: 'zoom-listener' }
    );
  };

  const handleToolSelect = (tool: Tool) => {
    if (!editor) return;
    
    setActiveTool(tool);
    setStatus(`Tool: ${tool}`);
    
    switch (tool) {
      case 'select':
        editor.selectTool('select');
        break;
      case 'pen':
        editor.selectTool('draw');
        break;
      case 'rectangle':
        editor.selectTool('geo');
        editor.updateInstanceState({
          propsForNextShape: { geo: 'rectangle' },
        });
        break;
      case 'ellipse':
        editor.selectTool('geo');
        editor.updateInstanceState({
          propsForNextShape: { geo: 'ellipse' },
        });
        break;
      case 'text':
        editor.selectTool('text');
        break;
      case 'line':
        editor.selectTool('line');
        break;
    }
  };

  const handleColorSelect = (color: string) => {
    setActiveColor(color);
    if (editor) {
      editor.updateInstanceState({
        propsForNextShape: { ...editor.instanceState.propsForNextShape, fill: color },
      });
      
      // Also apply to selected shapes
      const selectedIds = editor.selectedIds;
      if (selectedIds.length > 0) {
        editor.updateShapes(
          selectedIds.map((id) => ({
            id,
            type: 'geo',
            props: { fill: color },
          }))
        );
      }
    }
  };

  const handleUndo = () => {
    if (!editor) return;
    editor.undo();
    setStatus('Undo');
  };

  const handleRedo = () => {
    if (!editor) return;
    editor.redo();
    setStatus('Redo');
  };

  const handleClear = () => {
    if (!editor) return;
    // Clear all shapes
    editor.selectAll();
    editor.deleteShapes(editor.selectedIds);
    editor.selectNone();
    setStatus('Canvas cleared');
  };

  const handleExport = () => {
    if (!editor) return;
    
    // Export as SVG
    const svg = editor.getSvg(editor.selectedIds.length ? editor.selectedIds : undefined);
    if (svg) {
      const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'drawing.svg';
      a.click();
      
      URL.revokeObjectURL(url);
      setStatus('Exported as SVG');
    }
  };

  const handleZoomIn = () => {
    if (!editor) return;
    editor.zoomIn();
  };

  const handleZoomOut = () => {
    if (!editor) return;
    editor.zoomOut();
  };

  const handleResetZoom = () => {
    if (!editor) return;
    editor.resetZoom();
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onExport={handleExport} />
      
      <div className="flex flex-1 overflow-hidden">
        <Toolbar 
          activeTool={activeTool}
          activeColor={activeColor}
          colors={colors}
          onToolSelect={handleToolSelect}
          onColorSelect={handleColorSelect}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
        />
        
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-neutral-200 px-4 py-1.5 flex items-center justify-between text-sm">
            <div className="text-neutral-500">{status}</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="text-neutral-500 mr-2">Zoom:</label>
                <span className="font-medium">{Math.round(zoom * 100)}%</span>
              </div>
              <div>
                <button 
                  className="p-1 text-neutral-600 hover:text-primary"
                  onClick={handleZoomOut}
                >
                  <i className="fas fa-search-minus"></i>
                </button>
                <button 
                  className="p-1 text-neutral-600 hover:text-primary"
                  onClick={handleResetZoom}
                >
                  <i className="fas fa-compress-arrows-alt"></i>
                </button>
                <button 
                  className="p-1 text-neutral-600 hover:text-primary"
                  onClick={handleZoomIn}
                >
                  <i className="fas fa-search-plus"></i>
                </button>
              </div>
            </div>
          </div>
          
          <Canvas onMount={handleEditorMount} />
        </div>
      </div>
    </div>
  );
};

export default DrawingApp;
