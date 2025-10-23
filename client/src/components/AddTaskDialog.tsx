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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residents: string[];
  onAdd: (taskName: string, assignedTo: string) => void;
}

export default function AddTaskDialog({
  open,
  onOpenChange,
  residents,
  onAdd
}: AddTaskDialogProps) {
  const [taskName, setTaskName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleSubmit = () => {
    if (taskName && assignedTo) {
      onAdd(taskName, assignedTo);
      setTaskName("");
      setAssignedTo("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-task">
        <DialogHeader>
          <DialogTitle>Add Custom Task</DialogTitle>
          <DialogDescription>
            Create a new cleaning task and assign it to a resident
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              placeholder="e.g., Clean balcony, Disinfect fridge"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              data-testid="input-task-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-to">Assign To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assigned-to" data-testid="select-assigned-to">
                <SelectValue placeholder="Select a resident" />
              </SelectTrigger>
              <SelectContent>
                {residents.map((resident) => (
                  <SelectItem key={resident} value={resident}>
                    {resident}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!taskName || !assignedTo}
            data-testid="button-add-task"
          >
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
