const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    secure: false,
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

class Mail {
    constructor() {
        this.mailOptions = {
            from: {
                address: process.env.EMAIL,
                name: "Ultimate Coding Beast"
            },
            to: [],
            cc: [],
            bcc: [],
            attachments: []
        };
    }

    setCompanyName(name) {
        this.mailOptions.from.name = name;
    }

    setSenderEmail(email) {
        this.mailOptions.from.address = email;
    }

    setReceiver(receiver) {
        if (Array.isArray(receiver)) {
            this.mailOptions.to.push(...receiver);
        } else {
            this.mailOptions.to.push(receiver);
        }
    }

    setCC(cc) {
        if (Array.isArray(cc)) {
            this.mailOptions.cc.push(...cc);
        } else {
            this.mailOptions.cc.push(cc);
        }
    }

    setBCC(bcc) {
        if (Array.isArray(bcc)) {
            this.mailOptions.bcc.push(...bcc);
        } else {
            this.mailOptions.bcc.push(bcc);
        }
    }

    setSubject(subject) {
        this.mailOptions.subject = subject;
    }

    setText(text) {
        this.mailOptions.text = text;
    }

    setHTML(html) {
        this.mailOptions.html = html;
    }

    setAttachment(attachment) {
        if (Array.isArray(attachment)) {
            this.mailOptions.attachments.push(...attachment);
        } else {
            this.mailOptions.attachments.push(attachment);
        }
    }

    send() {
        return new Promise((resolve, reject) => {
            transporter.sendMail(this.mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    }
}

module.exports = Mail;
