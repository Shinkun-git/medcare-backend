import express from 'express';
import api from './api/index.js';
import 'dotenv/config';
const app = express();

app.use('/api',api);


app.get('/', (req,res)=>{
    res.status(200).send({message: "Root Page"});
})

app.listen(process.env.PORT, ()=>{
    console.log('Server listening on port', process.env.PORT);
})