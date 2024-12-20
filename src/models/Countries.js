const mongo = require("mongoose");
const CountriesSchema = new mongo.Schema({
    iso_code:{
        type: String,
        maxlenght: 2,
        required: true,
        unique: true
    },
    iata_code:{
        type: String,
        maxlenght: 3,
        required: true,
        unique: true
    },
    name_country:{
        type: String,
        required: true
    }
})
module.exports = mongo.model("Countries", CountriesSchema);