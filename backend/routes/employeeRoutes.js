const express = require("express");
const {
  getEmployees,
  getEmployee,
  createEmployee,
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getEmployees).post(createEmployee);

router.route("/:id").get(getEmployee);

module.exports = router;
