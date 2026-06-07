const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUserProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  guestLogin,
  deleteUserAccount,
  getStats,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Specific routes
router.get("/stats", getStats);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/guest", guestLogin);
router.delete("/delete", protect, deleteUserAccount);

// Authentication
router.post("/login", authUser);
router.post("/register", registerUser);

// User search and generic creation
router.get("/", protect, allUsers);
router.post("/", registerUser);

// Test route
router.get("/test", (req, res) => {
  res.send("User router is working perfectly");
});

module.exports = router;
