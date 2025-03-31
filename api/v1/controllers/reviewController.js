import express from 'express';
import { addDoctorReview, getAllReviews, getDoctorReviews } from '../services/reviewServices.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
const router = express.Router();

router.get('/all',authenticateUser,async(req,res)=>{
    try{
        const response = await getAllReviews();
        if(!response.success) throw new Error('Response false from getAllReviews');
        return res.status(200).send({ data: response.data });
    } catch (err) {
        console.log('All Reviews controller catch ', err);
        return res.status(400).send({ message: err.message });
    }
})

router.get('/all/:id', authenticateUser,async (req, res) => {
    try {
        const { id } = req.params;
        const response = await getDoctorReviews(parseInt(id));
        if (!response.success) throw new Error(`Response false from getDoctorReviews`);
        return res.status(200).send({ data: response.data });
    } catch (err) {
        console.log('DoctorReviews controller catch ', err);
        return res.status(400).send({ message: err.message });
    }
})

router.post('/add', authenticateUser,async (req, res) => {
    try {
        const response = await addDoctorReview(req.body);
        if (!response.success) throw new Error('Response false from addDoctorReview')
        return res.status(200).send({ data: response.data });
    } catch (err) {
        console.log('DoctorReviews controller catch ', err);
        return res.status(400).send({ message: err.message });
    }
})


export default router;