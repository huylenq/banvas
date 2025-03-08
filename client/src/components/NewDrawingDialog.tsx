import { useState } from "react";
import { FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewDrawingDialogProps {
  onCreateDrawing: (name: string) => void;
  isCreating?: boolean;
}

const NewDrawingDialog = ({ onCreateDrawing, isCreating = false }: NewDrawingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Untitled Drawing");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateDrawing(name.trim());
      setOpen(false);
      // Keep the name for next time but add a number if it ends with a number
      const match = name.match(/(.*?)(\d+)$/);
      if (match) {
        const prefix = match[1];
        const number = parseInt(match[2]);
        setName(`${prefix}${number + 1}`);
      } else {
        setName(`${name} 2`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center"
        >
          <FilePlus className="h-4 w-4 mr-1.5" />
          New Drawing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Drawing</DialogTitle>
            <DialogDescription>
              Give your new drawing a name. Your current drawing will be cleared.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isCreating || !name.trim()}
            >
              {isCreating ? "Creating..." : "Create Drawing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDrawingDialog;