// models/Vendor.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const VendorSchema = new Schema({
    name: { // Vendor's name
        type: String,
        required: true,
        unique: true,
    },
    contactPerson: { // Primary contact person for the vendor
        type: String,
    },
    email: { // Contact email for the vendor
        type: String,
        required: true,
        unique: true,
    },
    phone: { // Contact phone number for the vendor
        type: String,
    },
    address: { // Address of the vendor
        type: String,
    },
    notes: { // Additional notes about the vendor
        type: String,
    },
    createdAt: { // Timestamp of creation
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Vendor', VendorSchema);
