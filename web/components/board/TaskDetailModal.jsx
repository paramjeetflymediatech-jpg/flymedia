import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Separator } from "@/components/ui/Separator";
import {
  Paperclip,
  Clock,
  MessageSquare,
  FileIcon,
  X,
  UploadCloud,
  User as UserIcon,
} from "lucide-react";
import api from "@/lib/api";
import { BASE_URL } from "@/components/constant";

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("details");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!task) return null;

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await api.post(`/tasks/${task._id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        onUpdate(res.data.data); // Update task in parent
      }
    } catch (error) {
      console.error("Failed to upload files", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      if (res.data.success) {
        onUpdate(res.data.data);
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 leading-tight">
                {task.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge
                  variant={
                    task.priority === "high"
                      ? "destructive"
                      : task.priority === "medium"
                        ? "default"
                        : "secondary"
                  }
                >
                  {task.priority}
                </Badge>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Main Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({task.attachments?.length || 0})
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <UploadCloud className="h-3 w-3" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.attachments?.map((file, idx) => (
                    <a
                      key={idx}
                      href={`${BASE_URL}${file.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="h-8 w-8 rounded bg-white border border-gray-100 flex items-center justify-center text-gray-500">
                        <FileIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                          {file.uploadedBy?.name && ` • by ${file.uploadedBy.name}`}
                        </p>
                      </div>
                    </a>
                  ))}
                  {!task.attachments?.length && (
                    <div className="col-span-full py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No attachments yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Sidebar / History */}
          <div className="w-full md:w-[280px] bg-gray-50 border-l border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Activity
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {task.activityLog
                  ?.slice()
                  .reverse()
                  .map((log, i) => (
                    <div
                      key={i}
                      className="relative pl-4 border-l-2 border-gray-200 last:border-0 pb-1"
                    >
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-gray-300 ring-4 ring-gray-50" />
                      <div className="text-xs text-gray-500 mb-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-900 font-medium">
                        {log.user?.name || "System"}
                      </p>
                      <p className="text-xs text-gray-600">{log.details}</p>
                    </div>
                  ))}
                {!task.activityLog?.length && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No activity yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
