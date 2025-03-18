const mongoose = require('mongoose');
const {Schema} = mongoose;

const InvoiceSchema = new Schema({
    // unique_id: { type: Number, unique: true },
    invoice_id: { type: Number },
    InvoiceNumber: { 
        type: String 
    },
    customername: {
        type: String,
    },
    financialYear: {
        type: String,  // Format: "2023-2024"
        index: true    // Adding index for better query performance
    },
    job: {
        type: String,
    },
    customeremail: {
        type: String,
    },
    customerphone: {
        type: String,
    },
    emailsent: {
        type: String,
        default:'no'
    },
    purchaseorder: {
        type: String,
    },
    date: {
        type: Date,
    },
    duedate: {
        type: Date,
    },
    description: {
        type: String,
    },
    items: [],
    subtotal: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        default: 0,
    },
    amountdue: {
        type: Number,
        default: 0,
    },
    discountTotal: {
        type: String,
    },
    TaxPer: {
        type: String,
    },
    information: {
        type: String,
    },
    tax: {
        type: String,
    },
    taxpercentage: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        default: 'Saved',
    },
    userid:{
        type: String,
    },
    noteimageUrl:{
        type: String,
    },
    isAddSignature: { 
        type: Boolean, 
        default: false 
    },
    isCustomerSign: { 
        type: Boolean, 
        default: false 
    }, 
    createdAt: {
        type: Date,
        default: Date.now,
    }
    

});
InvoiceSchema.pre('save', function(next) {
    if (this.date) {
        const date = new Date(this.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        // Assuming financial year starts April 1st (adjust as per your needs)
        this.financialYear = month >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }
    next();
});

module.exports = mongoose.model('Invoice',InvoiceSchema)