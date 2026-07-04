import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from './Home.jsx';
import LogIn from './LogIn.jsx';
import EditProfile from './EditProfile.jsx'

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
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
