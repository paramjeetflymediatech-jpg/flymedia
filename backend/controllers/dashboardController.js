const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenant;
    const userId = req.user.id;

    // 1. Counts
    const totalProjects = await Project.countDocuments({ tenant: tenantId });
    const totalEmployees = await User.countDocuments({
      tenant: tenantId,
      role: "employee",
    });

    // Task counts
    const todoTasks = await Task.countDocuments({
      tenant: tenantId,
      status: "todo",
    });
    const inProgressTasks = await Task.countDocuments({
      tenant: tenantId,
      status: "in-progress",
    });
    const doneTasks = await Task.countDocuments({
      tenant: tenantId,
      status: "done",
    });
    const overdueTasks = await Task.countDocuments({
      tenant: tenantId,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    });

    // 2. Recent Projects (Limit 5)
    const recentProjects = await Project.find({ tenant: tenantId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name");

    // 3. My Tasks (Limit 5)
    // If user is admin/manager, maybe show all recent tasks?
    // For now, let's show tasks assigned to the user OR created by user if not assigned
    const myTasks = await Task.find({
      tenant: tenantId,
      assignedTo: userId,
      status: { $ne: "done" },
    })
      .sort({ dueDate: 1 }) // Show soonest due first
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalProjects,
          totalEmployees,
          tasks: {
            todo: todoTasks,
            inProgress: inProgressTasks,
            done: doneTasks,
            overdue: overdueTasks,
            total: todoTasks + inProgressTasks + doneTasks,
          },
        },
        recentProjects,
        myTasks,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
