const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// @desc    Get all users for communication
// @route   GET /api/messages/users
// @access  Private
exports.getCommunicationUsers = async (req, res) => {
  try {
    let filter = { _id: { $ne: req.user.id } };

    // 1. If superadmin, show everyone cross-tenant
    if (req.user.role === "superadmin") {
      filter.role = { $in: ["client", "manager", "admin", "employee"] };
    } 
    // 2. If manager or admin, show superadmin AND their own tenant's managers, admins, and employees
    else if (req.user.role === "manager" || req.user.role === "admin") {
      filter.$or = [
        { role: "superadmin" },
        { tenant: req.user.tenant, role: { $in: ["admin", "manager", "employee"] } }
      ];
    }
    // 3. If employee, show superadmin AND their own tenant's managers and admins
    else if (req.user.role === "employee") {
      filter.$or = [
        { role: "superadmin" },
        { tenant: req.user.tenant, role: { $in: ["admin", "manager"] } }
      ];
    }
    // 4. If client, show superadmin AND their own tenant's managers
    else if (req.user.role === "client") {
      filter.$or = [
        { role: "superadmin" },
        { tenant: req.user.tenant, role: "manager" }
      ];
    }

    const users = await User.find(filter)
      .select("name email role tenant")
      .populate("tenant", "name");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages/send/:receiverId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { message, projectId } = req.body;
    const senderId = req.user.id;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    // Determine the tenant for this conversation.
    let tenant = req.user.tenant;
    if (req.user.role === "superadmin") {
      tenant = receiver.tenant;
    } else if (receiver.role === "superadmin") {
      tenant = req.user.tenant;
    }

    // 1. Check if conversation exists (including projectId)
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      projectId: projectId || null,
      tenant,
    });

    // 2. If not, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        projectId: projectId || null,
        tenant,
      });
    }

    // Handle attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => {
        let folder = "others";
        if (file.mimetype.startsWith("image/")) folder = "images";
        else if (file.mimetype.startsWith("video/")) folder = "videos";
        else if (file.mimetype.startsWith("audio/")) folder = "audio";
        else if (file.mimetype === "application/pdf" || file.mimetype.includes("document") || file.mimetype.includes("word") || file.mimetype.includes("zip") || file.mimetype.includes("compressed")) folder = "documents";

        return {
          url: `/uploads/${req.user.role + req.user._id}/${folder}/${file.filename}`,
          fileType: file.mimetype,
          name: file.originalname,
        };
      });
    } else if (req.body.attachments) {
      // Support for forwarding existing media
      try {
        attachments = typeof req.body.attachments === 'string' 
          ? JSON.parse(req.body.attachments) 
          : req.body.attachments;
      } catch (e) {
        console.error("Error parsing forwarded attachments:", e);
      }
    }

    // 3. Create message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      projectId: projectId || null,
      senderId,
      receiverId,
      message,
      attachments,
      tenant,
    });

    // 4. Update last message in conversation
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // 5. Emit socket event
    if (req.app.get("io")) {
      const io = req.app.get("io");
      io.to(receiverId).emit("newMessage", newMessage);
    }

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:receiverId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { projectId } = req.query;
    const senderId = req.user.id;

    // Find the conversation. We don't filter by tenant here because superadmin 
    // can access across tenants, and participants will naturally isolate.
    const query = {
      participants: { $all: [senderId, receiverId] },
      projectId: projectId || null,
    };

    const conversation = await Conversation.findOne(query);

    if (!conversation) {
      return res.status(200).json({ success: true, data: [] });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const query = { participants: req.user.id };
    
    // If not superadmin, only show conversations for their tenant
    if (req.user.role !== "superadmin") {
      query.tenant = req.user.tenant;
    }

    const conversations = await Conversation.find(query)
      .populate("participants", "name email role")
      .populate("lastMessage")
      .populate("projectId", "name")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
