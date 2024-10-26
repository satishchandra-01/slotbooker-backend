import express from 'express';
import Room from '../models/room_model.js';
import authenticateJWT from '../middlewares/auth.js';


const roomRouter = express.Router();

roomRouter.get('/fetch', authenticateJWT, async (req, res) => {
    try{
        const rooms = await Room.find()
        return res.status(200).json({ rooms });
    } catch ( err ) {
        return res.status(400).json({code: "fetch_rooms_failed", error: 'Something went wrong. Please try again later' });
    }
})

roomRouter.post('/create', authenticateJWT, async (req, res) => {
    const role = req.role
    const userId = req.userId
    const {name, building_name, seats_count, available_seats} = req.body
    if( role == "user" ){
        return res.status(401).json({code: "create_rooms_failed", error: 'Only admin can create rooms' });
    }
    try{
        const test = await Room.findOne({name});
        if(test){
            return res.status(400).json({code: "create_rooms_failed", error: 'Room already exists, try with different name' });
        }
        const room = new Room({name, building_name, seats_count, available_seats, created_by: userId})
        await room.save();
        return res.status(200).json({ room });
    } catch ( err ) {
        return res.status(400).json({code: "create_rooms_failed", err });
    }
})

export default roomRouter;