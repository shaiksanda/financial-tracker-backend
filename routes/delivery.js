const express=require("express")
const router=express.Router()

const {authenticateUser}=require("../middlewares/auth")
const {addDelivery,updateDelivery,deleteDelivery}=require("../controllers/delivery")

router.post("/add-delivery",authenticateUser,addDelivery)
router.put("/update-delivery:id",authenticateUser,updateDelivery)
router.delete("delete-delivery/:id",authenticateUser,deleteDelivery)

export default router