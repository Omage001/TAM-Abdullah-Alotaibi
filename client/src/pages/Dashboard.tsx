import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/layout/Sidebar";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { type Task, type InsertTask } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardProps {
  filterType?: "all" | "pending" | "completed" | "high-priority";
}

export default function Dashboard({ filterType = "all" }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Derive API filters based on props and local state
  const apiFilters: any = { search: search || undefined };
  
  if (filterType === "pending") apiFilters.status = "pending";
  if (filterType === "completed") apiFilters.status = "completed";
  if (filterType === "high-priority") apiFilters.priority = "high";
  
  // Apply local priority filter if not overridden by page type
  if (priorityFilter !== "all" && filterType !== "high-priority") {
    apiFilters.priority = priorityFilter;
  }

  const { data: tasksData, isLoading } = useTasks(apiFilters);
  const { mutate: createTask, isPending: isCreatePending } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdatePending } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const tasks = tasksData?.tasks || [];
  const totalTasks = tasksData?.total || 0;

  const handleCreate = (data: InsertTask) => {
    createTask(data, {
      onSuccess: () => setIsDialogOpen(false),
    });
  };

  const handleUpdate = (data: InsertTask) => {
    if (editingTask) {
      updateTask({ id: editingTask.id, ...data }, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const openCreateDialog = () => {
    setEditingTask(undefined);
    setIsDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleStatusChange = (id: number, status: string) => {
    updateTask({ id, status });
  };

  const getPageTitle = () => {
    switch (filterType) {
      case "pending": return "Pending Tasks";
      case "completed": return "Completed Tasks";
      case "high-priority": return "High Priority";
      default: return "All Tasks";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="md:pl-64 min-h-screen flex flex-col transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">{getPageTitle()}</h1>
              <p className="text-muted-foreground mt-1">Manage and track your daily activities</p>
            </div>
            
            <Button 
              onClick={openCreateDialog} 
              size="lg" 
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
            >
              <Plus className="mr-2 h-5 w-5" /> New Task
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="bg-card border rounded-2xl p-4 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-9 bg-background border-border/50 focus:border-primary/50 transition-all rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter by:</span>
              <Select 
                value={priorityFilter} 
                onValueChange={setPriorityFilter}
                disabled={filterType === "high-priority"}
              >
                <SelectTrigger className="w-full md:w-[180px] rounded-xl bg-background border-border/50">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Task Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center flex-1 h-64">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center py-12 px-4 border-2 border-dashed border-border/50 rounded-3xl bg-muted/10">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You don't have any tasks matching your filters. Create a new task to get started!
              </p>
              <Button onClick={openCreateDialog} variant="outline">
                Create your first task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditDialog}
                    onDelete={deleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSubmit={editingTask ? handleUpdate : handleCreate}
        initialData={editingTask}
        isPending={isCreatePending || isUpdatePending}
      />
    </div>
  );
}
