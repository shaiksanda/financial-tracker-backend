const expenseModel = require("../models/expense")

module.exports.addExpense = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { title, amount, category, type, date, month, year } = req.body

        await expenseModel.create({ title, amount, category, type, date, month, year, userId })
        res.status(200).json({ message: "Expense Added Successfully!" })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports.updateExpense = async (req, res, next) => {
    try {
        const userId = req.user._id
        const expenseId = req.params.id
        const { title, amount, type, category, date, month, year } = req.body
        let updateData = {}
        if (title) updateData.title = title
        if (amount) updateData.amount = amount
        if (type) updateData.type = type
        if (category) updateData.category = category
        if (date) updateData.date = date
        if (month) updateData.month = month
        if (year) updateData.year = year

        const updatedExpense = await expenseModel.findByIdAndUpdate({ _id: expenseId, userId: userId }, { $set: updateData }, { new: true })

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense Not Found or Unauthorized!" })
        }
        res.status(200).json({ message: "Expense Updated Successfully!" })

    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

module.exports.deleteExpense = async (req, res, next) => {
    try {
        const userId = req.user._id
        const expenseId = req.params.id
        await expenseModel.findByIdAndDelete({ _id: expenseId, userId: userId })
        res.status(200).json({ message: "Expense Deleted Successfully!" })
    }
    catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

module.exports.getExpenses = async (req, res, next) => {
    try {
        const userId = req.user._id

        const { month, year, type, category } = req.query;

        let filters = { userId };

        if (month) filters.month = month;
        if (year) filters.year = year;
        if (type) filters.type = type;
        if (category) filters.category = category;

        const expenses = await expenseModel.find(filters).sort({date:-1})
        res.status(200).json({ expenses,count:expenses.length })
    }
    catch (error) {
        return res.status(500).json({ message: error.message })
    }
}