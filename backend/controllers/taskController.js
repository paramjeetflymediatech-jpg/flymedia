const Task = require("../models/Task");

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = { tenant: req.user.tenant };

    // If employee, only show assigned tasks
    if (req.user.role === "employee") {
      query.assignedTo = req.user.id;
    }

    if (req.query.project) {
      query.project = req.query.project;
    }

    const tasks = await Task.find(query).populate("project", "name");
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
    req.body.tenant = req.user.tenant;

    const task = await Task.create(req.body);
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

    if (task.tenant.toString() !== req.user.tenant.toString()) {
      return res
        .status(404)
        .json({ success: false, message: `Task not found` });
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

    // Re-fetch to populate if needed, or just return task
    // task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // since we saved using task.save(), we can just return task.
    // Mongoose save() validates by default.

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: `Task not found` });
    }

    if (task.tenant.toString() !== req.user.tenant.toString()) {
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

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const attachments = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${req.user.role}/${
        file.mimetype.startsWith("image/") ? "images" : "documents"
      }/${file.filename}`,
      type: file.mimetype.startsWith("image/") ? "image" : "document",
      uploadedBy: req.user.id,
    }));

    task.attachments.push(...attachments);

    // Add to activity log
    task.activityLog.push({
      action: "upload",
      user: req.user.id,
      details: `Uploaded ${req.files.length} file(s)`,
    });

    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
