import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Drawing } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderOpen } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface SavedDrawingsListProps {
  onDrawingSelect: (drawing: Drawing) => void;
  isLoading?: boolean;
}

const SavedDrawingsList = ({ onDrawingSelect, isLoading = false }: SavedDrawingsListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: drawings, isLoading: isLoadingDrawings } = useQuery<Drawing[]>({
    queryKey: ['/api/drawings'],
    staleTime: 1000 * 60, // 1 minute
  });

  const handleDrawingClick = (drawing: Drawing) => {
    onDrawingSelect(drawing);
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center hover:bg-blue-600 transition"
          disabled={isLoading}
        >
          <FolderOpen className="h-4 w-4 mr-1.5" />
          {isLoading ? 'Loading...' : 'Open'}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Saved Drawings</DialogTitle>
          <DialogDescription>
            Select a drawing to open
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {isLoadingDrawings ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !drawings || drawings.length === 0 ? (
            <p className="text-center py-8 text-neutral-500">No saved drawings found</p>
          ) : (
            <ul className="space-y-2">
              {drawings.map((drawing) => (
                <li
                  key={drawing.id}
                  className="p-4 border rounded-md hover:bg-neutral-50 cursor-pointer transition"
                  onClick={() => handleDrawingClick(drawing)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{drawing.name}</h3>
                    <span className="text-xs text-neutral-500">ID: {drawing.id}</span>
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    <span>Updated {formatDate(drawing.updatedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedDrawingsList;