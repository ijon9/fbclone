import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router';
import ProfileImg from './ProfileImg';
import silhouette from './silhouette.jpg'


// export default FileUploader;

function ManageRequests() {
  const [user, setUser] = useState(null);
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [friends, setFriends] = useState([]);
  const [profileImg, setProfileImg] = useState(null);
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
      // Profile Img
      const resp5 = await axios.get(backendURL+"/getProfileImg/"+resp.data.user.id)
      setProfileImg(resp5.data.profileImg);
      // Get incoming, outgoing, friends
      const resp2 = await axios.get(backendURL+'/getIncoming/'+resp.data.user.id);
      setIncoming(resp2.data.incoming);
      const resp3 = await axios.get(backendURL+'/getOutgoing/'+resp.data.user.id);
      setOutgoing(resp3.data.outgoing);
      const resp4 = await axios.get(backendURL+'/getFriends/'+resp.data.user.id);
      setFriends(resp4.data.friends);
    };
    grab();
  }, []);
  
  function logOut() {
    localStorage.removeItem('token');
    navigate('/');
  }

  const nameAndPic = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flex: 1,
    cursor: "pointer"
  }

  const cardStyle = {
    display: "flex",
    alignItems: "center"
  }

  async function respond(userTwo, response) {
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
      if(response === "accept") {
        resp2 = await axios.post(backendURL+"/acceptFriendReq", payload);
        const u2 = incoming.find(u => u.id === userTwo);
        setIncoming((prev) => {
            return prev.filter((u) => {return u.id !== userTwo});
        })
        setFriends((prev) => {
            return [...prev, u2];
        })
      }
      else if(response === "deny") {
        resp2 = await axios.post(backendURL+"/denyFriendReq", payload);
        setIncoming((prev) => {
            return prev.filter((u) => {return u.id !== userTwo});
        })
      }
      else if(response === "remove") {
        resp2 = axios.post(backendURL+"/denyFriendReq", payload);
        setFriends((prev) => {
            return prev.filter((u) => {return u.id !== userTwo});
        })
      }
    } catch(e) {
      console.log(e);
    }
  }

  function displayFriendButtons(id, status) {
    if(status === "sent") {
      return <div>Waiting for response...</div>
    }
    else if(status === "friends") {
      return <div>
        <button onClick={() => respond(id, "remove")}>Remove friend</button>
      </div>
    }
    else if(status === "received") {
      return <div>
        <button onClick={() => respond(id, "accept")}>Accept</button>
        <button onClick={() => respond(id, "deny")}>Deny</button>
      </div>
    } 
    // status === unsent
    else {
      return <div>
        <button onClick={() => respond(id, "send")}>Send friend request</button>
      </div>
    }
  }

  const inAndOut = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px"
  }

  const border = {
    border: "1px solid black",
    padding: "5px"
  }

  function viewProfile(id) {
    navigate('/viewProfile', {state: {id}})
  }

  return (
    <>
    <h1>FBClone</h1>
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
    <button onClick={() => navigate('/home')}>Home</button>
    <button onClick={() => logOut()}>Log Out</button><br /><br />
    {profileImg !== null ? <ProfileImg src={profileImg.url}/> : <ProfileImg src={silhouette}/>}
    <h2 style={{marginTop: "0px"}}>Welcome, {user === null ? "" : user.name}</h2>
    <div style={inAndOut}>
        <div style={border}>
            <h2 style={{textAlign: "center"}}>Incoming</h2>
            {incoming.map((u) => {
                return <div style={cardStyle} key={"incoming"+u.id}>
              <div style={nameAndPic} onClick={() => viewProfile(u.id)}>
                {u.url !== null ? <ProfileImg src={u.url} /> : <ProfileImg src={silhouette} />}{u.name}
              </div>
              {displayFriendButtons(u.id, "received")}
            </div>
            })}
        </div>
        <div style={border}>
            <h2 style={{textAlign: "center"}}>Outgoing</h2>
            {outgoing.map((u) => {
                return <div style={cardStyle} key={"outgoing"+u.id}>
              <div style={nameAndPic} onClick={() => viewProfile(u.id)}>
                {u.url !== null ? <ProfileImg src={u.url} /> : <ProfileImg src={silhouette} />}{u.name}
              </div>
              {displayFriendButtons(u.id, "sent")}
            </div>
            })}
        </div>
    </div><br />
    <div style={border}>
        <h2 style={{textAlign: "center"}}> Friends </h2>
        {friends.map((u) => {
                return <div style={cardStyle} key={"friends"+u.id}>
              <div style={nameAndPic} onClick={() => viewProfile(u.id)}>
                {u.url !== null ? <ProfileImg src={u.url} /> : <ProfileImg src={silhouette} />}{u.name}
              </div>
              {displayFriendButtons(u.id, "friends")}
            </div>
            })}
    </div>
    </>
  )
}

export default ManageRequests
