import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { Plus } from "lucide-react";

export function BoardColumn({ id, title, tasks, onTaskClick }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full w-[280px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1 h-8">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 space-y-2 overflow-y-auto min-h-[150px] pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick && onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-24 rounded border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 bg-gray-50/50">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}
