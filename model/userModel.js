const mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
    name : String,
    email : String,
    password : String,
    role : String,
    isActive : Boolean,
    bookings : Array
})

mongoose.model('users', UserSchema)
module.exports = mongoose.model('users')