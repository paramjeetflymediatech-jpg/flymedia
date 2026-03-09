"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useSocket } from "../../../context/SocketContext";
import api from "../../../lib/api";
import { clsx } from "clsx";
import ChatSidebar from "../../../components/chat/ChatSidebar";
import ChatWindow from "../../../components/chat/ChatWindow";
import MessageInput from "../../../components/chat/MessageInput";
import ForwardModal from "../../../components/chat/ForwardModal";

function MessagesContent() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const userId = searchParams.get("userId");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  
  const [isSending, setIsSending] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/messages/users");
      if (res.data.success) {
        setUsers(res.data.data);
        if (userId) {
          const u = res.data.data.find((u) => u._id === userId);
          if (u) setSelectedUser(u);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchMessages = useCallback(async (receiverId, pId) => {
    try {
      const url = pId 
        ? `/messages/${receiverId}?projectId=${pId}` 
        : `/messages/${receiverId}`;
      const res = await api.get(url);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/messages/conversations");
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchConversations();
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id, projectId);
    }
  }, [selectedUser, projectId, fetchMessages]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        if (
          selectedUser &&
          (newMessage.senderId === selectedUser._id ||
            newMessage.receiverId === selectedUser._id) &&
          (newMessage.projectId === (projectId || null))
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
        fetchConversations();
      };

      socket.on("newMessage", handleNewMessage);
      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [socket, selectedUser, projectId]);

  const handleSendMessage = async (text, files = []) => {
    if (!selectedUser) return;
    
    setIsSending(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      if (text) formData.append("message", text);
      if (projectId) formData.append("projectId", projectId);
      files.forEach((file) => formData.append("files", file));

      const res = await api.post(`/messages/send/${selectedUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        fetchConversations();
      }
    } catch (err) {
      console.error("Error sending message:", err);
      const errMsg = err.response?.data?.message || "Failed to send message. Please try again.";
      setUploadError(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleForwardMessage = async (receiverId) => {
    if (!messageToForward) return;
    try {
      const payload = {
        message: messageToForward.message || "",
        attachments: messageToForward.attachments || [],
        projectId: projectId || null,
      };

      const res = await api.post(`/messages/send/${receiverId}`, payload);
      if (res.data.success) {
        fetchConversations();
        const recipientUser = users.find(u => u._id === receiverId);
        if (recipientUser) setSelectedUser(recipientUser);
      }
    } catch (err) {
      console.error("Error forwarding message:", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-100px)] bg-white md:rounded-xl md:shadow-lg overflow-hidden md:border border-gray-200 md:m-4 relative">
      {/* Error Alert Overlay */}
      {uploadError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top duration-300">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="ml-2 hover:text-red-900 font-bold">&times;</button>
          </div>
        </div>
      )}

      <div className={clsx(
        "flex-1 flex",
        selectedUser ? "hidden md:flex" : "flex"
      )}>
        <ChatSidebar
          users={users}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          conversations={conversations}
          activeProjectId={projectId}
        />
      </div>
      
      <div className={clsx(
        "flex-1 flex flex-col min-w-0",
        selectedUser ? "flex" : "hidden md:flex"
      )}>
        <ChatWindow
          messages={messages}
          currentUser={user}
          selectedUser={selectedUser}
          onBack={() => setSelectedUser(null)}
          onForward={(msg) => {
            setMessageToForward(msg);
            setForwardModalOpen(true);
          }}
          projectId={projectId}
          conversations={conversations}
        />
        {selectedUser && (
          <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
        )}
      </div>

      <ForwardModal
        isOpen={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        users={users}
        messageContent={messageToForward}
        onForward={handleForwardMessage}
        excludeUserId={selectedUser?._id}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
