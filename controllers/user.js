const userModel = require("../models/user")
const BlacklistToken = require("../models/blacklist")
const expenseModel = require("../models/expense")
const Delivery = require("../models/delivery");
const mongoose = require("mongoose")


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
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { username, email, avatar, role, createdAt } = req.user;

        // Run both aggregations in parallel
        const [financeSummary, deliverySummary] = await Promise.all([
            expenseModel.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        totalExpensesRaw: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
                        totalIncomeRaw: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                        totalSavingsRaw: { $sum: { $cond: [{ $eq: ["$type", "savings"] }, "$amount", 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalExpenses: { $round: ["$totalExpensesRaw", 2] },
                        totalIncome: { $round: ["$totalIncomeRaw", 2] },
                        totalSavings: { $round: ["$totalSavingsRaw", 2] }
                    }
                }
            ]),
            Delivery.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        totalTrips: { $sum: 1 },
                        totalKms: { $sum: "$distance" },
                        totalEarnings: { $sum: "$earnings" },
                        totalPetrolCost: { $sum: "$petrolCostPerDelivery" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalTrips: 1,
                        totalKms: { $round: ["$totalKms", 2] },
                        totalEarnings: { $round: ["$totalEarnings", 2] },
                        totalPetrolCost: { $round: ["$totalPetrolCost", 2] }
                    }
                }
            ])
        ]);

        const finance = financeSummary[0] || { totalExpenses: 0, totalIncome: 0, totalSavings: 0 };
        const delivery = deliverySummary[0] || { totalTrips: 0, totalKms: 0, totalEarnings: 0, totalPetrolCost: 0 };

        res.status(200).json({
            user: { username, email, avatar, role, createdAt, userId },
            finance,
            delivery
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

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
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully!",
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports.deleteProfile = async (req, res, next) => {
    try {
        const { role } = req.user
        const userId = req.user._id
        const { id } = req.params

        if (role !== "admin" && userId !== id) {
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
