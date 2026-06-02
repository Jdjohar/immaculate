const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    try {
        const transporter1 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "Immacltd23@gmail.com",
                pass: "hulocvtjdutgnysr"
            },
        });
        
        await transporter1.verify();
        console.log("Transporter 1 (old pass) is valid");
    } catch (e) {
        console.error("Transporter 1 (old pass) failed:", e.message);
    }

    try {
        const transporter2 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
        });
        
        await transporter2.verify();
        console.log("Transporter 2 (env pass) is valid");
    } catch (e) {
        console.error("Transporter 2 (env pass) failed:", e.message);
    }
}

testEmail();
