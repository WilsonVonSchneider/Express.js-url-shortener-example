const mongoose = require('mongoose');
const { v1: uuid } = require('uuid');
const Schema = mongoose.Schema;

const actionTokenSchema = new Schema({
    _id: { 
        type: String, 
        default: uuid
    },
    entity_id: {
        type: String,
        required: true
    },
    action_name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        default: () => Date.now() + 15 * 60 * 1000 // 15 minutes in milliseconds
    },
    executed_at: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('ActionToken', actionTokenSchema);

