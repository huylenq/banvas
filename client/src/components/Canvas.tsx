import { useEffect, useRef } from 'react';
import { 
  Tldraw, 
  createTLStore,
  defaultShapeUtils,
  Editor
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

interface CanvasProps {
  onMount: (editor: Editor) => void;
}

const Canvas = ({ onMount }: CanvasProps) => {
  const editorRef = useRef<Editor | null>(null);

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;
    onMount(editor);
  };

  return (
    <div id="tldraw-container" className="flex-1 bg-neutral-100 relative overflow-hidden">
      <Tldraw
        onMount={handleMount}
        shapeUtils={defaultShapeUtils}
        autoFocus
      />
    </div>
  );
};

export default Canvas;
