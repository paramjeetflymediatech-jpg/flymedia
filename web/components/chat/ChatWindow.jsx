"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, PanelRight, ChevronLeft, X, Forward, Headphones, Video } from "lucide-react";
import { BASE_URL } from "../constant";

export default function ChatWindow({ messages, currentUser, selectedUser, projectId, conversations, onBack, onForward }) {
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Select a user to start chatting</p>
      </div>
    );
  }

  // Find project name from conversations if not passed directly or as context
  const conversationWithProject = conversations.find(c => c.projectId?._id === projectId || (c.projectId && !projectId));
  const projectName = conversationWithProject?.projectId?.name;

  // Extract all attachments from messages
  const allAttachments = messages.reduce((acc, msg) => {
    if (msg.attachments && msg.attachments.length > 0) {
      return [...acc, ...msg.attachments];
    }
    return acc;
  }, []);

  return (
    <div className="flex-1 flex bg-white overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center min-w-0">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 mr-1 text-gray-500 hover:text-gray-900 md:hidden flex-shrink-0"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 flex-shrink-0">
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-gray-900 truncate">{selectedUser.name}</h3>
              <p className="text-xs text-gray-500 capitalize">{selectedUser.role}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {projectId && (
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  Project Context
                </span>
                {projectName && (
                  <p className="text-xs font-medium text-gray-700 mt-1 truncate max-w-[150px]">{projectName}</p>
                )}
              </div>
            )}
            <button
              onClick={() => setShowMediaGallery(!showMediaGallery)}
              className={`p-2 rounded-md transition-colors ${showMediaGallery ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
              title="Shared Media"
            >
              <PanelRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser._id;
            return (
              <div
                key={msg._id || index}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.message && <p className="text-sm mb-2">{msg.message}</p>}
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="space-y-2 mb-1">
                      {msg.attachments.map((file, idx) => (
                        <div key={idx} className="overflow-hidden rounded-lg">
                          {file.fileType.startsWith("image/") ? (
                          <div className="max-w-sm">
                            <img
                              src={`${BASE_URL}${file.url}`}
                              alt={file.name}
                              className="w-full max-h-[300px] object-cover rounded-lg cursor-pointer hover:opacity-90 transition-all border border-gray-200"
                              onClick={() => window.open(`${BASE_URL}${file.url}`, "_blank")}
                            />
                          </div>
                        ) : file.fileType.startsWith("video/") ? (
                          <div className="max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-black/5">
                            <video 
                              src={`${BASE_URL}${file.url}`} 
                              controls 
                              className="w-full max-h-[300px]"
                            />
                          </div>
                        ) : file.fileType.startsWith("audio/") ? (
                          <div className="min-w-[200px] sm:min-w-[300px] p-2 rounded-lg border border-gray-200 bg-white/10">
                            <audio 
                              src={`${BASE_URL}${file.url}`} 
                              controls 
                              className="w-full h-8"
                            />
                            <p className="text-[10px] mt-1 truncate px-1 opacity-70">{file.name}</p>
                          </div>
                        ) : (
                            <a
                              href={`${BASE_URL}${file.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex items-center gap-2 p-2 rounded-md border ${
                                isMe 
                                  ? "bg-blue-700 border-blue-500 text-white" 
                                  : "bg-white border-gray-200 text-gray-700"
                              } hover:opacity-90 transition-opacity whitespace-nowrap overflow-hidden`}
                            >
                              <FileText className="h-4 w-4 flex-shrink-0" />
                              <span className="text-xs truncate">{file.name}</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p
                      className={`text-[10px] ${
                        isMe ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <button 
                      onClick={() => onForward(msg)}
                      className={`p-1 rounded-full transition-colors ${
                        isMe ? "hover:bg-blue-500 text-blue-100" : "hover:bg-gray-200 text-gray-400"
                      }`}
                      title="Forward message"
                    >
                      <Forward className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showMediaGallery && (
        <div className="fixed inset-y-0 right-0 z-50 w-full md:relative md:w-64 border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-200 shadow-2xl md:shadow-none">
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <ImageIcon className="h-4 w-4 mr-2 text-blue-600" />
              Shared Media
            </h4>
            <button 
              onClick={() => setShowMediaGallery(false)}
              className="p-1 text-gray-400 hover:text-gray-900 md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {allAttachments.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-10">No media shared yet</p>
            ) : (
              <div className="space-y-6">
                {/* Photos */}
                {allAttachments.some(a => a.fileType.startsWith("image/")) && (
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Photos</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {allAttachments.filter(a => a.fileType.startsWith("image/")).map((file, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-square rounded-md overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(`${BASE_URL}${file.url}`, "_blank")}
                        >
                          <img src={`${BASE_URL}${file.url}`} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {allAttachments.some(a => a.fileType.startsWith("video/")) && (
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Videos</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {allAttachments.filter(a => a.fileType.startsWith("video/")).map((file, idx) => (
                        <div 
                          key={idx} 
                          className="aspect-video relative rounded-md overflow-hidden bg-black flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(`${BASE_URL}${file.url}`, "_blank")}
                        >
                          <Video className="h-6 w-6 text-white/50 absolute z-10" />
                          <video src={`${BASE_URL}${file.url}`} className="w-full h-full object-cover opacity-60" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio */}
                {allAttachments.some(a => a.fileType.startsWith("audio/")) && (
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Audio</h5>
                    <div className="space-y-2">
                      {allAttachments.filter(a => a.fileType.startsWith("audio/")).map((file, idx) => (
                        <a
                          key={idx}
                          href={`${BASE_URL}${file.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-50 transition-colors"
                        >
                          <Headphones className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Other Files */}
                {allAttachments.some(a => !a.fileType.startsWith("image/") && !a.fileType.startsWith("video/") && !a.fileType.startsWith("audio/")) && (
                  <div>
                    <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Files</h5>
                    <div className="space-y-2">
                      {allAttachments.filter(a => !a.fileType.startsWith("image/") && !a.fileType.startsWith("video/") && !a.fileType.startsWith("audio/")).map((file, idx) => (
                        <a
                          key={idx}
                          href={`${BASE_URL}${file.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center p-2 rounded-md bg-white border border-gray-200 hover:bg-blue-50 transition-colors"
                        >
                          <FileText className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
