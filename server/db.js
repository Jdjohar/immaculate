const mongoose = require('mongoose');
// const mongoURI = 'mongodb+srv://grithomesonline:grithomes@cluster0.qctzpfr.mongodb.net/grithomes?retryWrites=true&w=majority&appName=Cluster0';
const mongoURI = 'mongodb+srv://Immaculate:vgCdQPhiNFB35uEW@cluster0.gywcq.mongodb.net/Immaculate?retryWrites=true&w=majority&appName=Cluster0';

const mongoDB = async() => {
    mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true},async (err, result) => {
    if(err) console.log('Some Error -- ', err)
        else { 
             const fetch_data = await mongoose.connection.db.collection("users");
    console.log("connect");
        }
    })
   
}


module.exports = mongoDB;