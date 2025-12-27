import { type Task, type InsertTask } from "@shared/schema";
import { format } from "date-fns";
import { 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle,
  AlertCircle
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRef, useEffect } from "react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

const priorityColors = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const statusColors = {
  pending: "text-gray-400 hover:text-primary",
  "in-progress": "text-blue-500",
  completed: "text-green-500",
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      const rotateX = (y - height / 2) / 40;
      const rotateY = -(x - width / 2) / 40;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? "pending" : "completed";
    onStatusChange(task.id, newStatus);
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ transition: 'transform 0.1s ease-out' }}
      className={`
        group relative bg-card border rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300
        ${isCompleted ? "opacity-60 bg-muted/30" : "bg-white"}
      `}
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={handleStatusToggle}
          className={`mt-1 transition-colors duration-200 ${statusColors[task.status as keyof typeof statusColors]}`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold text-lg leading-tight truncate pr-4 ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.title}
            </h3>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(task)} className="gap-2 cursor-pointer">
                  <Edit2 className="w-4 h-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className={`text-sm text-muted-foreground line-clamp-2 ${isCompleted && "line-through"}`}>
            {task.description || "No description provided"}
          </p>

          <div className="flex items-center gap-3 pt-3 mt-1">
            <Badge variant="outline" className={`capitalize font-medium border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
              {task.priority}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Calendar className="w-3.5 h-3.5" />
              <span>{task.createdAt ? format(new Date(task.createdAt), 'MMM d') : 'No date'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
