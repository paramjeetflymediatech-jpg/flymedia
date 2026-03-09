const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL, 
      process.env.BASE_URL,
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

app.use(express.static("public"));
// Middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.BASE_URL],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Database Connection
connectDB();

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const tenantRoutes = require("./routes/tenantRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Flymedia API is running...");
});

// Track online users: userId -> socketId
const onlineUsers = new Map();
// Track last seen: userId -> ISO timestamp
const lastSeenMap = new Map();

// Helper to broadcast current state to all clients
const broadcastPresence = () => {
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  io.emit("lastSeen", Object.fromEntries(lastSeenMap));
};

// Socket logic
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    broadcastPresence();
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      lastSeenMap.set(socket.userId, new Date().toISOString());
      broadcastPresence();
    }
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
