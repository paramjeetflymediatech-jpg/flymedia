const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(express.static("public"));
// Middleware
app.use(
  cors({
    // origin: "*",
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // credentials: false,
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
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tenants", tenantRoutes);

app.get("/", (req, res) => {
  res.send("Flymedia API is running...");
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
