import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import silhouette from './silhouette.jpg'
import ProfileImg from './ProfileImg';
import ViewPost from './ViewPost';


// export default FileUploader;

function Home() {
  const [user, setUser] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [posts, setPosts] = useState([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();


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
          return;
      }
      setUser(resp.data.user);
      const resp2 = await axios.get(backendURL+"/getProfileImg/"+resp.data.user.id);
      setProfileImg(resp2.data.profileImg)
      const resp3 = await axios.get(backendURL+"/getPostsHome/"+resp.data.user.id);
      setPosts(resp3.data.posts);
    };
    grab();
  }, []);
  
  function logOut() {
    localStorage.removeItem('token');
    navigate('/');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = localStorage.getItem('token');
    const resp = await axios.get(backendURL+'/verifyUser', {headers: {
      'Authorization': `Bearer ${t}`
    }});
    const loginMsg = resp.data.message;
    if(loginMsg === "Invalid token") {
        alert("Please log in");
        navigate('/');
        return;
    }
    // const query = document.getElementById("findUser").value;
    // const resp2 = await axios.post(backendURL+"/searchUsers", {query, userId: user.id});
    navigate('/searchUsers', {state: {query: document.getElementById("findUser").value }});
  }

  const postDivStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  }

  return (
    <>
    <h1>FBClone</h1>
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
    <button onClick={() => navigate('/manageRequests')}>Manage Requests</button>
    <button onClick={() => logOut()}>Log Out</button><br />
    <h2>{profileImg ? <ProfileImg src={profileImg.url}/> : <ProfileImg src={silhouette}/>}Welcome, {user === null ? "" : user.name}</h2>
    <form onSubmit={handleSubmit}>
      <input type="text" id="findUser"></input><button type="submit">Search User</button><br />
    </form><br />
    <h2 style={{textAlign: "center"}}>Feed</h2>
    <div style={postDivStyle}>
      {posts.length === 0 ? <strong style={{textAlign: "center"}}>Add friends to generate a feed!</strong> 
      : posts.map((p) => {
        return <ViewPost profileImg={profileImg} user={user} post={p} page={"Home"} setPosts={setPosts} key={"viewPostHome"+p.id} />
      })}
    </div>
    
    </>
  )
}

export default Home
