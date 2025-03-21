import { Download, Save, FolderOpen } from "lucide-react";

interface HeaderProps {
  onExport: () => void;
  onSave: () => void;
  onOpen?: () => void;
  isSaving?: boolean;
  isOpening?: boolean;
}

const Header = ({
  onExport,
  onSave,
  onOpen,
  isSaving = false,
  isOpening = false,
}: HeaderProps) => {
  return (
    <header className="bg-white border-b border-neutral-200 py-2 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-neutral-800">TLDraw App</h1>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-green-700 transition"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1.5" />
          {isSaving ? "Saving..." : "Save"}
        </button>

        {onOpen && (
          <button
            className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-600 transition"
            onClick={onOpen}
            disabled={isOpening}
          >
            <FolderOpen className="h-4 w-4 mr-1.5" />
            {isOpening ? "Loading..." : "Open"}
          </button>
        )}

        <button
          className="bg-primary text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-600 transition"
          onClick={onExport}
        >
          <Download className="h-4 w-4 mr-1.5" /> Export
        </button>
      </div>
    </header>
  );
};

export default Header;
