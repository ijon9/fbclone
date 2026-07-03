import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { jwtDecode } from "jwt-decode";
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from "./lib/prisma.js";

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

app.get("/verifyUser", (req, res) => {
  var token = req.get('Authorization');
  token = token.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    return res.send({message: "Success", user: jwtDecode(token)});
  } catch(e) {
    return res.send({message: "Invalid token"});
  }
  res.send({message : "Success"});
})

app.post('/logIn', async (req, res) => {
  const payload = req.body;
  const user = await prisma.user.findUnique({
    // where: { email: payload.email },
    where: { email: payload.email },
  })
  if(!user) {
    return res.send({ message: "Incorrect email" });
  }
  const match = await bcrypt.compare(payload.password, user.password);
  if(!match) {
    return res.send( { message: "Incorrect password" });
  }
  const token = jwt.sign(user, process.env.SECRET_KEY, {expiresIn: "1h" });
  return res.send( { message: "Success", token: token} );
});

app.post('/signUp', async (req, res) => {
  const payload = req.body;
  console.log(payload);
  const hashed = await bcrypt.hash(payload.password, 10);
  try {
    if(payload.password === '' || payload.email === '' || payload.name === '') throw new Error("Empty field");
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashed,
        name: payload.name,
        profileImg: -1
      }
    });
  } catch(e) {
    if(e.message === "Empty field") return res.send("Empty field");
    return res.send("Email already exists");
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