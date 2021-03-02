const mongoose = require('mongoose');
let BookingSchema = new mongoose.Schema({
    hotel: String,
    hotelid: String,
    price: String,
    name: String,
    date: String,
    city: String,
    status: String,
    bookeremail: String
})

mongoose.model('bookings', BookingSchema)
module.exports = mongoose.model('bookings')