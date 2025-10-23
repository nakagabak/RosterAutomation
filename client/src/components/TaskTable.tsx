import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import ResidentAvatar from "./ResidentAvatar";
import TaskStatusBadge from "./TaskStatusBadge";
import TaskCompletionDialog from "./TaskCompletionDialog";

interface Task {
  id: string;
  name: string;
  assignedTo: string;
  status: "completed" | "pending" | "overdue";
  completedAt?: string;
  proofCount: number;
}

interface TaskTableProps {
  tasks: Task[];
  onComplete: (taskId: string, images: File[]) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskTable({ tasks, onComplete, onDelete }: TaskTableProps) {
  const [completionDialog, setCompletionDialog] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null
  });

  const handleCheckboxChange = (task: Task, checked: boolean) => {
    if (checked) {
      setCompletionDialog({ open: true, task });
    }
  };

  return (
    <>
      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="font-semibold">Task Name</TableHead>
              <TableHead className="font-semibold">Assigned To</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Proof</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                <TableCell>
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={(checked) => handleCheckboxChange(task, checked as boolean)}
                    disabled={task.status === "completed"}
                    data-testid={`checkbox-task-${task.id}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ResidentAvatar name={task.assignedTo} size="sm" />
                    <span>{task.assignedTo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                  {task.completedAt && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {task.completedAt}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {task.proofCount > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      data-testid={`button-view-proof-${task.id}`}
                    >
                      <ImageIcon className="h-4 w-4" />
                      {task.proofCount} {task.proofCount === 1 ? "photo" : "photos"}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No proof</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task.id)}
                    data-testid={`button-delete-task-${task.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {completionDialog.task && (
        <TaskCompletionDialog
          open={completionDialog.open}
          onOpenChange={(open) => setCompletionDialog({ open, task: null })}
          taskName={completionDialog.task.name}
          assignedTo={completionDialog.task.assignedTo}
          onComplete={(images) => onComplete(completionDialog.task!.id, images)}
        />
      )}
    </>
  );
}
