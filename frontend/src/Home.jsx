import { useState } from 'react'
import axios, { isCancel, AxiosError } from 'axios';
// import React, { useState } from 'react';

// function FileUploader() {
//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState('');

//   // 1. Grab the file from the change event
//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0]; // Gets the first selected file
    
//     if (selectedFile) {
//       setFile(selectedFile);
      
//       // Optional: Generate a local URL to preview the file (e.g., an image)
//       const url = URL.createObjectURL(selectedFile);
//       setPreviewUrl(url);
//     }
//   };

//   // 2. Prepare and send the file to your API
//   const handleUpload = async (event) => {
//     event.preventDefault();
//     if (!file) return;

//     // Binary file data must be wrapped in FormData
//     const formData = new FormData();
//     formData.append('myFile', file); 

//     try {
//       const response = await fetch('https://your-api-endpoint.com', {
//         method: 'POST',
//         body: formData, // Fetch sets the Content-Type automatically for FormData
//       });
      
//       if (response.ok) {
//         console.log('Upload successful!');
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//     }
//   };

//   return (
//     <form onSubmit={handleUpload}>
//       {/* File input element */}
//       <input type="file" onChange={handleFileChange} />
      
//       {/* Meta details */}
//       {file && <p>Selected File: {file.name}</p>}
      
//       {/* Optional image preview */}
//       {previewUrl && <img src={previewUrl} alt="Preview" width="200" />}
      
//       <button type="submit" disabled={!file}>Upload File</button>
//     </form>
//   );
// }

// export default FileUploader;

function Home() {
  const [file, setFile] = useState(null);

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
