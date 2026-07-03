import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from './Home.jsx';
import LogIn from './LogIn.jsx';

function App() {
  const [count, setCount] = useState(0)
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LogIn />
    },
    {
      path: "/home",
      element: <Home />
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
