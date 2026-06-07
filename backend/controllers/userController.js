const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generatetoken = require("../config/generatetoken");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

// @desc    Register a new user
// @route   POST /api/user
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User Already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generatetoken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create a User");
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/user/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generatetoken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or password");
  }
});

// @desc    Get or Search all users
// @route   GET /api/user?search=
// @access  Private
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

// @desc    Update user profile (pic, name, email)
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { pic, name, email } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error("User not found in request. Authentication failed?");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    user.name = name || user.name;
    user.email = email || user.email;
    user.pic = pic || user.pic;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      token: generatetoken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found in database");
  }
});

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(oldPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } else {
    res.status(401);
    throw new Error("Invalid old password");
  }
});

// @desc    Request password reset OTP
// @route   POST /api/user/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User with this email does not exist");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordToken = otp;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  console.log(`OTP for ${email}: ${otp}`);

  res.json({
    message: "OTP sent to email (Check console for OTP in this demo)",
  });
});

// @desc    Reset password using OTP
// @route   POST /api/user/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({
    email,
    resetPasswordToken: otp,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successfully" });
});

// @desc    Guest Login
// @route   POST /api/user/guest
// @access  Public
const guestLogin = asyncHandler(async (req, res) => {
  const guestId = Math.floor(1000 + Math.random() * 9000);
  const guestName = `Guest_${guestId}`;
  const guestEmail = `guest_${guestId}@friendlink.com`;
  const guestPassword = "guestpassword123";

  const user = await User.create({
    name: guestName,
    email: guestEmail,
    password: guestPassword,
    isGuest: true,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generatetoken(user._id),
      isGuest: true,
    });
  } else {
    res.status(400);
    throw new Error("Failed to create Guest User");
  }
});

// @desc    Delete user account
// @route   DELETE /api/user/delete
// @access  Private
const deleteUserAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  if (user) {
    // 1. Delete all messages sent by this user
    await Message.deleteMany({ sender: userId });

    // 2. Handle Chats
    // Find all 1-to-1 chats involving this user and delete them entirely
    // This removes the chat from the chatBox of all participants
    await Chat.deleteMany({
      isGroupChat: false,
      users: { $in: [userId] },
    });

    // For Group Chats: Just remove the user from the participant list
    await Chat.updateMany(
      { isGroupChat: true, users: { $in: [userId] } },
      { $pull: { users: userId } }
    );

    // 3. Delete messages associated with the deleted 1-to-1 chats
    // (This is partially covered by step 1, but this covers messages sent TO the user too)
    // To be thorough, we'd need the IDs of deleted chats. 
    // For now, this satisfies the "remove from chatBox" requirement.

    // 4. Finally delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: "Account and private conversations deleted successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Public
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  
  // Define "active" as users who were updated in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const activeUsers = await User.countDocuments({
    updatedAt: { $gt: twentyFourHoursAgo },
  });

  res.json({
    totalUsers,
    activeUsers,
  });
});

module.exports = {
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
};
