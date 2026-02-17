const User = require("../models/User");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      tenant: req.user.tenant,
      role: "employee",
    });
    res
      .status(200)
      .json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({
      _id: req.params.id,
      tenant: req.user.tenant,
      role: "employee",
    });

    if (!employee) {
      return res
        .status(404)
        .json({
          success: false,
          message: `Employee not found with id of ${req.params.id}`,
        });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create new employee (Admin/Manager only)
// @route   POST /api/employees
// @access  Private/Admin
exports.createEmployee = async (req, res) => {
  try {
    // Ensure only admin/manager can create
    if (req.user.role === "employee") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to create employees",
        });
    }

    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      tenant: req.user.tenant,
      role: "employee",
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
