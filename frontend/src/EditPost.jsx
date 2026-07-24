import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Fragment } from 'react';
import ProfileImg from './ProfileImg';
import ReactTimeAgo from 'react-time-ago';



function EditPost({ profileImg, user, post, setPosts }) {
  const navigate = useNavigate();
  const [prevImgs, setPrevImgs] = useState([]);
  const [postImgs, setPostImgs] = useState([]);
  const [postPreviews, setPostPreviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const grab = async () => {
        const resp = await axios.get(backendURL+"/getImgs/"+post.id);
        if(resp.data.message === "Success") {
            setPrevImgs(resp.data.imgs)
        }
        const resp2 = await axios.get(backendURL+"/getComments/"+post.id);
        setComments(resp2.data.comments);
        const resp3 = await axios.get(backendURL+"/getLikes/"+post.id);
        setLikeCount(resp3.data.likes);
    };  
    grab();
  }, []);

  const handlePostImgChange = (e) => {
    const files = Array.from(e.target.files);
    setPostImgs(files);
    const filePreviews = files.map((file) => URL.createObjectURL(file));
    setPostPreviews(filePreviews);
  }

  const clearImages = function() {
    setPostImgs([]);
    setPostPreviews([]);
    document.getElementById("postImgs"+post.id).value = "";
  }

  const outerDivStyle = {
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
    borderRadius: "30px"
  }

  const imgDiv = {
    display: "flex"
  }

  function formatDate(d) {
    const date = new Date(d);
    const longFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    return longFormatter.format(date);
  }

  const innerDivStyle = {
    display: "flex",
    width: "100%",
    // alignItems: "space-between",
    justifyContent: "space-between"
  }

  async function deletePost(pid) {
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
      const resp2 = await axios.delete(backendURL+"/deletePost/"+post.id);
      setPosts((prev) => {
        return prev.filter(p => p.id !== post.id);
      })
    }
  }
  
  async function deleteImage(iid) {
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
      const resp2 = await axios.delete(backendURL+"/deleteImage/"+iid);
      setPrevImgs((prev) => {
        return prev.filter(i => i.id !== iid);
      })
    }
  }

  async function saveChanges() {
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
      alert("Please log in");
      navigate("/");
      return;
    }
    if (document.getElementById("title"+post.id).value === "") {
      alert('Please enter a title');
      return;
    }
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
        postId: post.id,
        dataUrls: dataUrls,
        title: document.getElementById("title"+post.id).value,
        content: document.getElementById("content"+post.id).value,
      };
      const resp2 = await axios.post(backendURL+"/updatePost", payload);
      setPosts((prev) => {
        const temp = [...prev];
        for(let i=0; i<temp.length; i++) {
          if(temp[i].id === resp2.data.post.id) {
            temp[i] = resp2.data.post;
          }
        }
        return temp;
      });
      const resp3 = await axios.get(backendURL+"/getImgs/"+post.id);
      if(resp.data.message === "Success") {
        setPrevImgs(resp3.data.imgs)
      }
      clearImages();
    } catch(e) {
      console.log(e);
    }
  }

  const nameAndPic = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flex: 1,
    cursor: "pointer"
  }

  const textWrap = {
    overflowWrap: "break-word",
    maxWidth: "100%",
  }

  async function deleteComment(id) {
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
      alert("Please log in");
      navigate("/");
      return;
    }
    const resp2 = await axios.delete(backendURL+"/deleteComment/"+id);
    setComments((prev) => {
      return prev.filter(c => c.id !== id);
    })
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Verify User
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
      alert("Please log in");
      navigate("/");
      return;
    }
    if(document.getElementById("epaddComm"+post.id).value === "") {
      alert("Please enter non empty value");
      return;
    }
    const payload = {
      userId: user.id,
      content: document.getElementById("epaddComm"+post.id).value,
      postId: post.id
    };
    const resp2 = await axios.post(backendURL+"/createComment", payload);
    document.getElementById("epaddComm"+post.id).value = "";
    // console.log(resp2.data.comments);
    if(resp2.data.comm === null) {
      alert("Post deleted");
      setPosts((prev) => prev.filter(p => p.id !== post.id));
      return;
    }
    const commentInfo = {
      id: resp2.data.comm.id,
      url: profileImg ? profileImg.url : null,
      name: user.name,
      authorId: user.id,
      content: resp2.data.comm.content,
      date: resp2.data.comm.date
    }
    setComments((prev) => {
      return [commentInfo, ...prev];
    })
  }

  function viewProfile(id) {
    if(id === user.id) {
      alert("Already on Edit Profile");
      return;
    }
    navigate('/viewProfile', {state: {id}})
  }


  return (
    <>
    <div style={outerDivStyle}>
        <div style={innerDivStyle}>
            <div>
                <label for={"title"+post.id}>Title:</label>
                <input type="text" id={"title"+post.id} defaultValue={post.title} placeholder={post.title}></input>
            </div>
            
            {formatDate(post.date)}
            <button onClick={() => deletePost()}>Delete Post</button>
        </div>
        <strong>Images:</strong> <br />
        <div style={imgDiv}>
            {prevImgs.map((img, ind) => {
                return <div key={"prevImgs"+img.id}>
                    <img src={img.url} alt="temp" width="150px"></img>
                    <button onClick={() => deleteImage(img.id)}>x</button>
                </div>
            })}
        </div>
        <h3>Add images</h3>
        <input id={"postImgs"+post.id} type="file" accept="image/*" onChange={handlePostImgChange} multiple/><br />
        <div>
          {postImgs.map((img, ind) => {
            return <Fragment key={"postImg"+ind}>
              {postImgs[ind].name}
              <img style={{width: "200px"}} src={postPreviews[ind]}></img>
            </Fragment>
          })}
          <button onClick={() => clearImages()}>Clear Images</button><br />
        </div>
        <label for={"content"+post.id}>Content:</label>
        <textarea id={"content"+post.id} rows="5" cols="50" defaultValue={post.content} placeholder={post.content}>
        </textarea><br />
        <div style={{width: '100%'}}>
          {comments.map((c) => {
            return <div style={{width: '75%'}} key={"epcomment"+c.id}>
              <div style={nameAndPic} onClick={() => viewProfile(c.authorId)}>
                {c.url !== null ? <ProfileImg src={c.url} /> 
                : <ProfileImg src={silhouette} />}
                <strong>{c.name}:</strong><p style={textWrap}>{c.content}</p>
              <strong><ReactTimeAgo date={c.date} locale="en-US" /></strong>
              <button onClick={() => deleteComment(c.id)}>x</button>
              </div>
            </div>
          })}
        </div>
        <div>Likes: {likeCount} </div>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input type="text" id={"epaddComm"+post.id}></input>
          <button type="submit">Add Comment</button>
        </form>
        <button onClick={() => saveChanges()}>Save Changes</button>
    </div>
    
    </>
  )
}

export default EditPost
