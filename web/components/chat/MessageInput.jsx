import { useState, useRef } from "react";
import { Paperclip, X, Send, UploadCloud } from "lucide-react";

export default function MessageInput({ onSendMessage, isSending }) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || files.length > 0) {
      onSendMessage(message, files);
      setMessage("");
      setFiles([]);
    }
  };

  return (
    <div 
      className={`p-4 border-t border-gray-200 bg-gray-50 relative transition-all ${isDragging ? "bg-blue-50 ring-2 ring-inset ring-blue-500" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center pointer-events-none rounded-t-xl transition-all border-2 border-dashed border-blue-500 m-1">
          <UploadCloud className="h-10 w-10 text-blue-600 animate-bounce" />
          <p className="text-blue-700 font-bold mt-2">Drop files here to upload</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 relative z-10">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-white border border-gray-200 rounded-md px-2 py-1 text-xs text-gray-700 shadow-sm"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="p-3 text-gray-500 hover:text-blue-600 transition-colors flex-shrink-0 disabled:opacity-50"
            title="Attach a file"
          >
            <Paperclip className="h-6 w-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={(e) => {
              if (isSending) return;
              const items = e.clipboardData.items;
              for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                  const file = items[i].getAsFile();
                  if (file) setFiles(prev => [...prev, file]);
                }
              }
            }}
            placeholder={isSending ? "Uploading files..." : "Type a message or drag files here..."}
            disabled={isSending}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isSending || (!message.trim() && files.length === 0)}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-md active:scale-95 flex items-center justify-center min-w-[50px]"
          >
            {isSending ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-6 w-6" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
