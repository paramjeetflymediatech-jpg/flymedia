import { useState } from "react";
import { Search } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

export default function ChatSidebar({ users, selectedUser, onSelectUser, conversations, activeProjectId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { onlineUsers } = useSocket();

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort: online users first
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aOnline = onlineUsers.includes(a._id);
    const bOnline = onlineUsers.includes(b._id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return 0;
  });

  return (
    <div className="w-full border-r border-gray-200 h-full overflow-y-auto bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Contacts ({onlineUsers.length} online)
        </p>
        <div className="space-y-1 px-2">
          {sortedUsers.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            const isSelected = selectedUser?._id === u._id;
            return (
              <button
                key={u._id}
                onClick={() => onSelectUser(u)}
                className={`w-full flex items-center p-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                }`}
              >
                {/* Avatar with online dot */}
                <div className="relative mr-3 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Online indicator dot */}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                      isSelected ? "border-blue-600" : "border-gray-50"
                    } ${isOnline ? "bg-green-400" : "bg-gray-300"}`}
                  />
                </div>

                <div className="text-left overflow-hidden min-w-0">
                  <p className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                    {u.name}
                  </p>
                  <p className={`text-xs capitalize ${isSelected ? "text-blue-100" : isOnline ? "text-green-500" : "text-gray-400"}`}>
                    {isOnline ? "Online" : u.role}
                  </p>
                </div>
              </button>
            );
          })}
          {sortedUsers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
