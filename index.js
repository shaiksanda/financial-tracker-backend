const express=require("express")
const cors = require("cors")
require("dotenv").config()
const connectToMongodb=require("./db/index")
const userRoutes=require("/routes/user")
const expenseRoutes=require("/routes/expense")

const app=express()
app.use(express.json())
app.use(cors())

connectToMongodb()

let port=process.env.PORT ?? 6000
app.use("/users",userRoutes)
app.use("/expense",expenseRoutes)

app.get("/",(req,res)=>{
    res.send("My Expense Tracker Is Live!!!")
})


app.listen(`${port}`,()=>{
    console.log("Server Running",port)
})