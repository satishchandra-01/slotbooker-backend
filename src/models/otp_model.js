import { Schema, model } from 'mongoose';

const OtpSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: false, 
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpires: {
        type: Date,
        required: true,
    },
}, {timestamps: true});

export default model('Otp', OtpSchema);
