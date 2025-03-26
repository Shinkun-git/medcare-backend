import express from 'express';
import api from './api/index.js';
import 'dotenv/config';
import cors from "cors";
import cookieParser from 'cookie-parser';
const app = express();

app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:8080",
  ];
  
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: "GET,POST,PUT,DELETE",
      credentials: true
    })
  );

app.use('/api',api);


app.get('/', (req,res)=>{
    res.status(200).send({message: "Root Page"});
})

app.listen(process.env.PORT, ()=>{
    console.log('Server listening on port', process.env.PORT);
})