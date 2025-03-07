import { Editor, TLShapeId } from '@tldraw/tldraw';

interface DrawingData {
  id: number;
  name: string;
  data: string;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}

export const serializeEditor = (editor: Editor): string => {
  const snapshot = editor.store.getSnapshot();
  return JSON.stringify(snapshot);
};

export const loadDrawingIntoEditor = (editor: Editor, drawingData: string): void => {
  try {
    const snapshot = JSON.parse(drawingData);
    editor.store.loadSnapshot(snapshot);
  } catch (error) {
    console.error('Failed to load drawing:', error);
  }
};

export const createNewDrawing = (editor: Editor, name: string = 'Untitled Drawing'): DrawingData => {
  const now = new Date().toISOString();
  return {
    id: -1, // Will be assigned by the server
    name,
    data: serializeEditor(editor),
    createdAt: now,
    updatedAt: now
  };
};

export const exportAsSvg = (editor: Editor, selectedIds?: TLShapeId[]): string | null => {
  const svg = editor.getSvg(selectedIds);
  if (!svg) return null;
  return svg.outerHTML;
};

export const exportAsPng = async (editor: Editor, selectedIds?: TLShapeId[]): Promise<Blob | null> => {
  const svg = editor.getSvg(selectedIds);
  if (!svg) return null;
  
  // Convert SVG to PNG
  const svgString = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const svgUrl = URL.createObjectURL(svgBlob);
  
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(svgUrl);
        resolve(blob);
      }, 'image/png');
    };
    image.src = svgUrl;
  });
};
