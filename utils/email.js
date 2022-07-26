const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

//new Email(user, url).sendWelcome();

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `CEO- Prosenjit- ${process.env.EMAIL_FROM}`;
    }

    newTransport() {
        if(process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        } else {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
                //Need to activate the less secure app option in Gmail.
            });
        }
    }

    //mail Template will be sent
    async send(template, subject) {
        // 1) Render HTML Based on a Pug Template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });
        // 2) Defined Email Options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        }

        // 3) create a transport and send Email
        await this.newTransport().sendMail(mailOptions); //since it is returning a promise, we need to define await

    }
    //Welcome Email send function
    async sendWelcome() {
        await this.send('welcome', 'Howdy! Heartiest Welcome!');
    }

    //Password Reset Email send function
    async sendPasswordReset() {
        await this.send('passwordReset', 'Your Password Reset Token. (Valid For Only 10 Minutes)');
    }
};

// const sendEmail = async options => {
//     // 1) Create a Transporter. Service that will send the email.
//     // const transporter = nodemailer.createTransport({
//     //     host: process.env.EMAIL_HOST,
//     //     port: process.env.EMAIL_PORT,
//     //     auth: {
//     //         user: process.env.EMAIL_USERNAME,
//     //         pass: process.env.EMAIL_PASSWORD
//     //     }
//     //     //Need to activate the less secure app option in Gmail.
//     // });
//     // 2) Define the Email Options
//     const mailOptions = {
//         from: 'Prosenjit Barman <hello@prosenb.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         //html:
//     }

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions) //since it is returning a promise, we need to define await
// }; //Configuring the Node mailer

