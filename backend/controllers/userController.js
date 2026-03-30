const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// GET /api/users - admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// GET /api/users/:id
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json(user);
});

// PUT /api/users/:id - admin (update role, status)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  const { name, email, role, isActive, phone } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (phone) user.phone = phone;
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
});

// DELETE /api/users/:id - admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  user.isActive = false;
  await user.save();
  res.json({ message: 'User deactivated' });
});

// PUT /api/users/profile - own profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, password } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (password) user.password = password;
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone });
});

module.exports = { getUsers, getUser, updateUser, deleteUser, updateProfile };
