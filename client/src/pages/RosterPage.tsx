import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import WeekNavigator from "@/components/WeekNavigator";
import StatsCard from "@/components/StatsCard";
import TaskTable from "@/components/TaskTable";
import BathroomCard from "@/components/BathroomCard";
import AddTaskDialog from "@/components/AddTaskDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const RESIDENTS = ['Perpetua', 'Eman', 'Allegra', 'Atilla', 'Dania', 'Illy'];

export default function RosterPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const { toast } = useToast();

  // Fetch current week roster
  const { data: currentWeek, isLoading: isLoadingCurrent } = useQuery({
    queryKey: ['/api/current-week'],
  });

  // Fetch history
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['/api/history'],
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async ({ name, assignedTo }: { name: string; assignedTo: string }) => {
      const res = await apiRequest('POST', '/api/tasks', { name, assignedTo });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      toast({
        title: "Task added",
        description: "The custom task has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest('DELETE', `/api/tasks/${taskId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest('POST', `/api/tasks/${taskId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      toast({
        title: "Task completed",
        description: "Your task has been marked as complete.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update bathroom mutation
  const updateBathroomMutation = useMutation({
    mutationFn: async ({ 
      bathroomId, 
      assignedTo, 
      cleaningMode 
    }: { 
      bathroomId: string; 
      assignedTo: string; 
      cleaningMode: 'basic' | 'deep' 
    }) => {
      const res = await apiRequest('PUT', `/api/bathrooms/${bathroomId}`, { assignedTo, cleaningMode });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      toast({
        title: "Bathroom updated",
        description: "The bathroom assignment has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update bathroom assignment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const tasks = (currentWeek as any)?.tasks || [];
  const bathrooms = (currentWeek as any)?.bathrooms || [];

  const stats = {
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    pending: tasks.filter((t: any) => t.status === 'pending').length,
    overdue: 0, // We can implement overdue logic based on dates if needed
  };

  const handleCompleteTask = (taskId: string) => {
    completeTaskMutation.mutate(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleAddTask = (taskName: string, assignedTo: string) => {
    addTaskMutation.mutate({ name: taskName, assignedTo });
  };

  const handleUpdateBathroom = (bathroomId: string, assignedTo: string, cleaningMode: 'basic' | 'deep') => {
    updateBathroomMutation.mutate({ bathroomId, assignedTo, cleaningMode });
  };

  if (isLoadingCurrent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Loading roster...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-semibold">7SS Cleaning Roster</h1>
              <p className="text-sm text-muted-foreground">First Floor</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">
                {(currentWeek as any)?.roster?.weekStartDate && (
                  <span>
                    Week {(currentWeek as any).roster.weekNumber}, {(currentWeek as any).roster.year}
                  </span>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard title="Completed" value={stats.completed} icon={CheckCircle2} color="success" />
          <StatsCard title="Pending" value={stats.pending} icon={Clock} color="warning" />
          <StatsCard title="Overdue" value={stats.overdue} icon={AlertCircle} color="default" />
        </div>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current" data-testid="tab-current-week">Current Week</TabsTrigger>
            <TabsTrigger value="bathrooms" data-testid="tab-bathrooms">Bathroom Rotation</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Weekly Tasks</h2>
              <Button onClick={() => setAddTaskOpen(true)} data-testid="button-add-task">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            <TaskTable
              tasks={tasks}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
            />
          </TabsContent>

          <TabsContent value="bathrooms" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Bathroom Rotation</h2>
              <p className="text-sm text-muted-foreground">
                Edit assignments and toggle between basic and deep cleaning modes. Changes automatically apply to the current week.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bathrooms.map((bathroom: any) => (
                <BathroomCard
                  key={bathroom.id}
                  bathroomNumber={bathroom.bathroomNumber}
                  assignedTo={bathroom.assignedTo}
                  cleaningMode={bathroom.cleaningMode}
                  residents={RESIDENTS}
                  onUpdate={(assignedTo, cleaningMode) => 
                    handleUpdateBathroom(bathroom.id, assignedTo, cleaningMode)
                  }
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Task History</h2>
              <p className="text-sm text-muted-foreground">
                View past weeks and completed tasks with proof photos
              </p>
            </div>
            {isLoadingHistory ? (
              <div className="border border-border rounded-md p-12 text-center">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : (history as any) && (history as any).length > 0 ? (
              <div className="space-y-6">
                {(history as any).map((week: any) => (
                  <div key={week.id} className="border border-border rounded-md p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        Week {week.weekNumber}, {week.year}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(week.weekStartDate), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {week.tasks.filter((t: any) => t.status === 'completed').map((task: any) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                          <div>
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-muted-foreground">{task.assignedTo}</p>
                          </div>
                        </div>
                      ))}
                      {week.tasks.filter((t: any) => t.status === 'completed').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tasks completed this week
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-border rounded-md p-12 text-center">
                <p className="text-muted-foreground">No historical data available yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Task history will appear here once you complete tasks
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        residents={RESIDENTS}
        onAdd={handleAddTask}
      />
    </div>
  );
}
