import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Fragment } from 'react';
import silhouette from './silhouette.jpg'
import ProfileImg from './ProfileImg';
import ReactTimeAgo from 'react-time-ago';


function ViewPost({ profileImg, user, post, setPosts }) {
  const navigate = useNavigate();
  const [prevImgs, setPrevImgs] = useState([]);
  const [comments, setComments] = useState([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const grab = async () => {
      const resp = await axios.get(backendURL+"/getImgs/"+post.id);
      if(resp.data.message === "Success") {
          setPrevImgs(resp.data.imgs)
      }
      const resp2 = await axios.get(backendURL+"/getComments/"+post.id);
      setComments(resp2.data.comments);
    };  
    grab();
  }, []);

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
        year: 'numeric',
        month: 'numeric',
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

  const textWrap = {
    overflowWrap: "break-word",
    maxWidth: "100%",
  }

  const handleSubmit = async function(e) {
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
    const payload = {
      userId: user.id,
      content: document.getElementById("addComm"+post.id).value,
      postId: post.id
    };
    const resp2 = await axios.post(backendURL+"/createComment", payload);
    document.getElementById("addComm"+post.id).value = "";
    // console.log(resp2.data.comments);
    const commentInfo = {
      id: resp2.data.comm.id,
      url: profileImg ? profileImg.url : null,
      name: user.name,
      content: resp2.data.comm.content,
      date: resp2.data.comm.date
    }
    setComments((prev) => {
      return [commentInfo, ...prev];
    })
  }

  const nameAndPic = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flex: 1,
  }

  return (
    <>
    <div style={outerDivStyle}>
        <div style={innerDivStyle}>
            <div>
                <strong>Title:</strong> {post.title}
            </div>
            {formatDate(post.date)}
        </div>
        <strong>Images:</strong> <br />
        <div style={imgDiv}>
            {prevImgs.map((img, ind) => {
                return <div key={"prevImgs"+img.id}>
                    <img src={img.url} alt="temp" width="150px"></img>
                </div>
            })}
        </div>
        <strong>Content:</strong>
        <div style={{width: '100%'}}>
            <p style={textWrap}>{post.content}</p>
        </div>
        <strong>Comments:</strong>
        <div style={{width: '100%'}}>
          {comments.map((c) => {
            return <div style={{width: '80%'}} key={"comment"+c.id}>
              <div style={nameAndPic}>
                {c.url !== null ? <ProfileImg src={c.url} /> 
                : <ProfileImg src={silhouette} />}
                <strong>{c.name}:</strong><p style={textWrap}>{c.content}</p>
              <strong><ReactTimeAgo date={c.date} locale="en-US" /></strong>

              </div>
            </div>
          })}
        </div>
        <form onSubmit={(e) => handleSubmit(e)}>
          <input type="text" id={"addComm"+post.id}></input>
          <button type="submit">Add Comment</button>
        </form>
    </div>
    </>
  )
}

export default ViewPost
