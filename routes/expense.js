const express=require("express")
const { authenticateUser } = require("../middlewares/auth")
const {addExpense,updateExpense,deleteExpense,getExpenses}=require("../controllers/expense")
const router=express.Router()


router.post("/add-expense",authenticateUser,addExpense)
router.put("/edit-expense/:id",authenticateUser,updateExpense)
router.delete("/expense/:id",authenticateUser,deleteExpense)
router.get("/expenses",authenticateUser,getExpenses)


module.exports=router