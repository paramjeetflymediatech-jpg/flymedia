const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please add a task title"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  status: {
    type: String,
    enum: ["todo", "in-progress", "review", "done"],
    default: "todo",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dueDate: Date,
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attachments: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      fileType: { type: String }, // renamed from 'type' to avoid conflicts
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  activityLog: [
    {
      action: String, // 'status_change', 'comment', 'upload', 'create'
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      details: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Task", taskSchema);
