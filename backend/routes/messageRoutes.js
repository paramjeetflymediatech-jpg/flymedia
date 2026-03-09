const express = require("express");
const {
  getCommunicationUsers,
  sendMessage,
  getMessages,
  getConversations,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.get("/users", getCommunicationUsers);
router.get("/conversations", getConversations);
router.get("/:receiverId", getMessages);
router.post("/send/:receiverId", upload.array("files"), sendMessage);

module.exports = router;
