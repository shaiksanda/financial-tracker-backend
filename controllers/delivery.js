const Delivery = require("../models/delivery")

module.exports.addDelivery = async (req, res, next) => {
    try {
        const { totalKm,
            date,
            petrolCost,
            totalOrders,
            totalEarnings,
            highestOrderPrice,
            lowestOrderPrice,
            notes, } = req.body
        const userId = req.user._id
        const profit = totalEarnings - petrolCost;


        await Delivery.create({
            userId,
            date,
            totalKm,
            petrolCost,
            totalOrders,
            totalEarnings,
            profit,
            highestOrderPrice,
            lowestOrderPrice,
            notes,
        });

        res.status(200).json({ message: "Delivery record created successfully!" })
    }
    catch (error) {
        res.status(500).json({ error: error.message })
    }
}

