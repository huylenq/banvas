import { useState } from 'react';
import Header from '@/components/Header';
import { 
  Editor, 
  Tldraw,
  TLShapeId,
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { serializeEditor, createNewDrawing } from '@/lib/drawingUtils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

const DrawingApp = () => {
  const [status, setStatus] = useState('Ready');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [zoom, setZoom] = useState(1);
  const [drawingId, setDrawingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Save drawing mutation
  const saveDrawingMutation = useMutation({
    mutationFn: async ({ id, data, isNew }: { id: number | null, data: string, isNew: boolean }) => {
      if (isNew || id === null) {
        // Create new drawing
        const drawingData = {
          name: 'Untitled Drawing',
          data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const response = await apiRequest('POST', '/api/drawings', drawingData);
        return response.json();
      } else {
        // Update existing drawing
        const response = await apiRequest('PUT', `/api/drawings/${id}`, { data });
        return response.json();
      }
    },
    onSuccess: (data) => {
      setDrawingId(data.id);
      setStatus(`Drawing saved (ID: ${data.id})`);
      queryClient.invalidateQueries({ queryKey: ['/api/drawings'] });
    },
    onError: (error) => {
      console.error('Error saving drawing:', error);
      setStatus('Failed to save drawing');
    },
  });

  const handleEditorMount = (editor: Editor) => {
    setEditor(editor);
    
    // Listen to zoom changes
    editor.store.listen(() => {
      const newZoom = editor.getZoomLevel();
      if (newZoom !== zoom) {
        setZoom(newZoom);
      }
    });
  };

  const handleExport = async () => {
    if (!editor) return;
    
    try {
      setStatus('Exporting...');
      
      // TLDraw v3.9.0+ API for exporting SVG
      const selectedIds = editor.getSelectedShapeIds();
      const shapes = selectedIds.length > 0 ? selectedIds : [];
      
      const svg = await editor.getSvg(selectedIds);
      
      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'drawing.svg';
        a.click();
        
        URL.revokeObjectURL(url);
        setStatus('Exported as SVG');
      } else {
        setStatus('Nothing to export');
      }
    } catch (error) {
      console.error('Error exporting SVG:', error);
      setStatus('Export failed');
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    
    try {
      setIsSaving(true);
      setStatus('Saving drawing...');
      
      // Serialize the current drawing state
      const data = serializeEditor(editor);
      
      // Save to database
      await saveDrawingMutation.mutateAsync({
        id: drawingId,
        data,
        isNew: drawingId === null
      });
      
    } catch (error) {
      console.error('Error saving drawing:', error);
      setStatus('Failed to save drawing');
    } finally {
      setIsSaving(false);
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
      <Header 
        onExport={handleExport} 
        onSave={handleSave}
        isSaving={isSaving}
      />
      
      <div className="flex flex-1 overflow-hidden">
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
                  -
                </button>
                <button 
                  className="p-1 text-neutral-600 hover:text-primary"
                  onClick={handleResetZoom}
                >
                  Reset
                </button>
                <button 
                  className="p-1 text-neutral-600 hover:text-primary"
                  onClick={handleZoomIn}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div id="tldraw-container" className="flex-1 bg-neutral-100 relative overflow-hidden">
            <Tldraw
              onMount={handleEditorMount}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingApp;
