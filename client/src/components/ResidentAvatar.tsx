import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ResidentAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getColorForResident = (name: string) => {
  const colors = [
    "hsl(195, 85%, 55%)",
    "hsl(142, 70%, 45%)",
    "hsl(38, 92%, 50%)",
    "hsl(265, 70%, 60%)",
    "hsl(25, 85%, 60%)",
    "hsl(340, 75%, 55%)",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export default function ResidentAvatar({ name, size = "md" }: ResidentAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };

  return (
    <Avatar className={sizeClasses[size]} data-testid={`avatar-${name.toLowerCase()}`}>
      <AvatarFallback 
        style={{ backgroundColor: getColorForResident(name) }}
        className="text-white font-medium"
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
