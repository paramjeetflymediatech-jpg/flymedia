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
    const role = req.user.role;

    let projectQuery = { tenant: tenantId };
    let taskQuery = { tenant: tenantId };

    if (role === "employee") {
      projectQuery = { tenant: tenantId, team: userId };
      taskQuery = { tenant: tenantId, assignedTo: userId };
    } else if (role === "client") {
      projectQuery = { tenant: tenantId, client: userId };
      // Clients see tasks related to their projects
      const clientProjects = await Project.find({ client: userId }).select("_id");
      const projectIds = clientProjects.map((p) => p._id);
      taskQuery = { tenant: tenantId, project: { $in: projectIds } };
    }

    // 1. Counts
    const totalProjects = await Project.countDocuments(projectQuery);
    const totalEmployees = await User.countDocuments({
      tenant: tenantId,
      role: "employee",
    });

    // Task counts
    const todoTasks = await Task.countDocuments({
      ...taskQuery,
      status: "todo",
    });
    const inProgressTasks = await Task.countDocuments({
      ...taskQuery,
      status: "in-progress",
    });
    const doneTasks = await Task.countDocuments({
      ...taskQuery,
      status: "done",
    });
    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: "done" },
    });

    // 2. Recent Projects (Limit 5)
    const recentProjects = await Project.find(projectQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("client", "name");

    // 3. My Tasks / Recent Tasks (Limit 5)
    const recentTasks = await Task.find({
      ...taskQuery,
      status: { $ne: "done" },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate("project", "name");

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
        recentTasks,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
