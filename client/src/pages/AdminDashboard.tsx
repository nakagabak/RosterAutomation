import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, CheckCircle2, Clock, ArrowLeft, User, LogOut } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

const RESIDENTS = ['Perpetua', 'Eman', 'Allegra', 'Atilla', 'Dania', 'Illy'];

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", assignedTo: "" });
  const [editTask, setEditTask] = useState({ id: "", name: "", assignedTo: "" });

  // Fetch all tasks
  const { data: tasks, isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/tasks'],
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (data: { name: string; assignedTo: string }) => {
      return await apiRequest("POST", "/api/tasks", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      setAddDialogOpen(false);
      setNewTask({ name: "", assignedTo: "" });
      toast({
        title: "Task added",
        description: "The task has been successfully added.",
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

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; assignedTo: string }) => {
      const { id, ...updates } = data;
      return await apiRequest("PUT", `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      setEditDialogOpen(false);
      setEditTask({ id: "", name: "", assignedTo: "" });
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-week'] });
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
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

  const handleAddTask = () => {
    if (!newTask.name || !newTask.assignedTo) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    addTaskMutation.mutate(newTask);
  };

  const handleUpdateTask = () => {
    if (!editTask.name || !editTask.assignedTo) {
      toast({
        title: "Validation error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    updateTaskMutation.mutate(editTask);
  };

  const handleEdit = (task: any) => {
    setEditTask({ id: task.id, name: task.name, assignedTo: task.assignedTo });
    setEditDialogOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  const completedCount = tasks?.filter(t => t.status === 'completed').length || 0;
  const pendingCount = tasks?.filter(t => t.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="button-back-to-roster">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Roster
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage cleaning tasks and assignments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1" data-testid="badge-user">
                    <User className="h-3 w-3" />
                    {user.name}
                  </Badge>
                  <Badge variant="default" data-testid="badge-admin">Admin</Badge>
                </div>
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-task">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new cleaning task and assign it to a resident.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input
                  id="task-name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder="e.g., Clean kitchen counters"
                  data-testid="input-task-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-assigned">Assign To</Label>
                <Select
                  value={newTask.assignedTo}
                  onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                >
                  <SelectTrigger id="task-assigned" data-testid="select-task-assigned">
                    <SelectValue placeholder="Select a resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESIDENTS.map(resident => (
                      <SelectItem key={resident} value={resident}>{resident}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleAddTask} 
                disabled={addTaskMutation.isPending}
                data-testid="button-confirm-add"
              >
                {addTaskMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>View and manage all cleaning tasks across all weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell>
                      <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                        {task.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.completion?.completedAt 
                        ? format(new Date(task.completion.completedAt), 'MMM dd, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(task)}
                          data-testid={`button-edit-${task.id}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                          data-testid={`button-delete-${task.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and reassign if needed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-name">Task Name</Label>
              <Input
                id="edit-task-name"
                value={editTask.name}
                onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
                data-testid="input-edit-task-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-assigned">Assign To</Label>
              <Select
                value={editTask.assignedTo}
                onValueChange={(value) => setEditTask({ ...editTask, assignedTo: value })}
              >
                <SelectTrigger id="edit-task-assigned" data-testid="select-edit-task-assigned">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESIDENTS.map(resident => (
                    <SelectItem key={resident} value={resident}>{resident}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateTask} 
              disabled={updateTaskMutation.isPending}
              data-testid="button-confirm-edit"
            >
              {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}
