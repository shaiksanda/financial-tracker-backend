const { mongoose } = require("mongoose");
const expenseModel = require("../models/expense")

module.exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user._id
        const days = Number(req.query.days) || 7;


        const endDate = new Date();
        endDate.setUTCHours(0, 0, 0, 0);

        const startDate = new Date(endDate);
        startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

        const [financeData, categoryData, typeData] = await Promise.all([
            expenseModel.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: "$date",
                        totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } },
                        totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
                        totalSavings: { $sum: { $cond: [{ $eq: ["$type", "savings"] }, "$amount", 0] } }
                    }
                },
                { $project: { _id: 0, date: "$_id", totalExpenses: 1, totalIncome: 1, totalSavings: 1 } }
            ]),

            expenseModel.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate }, type: "expense" } },
                { $group: { _id: "$category", total: { $sum: "$amount" } } },
                { $project: { _id: 0, category: "$_id", total: 1 } }
            ]),

            expenseModel.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } } },
                { $group: { _id: "$type", total: { $sum: "$amount" } } },
                { $project: { _id: 0, type: "$_id", total: 1 } }
            ])
        ]);

        const totalIncome = typeData?.find(t => t.type === "income")?.total || 0;
        const totalExpenses = typeData?.find(t => t.type === "expense")?.total || 0;
        const totalSavings = typeData?.find(t => t.type === "savings")?.total || 0;


        res.status(200).json({ financeData, categoryData, typeData,totals:{totalExpenses,totalIncome,totalSavings} });



    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

}