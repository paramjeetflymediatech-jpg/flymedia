const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadAttachment,
  searchTasks,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.route("/search").get(searchTasks);

router.route("/").get(getTasks).post(createTask);

router.route("/:id").put(updateTask).delete(deleteTask);

router.route("/:id/attachments").post(upload.array("files"), uploadAttachment);

module.exports = router;
