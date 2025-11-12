const userModel = require("../models/user")
const BlacklistToken = require("../models/blacklist")
// const expenseModel = require("../models/expense")
// const mongoose = require("mongoose")


module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body

        const existingUser = await userModel.findOne({ $or: [{ username }, { email }] })
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username Already Taken!" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email Already Taken!" });
            }
        }

        const hashedPassword = await userModel.hashPassword(password);
        const user = await userModel.create({ username, email, password: hashedPassword });
        const userDetails = { username: user.username, role: user.role, avatar: user.avatar }

        const token = userModel.generateAuthToken(user._id);
        res.status(201).json({ token, userDetails, message: "User Registered Successfully!" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body

        const existingUser = await userModel.findOne({ username })
        if (!existingUser) {
            return res.status(404).json({ message: "User Name Not Found!" })
        }

        const isPasswordMatched = await userModel.comparePassword(password, existingUser.password)

        if (!isPasswordMatched) {
            return res.status(401).json({ message: "Invalid Or Wrong Password!" })
        }

        const token = await userModel.generateAuthToken(existingUser._id)
        const userDetails = { username: existingUser.username, role: existingUser.role, avatar: existingUser.avatar }
        return res.status(200).json({ token, userDetails, message: "Login Successful!" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.logoutUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        await BlacklistToken.create({ token })

        res.status(200).json({ message: "Logged Out Successfully!" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.getUserProfile = async (req, res, next) => {
    try {
        const { username, email, avatar, role, createdAt, _id } = req.user
        res.status(200).json({ user: { username, email, avatar, role, createdAt, _id } })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports.getAllUsers = async (req, res, next) => {
    try {
        const { role } = req.user

        if (role !== "admin") {
            res.status(403).json({ message: "Forbidden: Admins only" })
        }
        const allUsers = await userModel.find({}, { _id: 0, username: 1, email: 1, isVerified: 1, avatar: 1, createdAt: 1 })
        res.status(200).json({ users: allUsers, count: allUsers.length })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports.updateProfile = async (req, res, next) => {
    try {
        const { username, email, avatar } = req.body
        const userId = req.user._id

        const updateData = {};

        if (username) updateData.username = username
        if (email) updateData.email = email
        if (avatar) updateData.avatar.avatar

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully!",
            user: updatedUser,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports.deleteProfile = async (req, res, next) => {
    try {
        const { role } = req.user
        const { id } = req.params

        if (role !== "admin") {
            return res.status(403).json({ message: "You are not authorized to perform this action." })
        }

        const deletedUser = await userModel.findByIdAndDelete(id)

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." })
        }

        res.status(200).json({ message: "Profile deleted successfully!" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
