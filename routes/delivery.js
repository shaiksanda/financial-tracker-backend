const express=require("express")
const router=express.Router()

const {authenticateUser}=require("../middlewares/auth")
const {addDelivery,updateDelivery,deleteDelivery,getDeliveryData,todayPerformance}=require("../controllers/delivery")
const {getDeliveryAnalytics}=require("../controllers/deliveryAnalytics")

router.get("/today-progress",authenticateUser,todayPerformance)
router.get("/data",authenticateUser,getDeliveryData)
router.post("/add",authenticateUser,addDelivery)
router.put("/update/:id",authenticateUser,updateDelivery)
router.delete("/delete/:id",authenticateUser,deleteDelivery)
router.get("/analytics",authenticateUser,getDeliveryAnalytics)

module.exports= router