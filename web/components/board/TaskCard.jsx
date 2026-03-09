import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, Trash2 } from "lucide-react";

export function TaskCard({ task, onClick, onDelete, canDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // prevent opening task detail modal
    if (confirm(`Delete task "${task.title}"?`)) {
      onDelete(task._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white group relative p-3 rounded-md border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer select-none"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
          {task.project?.name || "Task"}
        </span>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded hover:bg-red-50"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <h4 className="font-medium text-sm text-gray-900 mb-3 leading-snug">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-2">
        {/* Priority Badge - Minimal Dot */}
        <div
          className="flex items-center gap-1.5"
          title={`Priority: ${task.priority}`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              task.priority === "high"
                ? "bg-orange-500"
                : task.priority === "medium"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
            }`}
          />
          <span className="text-[10px] font-medium text-gray-500 capitalize">
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </div>
          )}

          {task.assignedTo && (
            <div
              className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-medium text-gray-600 border border-gray-200"
              title={task.assignedTo.name}
            >
              {task.assignedTo.name?.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
