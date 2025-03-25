import express from 'express';

import { registerService ,loginService} from '../services/registerService.js';

const router = express.Router();

router.post('/register', async(req,res)=>{
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


router.post('/login', async(req,res)=>{
    try{
        const response = await loginService(req.body);
        if(response.success){

            res.cookie("token", response.data.token, {
                httpOnly: true,  // Prevents JavaScript access (XSS protection)
                secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
                sameSite: "Lax",  // Prevent CSRF attacks
                maxAge: 3600000,  // 1 hour expiration
            });

            return res
            .status(200)
            .send({message: response.message, data: response.data});
        } else throw new Error('response success false');
    } catch (err) {
        console.log('post login api controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error while login' });
    }
});

router.post("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: "Strict",
        expires: new Date(0), // 🔥 Expire immediately
        path: "/", // ✅ Ensures cookie is cleared for all paths
    });

    return res.status(200).json({ message: "Logged out successfully" });
});


export default router;