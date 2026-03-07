const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a tenant name"],
    unique: true,
    trim: true,
  },
  domain: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values if not every tenant has a domain
  },
  logo: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Tenant", tenantSchema);
