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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]; // Gets the first selected file
    
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;

    const reader = new FileReader();
  
    // Read the binary file data and format it as a Data URL
    reader.readAsDataURL(file); 
    
     
    reader.onload = async () => {
      const base64String = reader.result; // This contains your binary text string
      try {
        const response = await axios.post('http://localhost:3000/upload', { str: base64String });
        setFile(null);
      } catch (error) {
        console.error('Upload error:', error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    
  };
  

  return (
    <>
    <h1>FBClone</h1>
    <input type="text"></input><button>Search User</button><br />
    <button>Edit Profile</button><br />
     <form onSubmit={handleUpload}>
       {/* File input element */}
       <input type="file" onChange={handleFileChange} />
      
       {/* Meta details */}
       {file && <p>Selected File: {file.name}</p>}
      
       <button type="submit" disabled={!file}>Upload File</button>
     </form>
    </>
  )
}

export default Home
