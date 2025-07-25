const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const BusinessProfile = require("../Models/BusinessProfile");
const { registerUserSchema, loginUserSchema, updateUserSchema } = require("../validators/userValidators");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};


exports.register = async (req, res) => {
  try {
    const parsed=registerUserSchema.safeParse(req.body);
    if(!parsed.success){
      return res.status(400).json({
        success:false,
        error: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, password, role } = parsed.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const user = new User({ name, email, password, role });
    await user.save(); 
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: { name: user.name, email: user.email, role: user.role },
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId || null,
      },
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const businessProfile = await BusinessProfile.findOne({ userId: req.user.id });

    res.json({ success: true, user, businessProfile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
      businessId: req.user.businessId,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User added successfully",
      user: { _id:newUser._id,name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  Get all users under the same business
exports.getAllUsers = async (req, res) => {
  try {
    console.log("get")
    const users = await User.find({ businessId: req.user.businessId }).select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    console.log("under")
    const { id } = req.params;

    console.log(id)

    // ✅ Step 1: Validate input
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.flatten().fieldErrors,
      });
    }

    const { name, email, role } = parsed.data;

    // ✅ Step 2: Find the user
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // ✅ Step 3: Update fields
    if (name) existingUser.name = name;
    if (email) existingUser.email = email;
    if (role) existingUser.role = role;


    // ✅ Step 4: Save updated user
    const updatedUser = await existingUser.save();

    // ✅ Step 5: Respond
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};