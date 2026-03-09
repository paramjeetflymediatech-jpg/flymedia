"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeen, setLastSeen] = useState({}); // { userId: isoString }
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
        withCredentials: true,
      });

      socketInstance.on("connect", () => {
        socketInstance.emit("join", user._id);
      });

      socketInstance.on("onlineUsers", (userIds) => {
        setOnlineUsers(userIds);
      });

      socketInstance.on("lastSeen", (data) => {
        setLastSeen(data); // { userId: isoString }
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
      setLastSeen({});
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, lastSeen }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
