const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect); // Protect all routes

router.route("/").get(getProjects).post(upload.array("files"), createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

module.exports = router;
