const express = require('express')
const app = express()
const port = 3001
const mongoDB = require("./db")
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
var path = require('path');
const { job } = require('./cron');
mongoDB();

// Set maximum payload size limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Start the cron job
job.start();

app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "https://restro-wbno.vercel.app");
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  const corsWhitelist = [
    "https://immaculate-beta.vercel.app",
    'http://localhost:5173'
];
if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, X-Requested-With, Accept");
}
  
  next();
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json())
app.use('/api', require("./Routes/CreateUser"));
// app.use('/api', require("./Routes/Createcategory"));
app.use('/api', require("./Routes/DisplayData"));
app.use('/api', require("./Routes/OrderData"));
app.use('/api', require("./Routes/TestApi"));
app.use('/api', require("./Routes/ForgotPassword"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})




// server/index.js
// const express = require('express');
// const path = require('path');
// const bodyParser = require('body-parser');

// const connectDB = require('./db'); // see recommended db.js below
// const createUser = require('./Routes/CreateUser');
// const displayData = require('./Routes/DisplayData');
// const orderData = require('./Routes/OrderData');
// const testApi = require('./Routes/TestApi');
// const forgotPassword = require('./Routes/ForgotPassword');
// // const { job } = require('./cron'); // DO NOT start cron here (see notes)

// const app = express();

// // JSON/body limits
// app.use(bodyParser.json({ limit: '10mb' }));
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// // Connect DB once per cold start (cached in db.js)
// connectDB().catch(err => {
//   // don't crash UI — log and let function return errors on request handlers
//   console.error('DB connect error:', err);
// });

// // CORS — whitelist logic
// app.use((req, res, next) => {
//   const corsWhitelist = [
//     'https://immaculate-beta.vercel.app',
//     'http://localhost:5173'
//   ];
//   const origin = req.headers.origin;
//   if (origin && corsWhitelist.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
//   }
//   // Allow preflight
//   if (req.method === 'OPTIONS') return res.sendStatus(204);
//   next();
// });

// // Static files — note: the Vercel runtime file-system is ephemeral/read-only for writes
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('/', (req, res) => res.send('API running'));

// // Routes
// app.use(express.json());
// app.use('/api', createUser);
// app.use('/api', displayData);
// app.use('/api', orderData);
// app.use('/api', testApi);
// app.use('/api', forgotPassword);

// // Export the app for @vercel/node (DO NOT app.listen)
// module.exports = app;
