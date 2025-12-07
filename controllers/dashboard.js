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

        const financeMap = new Map()
        financeData.forEach(each => {
            const dateStr = each.date.toISOString().slice(0, 10)
            financeMap.set(dateStr, {
                totalExpenses: each.totalExpenses,
                totalIncome: each.totalIncome,
                totalSavings: each.totalSavings
            })
        })

        let dashboardData = []

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateClone = new Date(d);
            const dateStr = dateClone.toISOString().slice(0, 10)
            const data = financeMap.get(dateStr) || {
                totalExpenses: 0,
                totalIncome: 0,
                totalSavings: 0
            }

            dashboardData.push(
                {
                    date: dateStr, 
                    totalExpenses: Number(data.totalExpenses.toFixed(2)),
                    totalIncome: Number(data.totalIncome.toFixed(2)),
                    totalSavings: Number(data.totalSavings.toFixed(2))
                }
            )

        }


        const totalIncome = typeData?.find(t => t.type === "income")?.total || 0;
        const totalExpenses = typeData?.find(t => t.type === "expense")?.total || 0;
        const totalSavings = typeData?.find(t => t.type === "savings")?.total || 0;


        res.status(200).json({ dashboardData, categoryData, typeData, totals: { totalExpenses, totalIncome, totalSavings } });



    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }

}