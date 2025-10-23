import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

interface WeekNavigatorProps {
  currentDate: Date;
  onNavigate: (date: Date) => void;
  onToday: () => void;
}

export default function WeekNavigator({ currentDate, onNavigate, onToday }: WeekNavigatorProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const isCurrentWeek = () => {
    const today = new Date();
    const todayWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    return weekStart.getTime() === todayWeekStart.getTime();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onNavigate(subWeeks(currentDate, 1))}
        data-testid="button-prev-week"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex flex-col items-center min-w-[200px]">
        <span className="text-sm font-medium">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </span>
        {!isCurrentWeek() && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-auto p-0 text-xs"
            data-testid="button-current-week"
          >
            Jump to current week
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onNavigate(addWeeks(currentDate, 1))}
        data-testid="button-next-week"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
