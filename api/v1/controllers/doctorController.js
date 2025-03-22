import express from 'express';
import { getAllDoctors } from '../services/doctorService.js';

const router = express.Router();

router.get('/', async(req,res) =>{
    try {
        const response = await getAllDoctors();
        if(response.success){
            return res.status(200).send({data: response.data});
        } else throw new Error('Error in get API');
    } catch (err){
        console.log('Get api controller catch ',err);
        return res.status(400).send({message: err.message || ''});
    }
})

export default router;