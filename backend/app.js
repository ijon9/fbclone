import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { jwtDecode } from "jwt-decode";
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'

// npx prisma studio --config ./prisma.config.js

// To correctly transmit an image, your <form> element
//  must include the enctype="multipart/form-data" attribute.
//   According to documentation on the MDN Web Docs File Input
//    Guide, this tells the browser to split the form fields into
//     separate "parts"

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.post("/upload", async (req, res) => {
  const str = req.body.str;
  try {
    const url = await cloudinary.uploader.upload(str, { resource_type: 'image' });
    console.log(url.secure_url);
  }
  catch(e) {
    console.log(e);
  }
  res.send("Success");
})

const PORT = process.env.PORT || 3000;;
app.listen(PORT, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Express app - listening on port ${PORT}!`);
});