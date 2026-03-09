const express = require("express");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
} = require("../controllers/employeeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/search").get(searchEmployees);

router.route("/").get(getEmployees).post(createEmployee);

router.route("/:id").get(getEmployee).put(updateEmployee).delete(deleteEmployee);

module.exports = router;
