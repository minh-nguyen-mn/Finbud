const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema({
    symbol : {type: String, require: true},
    price : {type:  Number, require: true},
    vollumn: {type:  Number, require: true},
    change : {type:  Number, require: true},
    percentChange : {type:  Number, require: true},
    date : { type: String, require: true},
    timeStamp : {type: Number},
})
module.exports = mongoose.model('StockPrice', StockSchema );