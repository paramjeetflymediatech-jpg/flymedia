const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  uploadAttachment,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.route("/").get(getTasks).post(createTask);

router.route("/:id").put(updateTask).delete(deleteTask);

router.route("/:id/attachments").post(upload.array("files"), uploadAttachment);

module.exports = router;
