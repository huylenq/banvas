import { cn } from "@/lib/utils";

type Tool = 'select' | 'pen' | 'rectangle' | 'ellipse' | 'text' | 'line';

interface ColorOption {
  id: string;
  value: string;
}

interface ToolbarProps {
  activeTool: Tool;
  activeColor: string;
  colors: ColorOption[];
  onToolSelect: (tool: Tool) => void;
  onColorSelect: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const Toolbar = ({
  activeTool,
  activeColor,
  colors,
  onToolSelect,
  onColorSelect,
  onUndo,
  onRedo,
  onClear
}: ToolbarProps) => {
  
  return (
    <div className="toolbar flex flex-col bg-white border-r border-neutral-200 p-3 space-y-6 w-16 sm:w-20">
      <div className="toolbar-section flex flex-col space-y-2">
        <button 
          className={cn(
            "tool-button flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
            activeTool === 'select' && "active bg-blue-50 text-blue-600"
          )}
          onClick={() => onToolSelect('select')}
        >
          <i className="fas fa-mouse-pointer text-lg"></i>
          <span className="text-xs mt-1">Select</span>
        </button>

        <button 
          className={cn(
            "tool-button flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
            activeTool === 'pen' && "active bg-blue-50 text-blue-600"
          )}
          onClick={() => onToolSelect('pen')}
        >
          <i className="fas fa-pen text-lg"></i>
          <span className="text-xs mt-1">Pen</span>
        </button>

        <button 
          className={cn(
            "tool-button flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
            activeTool === 'rectangle' && "active bg-blue-50 text-blue-600"
          )}
          onClick={() => onToolSelect('rectangle')}
        >
          <i className="far fa-square text-lg"></i>
          <span className="text-xs mt-1">Rect</span>
        </button>

        <button 
          className={cn(
            "tool-button flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
            activeTool === 'ellipse' && "active bg-blue-50 text-blue-600"
          )}
          onClick={() => onToolSelect('ellipse')}
        >
          <i className="far fa-circle text-lg"></i>
          <span className="text-xs mt-1">Circle</span>
        </button>

        <button 
          className={cn(
            "tool-button flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
            activeTool === 'text' && "active bg-blue-50 text-blue-600"
          )}
          onClick={() => onToolSelect('text')}
        >
          <i className="fas fa-font text-lg"></i>
          <span className="text-xs mt-1">Text</span>
        </button>

        <button 
          className={cn(
            "tool-button flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100",
            activeTool === 'line' && "active bg-blue-50 text-blue-600"
          )}
          onClick={() => onToolSelect('line')}
        >
          <i className="fas fa-slash text-lg"></i>
          <span className="text-xs mt-1">Line</span>
        </button>
      </div>

      <div className="toolbar-section">
        <p className="text-xs text-neutral-500 mb-2 text-center">Colors</p>
        <div className="color-swatches flex flex-col items-center space-y-2">
          {colors.map((color) => (
            <div
              key={color.id}
              className={cn(
                "color-swatch w-6 h-6 rounded-full cursor-pointer transition transform hover:scale-110",
                activeColor === color.value ? "ring-2 ring-offset-2 ring-blue-500" : ""
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => onColorSelect(color.value)}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section flex flex-col space-y-2 mt-auto">
        <button 
          className="flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          onClick={onUndo}
        >
          <i className="fas fa-undo text-lg"></i>
          <span className="text-xs mt-1">Undo</span>
        </button>

        <button 
          className="flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          onClick={onRedo}
        >
          <i className="fas fa-redo text-lg"></i>
          <span className="text-xs mt-1">Redo</span>
        </button>

        <button 
          className="flex flex-col items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-red-500"
          onClick={onClear}
        >
          <i className="fas fa-trash-alt text-lg"></i>
          <span className="text-xs mt-1">Clear</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
