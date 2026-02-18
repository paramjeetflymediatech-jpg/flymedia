const User = require("../models/User");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  const filter = {};
  if (req.user.role === "admin") {
    filter.role = "employee";
  } else {
    filter.role = "employee";
    filter.tenant = req.user.tenant;
  }
  try {
    const employees = await User.find(filter);
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
      return res.status(404).json({
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
      return res.status(403).json({
        success: false,
        message: "Not authorized to create employees",
      });
    }

    const {
      name,
      email,
      password,
      designation,
      department,
      phone,
      joiningDate,
    } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      tenant: req.user.tenant,
      role: "employee",
      designation,
      department,
      phone,
      joiningDate,
    });

    res.status(201).json({ success: true, data: user });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res) => {
  try {
    // Ensure only admin/manager can update
    if (req.user.role === "employee") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update employees",
      });
    }

    let user = await User.findOne({
      _id: req.params.id,
      tenant: req.user.tenant,
      role: "employee",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`,
      });
    }

    const { name, email, designation, department, phone, joiningDate } =
      req.body;

    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        designation,
        department,
        phone,
        joiningDate,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
