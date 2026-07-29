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
  const [friends, setFriends] = useState([]);
  const [oneStatus, setOneStatus] = useState(null);
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
      // Get friends
      const resp6 = await axios.get(backendURL+'/getFriendsVP/'+resp.data.user.id+"/"+resp2.data.user.id)
      setFriends(resp6.data.friends);
      // Get friend status
      const resp7 = await axios.get(backendURL+'/getOneFriend/'+resp.data.user.id+"/"+resp2.data.user.id);
      setOneStatus(resp7.data);
    };
    grab();
  }, [user2Id]);

  const postDivStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  }

  function logOut() {
    localStorage.removeItem('token');
    navigate('/');
  }

  async function respond(userTwo, response, many) {
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
    const payload = {
      userOne: user.id,
      userTwo
    }
    try {
      let resp2 = null;
      if(response === "send") {
        resp2 = await axios.post(backendURL+"/sendFriendReq", payload);
        if(resp2.data.message === "Friend request already sent") {
          alert("Friend request already sent")
        }
        if(!many) {
          setOneStatus((prev) => {
            return {...prev, status: resp2.data.status}
          });
          return;
        } 
        setFriends(prev => 
          prev.map(f => f.id === userTwo ? {...f, status: resp2.data.status} : f)
        )
      }
      else if(response === "accept") {
        resp2 = await axios.post(backendURL+"/acceptFriendReq", payload);
        if(resp2.data.message === "Deleted") {
          alert("Friend request deleted")
        }
        if(!many) {
          setOneStatus((prev) => {
            return {...prev, status: resp2.data.status}
          });
          return;
        }
        setFriends(prev => 
          prev.map(f => f.id === userTwo ? {...f, status: resp2.data.status} : f)
        )
      }
      else if(response === "deny" || response === "remove") {
        resp2 = await axios.post(backendURL+"/denyFriendReq", payload);
        if(!many) {
          setOneStatus((prev) => {
            return {...prev, status: "unsent"}
          });
          return;
        }
        setFriends(prev => 
          prev.map(f => f.id === userTwo ? {...f, status: "unsent"} : f)
        )
      }
    } catch(e) {
      console.log(e);
    }
  }

  function formatMutual(n) {
    if(n === 0) return null;
    else if(n === 1) return n+" mutual friend"
    else return n + " mutual friends"
  }

  function displayFriendButtons(id, status, many = true) {
    if(id === user.id) {
      return <div>You</div>;
    }
    else if(status === "sent") {
      return <div>
        <button onClick={() => respond(id, "remove", many)}>Cancel request</button>
      </div>
    }
    else if(status === "friends") {
      return <div>
        <button onClick={() => respond(id, "remove", many)}>Remove friend</button>
      </div>
    }
    else if(status === "received") {
      return <div>
        <button onClick={() => respond(id, "accept", many)}>Accept</button>
        <button onClick={() => respond(id, "deny", many)}>Deny</button>
      </div>
    } 
    // status === unsent
    else {
      return <div>
        <button onClick={() => respond(id, "send", many)}>Send friend request</button>
      </div>
    }
  }

  const cardStyle = {
    display: "flex",
    alignItems: "center"
  }

  const nameAndPic = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flex: 1,
    cursor: "pointer"
  }

  function viewProfile(id) {
    // navigate('/viewProfile', {state: {id}})
    if(id === user.id) {
      alert("Click Edit Profile to view your information")
      return;
    }
    setUser2Id(id);
  }
  
  return (
    <>
    <h1> FBClone </h1>
    {userProfileImg ? <ProfileImg src={userProfileImg.url}/> : <ProfileImg src={silhouette}/>}
    <h2 style={{marginTop: "5px"}}>Welcome, {user === null ? "" : user.name}</h2>
    <button onClick={() => navigate("/home")}>Home</button>
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
    <button onClick={() => navigate('/manageRequests')}>Manage Requests</button>
    <button onClick={() => logOut()}>Log Out</button><br /><br />
    {profileImg ? <ProfileImg src={profileImg.url}/> : <ProfileImg src={silhouette}/>}
    <br />
    {oneStatus ? formatMutual(oneStatus.mutual) : null}
    {oneStatus ? (user2 && displayFriendButtons(user2.id, oneStatus.status, false)) : null}
    <h2>{user2 ? user2.name : ""}'s Posts</h2>

    <div style={postDivStyle}>
        {posts.map((post) => {
          // return <EditPost post={post} setPosts={setYourPosts} key={"editPost"+post.id}/>
          return <ViewPost setUser2Id={setUser2Id} profileImg={userProfileImg} user={user} post={post} page={"ViewProfile"} setPosts={setPosts} key={"viewPost"+post.id} />
        })}
    </div>
    <h2>{user2 ? user2.name: ""}'s Friends</h2>
    <div>
        {friends.map((u) => {
                return <div style={cardStyle} key={"friends"+u.id}>
              <div style={nameAndPic} onClick={() => viewProfile(u.id)}>
                {u.url !== null ? <ProfileImg src={u.url} /> : <ProfileImg src={silhouette} />}
                <div>{u.name}<br />{u.id !== user.id ? formatMutual(u.mutual) : null}</div>
              </div>
              {displayFriendButtons(u.id, u.status)}
            </div>
            })}
    </div>
    </>
  )
}

export default ViewProfile
