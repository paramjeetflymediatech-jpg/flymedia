"use client";

import { useState } from "react";
import {
    ArrowUpDown,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    Trash2
} from "lucide-react";

export function TaskListView({ tasks, onTaskClick, onDeleteTask, userRole }) {
    const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

    const sortedTasks = [...tasks].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Priority sorting logic
        if (sortConfig.key === "priority") {
            const priorityMap = { high: 3, medium: 2, low: 1 };
            aVal = priorityMap[a.priority];
            bVal = priorityMap[b.priority];
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const statusIcons = {
        todo: <Circle className="h-4 w-4 text-gray-400" />,
        "in-progress": <Clock className="h-4 w-4 text-blue-500" />,
        review: <AlertCircle className="h-4 w-4 text-yellow-500" />,
        done: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    };

    const priorityColors = {
        high: "bg-red-50 text-red-700 border-red-200",
        medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
        low: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort("title")}>
                                <div className="flex items-center gap-2">
                                    Task Title <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort("status")}>
                                <div className="flex items-center gap-2">
                                    Status <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort("priority")}>
                                <div className="flex items-center gap-2">
                                    Priority <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort("dueDate")}>
                                <div className="flex items-center gap-2">
                                    Due Date <ArrowUpDown className="h-3 w-3" />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedTasks.map((task) => (
                            <tr
                                key={task._id}
                                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => onTaskClick(task)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {statusIcons[task.status]}
                                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {task.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="capitalize text-sm text-gray-600">{task.status.replace("-", " ")}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {["superadmin", "manager", "admin"].includes(userRole) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Delete task "${task.title}"?`)) {
                                                    onDeleteTask(task._id);
                                                }
                                            }}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded hover:bg-red-50"
                                            title="Delete task"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {sortedTasks.length === 0 && (
                <div className="py-20 text-center text-gray-500 bg-gray-50/50">
                    No tasks found in this project.
                </div>
            )}
        </div>
    );
}
