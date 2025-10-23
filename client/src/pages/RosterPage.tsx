import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import WeekNavigator from "@/components/WeekNavigator";
import StatsCard from "@/components/StatsCard";
import TaskTable from "@/components/TaskTable";
import BathroomCard from "@/components/BathroomCard";
import AddTaskDialog from "@/components/AddTaskDialog";
import ThemeToggle from "@/components/ThemeToggle";

//todo: remove mock functionality
const RESIDENTS = ['Perpetua', 'Eman', 'Allegra', 'Atilla', 'Dania', 'Illy'];

export default function RosterPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  
  //todo: remove mock functionality - replace with real data from backend
  const [tasks, setTasks] = useState<Array<{
    id: string;
    name: string;
    assignedTo: string;
    status: 'completed' | 'pending' | 'overdue';
    completedAt?: string;
    proofCount: number;
  }>>([
    {
      id: '1',
      name: 'Take Out Trash & Replace Bag',
      assignedTo: 'Perpetua',
      status: 'completed',
      completedAt: '2024-01-15 14:30',
      proofCount: 2
    },
    {
      id: '2',
      name: 'Sweep/Vacuum & Mop Floors',
      assignedTo: 'Atilla',
      status: 'pending',
      proofCount: 0
    },
    {
      id: '3',
      name: 'Dust & Wipe Surfaces',
      assignedTo: 'Illy',
      status: 'pending',
      proofCount: 0
    },
    {
      id: '4',
      name: 'Cleaning & Trash (Bathroom 1)',
      assignedTo: 'Eman',
      status: 'pending',
      proofCount: 0
    }
  ]);

  //todo: remove mock functionality - replace with real data from backend
  const [bathrooms, setBathrooms] = useState([
    { id: 1, assignedTo: 'Eman', cleaningMode: 'deep' as const },
    { id: 2, assignedTo: 'Perpetua', cleaningMode: 'basic' as const },
    { id: 3, assignedTo: 'Atilla', cleaningMode: 'deep' as const }
  ]);

  const stats = {
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  };

  const handleCompleteTask = (taskId: string, images: File[]) => {
    console.log('Complete task:', taskId, 'with images:', images);
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: 'completed' as 'completed' | 'pending' | 'overdue', completedAt: new Date().toLocaleString(), proofCount: images.length }
        : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    console.log('Delete task:', taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleAddTask = (taskName: string, assignedTo: string) => {
    console.log('Add task:', taskName, 'assigned to:', assignedTo);
    const newTask = {
      id: String(tasks.length + 1),
      name: taskName,
      assignedTo,
      status: 'pending' as 'completed' | 'pending' | 'overdue',
      proofCount: 0
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateBathroom = (bathroomId: number, assignedTo: string, cleaningMode: 'basic' | 'deep') => {
    console.log('Update bathroom:', bathroomId, assignedTo, cleaningMode);
    setBathrooms(bathrooms.map(b => 
      b.id === bathroomId 
        ? { ...b, assignedTo, cleaningMode }
        : b
    ));
  };

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
              <WeekNavigator
                currentDate={currentDate}
                onNavigate={setCurrentDate}
                onToday={() => setCurrentDate(new Date())}
              />
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
                Edit assignments and toggle between basic and deep cleaning modes
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bathrooms.map(bathroom => (
                <BathroomCard
                  key={bathroom.id}
                  bathroomNumber={bathroom.id}
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
                View past weeks and completed tasks
              </p>
            </div>
            <div className="border border-border rounded-md p-12 text-center">
              <p className="text-muted-foreground">No historical data available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Task history will appear here once you complete tasks
              </p>
            </div>
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
