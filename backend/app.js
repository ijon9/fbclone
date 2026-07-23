import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import { jwtDecode } from "jwt-decode";
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from "./lib/prisma.js";

// npx prisma studio --config ./prisma.config.js

// TODO
// Make pressing enter work
// Reload each page
// Check keys are unique for every page
// Check inputting empty image
// Check every button verifies user first
// Remove all console.logs
// Test synchronous interactions
//    ex: Two users sending friend requests at same time
//        Commenting or liking a deleted post
// Make testLogin() return user
// Get mutual friend count
// Add buttons to head bar
// Check imports are all used
// Delete sent friend request
// Verify userse at every interaction

// Mutual friends
// SELECT COUNT(f1.friend_id) AS mutual_friend_count
// FROM friendships f1
// JOIN friendships f2 
//     ON f1.friend_id = f2.friend_id
// WHERE f1.user_id = 1
//   AND f2.user_id = 2;
// ViewProfile friends and mutual friends
// Mutual friends

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

const deletePrevProfileImg = async (user) => {
  if(user.profileImg !== -1) {
    const oldPic = await prisma.image.findFirst({
      where: { id: user.profileImg }
    });
    const d = await cloudinary.uploader.destroy(oldPic.publicId, {
      invalidate: true
    });
    const d2 = await prisma.image.delete({
      where: {id : oldPic.id }
    });
    await prisma.user.update({
      where: {id : user.id},
      data: { profileImg: -1}
    })
  }
}

app.get("/getComments/:id", async (req, res) => {
  const postId = +req.params.id;
  try {
    const comments = await prisma.$queryRaw`
      SELECT c.id, u.name, c.content, c.date, i.url FROM 
      "User" u LEFT JOIN "Comment" c ON u.id = c."authorId" 
      LEFT JOIN "Image" i ON u."profileImg" = i.id
      WHERE c."postId" = ${postId} ORDER BY c.date DESC
    `;
    res.send({message: "Success", comments});
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
})

app.post("/createComment", async (req, res) => {
  const payload = req.body;
  try {
    const comm = await prisma.comment.create({
      data: {
        authorId: payload.userId,
        content: payload.content,
        postId: payload.postId
      }
    });
    res.send({message: "Success", comm});
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
})

app.delete("/deleteComment/:id", async (req, res) => {
  const commentId = +req.params.id;
  try {
    const comment = await prisma.comment.delete({
      where: { id: commentId }
    });
    res.send({message: "Success", comment})
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
  
})

app.get("/getUser/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findFirst({
      where: {id: +userId}
    });
    res.send({message: "Success", user});
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
})

app.delete("/deleteProfileImg/:id", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {id : +req.params.id}
    })
    await deletePrevProfileImg(user);
    res.send({message: "Success"})
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
  
})

app.get("/getProfileImg/:id", async(req, res) => {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findFirst({
      where: {id: +userId}
    });
    const profileImg = await prisma.image.findFirst({
      where: {id: user.profileImg}
    });
    res.send({message: "Success", profileImg});
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
})

app.post("/createProfileImg", async (req, res) => {
  const payload = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { id: payload.userId }
    })
    // If there already is a profileImg, delete it first
    await deletePrevProfileImg(user);
    // Upload picture to cloudinary and db and set profileImg to the new img id
    const img = await cloudinary.uploader.upload(payload.dataUrl, { resource_type: 'image' });
    const imgDb = await prisma.image.create({
        data: {
          publicId: img.public_id,
          url: img.secure_url,
          postId: -1
        }
    });
    await prisma.user.update({
      where: {id : user.id},
      data: { profileImg: imgDb.id }
    });
    res.send({message: "Success", profileImg: imgDb});
  } catch(e) {
    res.send({message: "Invalid query"});
  }
})

app.get("/getFriends/:id", async (req, res) => {
  const userId = +req.params.id;
  try {
    const friends = await prisma.$queryRaw`
      SELECT u.id,u.name,i.url FROM "User" u LEFT JOIN "Friendships" f ON u.id = f."userTwo"
      LEFT JOIN "Image" i ON u."profileImg" = i.id
      WHERE f."userOne" = ${userId} AND f.status = 'friends'
    `;
    res.send({message: "Success", friends});
  } catch(e) {
    console.log(e);
    res.send({message: 'Invalid query'});
  }
})

app.get("/getIncoming/:id", async (req, res) => {
  const userId = +req.params.id;
  try {
    const incoming = await prisma.$queryRaw`
      SELECT u.id,u.name,i.url FROM "User" u LEFT JOIN "Friendships" f ON u.id = f."userTwo"
      LEFT JOIN "Image" i ON u."profileImg" = i.id
      WHERE f."userOne" = ${userId} AND f.status = 'received'
    `;
    res.send({message: "Success", incoming});
  } catch(e) {
    console.log(e);
    res.send({message: 'Invalid query'});
  }
});

