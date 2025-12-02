const express = require("express")
const cors = require("cors")
const path=require("path")
require("dotenv").config()
const connectToMongodb = require("./db/index")
const userRoutes = require("./routes/user")
const expenseRoutes = require("./routes/expense")
const deliveryRoutes = require("./routes/delivery")

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

connectToMongodb()

let port = process.env.PORT ?? 6002
app.use("/users", userRoutes)
app.use("/expense", expenseRoutes)
app.use("/delivery", deliveryRoutes)

app.get("/", (req, res) => {
    res.send("My Tracker is Live!!")
})


app.listen(`${port}`, () => {
    console.log("Server Running on Port: ", port)
})