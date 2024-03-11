const mongoose = require('mongoose');
const { v1: uuid } = require('uuid');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: { 
        type: String, 
        default: uuid
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        default: null
    },
    emailVerifiedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);