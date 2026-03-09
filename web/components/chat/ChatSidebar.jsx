import { useState } from "react";
import { Search } from "lucide-react";

export default function ChatSidebar({ users, selectedUser, onSelectUser, conversations, activeProjectId }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full   border-r border-gray-200 h-full overflow-y-auto bg-gray-50 flex flex-col">
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
          Contacts
        </p>
        <div className="space-y-1 px-2">
          {filteredUsers.map((u) => (
            <button
              key={u._id}
              onClick={() => onSelectUser(u)}
              className={`w-full flex items-center p-3 rounded-xl transition-all ${selectedUser?._id === u._id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "hover:bg-gray-200 text-gray-700 hover:text-gray-900"
                }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 flex-shrink-0 ${selectedUser?._id === u._id ? "bg-white/20" : "bg-blue-100 text-blue-600"
                }`}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left overflow-hidden min-w-0">
                <p className={`font-semibold text-sm truncate ${selectedUser?._id === u._id ? "text-white" : "text-gray-900"}`}>
                  {u.name}
                </p>
                <p className={`text-xs capitalize ${selectedUser?._id === u._id ? "text-blue-100" : "text-gray-500"}`}>
                  {u.role}
                </p>
              </div>
            </button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">No contacts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
