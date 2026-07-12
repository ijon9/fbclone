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

app.use(express.json({ limit: '50mb' }));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.post("/createPost", async (req, res) => {
  const payload = req.body;
  try {
    const post = await prisma.post.create({
      data: {
        title: payload.title,
        content: payload.content,
        userid: payload.userId
      }
    });

    const uploadPromises = payload.dataUrls.map(img => 
      cloudinary.uploader.upload(img, { resource_type: 'image' })
    );
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);
    const publicIds = results.map(result => result.public_id);
    for(let i=0; i<imageUrls.length; i++) {
      const img = await prisma.image.create({
        data: {
          publicId: publicIds[i],
          url: imageUrls[i],
          postId: post.id
        }
      })
    }
    // const d = await cloudinary.uploader.destroy(publicIds[1], {
    //   invalidate: true
    // });
    return res.send({post, message: "Success"});
  }
  catch(e) {
    return res.send({ message: "Invalid query" });
  }
})

// Order by date
app.get("/getYourPosts/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const posts = await prisma.post.findMany({
      where: {userid: +userId},
      orderBy: { date: 'desc' }
    });
    return res.send({posts, message: "Success"})
  } catch(e) {
    console.log(e);
    return res.send({message: "Invalid query" });
  }
})

app.get("/getImgs/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const imgs = await prisma.image.findMany({
      where: {postId : +postId}
    });
    return res.send({imgs, message: "Success"});
  } catch(e) {
    console.log(e);
    return res.send({message: "Invalid query"});
  }
})

// Object.keys(user).forEach(key => {
//   console.log(key);        // Logs: name, age, role
//   console.log(user[key]);  // Logs: Alice, 25, Admin
// });
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