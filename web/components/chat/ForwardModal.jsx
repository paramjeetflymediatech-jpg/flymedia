"use client";

import { useState } from "react";
import { X, Search, Forward, User as UserIcon } from "lucide-react";

export default function ForwardModal({ isOpen, onClose, users, onForward, messageContent, excludeUserId }) {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredUsers = users.filter(u => 
    (u._id !== excludeUserId) && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Forward className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Forward Message</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 max-h-[100px] overflow-hidden relative group">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Message Preview</p>
            <p className="text-sm text-gray-600 italic line-clamp-2">
              {messageContent?.message || "Forwarded media"}
            </p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Recipients</p>
            {filteredUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => {
                  onForward(u._id);
                  onClose();
                }}
                className="w-full flex items-center p-3 rounded-xl hover:bg-blue-50 group transition-all border border-transparent hover:border-blue-100 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold mr-3 flex-shrink-0 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-blue-700">{u.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Forward className="h-4 w-4 text-blue-500" />
                </div>
              </button>
            ))}
            {filteredUsers.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-400 text-sm">No contacts found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
