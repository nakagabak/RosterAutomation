import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon } from "lucide-react";

interface TaskCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  assignedTo: string;
  onComplete: (file: File | null) => void;
}

export default function TaskCompletionDialog({
  open,
  onOpenChange,
  taskName,
  assignedTo,
  onComplete
}: TaskCompletionDialogProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  const removeFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleSubmit = () => {
    if (isCompleted && selectedFile) {
      onComplete(selectedFile);
      setIsCompleted(false);
      setSelectedFile(null);
      setPreview(null);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsCompleted(false);
      setSelectedFile(null);
      setPreview(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-task-completion">
        <DialogHeader>
          <DialogTitle>Mark Task as Complete</DialogTitle>
          <DialogDescription>
            Confirm completion for <strong>{taskName}</strong> assigned to{" "}
            <strong>{assignedTo}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
              data-testid="checkbox-task-complete"
            />
            <Label htmlFor="completed" className="text-sm font-medium cursor-pointer">
              I confirm this task has been completed
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Upload proof photo (required)</Label>
            
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover-elevate'
                }`}
                data-testid="dropzone-upload"
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the image here'
                    : 'Drag & drop an image, or click to select'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            ) : (
              <div className="border rounded-md p-3 space-y-3" data-testid="file-preview">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[250px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    data-testid="button-remove-file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {preview && (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md"
                    data-testid="img-preview"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isCompleted || !selectedFile}
            data-testid="button-submit-completion"
          >
            Mark Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
