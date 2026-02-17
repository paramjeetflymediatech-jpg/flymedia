const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a project name"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  status: {
    type: String,
    enum: ["planned", "in-progress", "completed", "on-hold"],
    default: "planned",
  },
  client: {
    type: String,
    required: [true, "Please add a client name"],
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: true,
  },
  files: [
    {
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Project", projectSchema);
