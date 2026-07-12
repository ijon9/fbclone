import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
// import { Fragment } from 'react';


function EditPost({ post }) {
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
        // console.log(resp2);
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        clearImages();
      } catch(e) {
        console.log("Error");
      }
    }
  }

  const outerDivStyle = {
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
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
        hour12: false
    });
    return longFormatter.format(date);
  }

  const innerDivStyle = {
    display: "flex",
    width: "100%",
    // alignItems: "space-between",
    justifyContent: "space-between"
  }

  return (
    <>
    <div style={outerDivStyle}>
       {/* <div> */}
            <div style={innerDivStyle}>
                <div>
                    <label for={"title"+post.id}>Title:</label>
                    <input type="text" id={"title"+post.id} defaultValue={post.title} placeholder={post.title}></input>
                </div>
                
                {formatDate(post.date)}
                <button>Delete Post</button>
            </div>
            Images: <br />
            <div style={imgDiv}>
                {prevImgs.map((img, ind) => {
                    return <div>
                        <img src={img.url} alt="temp" width="150px"></img>
                        <button>x</button>
                    </div>
                })}
            </div>
            <label for={"content"+post.id}>Content:</label>
            <textarea id={"content"+post.id} rows="5" cols="50" defaultValue={post.content} placeholder={post.content}>
            </textarea><br />
       {/* </div> */}
    </div>
    </>
  )
}

export default EditPost
