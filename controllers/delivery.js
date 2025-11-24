const MailMessage = require("nodemailer/lib/mailer/mail-message");
const Delivery = require("../models/delivery");

module.exports.addDelivery = async (req, res, next) => {
    try {
        const {
            date,
            customerName,
            timeTaken, dropLocation, distance,
            earnings,
            status,
            notes, } = req.body
        const userId = req.user._id
        const mileage = 45;
        const petrolPrice = 110;
        const petrolCostPerDelivery =
            Number(((Number(distance) / mileage) * petrolPrice).toFixed(2));


        await Delivery.create({
            userId,
            date,
            customerName,
            timeTaken: Number(timeTaken),
            distance: Number(distance),
            dropLocation,
            earnings: Number(earnings),
            status,
            petrolCostPerDelivery: (Number(petrolCostPerDelivery)),
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
        const { timeTaken, dropLocation, distance, earnings, status, date, notes } = req.body
        const userId = req.user._id

        const updatedDelivery = {}
        if (timeTaken !== undefined) updatedDelivery.timeTaken = Number(timeTaken);
        if (dropLocation !== undefined) updatedDelivery.dropLocation = dropLocation;
        if (distance !== undefined) updatedDelivery.distance = Number(distance);
        if (earnings !== undefined) updatedDelivery.earnings = Number(earnings);
        if (status !== undefined) updatedDelivery.status = status;
        if (date !== undefined) updatedDelivery.date = date;
        if (notes !== undefined) updatedDelivery.notes = notes;

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

module.exports.getDeliveryData = async (req, res, next) => {
    try {
        const { date, days, status, sortByEarnings, earningsOrder, sortByDistance, distanceOrder,
            sortByTimeTaken, timeTakenOrder,
            sortByDate, dateOrder } = req.query

        const userId = req.user._id
        const filters = { userId }
        if (date) {
            filters.date = date;
        }

        if (days) {
            const n = Number(days);
            const to = new Date();
            const from = new Date();
            from.setDate(to.getDate() - n);

            filters.date = { $gte: from, $lte: to };
        }

        if (status) {
            filters.status = status;
        }


        const sortOptions = {}

        if (sortByEarnings) {
            sortOptions[sortByEarnings] = earningsOrder === "asc" ? 1 : -1
        }

        if (sortByDistance) {
            sortOptions[sortByDistance] = distanceOrder === "asc" ? 1 : -1;
        }

        if (sortByTimeTaken) {
            sortOptions[sortByTimeTaken] = timeTakenOrder === "asc" ? 1 : -1;
        }

        if (sortByDate) {
            sortOptions[sortByDate] = dateOrder === "asc" ? 1 : -1;
        }

        if (Object.keys(sortOptions).length === 0) {
            sortOptions.date = -1;
        }

        const deliveryRecords = await Delivery.find(filters).sort(sortOptions);

        if (deliveryRecords.length === 0) {
            return res.status(404).json({ message: "No delivery records found!" });
        }
        

        res.status(200).json(deliveryRecords );

    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}