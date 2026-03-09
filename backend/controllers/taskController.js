const path = require("path");
const Task = require("../models/Task");
const Project = require("../models/Project")
const ObjectId = require("mongoose").Types.ObjectId;

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "superadmin") {
      query.tenant = req.user.tenant;
      // If employee, only show assigned tasks
      if (req.user.role === "employee") {
        query.assignedTo = req.user.id;
      }
    }

    if (req.query.project) {
      query.project = req.query.project;
    }
    if (req.query.tenantId) {
      query.tenant = req.query.tenantId;
    }

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("attachments.uploadedBy", "name")
      .populate("activityLog.user", "name")
      .populate("assignedTo", "name");
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    if (req.user.role === "client") {
      return res.status(403).json({
        success: false,
        message: "Clients are not authorized to create tasks",
      });
    }

    req.body.tenant = req.user.role === "superadmin" ? (req.body.tenant || req.user.tenant) : req.user.tenant;
    const task = await Task.create(req.body);
    console.log(task, '-------------')
    const updateProject = await Project.updateOne({ _id: task.project }, {
      $set: {
        team: task.assignedTo
      }
    })
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update task (status etc)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: `Task not found` });
    }

    // Authorization check
    if (req.user.role === "client") {
      const project = await Project.findById(task.project);
      if (!project || project.client.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: "Not authorized to update this task" });
      }

      // Clients can ONLY update status
      const { status } = req.body;
      req.body = { status };
    } else if (task.tenant.toString() !== req.user.tenant.toString()) {
      return res.status(404).json({ success: false, message: `Task not found` });
    }

    // Track changes for activity log
    if (req.body.status && req.body.status !== task.status) {
      task.activityLog.push({
        action: "status_change",
        user: req.user.id,
        details: `Changed status from ${task.status} to ${req.body.status}`,
      });
    }

    if (req.body.priority && req.body.priority !== task.priority) {
      task.activityLog.push({
        action: "priority_change",
        user: req.user.id,
        details: `Changed priority from ${task.priority} to ${req.body.priority}`,
      });
    }

    // Merge updates
    Object.assign(task, req.body);

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("attachments.uploadedBy", "name")
      .populate("activityLog.user", "name")
      .populate("assignedTo", "name");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (superadmin, manager only)
exports.deleteTask = async (req, res) => {
  try {
    // Only superadmin and manager can delete tasks
    if (!["superadmin", "manager", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete tasks",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: `Task not found` });
    }

    if (req.user.role !== "superadmin" && task.tenant.toString() !== req.user.tenant.toString()) {
      return res
        .status(404)
        .json({ success: false, message: `Task not found` });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// @desc    Upload attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.uploadAttachment = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (req.user.role !== "superadmin" && task.tenant.toString() !== req.user.tenant.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }
    const publicDir = path.join(__dirname, "..", "public");

    const attachments = req.files.map((file) => {
      // Derive URL from the actual folder multer saved the file to
      const relativeFolder = path.relative(publicDir, file.destination).replace(/\\/g, "/");
      return {
        name: file.originalname,
        url: `/${relativeFolder}/${file.filename}`,
        fileType: file.mimetype,
        uploadedBy: req.user.id,
      };
    });
    task.attachments.push(...attachments);

    // Add to activity log
    task.activityLog.push({
      action: "upload",
      user: req.user.id,
      details: `Uploaded ${req.files.length} file(s)`,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("attachments.uploadedBy", "name")
      .populate("activityLog.user", "name")
      .populate("assignedTo", "name");

    res.status(200).json({ success: true, data: populatedTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Search tasks by title, description, status or priority
// @route   GET /api/tasks/search?q=keyword
// @access  Private
exports.searchTasks = async (req, res) => {
  try {
    const keyword = req.query.q ? req.query.q.trim() : "";
    if (!keyword) {
      return res.status(400).json({ success: false, message: "Search query (q) is required" });
    }

    let query = {};
    if (req.user.role !== "superadmin") {
      query.tenant = req.user.tenant;
      if (req.user.role === "employee") {
        query.assignedTo = req.user.id;
      }
    }
    if (req.query.project) {
      query.project = req.query.project;
    }

    const regex = new RegExp(keyword, "i");
    query.$or = [
      { title: regex },
      { description: regex },
      { status: regex },
      { priority: regex },
    ];

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate("assignedTo", "name")
      .limit(20);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
