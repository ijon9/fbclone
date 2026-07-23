import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Fragment } from 'react';
import EditPost from './EditPost.jsx'
import silhouette from './silhouette.jpg'
import ProfileImg from './ProfileImg.jsx';

function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [newProfileImg, setNewProfileImg] = useState(null)
  const [newProfileImgPreview, setNewProfileImgPreview] = useState(null);
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
          // Grab profile img as well
          const resp3 = await axios.get(backendURL+'/getProfileImg/'+resp.data.user.id);
          setProfileImg(resp3.data.profileImg);
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

  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    setNewProfileImg(file);
    const filePreview = URL.createObjectURL(file);
    setNewProfileImgPreview(filePreview);
  }

  const createProfileImg = async () => {
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
      alert("Please log in");
      navigate("/");
    }
    if(newProfileImg === null) {
      alert("Please select an image");
      return;
    }
    const filePromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(newProfileImg)
    });
    const dataUrl = await filePromise;
    try {
      const resp2 = await axios.post(backendURL+"/createProfileImg", {dataUrl, userId: user.id})
      setProfileImg(resp2.data.profileImg);
      clearProfileImg();
    } catch(e) {
      console.log(e);
    }
  }

  const deleteProfileImg = async () => {
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
      alert("Please log in");
      navigate("/");
    }
    try {
      const resp2 = await axios.delete(backendURL+"/deleteProfileImg/"+user.id);
      setProfileImg(null);
    } catch(e) {
      console.log(e);
    }
  }

  const clearProfileImg = function() {
    setNewProfileImg(null);
    setNewProfileImgPreview(null);
    document.getElementById("profileImg").value = "";
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

  function logOut() {
    localStorage.removeItem('token');
    navigate('/');
  }
  
  return (
    <>
    <h1> FBClone </h1>
    <button onClick={() => navigate("/home")}>Home</button>
    <button onClick={() => navigate('/manageRequests')}>Manage Requests</button>
    <button onClick={() => logOut()}>Log Out</button><br />
    {user && <p><strong>Welcome, {user.name}</strong></p>}
    {profileImg ? <ProfileImg src={profileImg.url}/> : <ProfileImg src={silhouette}/>}
    <input id="profileImg" type="file" accept="image/*" onChange={handleProfileImgChange} />
    {newProfileImgPreview && <ProfileImg src={newProfileImgPreview} />}<button onClick={clearProfileImg}>Clear Image</button>
    <br />
    <button onClick={createProfileImg}>Submit Image</button>
    <button onClick={deleteProfileImg}>Delete Image</button><br /><br />
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
            <textarea id="content" name="content" rows="5" cols="50">
            </textarea><br />
            <button type="submit" onClick={() => createPost()}>Submit</button>
        </div>
    </div>
    <h2>Your Posts</h2>

    <div style={editPostStyle}>
        {yourPosts.map((post) => {
          return <EditPost profileImg={profileImg} user={user} post={post} setPosts={setYourPosts} key={"editPost"+post.id}/>
        })}
    </div>
    </>
  )
}

export default EditProfile
