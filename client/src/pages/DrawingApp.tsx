import { useState } from 'react';
import Header from '@/components/Header';
import { 
  Editor, 
  Tldraw
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

const DrawingApp = () => {
  const [status, setStatus] = useState('Ready');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [zoom, setZoom] = useState(1);

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
      const svg = await editor.getSvg(undefined);
      
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
