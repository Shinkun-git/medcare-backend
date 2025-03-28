import express from 'express';
import { getAllDoctors, getDoctors , findDoctorById, createDoctor } from '../services/doctorService.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
const router = express.Router();


router.get('/all', authenticateUser, async (req, res) => {
    try {
        const response = await getAllDoctors();
        if (response.success) {
            return res.status(200).send({ data: response.data });
        } else throw new Error('Error in get API');
    } catch (err) {
        console.log('Get api controller catch ', err);
        return res.status(400).send({ message: err.message || '' });
    }
});

router.get('/search' , async (req, res) => {
    try {
        const { page, limit, rating, experience, gender, searchQuery } = req.query;

        console.log(`Received Request => page: ${page}, limit: ${limit}, rating: ${rating}, experience: ${experience}, gender: ${gender}, searchQuery: ${searchQuery}`);

        const response = await getDoctors({
            searchQuery,
            page: parseInt(page, 10) || 1,
            limit: parseInt(limit, 10) || 6,
            rating: rating ? parseInt(rating, 10) : undefined,
            experience,
            gender
        });

        if (response.success) {
            return res.status(200).json({ data: response.data });
        } else {
            throw new Error('Error fetching doctors');
        }
    } catch (err) {
        console.error('Doctors API Error:', err);
        return res.status(400).json({ message: err.message || 'Something went wrong' });
    }
});


router.get('/searchDoctor/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const response = await findDoctorById(id);
        if (response.success) {
            return res.status(200).send({ data: response.data });
        } else throw new Error('Error in search API');
    } catch (err) {
        console.log('Search Doctor controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error in controller' });
    }
}
);

//admin only routes
router.post('/createDoctor', async (req, res) => {
    try{
        const response = await createDoctor(req.body);
        if(!response.success) throw new Error('Error in creating doctor');
        return res.status(200).send({data: response.data});
    } catch(err){
        console.log('Create doctor controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error in create doctor controller' });
    }
});



export default router;