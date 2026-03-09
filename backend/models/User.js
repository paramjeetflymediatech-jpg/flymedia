const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["superadmin", "admin", "manager", "employee", "client"],
    default: "employee",
  },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
  
  },
  designation: {
    type: String,
    default: "Employee",
  },
  department: {
    type: String,
    default: "General",
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    unique: true,
    match: [
      /^[+]?[\d\s\-().]{7,20}$/,
      "Please add a valid phone number",
    ],
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  domain: {
    type: String,
    trim: true,
  },
  resetPasswordOTP: String,
  resetPasswordOTPExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, tenant: this.tenant },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    },
  );
};

module.exports = mongoose.model("User", userSchema);
