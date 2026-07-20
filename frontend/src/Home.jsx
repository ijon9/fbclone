import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';


// export default FileUploader;

function Home() {
  const [user, setUser] = useState(null);
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
      }
      else {
          setUser(resp.data.user);
      }
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

  return (
    <>
    <h1>FBClone</h1>
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button>
    <button onClick={() => navigate('/manageRequests')}>Manage Requests</button>
    <button onClick={() => logOut()}>Log Out</button><br />
    <h2>Welcome, {user === null ? "" : user.name}</h2>
    <form onSubmit={handleSubmit}>
      <input type="text" id="findUser"></input><button type="submit">Search User</button><br />
    </form>
    
    </>
  )
}

export default Home
