import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Trash2, Search, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: number;
  username: string;
  role: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  userId: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [searchUsers, setSearchUsers] = useState("");
  const [searchTasks, setSearchTasks] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Fetch all tasks
  const { data: allTasksData, isLoading: tasksLoading } = useQuery<{ tasks: Task[], total: number }>({
    queryKey: ["/api/admin/tasks"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tasks?limit=100", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update role");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user) =>
    user.username.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredTasks = allTasksData?.tasks.filter((task) =>
    task.title.toLowerCase().includes(searchTasks.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTasks.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-purple-500 hover:bg-purple-600">
        <Crown className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">User</Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-500 hover:bg-red-600",
      medium: "bg-yellow-500 hover:bg-yellow-600",
      low: "bg-green-500 hover:bg-green-600",
    };
    return (
      <Badge className={colors[priority as keyof typeof colors] || "bg-gray-500"}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-blue-500 hover:bg-blue-600",
      "in-progress": "bg-orange-500 hover:bg-orange-600",
      completed: "bg-green-500 hover:bg-green-600",
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-500"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      
      <main className="md:pl-64 min-h-screen flex flex-col transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-purple-500" />
                <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">Manage users and view all system tasks</p>
            </div>
          </div>

          <Alert className="mb-6 bg-purple-500/10 border-purple-500/50">
            <Shield className="h-4 w-4 text-purple-500" />
            <AlertDescription className="text-purple-700 dark:text-purple-300">
              You have administrator privileges. You can view all users, manage roles, and delete any task.
            </AlertDescription>
          </Alert>

          {/* Users Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">Users Management</h2>
              </div>
              <Badge variant="outline">{users?.length || 0} users</Badge>
            </div>

            <div className="bg-card border rounded-2xl p-4 mb-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9 bg-background"
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredUsers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) =>
                              updateRoleMutation.mutate({ userId: user.id, role: value })
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* All Tasks Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">All Tasks</h2>
              <Badge variant="outline">{allTasksData?.total || 0} tasks</Badge>
            </div>

            <div className="bg-card border rounded-2xl p-4 mb-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-9 bg-background"
                  value={searchTasks}
                  onChange={(e) => setSearchTasks(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasksLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                    </TableRow>
                  ) : filteredTasks?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No tasks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.id}</TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {task.title}
                        </TableCell>
                        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{task.userId}</TableCell>
                        <TableCell>
                          {task.deadline 
                            ? new Date(task.deadline).toLocaleDateString()
                            : "No deadline"
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
