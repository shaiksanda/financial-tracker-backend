const express=require("express")
const router=express.Router()
const {registerUser,loginUser,getUserProfile,getAllUsers,logoutUser,updateProfile,deleteProfile}=require("../controllers/user")
const { authenticateUser } = require("../middlewares/auth")

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/logout",logoutUser)

router.get("/profile",authenticateUser,getUserProfile)
router.put("/update-profile",authenticateUser,updateProfile)
router.get("/all-users",authenticateUser,getAllUsers)
router.delete("/profile/:id",authenticateUser,deleteProfile)
module.exports=router