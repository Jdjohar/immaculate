// models/ExpenseType.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExpenseTypeSchema = new Schema({
    name: { // Name of the expense type, e.g., "Fuel", "Materials"
        type: String,
        required: true,
        unique: true,
    },
    description: { // Optional description of the expense type
        type: String,
    },
    createdAt: { // Timestamp of when the expense type was created
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('ExpenseType', ExpenseTypeSchema);
