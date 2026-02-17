const Project = require("../models/Project");

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ tenant: req.user.tenant });
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
    const project = await Project.findOne({
      _id: req.params.id,
      tenant: req.user.tenant,
    });

    if (!project) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Project not found with id of ${req.params.id}`,
        });
    }

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
    // Add user and tenant to req.body
    req.body.manager = req.user.id;
    req.body.tenant = req.user.tenant;

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      req.body.files = req.files.map((file) => ({
        name: file.originalname,
        url: file.location,
      }));
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
      return res
        .status(404)
        .json({
          success: false,
          message: `Project not found with id of ${req.params.id}`,
        });
    }

    // Make sure user owns project or is admin (check tenant too)
    if (project.tenant.toString() !== req.user.tenant.toString()) {
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
      return res
        .status(404)
        .json({
          success: false,
          message: `Project not found with id of ${req.params.id}`,
        });
    }

    if (project.tenant.toString() !== req.user.tenant.toString()) {
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
