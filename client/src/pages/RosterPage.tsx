import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, User, Settings } from "lucide-react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import WeekNavigator from "@/components/WeekNavigator";
import StatsCard from "@/components/StatsCard";
import TaskTable from "@/components/TaskTable";
import BathroomCard from "@/components/BathroomCard";
import AddTaskDialog from "@/components/AddTaskDialog";
import ThemeToggle from "@/components/ThemeToggle";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const RESIDENTS = ['Perpetua', 'Eman', 'Allegra', 'Atilla', 'Dania', 'Illy'];

export default function RosterPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();

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
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete task. Please try again.",
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

  const completeBathroomMutation = useMutation({
    mutationFn: async (bathroomId: string) => {
      const res = await apiRequest('POST', `/api/bathrooms/${bathroomId}/complete`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      toast({
        title: "Success",
        description: "Bathroom marked as complete!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete bathroom. Please try again.",
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

  const handleCompleteBathroom = (bathroomId: string) => {
    completeBathroomMutation.mutate(bathroomId);
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
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">
                {(currentWeek as any)?.roster?.weekStartDate && (
                  <span>
                    {format(new Date((currentWeek as any).roster.weekStartDate), 'MMM d')} - {format(addDays(new Date((currentWeek as any).roster.weekStartDate), 6), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
              {user && (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1" data-testid="badge-user">
                      <User className="h-3 w-3" />
                      {user.name}
                    </Badge>
                    {user.role === 'admin' && (
                      <Badge variant="default" data-testid="badge-admin">Admin</Badge>
                    )}
                  </div>
                  {user.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" data-testid="button-admin-dashboard">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </>
              )}
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
              {user?.role === 'admin' && (
                <Button onClick={() => setAddTaskOpen(true)} data-testid="button-add-task">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
            <TaskTable
              tasks={tasks}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
              isAdmin={user?.role === 'admin'}
              currentUserName={user?.name}
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
                  bathroomId={bathroom.id}
                  bathroomNumber={bathroom.bathroomNumber}
                  assignedTo={bathroom.assignedTo}
                  cleaningMode={bathroom.cleaningMode}
                  residents={RESIDENTS}
                  onUpdate={(assignedTo, cleaningMode) => 
                    handleUpdateBathroom(bathroom.id, assignedTo, cleaningMode)
                  }
                  onComplete={handleCompleteBathroom}
                  completedAt={bathroom.completedAt}
                  currentUserName={user?.name}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Task History</h2>
              <p className="text-sm text-muted-foreground">
                View resident performance across past weeks
              </p>
            </div>
            {isLoadingHistory ? (
              <div className="border border-border rounded-md p-12 text-center">
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : (history as any) && (history as any).length > 0 ? (
              <div className="space-y-6">
                {(history as any).map((week: any) => {
                  // Calculate per-user stats
                  const userStats = RESIDENTS.map(resident => {
                    const userTasks = week.tasks.filter((t: any) => t.assignedTo === resident);
                    const completed = userTasks.filter((t: any) => t.status === 'completed').length;
                    const missed = userTasks.filter((t: any) => t.status !== 'completed').length;
                    return { name: resident, completed, missed, total: userTasks.length };
                  }).filter(stat => stat.total > 0); // Only show users who had tasks

                  return (
                    <div key={week.id} className="border border-border rounded-md p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          {format(new Date(week.weekStartDate), 'MMM d')} - {format(addDays(new Date(week.weekStartDate), 6), 'MMM d, yyyy')}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {userStats.map((stat) => (
                          <div key={stat.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{stat.name}</p>
                                <p className="text-xs text-muted-foreground">{stat.total} tasks assigned</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                  ✓ {stat.completed} completed
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                  ✗ {stat.missed} missed
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {userStats.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No tasks assigned this week
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-border rounded-md p-12 text-center">
                <p className="text-muted-foreground">No historical data available yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Task history will appear here once weeks complete
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
