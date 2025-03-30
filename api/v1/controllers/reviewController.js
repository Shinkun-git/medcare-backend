import express from 'express';
import { getDoctorReviews } from '../services/reviewServices.js';

const router = express.Router();

router.get('/all/:id', async(req,res)=>{
    try {
        const {id} = req.params;
        const response = await getDoctorReviews(parseInt(id));
        if(!response.success) throw new Error(`Response false from getDoctorReviews`);
        return res.status(200).send({data:response.data});
    } catch(err){
        console.log('DoctorReviews controller catch ',err);
        return res.status(400).send({message:err.message});
    }
})

export default router;