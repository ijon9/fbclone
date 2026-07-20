import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from './Home.jsx';
import LogIn from './LogIn.jsx';
import EditProfile from './EditProfile.jsx'
import SearchUsers  from './SearchUsers.jsx';
import ManageRequests from './ManageRequests.jsx';

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
    },
    {
      path: "/manageRequests",
      element: <ManageRequests />
    },
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
