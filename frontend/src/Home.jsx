import { useState, useEffect } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
import { useNavigate } from 'react-router';


// export default FileUploader;

function Home() {
  const [file, setFile] = useState(null);
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
  

  return (
    <>
    <h1>FBClone</h1>
    <input type="text"></input><button>Search User</button><br />
    <button onClick={() => navigate('/editProfile')}>Edit Profile</button><br />
    </>
  )
}

export default Home
