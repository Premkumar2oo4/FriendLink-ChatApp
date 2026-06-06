const express = require("express");
const { allMessages, sendMessage, editMessage, deleteMessage, markAsRead, markAsDelivered } = require("../controllers/MessageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/read").put(protect, markAsRead);
router.route("/deliver").put(protect, markAsDelivered);
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/:messageId").put(protect, editMessage).delete(protect, deleteMessage);

module.exports = router;