import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { isAdmin } from '../../middleware/isAdmin.js';
import { getBookedSlots,requestSlot,declineOtherOverlapSlots,approveSlot, getAllSlots, declineSlot } from '../services/slotService.js';
const router = express.Router();

//util route
router.post('/bookedSlots', authenticateUser, async(req,res)=>{
    try{
        const response = await getBookedSlots(req.body);
        if(!response.success) throw new Error(`Response false from getBookedSlots`);
        return res.status(200).send({data:response.data});
    }catch(err){
        console.log('bookedSlot controller catch ',err);
        return res.status(400).send({message:err.message});
    }
});

//user route
router.post('/book', authenticateUser, async(req, res) => {
    try{
        const {doctorId, email, date, time, mode} = req.body;
        console.log("Date in controller ",date);
        const response = await requestSlot(email, doctorId, time, date, mode);
        if(!response.success) throw new Error('Error in booking slot');
        return res.status(200).send({data: response.data});
    }catch(err){
        console.log('request slot controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error in slot request controller' });
    }
});

//admin only routes
router.post('/approve', authenticateUser,isAdmin, async (req, res) => {
    try{
        const response = await approveSlot(req.body);
        if(!response.success) throw new Error('Error in approving slot');
        return res.status(200).send({data: response.data});
    } catch(err){
        console.log('Approve slot controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error in approve slot controller' });
    }
});

router.get('/all', authenticateUser,isAdmin,async(req,res)=>{
    try{
        const response = await getAllSlots();
        if(!response.success) throw new Error('Response failed from getAllSlots');
        return res.status(200).send({data: response.data});
    }catch(err){
        console.log('getAllSlot controller catch ',err);
        return res.status(400).send({message:err.message});
    }
})

router.post('/cancel',authenticateUser,isAdmin, async(req,res)=>{
    try{
        const response = await declineSlot(req.body);
        if(!response.success) throw new Error('Response failed from declineSlot');
        return res.status(200).send({data: response.data});
    } catch(err){
        console.log('declineSlot controller catch ',err);
        return res.status(400).send({message:err.message});
    }
})
export default router;