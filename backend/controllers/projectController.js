const Project = require("../models/Project");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== "superadmin") {
      if (req.user.role === "client") {
        query.client = req.user.id;
      } else if (req.user.role == "employee") {
        query.team = req.user.id;
      }
    }
    console.log(query)
    const projects = await Project.find(query)
      .populate("client", "name")
      .populate("tenant", "name");
    res
      .status(200)
      .json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    // if (req.user.role !== "superadmin") {
    //   query.tenant = req.user.tenant;
    // }
    if (req.user.role === "employee") {
      query.team = req.user.id;
    } else if (req.user.role === "client") {
      query.client = req.user.id;
    }

    const project = await Project.findOne(query)
      .populate("client", "name")
      .populate("tenant", "name");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found`,
      });
    }
    console.log(project)

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    if (req.user.role === "client") {
      req.body.client = req.user.id;
      req.body.status = "requested";
      // Ensure tenant is provided so organization can see the request
      if (!req.body.tenant) {
        return res
          .status(400)
          .json({ success: false, message: "Please select an organization" });
      }
    } else {
      req.body.manager = req.user.id;
      req.body.tenant =
        req.user.role === "superadmin"
          ? req.body.tenant || req.user.tenant
          : req.user.tenant;
    }

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      req.body.files = req.files.map((file) => {
        let type = "others";
        if (file.mimetype.startsWith("image/")) {
          type = "images";
        } else if (
          file.mimetype === "application/pdf" ||
          file.mimetype.includes("word") ||
          file.mimetype.includes("document")
        ) {
          type = "documents";
        }

        return {
          name: file.originalname,
          // Construct URL matching the upload middleware logic: role + user._id
          url: `/uploads/${req.user.role}${req.user._id}/${type}/${file.filename}`,
        };
      });
    }

    const project = await Project.create(req.body);

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`,
      });
    }

    // Make sure user owns project or is admin (check tenant too)
    if (req.user.role !== "superadmin" && project.tenant.toString() !== req.user.tenant.toString()) {
      return res
        .status(404)
        .json({ success: false, message: `Project not found` });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: `Project not found with id of ${req.params.id}`,
      });
    }

    if (req.user.role !== "superadmin" && project.tenant.toString() !== req.user.tenant.toString()) {
      return res
        .status(404)
        .json({ success: false, message: `Project not found` });
    }

    await project.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Approve/Accept requested project
// @route   PUT /api/projects/:id/approve
// @access  Private (Admin/Manager)
exports.approveProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: only tenant admin/manager can approve
    if (
      req.user.role !== "superadmin" &&
      project.tenant.toString() !== req.user.tenant.toString()
    ) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    if (project.status !== "requested") {
      return res
        .status(400)
        .json({ success: false, message: "Project is already approved or active" });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: "planned",
        manager: req.user.id, // PM who approved it becomes the manager
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
