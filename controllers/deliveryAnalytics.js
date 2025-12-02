const { mongoose } = require("mongoose");
const Delivery = require("../models/delivery");

module.exports.getDeliveryAnalytics = async (req, res) => {
    try {
        const userId = req.user._id
        let days = Number(req.query.days) || 7;


        const filters = { userId }
        const endDate = new Date();
        endDate.setUTCHours(0, 0, 0, 0);

        const startDate = new Date(endDate);
        startDate.setUTCDate(startDate.getUTCDate() - days);

        if (days) filters.date = { $gte: startDate, $lte: endDate }

        const tripData = await Delivery.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } }
            },
            {
                $group: {
                    _id: "$date",
                    totalTrips: { $sum: 1 },
                    totalDistance: { $sum: "$distance" },
                    totalEarnings: { $sum: "$earnings" },
                    totalPetrolCost: { $sum: "$petrolCostPerDelivery" },
                    totalTimeTaken: { $sum: "$timeTaken" },

                }
            }, { $project: { _id: 0, date: "$_id", totalTrips: 1, totalDistance: 1, totalEarnings: 1, totalPetrolCost: 1, totalTimeTaken: 1 } }])


        const tripMap = new Map()
        tripData.forEach(each => {
            const dateStr = each.date.toISOString().slice(0, 10)
            tripMap.set(dateStr, { totalTrips: each.totalTrips, totalDistance: each.totalDistance, totalEarnings: each.totalEarnings, totalPetrolCost: each.totalPetrolCost, totalTimeTaken: each.totalTimeTaken });
        })

        let analyticsData = []

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {

            const dateClone = new Date(d);
            const dateStr = dateClone.toISOString().slice(0, 10)
            const data = tripMap.get(dateStr) || {
                totalTrips: 0,
                totalDistance: 0,
                totalEarnings: 0,
                totalPetrolCost: 0,
                totalTimeTaken: 0
            };
            analyticsData.push({
                date: dateStr,
                totalTrips: data.totalTrips,
                totalDistance: data.totalDistance,
                totalEarnings: data.totalEarnings,
                totalPetrolCost: data.totalPetrolCost,
                totalTimeTaken: data.totalTimeTaken
            });
        }

        res.status(200).json({ analytics: analyticsData })

    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}