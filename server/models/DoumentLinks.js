const mongoose = require('mongoose');
const {Schema} = mongoose;

const DocsSchema = new Schema({
    name:{
        type: String,
    },
    link:{
        type: String,
    }
});

module.exports = mongoose.model('docslink',DocsSchema)