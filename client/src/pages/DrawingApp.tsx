import { useState, useCallback, useEffect } from "react";
import { 
  Editor, 
  Tldraw, 
  TLShapeId,
  defaultEditorAssetUrls
} from "@tldraw/tldraw";
import { Save, Download } from "lucide-react";
import "@tldraw/tldraw/tldraw.css";
import {
  serializeEditor,
  createNewDrawing,
  loadDrawingIntoEditor,
} from "@/lib/drawingUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Drawing } from "@shared/schema";
import SavedDrawingsList from "@/components/SavedDrawingsList";
import NewDrawingDialog from "@/components/NewDrawingDialog";

const DrawingApp = () => {
  const [status, setStatus] = useState("Ready");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [zoom, setZoom] = useState(1);
  const [drawingId, setDrawingId] = useState<number | null>(null);
  const [drawingName, setDrawingName] = useState("Untitled Drawing");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Save drawing mutation
  const saveDrawingMutation = useMutation({
    mutationFn: async ({
      id,
      data,
      isNew,
      name = drawingName, // Use current drawing name or provided name
    }: {
      id: number | null;
      data: string;
      isNew: boolean;
      name?: string;
    }) => {
      if (isNew || id === null) {
        // Create new drawing
        const drawingData = {
          name,
          data,
          userId: null, // Since we don't have user authentication yet
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const response = await apiRequest("POST", "/api/drawings", drawingData);
        return response.json();
      } else {
        // Update existing drawing
        const response = await apiRequest("PUT", `/api/drawings/${id}`, {
          data,
        });
        return response.json();
      }
    },
    onSuccess: (data) => {
      setDrawingId(data.id);
      setDrawingName(data.name);
      setStatus(`Drawing saved: ${data.name} (ID: ${data.id})`);
      queryClient.invalidateQueries({ queryKey: ["/api/drawings"] });
      setIsCreatingNew(false);
    },
    onError: (error) => {
      console.error("Error saving drawing:", error);
      setStatus("Failed to save drawing");
      setIsCreatingNew(false);
    },
  });
  
  // Handler for creating a new drawing
  const handleCreateNewDrawing = useCallback((name: string) => {
    if (!editor) return;
    
    try {
      setIsCreatingNew(true);
      setStatus(`Creating new drawing: ${name}...`);
      
      // Clear the current drawing
      editor.deleteShapes(editor.getSelectedShapeIds());
      editor.selectAll();
      editor.deleteShapes(editor.getSelectedShapeIds());
      
      // Reset the drawing ID and name
      setDrawingId(null);
      setDrawingName(name);
      
      // Serialize the current (empty) state
      const data = serializeEditor(editor);
      
      // Create the new drawing
      saveDrawingMutation.mutate({
        id: null,
        data,
        isNew: true,
        name,
      });
      
    } catch (error) {
      console.error("Error creating new drawing:", error);
      setStatus("Failed to create new drawing");
      setIsCreatingNew(false);
    }
  }, [editor, saveDrawingMutation]);

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
      setStatus("Exporting...");

      // TLDraw v3.9.0+ API for exporting SVG
      const selectedIds = editor.getSelectedShapeIds();

      const svg = await editor.getSvg(selectedIds);

      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const url = URL.createObjectURL(svgBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "drawing.svg";
        a.click();

        URL.revokeObjectURL(url);
        setStatus("Exported as SVG");
      } else {
        setStatus("Nothing to export");
      }
    } catch (error) {
      console.error("Error exporting SVG:", error);
      setStatus("Export failed");
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    try {
      setIsSaving(true);
      setStatus("Saving drawing...");

      // Serialize the current drawing state
      const data = serializeEditor(editor);

      // Save to database
      await saveDrawingMutation.mutateAsync({
        id: drawingId,
        data,
        isNew: drawingId === null,
      });
    } catch (error) {
      console.error("Error saving drawing:", error);
      setStatus("Failed to save drawing");
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

  const handleLoadDrawing = useCallback(
    async (drawing: Drawing) => {
      if (!editor) return;

      try {
        setIsLoading(true);
        setStatus(`Loading drawing (ID: ${drawing.id})...`);

        // Load the drawing data into the editor
        loadDrawingIntoEditor(editor, drawing.data);

        // Update state
        setDrawingId(drawing.id);
        setDrawingName(drawing.name);
        setStatus(`Loaded drawing: ${drawing.name} (ID: ${drawing.id})`);
      } catch (error) {
        console.error("Error loading drawing:", error);
        setStatus("Failed to load drawing");
      } finally {
        setIsLoading(false);
      }
    },
    [editor],
  );

  // Query to fetch all drawings
  const { data: drawings } = useQuery<Drawing[]>({
    queryKey: ["/api/drawings"],
    staleTime: 1000 * 60, // 1 minute
  });

  // Load the most recent drawing when the editor is mounted and drawings are available
  useEffect(() => {
    if (editor && drawings && drawings.length > 0 && !drawingId) {
      // The drawings are already sorted by updatedAt in descending order from the server
      // Load the most recent drawing (first in the array)
      handleLoadDrawing(drawings[0]);
    }
  }, [editor, drawings, drawingId, handleLoadDrawing]);

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-neutral-200 py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-neutral-800">TLDraw App</h1>
          {drawingId !== null && (
            <span className="ml-3 text-sm text-neutral-500">
              {drawingName} (ID: {drawingId})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <SavedDrawingsList
            onDrawingSelect={handleLoadDrawing}
            isLoading={isLoading}
          />
          
          <NewDrawingDialog 
            onCreateDrawing={handleCreateNewDrawing}
            isCreating={isCreatingNew}
          />

          <button
            className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-green-700 transition"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {isSaving ? "Saving..." : "Save"}
          </button>

          {/* TODO: move Export to a different layout  */}
          {/*
          <button
            className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-600 transition"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1.5" /> Export
          </button>
          */}
        </div>
      </div>

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

          <div
            id="tldraw-container"
            className="flex-1 bg-neutral-100 relative overflow-hidden"
          >
            <Tldraw 
              onMount={handleEditorMount} 
              autoFocus
              persistenceKey="tldraw-app"
              hideUi={false}
              disableAssetUrlReplacement={true}
              useStateForStorage={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingApp;
