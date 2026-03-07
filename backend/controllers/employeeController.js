const User = require("../models/User");

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  const filter = {role: { $ne: "superadmin" }};
  if (req.user.role !== "superadmin") {
    filter.tenant = req.user.tenant;
    // filter.role = { $eq: "employee" }
  }
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const startIndex = (page - 1) * limit;

  try {
    const total = await User.countDocuments(filter);
    const employees = await User.find(filter)
      .populate("tenant", "name")
      .select("name email role designation department phone joiningDate tenant")
      .skip(startIndex)
      .limit(limit)
      .sort("-createdAt");

    const pagination = {};
    if (startIndex + limit < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      pagination,
      data: employees,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.tenant = req.user.tenant;
    }
    const employee = await User.findOne(query);

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
      role,
      designation,
      department,
      phone,
      joiningDate,
    } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      tenant: req.user.role === "superadmin" ? req.body.tenant : req.user.tenant,
      role: role || "employee",
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

    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.tenant = req.user.tenant;
    }
    let user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`,
      });
    }

    const { name, email, role, designation, department, phone, joiningDate, tenant } =
      req.body;

    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        role,
        designation,
        department,
        phone,
        joiningDate,
        tenant: req.user.role === "superadmin" ? (tenant || user.tenant) : user.tenant,
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

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res) => {
  try {
    // Ensure only admin/manager can delete
    if (req.user.role === "employee") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete employees",
      });
    }

    const query = { _id: req.params.id };
    if (req.user.role !== "superadmin") {
      query.tenant = req.user.tenant;
    }
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id of ${req.params.id}`,
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