app.get("/getOutgoing/:id", async (req, res) => {
  const userId = +req.params.id;
  try {
    const outgoing = await prisma.$queryRaw`
      SELECT u.id,u.name,i.url FROM "User" u LEFT JOIN "Friendships" f ON u.id = f."userTwo"
      LEFT JOIN "Image" i ON u."profileImg" = i.id
      WHERE f."userOne" = ${userId} AND f.status = 'sent'
    `;
    res.send({message: "Success", outgoing});
  } catch(e) {
    console.log(e);
    res.send({message: 'Invalid query'});
  }
})

app.post("/acceptFriendReq", async (req, res) => {
  const payload = req.body;
  try {
    const dir1 = await prisma.friendships.findFirst({
      where: {userOne: payload.userOne, userTwo: payload.userTwo}
    });
    const dir2 = await prisma.friendships.findFirst({
      where: {userTwo: payload.userOne, userOne: payload.userTwo}
    });
    await prisma.friendships.update({
      where: {id: dir1.id},
      data: {status: "friends"}
    });
    await prisma.friendships.update({
      where: {id: dir2.id},
      data: {status: "friends"}
    });
    res.send({message: "Success", status: "friends"})
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
})

app.post("/denyFriendReq", async (req, res) => {
  const payload = req.body;
  try {
    const dir1 = await prisma.friendships.findFirst({
      where: {userOne: payload.userOne, userTwo: payload.userTwo}
    });
    const dir2 = await prisma.friendships.findFirst({
      where: {userTwo: payload.userOne, userOne: payload.userTwo}
    });
    await prisma.friendships.delete({
      where: { id: dir1.id}
    })
    await prisma.friendships.delete({
      where: { id: dir2.id }
    })
    res.send({message: "Success", status: "unsent"})
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
})

app.post("/sendFriendReq", async(req, res) => {
  const payload = req.body;
  try {
    await prisma.friendships.create({
      data: {
        userOne: payload.userOne,
        userTwo: payload.userTwo,
        status: "sent"
      }
    });
    await prisma.friendships.create({
      data: {
        userOne: payload.userTwo,
        userTwo: payload.userOne,
        status: "received"
      }
    });
    res.send({message: "Success", status: "sent"});
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
  
})

app.post("/searchUsers", async (req, res) => {
  const payload = req.body;
  try {
    const query = payload.query;
    const userId = payload.userId;
    // Try to do a join to get the image url
    // const users = await prisma.user.findMany({
    //   where: {
    //     AND: [
    //       {name: { contains: query, mode: 'insensitive'}}, 
    //       {id: {not: userId} }
    //     ]
    //   }
    // });
    const users = await prisma.$queryRaw`
      SELECT u.id, u.name, i.url
      FROM "User" u LEFT JOIN "Image" i ON i.id = u."profileImg"
      WHERE LOWER(u.name) LIKE LOWER('%' || ${query} || '%') AND u.id != ${userId}
    `;
    for(let i=0; i<users.length; i++) {
      const status = await prisma.friendships.findFirst({
        select: {
          status: true
        },
        where: {
          AND: [
            {userOne: userId},
            {userTwo: users[i].id}
          ]
        }
      });
      if(status === null) users[i].status = "unsent";
      else users[i].status = status.status;
    }
    return res.send({message: 'Success', users});
  } catch(e) {
    console.log(e);
    res.send({message: "Invalid query"});
  }
  
})

app.delete("/deletePost/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const imgs = await prisma.image.findMany({
      where: {postId : +postId}
    });
    for(let img of imgs) {
      const d = await cloudinary.uploader.destroy(img.publicId, {
        invalidate: true
      });
    }
    const deleteImgs = await prisma.image.deleteMany({
      where: {postId: +postId}
    })
    const delPost = await prisma.post.delete({
      where: {
        id: +postId
      }
    })
    // Delete Comments
    const deleteComments = await prisma.comment.deleteMany({
      where: {postId: +postId}
    });
    // Delete Likes
    return res.end({ message: "Success" });
  }
  catch(e) {
    return res.send({ message: "Invalid query" });
  }
})

app.delete("/deleteImage/:id", async (req, res) => {
  const imgId = req.params.id;
  try {
    const imgToDel = await prisma.image.findFirst({
      where: {id: +imgId}
    })
    const d = await cloudinary.uploader.destroy(imgToDel.publicId, {
      invalidate: true
    });
    const del = await prisma.image.delete({
      where: {id : +imgId}
    })
    return res.send({ message: "Success" });
  }
  catch(e) {
    return res.send({ message: "Invalid query" });
  }
})

app.post("/updatePost", async (req, res) => {
  const payload = req.body;
  try {
    const updatePost = await prisma.post.update({
      where: {id: payload.postId},
      data: {
        title: payload.title,
        content: payload.content
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
          postId: payload.postId
        }
      })
    }
    return res.send({post: updatePost, message: "Success"});
  } catch(e) {
    console.log(e);
    return res.send({ message: "Invalid query" });
  }
})

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