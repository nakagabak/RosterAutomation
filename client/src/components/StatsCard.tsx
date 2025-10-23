import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "default";
}

export default function StatsCard({ title, value, icon: Icon, color = "default" }: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary",
    success: "text-chart-2",
    warning: "text-chart-3",
    default: "text-muted-foreground"
  };

  return (
    <Card data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`${colorClasses[color]}`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
