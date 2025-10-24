import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User, Calendar, CheckCircle2 } from "lucide-react";

interface PhotoItem {
  photoUrl: string;
  residentName: string;
  taskName: string;
  completedAt: Date;
  type: 'task' | 'bathroom';
}

interface PhotoGalleryProps {
  currentWeek: any;
}

export default function PhotoGallery({ currentWeek }: PhotoGalleryProps) {
  if (!currentWeek) {
    return null;
  }

  // Collect all photos from tasks and bathrooms
  const allPhotos: PhotoItem[] = [];

  // Add photos from completed tasks
  currentWeek.tasks?.forEach((task: any) => {
    if (task.proofPhotos && task.proofPhotos.length > 0 && task.completedAt) {
      task.proofPhotos.forEach((photoFilename: string) => {
        allPhotos.push({
          photoUrl: `/api/photos/${photoFilename}`,
          residentName: task.assignedTo,
          taskName: task.name,
          completedAt: new Date(task.completedAt),
          type: 'task',
        });
      });
    }
  });

  // Add photos from completed bathrooms
  currentWeek.bathrooms?.forEach((bathroom: any) => {
    if (bathroom.proofPhotos && bathroom.proofPhotos.length > 0 && bathroom.completedAt) {
      bathroom.proofPhotos.forEach((photoFilename: string) => {
        allPhotos.push({
          photoUrl: `/api/photos/${photoFilename}`,
          residentName: bathroom.assignedTo,
          taskName: `Bathroom ${bathroom.bathroomNumber} (${bathroom.cleaningMode})`,
          completedAt: new Date(bathroom.completedAt),
          type: 'bathroom',
        });
      });
    }
  });

  // Sort by completion date (newest first)
  allPhotos.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  if (allPhotos.length === 0) {
    return (
      <Card data-testid="card-photo-gallery-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Photo Proof Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No photos uploaded yet this week. Complete tasks with photo proof to see them here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-photo-gallery">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Photo Proof Gallery ({allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPhotos.map((photo, index) => (
            <div
              key={`${photo.photoUrl}-${index}`}
              className="border rounded-lg overflow-hidden hover-elevate"
              data-testid={`photo-item-${index}`}
            >
              <div className="aspect-square relative bg-muted">
                <img
                  src={photo.photoUrl}
                  alt={`${photo.taskName} by ${photo.residentName}`}
                  className="w-full h-full object-cover"
                  data-testid={`img-photo-${index}`}
                />
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium" data-testid={`text-resident-${index}`}>
                    {photo.residentName}
                  </span>
                  <Badge variant="secondary" className="ml-auto" data-testid={`badge-type-${index}`}>
                    {photo.type}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground" data-testid={`text-task-${index}`}>
                  {photo.taskName}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span data-testid={`text-date-${index}`}>
                    {format(photo.completedAt, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
