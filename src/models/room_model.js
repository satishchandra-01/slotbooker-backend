import { Schema, model } from 'mongoose';
import { type } from 'os';

const RoomSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    building_name: {
        type: String,
        required: true
    },
    created_by: {
        type: String,
        required: true
    },
    seats_count: {
        type: Number,
        required: true
    },
    available_seats: {
        type: Number,
        required: true
    }
});

export default model('Room', RoomSchema);
