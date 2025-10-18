const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["income", "expense", "savings"], required: true },
    date: { type: Date, required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"}

}, { timestamps: true })


const expenseModel=mongoose.model("Expense", expenseSchema)
module.exports = expenseModel