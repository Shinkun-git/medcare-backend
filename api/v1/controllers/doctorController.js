import express from 'express';
import { getAllDoctors, getFilteredDoctors } from '../services/doctorService.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { page, limit, rating, experience, gender } = req.query;
        // console.log(`=============>pges ${page} limit ${limit} rating ${rating} exp  ${experience} gen ${gender}`);
        const response = await getFilteredDoctors(parseInt(page, 10), parseInt(limit, 10), rating,experience,gender);
        if (response.success) {
            return res.status(200).send({ data: response.data });
        } else throw new Error('Error in get API');
    } catch (err) {
        console.log('Get api(filtered) controller catch ', err);
        return res.status(400).send({ message: err.message || '' });
    }
})

export default router;