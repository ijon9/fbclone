import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { createBrowserRouter, RouterProvider } from "react-router";
import { useNavigate } from 'react-router';


function EditProfile() {
  const navigate = useNavigate();
  const [profileImg, setProfileImg] = useState(null);
  const [img, setImg] = useState(null);
  const [postImgs, setPostImgs] = useState(null);
  const backendURL = import.meta.env.VITE_BACKEND_URL;

  

  const divStyle = {
    border: "1px solid black",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px"
  }

  const headingStyle = {
    marginTop: "0px"
  }
  
  return (
    <>
    <h1> FBClone </h1>
    <button onClick={() => navigate("/home")}>Home</button>
    <h2>Your Images</h2>
    <div style={divStyle}>  
        <h2 style={headingStyle}>Create new post</h2>
        <div>
            <label for="title">Title:</label>
            <input type="text" name="title" id="title" required /><br /><br />
            <h3>Add images</h3>
            <input type="file"  /><button>Add Img</button><br />

            <label for="content">Content:</label><br />
            <textarea id="content" name="content" rows="5" cols="100">
            </textarea><br />
            <button type="submit" onClick={() => createPost()}>Submit</button>
        </div>
    </div>
    <h2>Your Posts</h2>
    </>
  )
}

export default EditProfile
