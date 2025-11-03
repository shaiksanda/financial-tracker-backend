const mongoose = require("mongoose");


const deliverySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    },
    date: { type: Date, required: true },
    totalKm: { type: Number, required: true },
    petrolCost: { type: Number, required: true },
    totalOrders: { type: Number, required: true },
    totalEarnings: {
        type: Number,
        required: true,
    },

    highestOrderPrice: {
        type: Number,
        default: 0,
    },
    lowestOrderPrice: {
        type: Number,
        default: 0,
    },
    profit: {
        type: Number,
        default: function () {
            // auto-calculate profit if both values exist
            return this.totalEarnings - this.petrolCost;
        },
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

const Delivery = mongoose.model("Deliver", deliverySchema);

module.exports=Delivery;