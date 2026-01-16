const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const codes = {}; // { email: code }

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post('/register-email', async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  if (!email || !password || !confirmPassword) {
    return res.json({ success: false, message: 'Все поля обязательны' });
  }
  if (password !== confirmPassword) {
    return res.json({ success: false, message: 'Пароли не совпадают' });
  }
  // Generate code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes[email] = code;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Код подтверждения регистрации',
      text: `Ваш код подтверждения: ${code}`,
      html: `<b>Ваш код подтверждения: ${code}</b>`
    });
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: 'Ошибка отправки email: ' + err.message });
  }
});

app.post('/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.json({ success: false, message: 'Email и код обязательны' });
  }
  if (codes[email] && codes[email] === code) {
    delete codes[email];
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: 'Неверный код' });
  }
});

app.listen(4000, () => {
  console.log('Email backend listening on http://localhost:4000');
}); 