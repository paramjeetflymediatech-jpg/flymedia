const express = require("express");
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  approveProject,
  searchProjects,
} = require("../controllers/projectController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect); // Protect all routes

router.route("/search").get(searchProjects);

router.route("/").get(getProjects).post(upload.array("files"), createProject);

router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);

router.route("/:id/approve").put(approveProject);

const { uploadProjectFiles } = require("../controllers/projectController");
router.route("/:id/files").put(upload.array("files"), uploadProjectFiles);

module.exports = router;
