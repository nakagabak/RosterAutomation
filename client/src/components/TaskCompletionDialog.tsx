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

interface TaskCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskName: string;
  assignedTo: string;
  onComplete: () => void;
}

export default function TaskCompletionDialog({
  open,
  onOpenChange,
  taskName,
  assignedTo,
  onComplete
}: TaskCompletionDialogProps) {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = () => {
    if (isCompleted) {
      onComplete();
      setIsCompleted(false);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsCompleted(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-task-completion">
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
            disabled={!isCompleted}
            data-testid="button-submit-completion"
          >
            Mark Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
