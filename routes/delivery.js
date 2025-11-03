const express=require("express")
const router=express.Router()

const {authenticateUser}=require("../middlewares/auth")
const {addDelivery}=require("../controllers/delivery")

router.post("/add-delivery",authenticateUser,addDelivery)

export default router