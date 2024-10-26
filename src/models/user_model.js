import { Schema, model } from 'mongoose';
import { type } from 'os';

const UserSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    role: {
        type: String
    }
});

export default model('User', UserSchema);
