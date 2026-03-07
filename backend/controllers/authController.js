const User = require("../models/User");
const Tenant = require("../models/Tenant");
const dns = require("dns").promises;

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, tenantName, role, domain = "" } = req.body;

    // Validate domain existence
    if (domain) {
      try {
        await dns.lookup(domain);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "The provided domain does not exist or is unreachable.",
        });
      }
    }

    // Create tenant if not exists (simplify for now: one tenant per registration or link to existing?)
    // For SaaS, usually a new registration creates a new Tenant if it's an admin/owner.
    // Let's assume passed tenantName creates a new Tenant.

    let tenant = await Tenant.findOne({ name: tenantName, domain: domain });

    if (!tenant) {
      tenant = await Tenant.create({ name: tenantName, domain: domain });
    }

    const user = await User.create({
      name,
      email,
      password,
      tenant: tenant._id,
      role: role || "admin", // Default to admin if no role provided, or use logic to restrict
    });
    tenant.userId = user._id;
    tenant.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    // httpOnly: true, // Commented out to allow frontend JS access for checkAuth logic if needed
    path: "/",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenant,
      },
    });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
