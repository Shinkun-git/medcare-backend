import express from 'express';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { getBookedSlots,requestSlot,declineOtherOverlapSlots,approveSlot, getAllSlots, declineSlot } from '../services/slotService.js';
const router = express.Router();

router.post('/book', async(req, res) => {
    try{
        const {doctorId, email, date, time, mode} = req.body;
        const response = await requestSlot(email, doctorId, time, date, mode);
        if(!response.success) throw new Error('Error in booking slot');
        return res.status(200).send({data: response.data});
    }catch(err){
        console.log('request slot controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error in slot request controller' });
    }
});



router.post('/approve', async (req, res) => {
    try{
        const response = await approveSlot(req.body);
        if(!response.success) throw new Error('Error in approving slot');
        return res.status(200).send({data: response.data});
    } catch(err){
        console.log('Approve slot controller catch ', err);
        return res.status(400).send({ message: err.message || 'Error in approve slot controller' });
    }
});

router.post('/bookedSlots', async(req,res)=>{
    try{
        const response = await getBookedSlots(req.body);
        if(!response.success) throw new Error(`Response false from getBookedSlots`);
        return res.status(200).send({data:response.data});
    }catch(err){
        console.log('bookedSlot controller catch ',err);
        return res.status(400).send({message:err.message});
    }
});

router.get('/all', async(req,res)=>{
    try{
        const response = await getAllSlots();
        if(!response.success) throw new Error('Response failed from getAllSlots');
        return res.status(200).send({data: response.data});
    }catch(err){
        console.log('getAllSlot controller catch ',err);
        return res.status(400).send({message:err.message});
    }
})

router.post('/cancel', async(req,res)=>{
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