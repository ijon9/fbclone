import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router';
import { Fragment } from 'react';
import EditPost from './EditPost.jsx'
import silhouette from './silhouette.jpg'
import ProfileImg from './ProfileImg.jsx';
import ViewPost from './ViewPost.jsx';

function ViewProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [user2Id, setUser2Id] = useState(location.state?.id === undefined ? null : location.state?.id);
  const [user2, setUser2] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [userProfileImg, setUserProfileImg] = useState(null);
  const [posts, setPosts] = useState([]);
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
        return;
      }
      setUser(resp.data.user);
      const resp2 = await axios.get(backendURL+'/getUser/'+user2Id);
      if(resp2.data.user === undefined) {
        navigate('/home');
        return;
      }
      setUser2(resp2.data.user);
      const resp3 = await axios.get(backendURL+'/getYourPosts/'+user2Id);
      // GET POSTS MOST RECENT FIRST
      setPosts(resp3.data.posts);
      // Grab profile img as well
      const resp4 = await axios.get(backendURL+'/getProfileImg/'+user2Id);
      setProfileImg(resp4.data.profileImg);
      // User profile img
      const resp5 = await axios.get(backendURL+'/getProfileImg/'+resp.data.user.id);
      setUserProfileImg(resp5.data.profileImg);
    };
    grab();
  }, []);

  const postDivStyle = {
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
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
    <button onClick={() => navigate('/manageRequests')}>Manage Requests</button>
    <button onClick={() => logOut()}>Log Out</button><br /><br />
    {profileImg ? <ProfileImg src={profileImg.url}/> : <ProfileImg src={silhouette}/>}
    <br />
    <h2>{user2 ? user2.name : ""}'s Posts</h2>

    <div style={postDivStyle}>
        {posts.map((post) => {
          // return <EditPost post={post} setPosts={setYourPosts} key={"editPost"+post.id}/>
          return <ViewPost profileImg={userProfileImg} user={user} post={post} page={"ViewProfile"} setPosts={setPosts} key={"viewPost"+post.id} />
          
        })}
    </div>
    </>
  )
}

export default ViewProfile
