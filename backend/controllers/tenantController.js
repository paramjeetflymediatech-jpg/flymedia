const Tenant = require("../models/Tenant");
const Project = require("../models/Project");

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private/SuperAdmin
exports.getTenants = async (req, res) => {
    try {
        const tenants = await Tenant
            .find()
            .populate("userId", "name role");
        const formattedTenants = tenants.filter(tenant => {
            if (req.user.role == "superadmin") return tenant
            if (tenant.userId.role !== "client" && tenant.userId != req.user.id) {
                return {
                    ...tenant.toObject(),
                    userId: tenant.userId._id,
                    username: tenant.userId.name,
                    role: tenant.userId.role
                }
            }
        });
        res.status(200).json({ success: true, count: tenants.length, data: formattedTenants });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new tenant
// @route   POST /api/tenants
// @access  Private/SuperAdmin
exports.createTenant = async (req, res) => {
    try {
        const tenant = await Tenant.create(req.body);
        res.status(201).json({ success: true, data: tenant });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Get single tenant
// @route   GET /api/tenants/:id
// @access  Private/SuperAdmin
exports.getTenant = async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }

        const projects = await Project.find({ tenant: req.params.id }).populate("client", "name");

        res.status(200).json({
            success: true,
            data: {
                ...tenant._doc,
                projects
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
