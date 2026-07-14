import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Fragment } from 'react';
import EditPost from './EditPost.jsx'


function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [postImgs, setPostImgs] = useState([]);
  const [postPreviews, setPostPreviews] = useState([])
  const [yourPosts, setYourPosts] = useState([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const grab = async () => {
      const t = localStorage.getItem('token');
      const resp = await axios.get(backendURL+'/verifyUser', {headers: {
        'Authorization': `Bearer ${t}`
      }});
      
      const loginMsg = resp.data.message;
      if(loginMsg === "Invalid token") {
          alert("Please log in");
          navigate('/');
      }
      else {
          setUser(resp.data.user);
          const resp2 = await axios.get(backendURL+'/getYourPosts/'+resp.data.user.id);
          // GET POSTS MOST RECENT FIRST
          setYourPosts(resp2.data.posts);
      }
    };
    grab();
  }, []);
  

  const divStyle = {
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  }

  const headingStyle = {
    marginTop: "0px"
  }

  const handlePostImgChange = (e) => {
    const files = Array.from(e.target.files);
    setPostImgs(files);
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPostPreviews(filePreviews);
  }

  const clearImages = function() {
    setPostImgs([]);
    setPostPreviews([]);
    document.getElementById("postImgs").value = "";
  }

  const createPost = async function() {
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
      alert("Please log in");
      navigate("/");
    }
    else {
      setUser(resp.data.user);
    }

    if (document.getElementById("title").value === "") alert('Please enter a title');
    else {
      const filePromises = postImgs.map((img) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(img);
        });
      });
      const fileNames = postImgs.map((img) => {
        return img.name;
      })
      try {
        const dataUrls = await Promise.all(filePromises);
        const payload = {
          dataUrls: dataUrls,
          title: document.getElementById("title").value,
          content: document.getElementById("content").value,
          userId: resp.data.user.id
        };
        const resp2 = await axios.post(backendURL+'/createPost', payload);
        // ADD NEW POST TO YOURPOSTS
        setYourPosts((prev) => [resp2.data.post, ...prev]);
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        clearImages();
      } catch(e) {
        console.log("Error");
      }
    }
  }
  const editPostStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  }
  
  return (
    <>
    <h1> FBClone </h1>
    <button onClick={() => navigate("/home")}>Home</button>
    <div style={divStyle}>  
        <h2 style={headingStyle}>Create new post</h2>
        <div>
            <label for="title">Title:</label>
            <input type="text" name="title" id="title" required /><br /><br />
            <h3>Add images</h3>
            <input id="postImgs" type="file" accept="image/*" onChange={handlePostImgChange} multiple/><br />
            <div>
              {postImgs.map((img, ind) => {
                return <Fragment key={"postImg"+ind}>
                  {postImgs[ind].name}
                  <img style={{width: "200px"}} src={postPreviews[ind]}></img>
                </Fragment>
              })}<br />
            </div>
            <button onClick={() => clearImages()}>Clear Images</button><br />
            
            <label for="content">Content:</label><br />
            <textarea id="content" name="content" rows="5" cols="100">
            </textarea><br />
            <button type="submit" onClick={() => createPost()}>Submit</button>
        </div>
    </div>
    <h2>Your Posts</h2>

    <div style={editPostStyle}>
        {yourPosts.map((post) => {
          return <EditPost post={post} setPosts={setYourPosts} key={"editPost"+post.id}/>
        })}
    </div>
    </>
  )
}

export default EditProfile
