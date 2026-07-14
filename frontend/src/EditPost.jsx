import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Fragment } from 'react';


function EditPost({ post, setPosts }) {
  const navigate = useNavigate();
  const [prevImgs, setPrevImgs] = useState([]);
  const [postImgs, setPostImgs] = useState([]);
  const [postPreviews, setPostPreviews] = useState([])
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const grab = async () => {
        const resp = await axios.get(backendURL+"/getImgs/"+post.id);
        if(resp.data.message === "Success") {
            setPrevImgs(resp.data.imgs)
        }
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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
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
        Images: <br />
        <div style={imgDiv}>
            {prevImgs.map((img, ind) => {
                return <div>
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
        <button onClick={() => saveChanges()}>Save Changes</button>
    </div>
    </>
  )
}

export default EditPost
