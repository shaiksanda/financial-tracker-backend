const mongoose = require("mongoose");


const deliverySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerName:{type:String,require:true},
    date: { type: Date, required: true },
    timeTaken: { type: Number, required: true },
    dropLocation: { type: String, required: true },
    distance: { type: Number, required: true },
    petrolPrice: { type: Number, default: 110 },   // fixed for now
    mileage: { type: Number, default: 45 },   // fixed for now
    petrolCostPerDelivery: {
        type: Number,
        required: true, // auto-calculated: distance / mileage * petrolPrice
    },
    earnings:{
        type:Number,required:true, //direct blinkt earnings
    },
    status: {
        type: String,
        enum: ["completed", "cancelled", "pending"],
    },
    notes: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

const Delivery = mongoose.model("Deliver", deliverySchema);

module.exports = Delivery;