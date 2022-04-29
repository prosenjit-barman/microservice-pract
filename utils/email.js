const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a Transporter. Service that will send the email.
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
        //Need to activate the less secure app option in Gmail.
    });
    // 2) Define the Email Options
    const mailOptions = {
        from: 'Prosenjit Barman <hello@prosenb.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions) //since it is returning a promise, we need to define await
}; //Configuring the Node mailer

module.exports = sendEmail;