import express from 'express';
import { getFilteredDoctors, searchDoctors, findDoctorById, getAllDoctors } from '../services/doctorService.js';
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

router.get('/', authenticateUser, async (req, res) => {
    try {
        const { page, limit, rating, experience, gender } = req.query;
        console.log(`=============>pges ${page} limit ${limit} rating ${rating} exp  ${experience} gen ${gender}`);
        const response = await getFilteredDoctors(parseInt(page, 10), parseInt(limit, 10), parseInt(rating[0]), experience, gender);
        if (response.success) {
            return res.status(200).send({ data: response.data });
        } else throw new Error('Error in get API');
    } catch (err) {
        console.log('Get api(filtered) controller catch ', err);
        return res.status(400).send({ message: err.message || '' });
    }
});

router.get('/searchDoctor', authenticateUser, async (req, res) => {
    try {
        const { page, limit, searchQuery } = req.query;
        // console.log('Search Query',searchQuery);
        const response = await searchDoctors(searchQuery, page, limit);
        if (response.success) {
            return res.status(200).send({ data: response.data });
        } else throw new Error('Error in search API');
    } catch (err) {
        console.log('Search Doctor controller catch ', err);
        return res.status(400).send({ message: err.message || '' });
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

export default router;