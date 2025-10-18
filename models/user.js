const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },           // email verification
    avatar: { type: String, default: "https://res.cloudinary.com/dq4yjeejc/image/upload/v1755768087/Screenshot_2025-08-21_145047_zqcfpw.png" },
    otp: { type: String, default: "" },
    role: { type: String, default: "user", enum: ['user', 'admin'] }
}, {
    timestamps: true
});


userSchema.statics.hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};
// Compare password
userSchema.statics.comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};


userSchema.statics.hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};
// Compare password
userSchema.statics.compareOtp = async (otp, hashedOtp) => {
  return bcrypt.compare(otp, hashedOtp);
};

// Generate JWT
userSchema.statics.generateAuthToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "5d" });
};



const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
