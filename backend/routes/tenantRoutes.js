const express = require("express");
const { getTenants, createTenant, getTenant } = require("../controllers/tenantController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/")
    .get(getTenants)
    .post(authorize("superadmin"), createTenant);

router.route("/:id")
    .get(authorize("superadmin"), getTenant);

module.exports = router;
