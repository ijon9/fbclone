import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from './Home.jsx';

function App() {
  const [count, setCount] = useState(0)
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />
    }
  ])
  return (
    <RouterProvider router={router} />
  )
}

export default App
