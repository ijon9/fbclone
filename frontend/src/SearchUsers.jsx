import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router';
import ProfileImg from './ProfileImg';
import silhouette from './silhouette.jpg'


// export default FileUploader;

function SearchUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.query === undefined ? null : location.state?.query);

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
      if(query === null) {
        navigate("/home");
        return;
      }
      setUser(resp.data.user);
      const resp2 = await axios.post(backendURL+"/searchUsers", {query, userId: resp.data.user.id});
      setUsers(resp2.data.users);
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
    flex: 1
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
      if(response === "send") {
        resp2 = await axios.post(backendURL+"/sendFriendReq", payload);
      }
      else if(response === "accept") {
        resp2 = await axios.post(backendURL+"/acceptFriendReq", payload);
      }
      else if(response === "deny") {
        resp2 = await axios.post(backendURL+"/denyFriendReq", payload);
      }
      setUsers((prev) => {
        const next = [...prev];
        for(let i=0; i<next.length; i++) {
          if(next[i].id === userTwo) {
            next[i].status = resp2.data.status;
          }
        }
        return next;
      });
    } catch(e) {
      console.log(e);
    }
  }

  function displayFriendButtons(id, status) {
    if(status === "sent") {
      return <div>Waiting for response...</div>
    }
    else if(status === "friends") {
      return <div>Friends!</div>
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

  return (
    <>
    <h1>FBClone</h1>
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
    <button onClick={() => navigate('/home')}>Home</button>
    <button onClick={() => logOut()}>Log Out</button><br />
    <div>
        <h2>Users</h2>
        {users.map((u, ind) => {
            return <div style={cardStyle} key={"sUser"+u.id}>
              <div style={nameAndPic}>
                {u.url !== null ? <ProfileImg src={u.url} /> : <ProfileImg src={silhouette} />}{u.name}
              </div>
              {displayFriendButtons(u.id, u.status)}
            </div>
        })}
    </div>
    </>
  )
}

export default SearchUsers
