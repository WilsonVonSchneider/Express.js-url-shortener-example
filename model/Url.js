const mongoose = require('mongoose');
const { v1: uuid } = require('uuid');
const Schema = mongoose.Schema;
const urlSchema = new Schema({
    _id: { 
        type: String, 
        default: uuid
    },
    trueUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    counter: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('Url', urlSchema);