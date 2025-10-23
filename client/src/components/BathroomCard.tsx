import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Check, X } from "lucide-react";
import ResidentAvatar from "./ResidentAvatar";

interface BathroomCardProps {
  bathroomNumber: number;
  assignedTo: string;
  cleaningMode: "basic" | "deep";
  residents: string[];
  onUpdate: (assignedTo: string, cleaningMode: "basic" | "deep") => void;
}

export default function BathroomCard({
  bathroomNumber,
  assignedTo,
  cleaningMode,
  residents,
  onUpdate
}: BathroomCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempAssignedTo, setTempAssignedTo] = useState(assignedTo);
  const [tempMode, setTempMode] = useState(cleaningMode);

  const handleSave = () => {
    onUpdate(tempAssignedTo, tempMode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempAssignedTo(assignedTo);
    setTempMode(cleaningMode);
    setIsEditing(false);
  };

  return (
    <Card data-testid={`card-bathroom-${bathroomNumber}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-lg">Bathroom {bathroomNumber}</CardTitle>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            data-testid={`button-edit-bathroom-${bathroomNumber}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              data-testid={`button-save-bathroom-${bathroomNumber}`}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              data-testid={`button-cancel-bathroom-${bathroomNumber}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor={`resident-${bathroomNumber}`}>Assigned To</Label>
              <Select value={tempAssignedTo} onValueChange={setTempAssignedTo}>
                <SelectTrigger id={`resident-${bathroomNumber}`} data-testid={`select-resident-${bathroomNumber}`}>
                  <SelectValue />
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

            <div className="flex items-center justify-between">
              <Label htmlFor={`mode-${bathroomNumber}`} className="text-sm">
                Cleaning Mode
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Basic</span>
                <Switch
                  id={`mode-${bathroomNumber}`}
                  checked={tempMode === "deep"}
                  onCheckedChange={(checked) => setTempMode(checked ? "deep" : "basic")}
                  data-testid={`switch-mode-${bathroomNumber}`}
                />
                <span className="text-sm text-muted-foreground">Deep</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ResidentAvatar name={assignedTo} size="sm" />
              <div>
                <p className="text-sm font-medium">{assignedTo}</p>
                <p className="text-xs text-muted-foreground">
                  {cleaningMode === "deep" ? "Deep Cleaning" : "Basic Cleaning"}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
