import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { Fragment } from 'react';


function ViewPost({ post, setPosts }) {
  const navigate = useNavigate();
  const [prevImgs, setPrevImgs] = useState([]);
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

  const textWrap = {
    overflowWrap: "break-word",
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
    </div>
    </>
  )
}

export default ViewPost
