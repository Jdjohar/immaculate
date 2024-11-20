const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema for individual expense entries
const ExpenseSchema = new Schema({
    
    invoiceId: { // Reference to the associated invoice
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
        required: false,
    },
   
    expenseDate: { // Date when the expense was incurred
        type: Date,
        default: Date.now,
    },
    expenseType: { // Reference to ExpenseType
        type: Schema.Types.ObjectId,
        ref: 'ExpenseType',
        required: false,
    },
    transactionType: {
        type: String,
        required: false,
    },
    vendor: { // Reference to ExpenseType
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: false,
    },
    amount: { // Total cost of the expense
        type: Number,
        required: true,
        min: 0,
    },
    description: { // Additional details about the expense
        type: String,
    },
    receiptUrl: { // Optional URL or path to a receipt image/file
        type: String,
    },
    paymentStatus: { // Status of payment to the vendor
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    createdBy: { // User ID of the person who created the expense record
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: { // Timestamp for when the expense was created
        type: Date,
        default: Date.now,
    },
    updatedAt: { // Timestamp for when the expense was last updated
        type: Date,
    },
});

module.exports = mongoose.model('Expense', ExpenseSchema);
