const express=require("express")
const { authenticateUser } = require("../middlewares/auth")
const {addExpense,updateExpense,deleteExpense,getExpenses,headerSummary}=require("../controllers/expense")
const {getDashboard}=require("../controllers/dashboard")
const router=express.Router()


router.post("/add-expense",authenticateUser,addExpense)
router.put("/edit-expense/:id",authenticateUser,updateExpense)
router.delete("/expense/:id",authenticateUser,deleteExpense)
router.get("/expenses",authenticateUser,getExpenses)
router.get("/header-summary",authenticateUser,headerSummary)
router.get("/dashboard",authenticateUser,getDashboard)


module.exports=router