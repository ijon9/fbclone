import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate, useLocation } from 'react-router';


// export default FileUploader;

function SearchUsers() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const backendURL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const location = useLocation();


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
          if(location.state?.users !== undefined) setUsers(location.state?.users);
      }
    };
    grab();
  }, []);
  
  function logOut() {
    localStorage.removeItem('token');
    navigate('/');
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
            return <div key={"sUser"+u.id}>
                {u.name}
            </div>
        })}
    </div>
    </>
  )
}

export default SearchUsers
