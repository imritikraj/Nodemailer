require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const Mail = require('./mail');
const otpStorage = require('./otpStorage');
var cookieParser = require('cookie-parser');

app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
let db = [
    { email: 'imritikraj0@gmail.com', password: '123456', name: 'Ritik Raj' },
];

let generateOTP = () => {
    return crypto.randomInt(100000, 999999);
}

app.get('/', (req, res) => {
    let cookie = req.cookies['isLoggedIn'] ? JSON.parse(req.cookies['isLoggedIn']) : null;
    if (!cookie) {
        return res.redirect('/login');
    }
    res.render('index');
});

app.route('/login')
    .get((req, res) => {
        res.render('login');
    })
    .post((req, res) => {
        const { email, password } = req.body;
        const user = db.find(user => user.email === email && user.password === password);
        if (user) {
            console.log('User found:', user);
            res.cookie('isLoggedIn', 'true');
            return res.redirect('/');
        } else {
            console.log('Invalid credentials');
            return res.status(401).send('Invalid credentials');
        }
    });
    
app.get('/logout', (req, res) => {
    res.clearCookie('isLoggedIn');
    res.redirect('/login');
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

app.get('/verify-otp', (req, res) => {
    const email = req.query.email;
    const error = req.query.error;
    res.render('verify-otp', { email, error });
});




app.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    // Corrected: Check if the email exists in the db, not just if it is included as a string.
    if (email && db.find(user => user.email === email)) {
        let otp = generateOTP(); // Corrected: Function name typo corrected to generateOTP.
        otpStorage.set(email, otp);
        let forget_pass_template = fs.readFileSync(path.join(__dirname, 'forgotPassword.html'), 'utf-8'); // Corrected: Filename typo corrected to forgotPassword.html.
        forget_pass_template = forget_pass_template.replace('{{user_name}}', email);
        forget_pass_template = forget_pass_template.replace('{{OTP_CODE}}', otp);
        let mail = new Mail();
        mail.setReceiver(email);
        mail.setSubject("Password Reset");
        mail.setHTML(forget_pass_template);
        mail.send()
            .then((result) => {
                res.render('verify-otp', { email: email });
            })
            .catch((error) => {
                console.log(error);
                res.status(500).send("Internal Server Error");
            });
    } else {
        res.status(400).json({ message: "Invalid Email" });
    }
});

setInterval(() => {
    console.log(otpStorage.getAll())
}, 10000)

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    console.log(email, otp);

    if (otpStorage.verify(email, otp)) {
        console.log('verified');
        res.cookie('isLoggedIn', 'true');
        res.redirect('/'); // Adjust this to the appropriate page you want to render after successful verification
    } else {
        const error = 'Invalid OTP';
        res.redirect(`/verify-otp?email=${email}&error=${encodeURIComponent(error)}`);
    }
});


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}`));