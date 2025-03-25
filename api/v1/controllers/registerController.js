import express from 'express';

import { registerService } from '../services/registerService.js';

const router = express.Router();

router.post('/', async(req,res)=>{
    try{
        const response = await registerService(req.body);
        if(response.success){

            res.cookie("token", response.data.token, {
                httpOnly: true,  // Prevents JavaScript access (XSS protection)
                secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
                sameSite: "Lax",  // Prevent CSRF attacks
                maxAge: 3600000,  // 1 hour expiration
            });

            return res
            .status(201)
            .send({message: response.message, data: response.data});
        } else throw new Error('response success false');
    } catch (err) {
        console.log('post register api controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error while creating user' });
    }
})

export default router;