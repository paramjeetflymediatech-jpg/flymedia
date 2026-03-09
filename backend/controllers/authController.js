const User = require("../models/User");
const Tenant = require("../models/Tenant");
const sendEmail = require("../utils/sendEmail");
const dns = require("dns").promises;

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, tenantName, role, domain = "" } = req.body;

    // Validate domain existence
    // if (domain) {
    //   try {
    //     await dns.lookup(domain);
    //   } catch (err) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "The provided domain does not exist or is unreachable.",
    //     });
    //   }
    // }

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
// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      domain: req.body.domain,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res
        .status(401)
        .json({ success: false, message: "Password is incorrect" });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "There is no user with that email" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Use updateOne to bypass the pre-save password hashing hook
    await User.updateOne(
      { _id: user._id },
      { $set: { resetPasswordOTP: otp, resetPasswordOTPExpire: otpExpire } }
    );

    // Send email
    const message = `Your password reset OTP is: ${otp}. It will expire in 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset OTP - Flymedia",
        message,
        html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px"><h2 style="color:#111827">Reset Your Password</h2><p style="color:#6b7280">Use the OTP below to reset your Flymedia account password. It expires in 10 minutes.</p><div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1d4ed8;text-align:center;padding:24px 0">${otp}</div><p style="color:#9ca3af;font-size:12px">If you did not request this, you can safely ignore this email.</p></div>`,
      });

      res.status(200).json({ success: true, message: "Email sent" });
    } catch (err) {
      console.error("Email send error:", err);
      // Clear OTP on email failure
      await User.updateOne(
        { _id: user._id },
        { $unset: { resetPasswordOTP: 1, resetPasswordOTPExpire: 1 } }
      );

      return res
        .status(500)
        .json({ success: false, message: "Email could not be sent" });
    }
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Set new password - use save() so the pre-save hook hashes it
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};
