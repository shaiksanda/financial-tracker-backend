const express=require("express")
const router=express.Router()

const {authenticateUser}=require("../middlewares/auth")
const {addDelivery,updateDelivery,deleteDelivery,getDeliveryData}=require("../controllers/delivery")

router.get("/data",authenticateUser,getDeliveryData)
router.post("/add",authenticateUser,addDelivery)
router.put("/update/:id",authenticateUser,updateDelivery)
router.delete("/delete/:id",authenticateUser,deleteDelivery)

module.exports= router