import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TaskStatusBadgeProps {
  status: "completed" | "pending" | "overdue";
}

export default function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = {
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className: "bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 border-chart-2/20"
    },
    pending: {
      label: "Pending",
      icon: Clock,
      className: "bg-chart-3/10 text-chart-3 hover:bg-chart-3/20 border-chart-3/20"
    },
    overdue: {
      label: "Overdue",
      icon: AlertCircle,
      className: "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
    }
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <Badge 
      variant="outline" 
      className={className}
      data-testid={`badge-status-${status}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
