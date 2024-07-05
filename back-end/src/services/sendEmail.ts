import nodemailer from 'nodemailer';
import { User } from '../User';
import 'dotenv/config'

export function sendEmails (users: User[], subject: string, bodyEmail: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SENDER_EMAIL_HOST,
        port: parseInt(process.env.SENDER_EMAIL_PORT),
        secure: parseInt(process.env.SENDER_EMAIL_PORT) === 465 ? true : false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.SENDER_EMAIL,
          pass: process.env.SENDER_EMAIL_PASSWORD,
        },
      });

    console.log(users);

    console.log('Sending emails to all adherents:', subject, bodyEmail);
    for (const user of users) {
        if (user?.guardians?.length > 0) {
            user.guardians.forEach(guardian => {

                const mailOptions = {
                    from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
                    to: guardian.email,
                    subject: subject,
                    text: bodyEmail
                }

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email:', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }
                });
            });
        }
            
        const mailOptions = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: subject,
            text: bodyEmail
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }
}