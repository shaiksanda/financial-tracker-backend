const jwt = require("jsonwebtoken")
const userModel = require("../models/user")
const BlacklistToken = require("../models/blacklist")
module.exports.authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1]

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const isBlacklisted = await BlacklistToken.findOne({ token })

        if (isBlacklisted) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const exisitingUser = await userModel.findById(decoded.id)
        req.user = exisitingUser
        return next()
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}
