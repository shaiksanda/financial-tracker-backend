const Delivery = require("../models/delivery");
const { findById, findByIdAndDelete } = require("../models/user");

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

module.exports.updateDelivery = async (req, res, next) => {
    try {
        const deliveryId = req.params.id
        const { id, totalKm, totalOrders, totalEarnings, petrolCost, highestOrderPrice, lowestOrderPrice, notes } = req.body
        const userId = req.user._id

        const updatedDelivery = {}

        if (totalKm) updatedDelivery.totalKm = totalKm

        if (totalOrders) updatedDelivery.totalOrders = totalOrders;
        if (totalEarnings) updatedDelivery.totalEarnings = totalEarnings;
        if (petrolCost) updatedDelivery.petrolCost = petrolCost;
        if (highestOrderPrice) updatedDelivery.highestOrderPrice = highestOrderPrice;
        if (lowestOrderPrice) updatedDelivery.lowestOrderPrice = lowestOrderPrice;
        if (notes) updatedDelivery.notes = notes;

        if (totalEarnings && petrolCost) {
            updatedDelivery.profit = totalEarnings - petrolCost;
        }

        const updated = await Delivery.findByIdAndUpdate({ _id: deliveryId, userId }, updatedDelivery, { new: true })
        if (!updated) {
            return res.status(401).json({ message: "Delivery Record Not Found or Unauthorized!" })
        }
        res.status(200).json({ message: "Delivery Record Updated Successfully!" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports.deleteDelivery = async (req, res, next) => {
    try {
        const deliveryId = req.params.id
        const userId = req.user._id
        const deleted = await Delivery.findOneAndDelete({ _id: deliveryId, userId });
        if (!deleted) {
            return res.status(401).json({ message: "Delivery Record Not Found or Unauthorized!" });
        }

        res.status(200).json({ message: "Delivery Record Deleted Successfully!" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}