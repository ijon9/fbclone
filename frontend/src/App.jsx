import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from './Home.jsx';
import LogIn from './LogIn.jsx';
import EditProfile from './EditProfile.jsx'
import SearchUsers  from './SearchUsers.jsx';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LogIn />
    },
    {
      path: "/home",
      element: <Home />
    },
    {
      path: "/editProfile",
      element: <EditProfile />
    },
    {
      path: "/searchUsers",
      element: <SearchUsers />
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
