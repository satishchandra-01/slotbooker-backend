import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user_model.js';
import Otp from '../models/otp_model.js';
import jwt from 'jsonwebtoken';
import authenticateJWT from '../middlewares/auth.js';
import userValidators from '../validators/user_validator.js';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

const { registerValidator, loginValidator } = userValidators;
import handleValidationErrors from '../validators/validation_result.js'

const JWT_SECRET = 'your_jwt_secret';

const userRouter = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    service: 'Gmail',
    auth: {
        user: 'slotbookers@gmail.com',
        pass: 'qodvncfumcpuotyq'
    }
});
userRouter.get('/test', async (req, res) => {
    res.status(200).json({ code: "user_test_success", message: 'User registered successfully' });
})

userRouter.post('/register', [...registerValidator], handleValidationErrors, async (req, res) => {
    const { name, email, password, otp, role } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ code: "user_registration_failed", error: 'No OTP found for this email. Please request OTP again.' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ code: "user_registration_failed", error: 'Invalid OTP.' });
        }

        if (otpRecord.otpExpires < Date.now()) {
            return res.status(400).json({code: "user_registration_failed", error: 'Invalid Session. Please try again' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ code: "user_registration_failed", error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        const savedUser = await User.findOne({email})
        const token = jwt.sign({ id: savedUser._id }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ code: "user_registration_success", message: 'User registered successfully', token: token });
    } catch (error) {
        res.status(500).json({ code: "user_registration_failed", error: error });
    }
});

userRouter.post('/verify/email', async (req, res) => {
    const { email } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if(userExists) {
            res.status(200).json({ code: "user_verification_success", isUserRegistered: true });
        } else {
            res.status(404).json({ code: "user_verification_failed", isUserRegistered: false });
        }
    } catch (error) {
        res.status(500).json({ code: "user_registration_failed", error: error });
    }
});

userRouter.post('/login', [...loginValidator], handleValidationErrors, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ code: "user_login_failed", error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ code: "user_login_failed", error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ code: "user_login_success", token: token });
    } catch (error) {
        res.status(500).json({ code: "user_login_failed", message: error });
    }
});

userRouter.post('/verify/otp', authenticateJWT, async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ code: "otp_verification_failed", error: 'No OTP found for this email. Please request OTP again.' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ code: "otp_verification_failed", error: 'Invalid OTP.' });
        }

        if (otpRecord.otpExpires < Date.now()) {
            return res.status(400).json({code: "otp_verification_failed", error: 'Invalid Session. Please try again' });
        }
        res.status(200).json({ code: "otp_verification_success", isVerified: true });
    } catch (error) {
        res.status(500).json({ code: "otp_verification_failed", error: error });
    }
});

userRouter.post('/verify', authenticateJWT, async (req, res) => {
    const userId = req.userId;    
    const user = await User.findById(userId)
    if (!user) return res.status(400).json({ code: "user_verification_failed", error: 'Invalid user' });
    try {
        res.status(200).json({ code: "user_verification_success", token: userId, name: user.name });
    } catch (error) {
        res.status(500).json({ code: "user_verification_failed", error: error });
    }
});

userRouter.post('/sendotp', async (req, res) => {
    const { email } = req.body;
    try {
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        const otpExpires = Date.now() + 10 * 60 * 1000;

        await Otp.create({
            email,
            otp,
            otpExpires: new Date(otpExpires),
        });

        const mailOptions = {
            from: 'slotbookers@gmail.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending OTP', error });
            }
            res.status(200).json({ message: 'OTP sent successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating OTP', error });
    }
});

userRouter.post('/verifyotp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
});

userRouter.get('/password/reset/:email', async (req, res) => {
    const email = req.params['email']
    const link = `http://localhost:3000/reset/password/${email}`
    try {
        const mailOptions = {
            from: 'slotbookers@gmail.com',
            to: email,
            subject: 'Reset Your Password',
            text: `Please use the below link to reset your account password\n${link}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending password reset mail', error });
            }
            res.status(200).json({ message: 'Passowrd reset mail sent successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error sending password reset mail', error });
    }
});

userRouter.post('/password/reset/:email', async (req, res) => {
    const email = req.params['email']
    const { password } = req.body

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword
        await user.save();
        res.status(200).json({ message: 'Password Reset Successfull' });
    } catch (error) {
        res.status(500).json({ message: 'Password Reset Failed', error });
    }
});



export default userRouter;